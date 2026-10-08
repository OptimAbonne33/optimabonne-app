import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/admin";
import { notifyZapier } from "@/lib/zapier";
import {
  REPLACEABLE_SUBSCRIPTION_STATUSES,
  getStripe,
  isStripeConfigured,
} from "@/lib/stripe";
import {
  billingPatchFromSubscription,
  isBillingEntitled,
  planFromSubscription,
} from "@/lib/billing";
import type { BillingStatus } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 503 });
  }

  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "stripe not configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const admin = createServiceClient();
  const { error: seenError } = await admin.from("stripe_events").insert({
    id: event.id,
    type: event.type,
  });
  if (seenError) {
    if (seenError.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json({ error: seenError.message }, { status: 500 });
  }

  try {
    await handleEvent(stripe, admin, event);
  } catch (err) {
    console.error("[stripe webhook]", event.type, err);
    await admin.from("stripe_events").delete().eq("id", event.id);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(
  stripe: Stripe,
  admin: ReturnType<typeof createServiceClient>,
  event: Stripe.Event,
) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") return;
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (!subId) return;
      const sub = await stripe.subscriptions.retrieve(subId);
      await upsertFromSubscription(admin, sub, userIdFrom(session));
      await cancelReplacedSubscriptions(stripe, sub);
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "customer.subscription.paused":
    case "customer.subscription.resumed": {
      const sub = event.data.object as Stripe.Subscription;
      await upsertFromSubscription(admin, sub, sub.metadata?.user_id);
      return;
    }
    case "customer.subscription.trial_will_end": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await upsertFromSubscription(admin, sub, sub.metadata?.user_id);
      if (userId && sub.status === "trialing" && !sub.cancel_at_period_end) {
        notifyZapier("trial_ending", {
          user_id: userId,
          plan: planFromSubscription(sub),
          stripe_subscription_id: sub.id,
          trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        });
      }
      return;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = subscriptionIdFromInvoice(invoice);
      if (!subId) return;
      const sub = await stripe.subscriptions.retrieve(subId);
      await upsertFromSubscription(admin, sub, sub.metadata?.user_id);
      return;
    }
    case "charge.refunded":
    case "charge.dispute.created":
    case "radar.early_fraud_warning.created": {
      const sub = await subscriptionFromRiskEvent(stripe, event);
      if (!sub) return;
      await upsertFromSubscription(admin, sub, sub.metadata?.user_id);
    }
  }
}

function userIdFrom(session: Stripe.Checkout.Session) {
  return session.metadata?.user_id || session.client_reference_id || null;
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice) {
  const parentSub = (
    invoice as Stripe.Invoice & {
      parent?: { subscription_details?: { subscription?: string } };
    }
  ).parent?.subscription_details?.subscription;
  const legacy = (invoice as Stripe.Invoice & { subscription?: string | { id: string } })
    .subscription;
  if (typeof parentSub === "string") return parentSub;
  if (typeof legacy === "string") return legacy;
  if (legacy && typeof legacy === "object") return legacy.id;
  return null;
}

async function subscriptionFromRiskEvent(
  stripe: Stripe,
  event: Stripe.Event,
): Promise<Stripe.Subscription | null> {
  let charge: Stripe.Charge | null = null;
  if (event.type === "charge.refunded" || event.type === "charge.dispute.created") {
    const obj = event.data.object as Stripe.Charge | Stripe.Dispute;
    if ("charge" in obj && typeof obj.charge === "string") {
      charge = await stripe.charges.retrieve(obj.charge);
    } else if ("id" in obj && event.type === "charge.refunded") {
      charge = obj as Stripe.Charge;
    }
  }
  if (event.type === "radar.early_fraud_warning.created") {
    const warning = event.data.object as Stripe.Radar.EarlyFraudWarning;
    const chargeId = typeof warning.charge === "string" ? warning.charge : warning.charge?.id;
    if (chargeId) charge = await stripe.charges.retrieve(chargeId);
  }
  if (!charge) return null;
  const invoiceRef = (
    charge as Stripe.Charge & { invoice?: string | { id: string } | null }
  ).invoice;
  const invoiceId = typeof invoiceRef === "string" ? invoiceRef : invoiceRef?.id;
  if (!invoiceId) return null;
  const invoice = await stripe.invoices.retrieve(invoiceId);
  const subId = subscriptionIdFromInvoice(invoice);
  if (!subId) return null;
  return stripe.subscriptions.retrieve(subId);
}

async function cancelReplacedSubscriptions(stripe: Stripe, current: Stripe.Subscription) {
  const customerId =
    typeof current.customer === "string" ? current.customer : current.customer?.id;
  if (!customerId) return;
  const subs = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 100,
  });
  for (const sub of subs.data) {
    if (sub.id !== current.id && REPLACEABLE_SUBSCRIPTION_STATUSES.includes(sub.status)) {
      await stripe.subscriptions.cancel(sub.id);
    }
  }
}

type BillingRow = {
  user_id: string;
  status: BillingStatus;
  stripe_subscription_id: string | null;
};

async function upsertFromSubscription(
  admin: ReturnType<typeof createServiceClient>,
  sub: Stripe.Subscription,
  fallbackUserId?: string | null,
): Promise<string | null> {
  const patch = billingPatchFromSubscription(sub);
  const userId = fallbackUserId || sub.metadata?.user_id || null;
  const columns = "user_id, status, stripe_subscription_id";

  const { data } = userId
    ? await admin.from("billing_subscriptions").select(columns).eq("user_id", userId).maybeSingle()
    : patch.stripe_customer_id
      ? await admin
          .from("billing_subscriptions")
          .select(columns)
          .eq("stripe_customer_id", patch.stripe_customer_id)
          .maybeSingle()
      : { data: null };

  const current = data as BillingRow | null;
  if (!current) return null;

  const isStale =
    current.stripe_subscription_id &&
    current.stripe_subscription_id !== sub.id &&
    !isBillingEntitled(patch.status);
  if (isStale) return current.user_id;

  const { error } = await admin
    .from("billing_subscriptions")
    .update(patch)
    .eq("user_id", current.user_id);
  if (error) throw error;

  emitZapier(current.status, patch.status, {
    user_id: current.user_id,
    plan: patch.plan,
    stripe_subscription_id: patch.stripe_subscription_id,
  });
  return current.user_id;
}

function emitZapier(
  previous: BillingStatus,
  next: BillingStatus,
  payload: Record<string, unknown>,
) {
  if (previous !== "trial" && next === "trial") {
    notifyZapier("trial_started", payload);
  }
  if (previous !== "active" && next === "active") {
    notifyZapier("subscription_active", payload);
  }
  if (previous !== "cancelled" && next === "cancelled") {
    notifyZapier("subscription_cancelled", payload);
  }
}
