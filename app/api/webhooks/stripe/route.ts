import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/admin";
import { notifyZapier } from "@/lib/zapier";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { billingPatchFromSubscription } from "@/lib/billing";
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
      return;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await upsertFromSubscription(admin, sub, sub.metadata?.user_id);
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

async function upsertFromSubscription(
  admin: ReturnType<typeof createServiceClient>,
  sub: Stripe.Subscription,
  fallbackUserId?: string | null,
) {
  const patch = billingPatchFromSubscription(sub);
  let userId = fallbackUserId || sub.metadata?.user_id || null;

  if (!userId && patch.stripe_customer_id) {
    const { data } = await admin
      .from("billing_subscriptions")
      .select("user_id, status, trial_ends_at")
      .eq("stripe_customer_id", patch.stripe_customer_id)
      .maybeSingle();
    userId = data?.user_id || null;
    if (data) {
      await applyPatch(admin, userId!, patch, data.status as BillingStatus, data.trial_ends_at);
      return;
    }
  }

  if (!userId) return;

  const { data: current } = await admin
    .from("billing_subscriptions")
    .select("status, trial_ends_at")
    .eq("user_id", userId)
    .maybeSingle();

  await applyPatch(
    admin,
    userId,
    patch,
    (current?.status as BillingStatus) || "none",
    current?.trial_ends_at || null,
  );
}

async function applyPatch(
  admin: ReturnType<typeof createServiceClient>,
  userId: string,
  patch: ReturnType<typeof billingPatchFromSubscription>,
  previousStatus: BillingStatus,
  previousTrialEnd: string | null,
) {
  const { error } = await admin
    .from("billing_subscriptions")
    .update(patch)
    .eq("user_id", userId);

  if (error) throw error;

  emitZapier(previousStatus, patch.status, patch.trial_ends_at || previousTrialEnd, {
    user_id: userId,
    plan: patch.plan,
    stripe_subscription_id: patch.stripe_subscription_id,
  });
}

function emitZapier(
  previous: BillingStatus,
  next: BillingStatus,
  trialEndsAt: string | null,
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
  if (next === "trial" && trialEndsAt) {
    const ms = new Date(trialEndsAt).getTime() - Date.now();
    if (ms > 0 && ms <= 3 * 24 * 60 * 60 * 1000) {
      notifyZapier("trial_ending", { ...payload, trial_ends_at: trialEndsAt });
    }
  }
}
