import type Stripe from "stripe";
import type {
  BillingPlan,
  BillingStatus,
  BillingSubscription,
} from "@/lib/types";
import { planFromPriceId } from "@/lib/stripe";

export function isBillingEntitled(status: BillingStatus | null | undefined) {
  return status === "trial" || status === "active";
}

export function mapStripeStatus(
  status: Stripe.Subscription.Status | string | null | undefined,
): BillingStatus {
  switch (status) {
    case "trialing":
      return "trial";
    case "active":
      return "active";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    case "past_due":
    case "unpaid":
    case "incomplete":
    case "paused":
      return "expired";
    default:
      return "none";
  }
}

function unixToIso(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function subscriptionPeriodEnd(sub: Stripe.Subscription) {
  const itemEnd = sub.items?.data?.[0]?.current_period_end;
  const rootEnd = (sub as Stripe.Subscription & { current_period_end?: number })
    .current_period_end;
  return unixToIso(itemEnd ?? rootEnd);
}

export function planFromSubscription(
  sub: Stripe.Subscription,
): BillingPlan | null {
  const priceId = sub.items?.data?.[0]?.price?.id;
  return planFromPriceId(priceId);
}

export function billingPatchFromSubscription(sub: Stripe.Subscription) {
  return {
    status: mapStripeStatus(sub.status),
    stripe_customer_id:
      typeof sub.customer === "string"
        ? sub.customer
        : sub.customer?.id || null,
    stripe_subscription_id: sub.id,
    plan: planFromSubscription(sub),
    trial_ends_at: unixToIso(sub.trial_end),
    current_period_end: subscriptionPeriodEnd(sub),
  };
}

export function emptyBilling(userId: string): BillingSubscription {
  return {
    id: "",
    user_id: userId,
    status: "none",
    stripe_customer_id: null,
    stripe_subscription_id: null,
    plan: null,
    trial_ends_at: null,
    current_period_end: null,
    created_at: "",
    updated_at: "",
  };
}
