import type Stripe from "stripe";
import type {
  BillingPlan,
  BillingStatus,
  BillingSubscription,
} from "@/lib/types";
import { planFromPriceId } from "@/lib/stripe";

export type BillingAccess = {
  entitled: boolean;
  status: BillingStatus;
  trial_ends_at?: string | null;
  email_confirmed?: boolean;
  admin?: boolean;
};

export function isBillingEntitled(
  billing:
    | Pick<BillingSubscription, "status" | "trial_ends_at">
    | null
    | undefined,
) {
  if (!billing) return false;
  if (billing.status === "active" || billing.status === "past_due") return true;
  if (billing.status === "trial" && billing.trial_ends_at) {
    return new Date(billing.trial_ends_at).getTime() > Date.now();
  }
  return false;
}

export function isEntitledBillingStatus(
  status: BillingStatus | null | undefined,
) {
  return status === "trial" || status === "active" || status === "past_due";
}

export function mapStripeStatus(
  status: Stripe.Subscription.Status | string | null | undefined,
): BillingStatus {
  switch (status) {
    case "trialing":
      return "trial";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
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
  const patch: {
    status: BillingStatus;
    stripe_customer_id: string | null;
    stripe_subscription_id: string;
    plan: BillingPlan | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    trial_ends_at?: string | null;
  } = {
    status: mapStripeStatus(sub.status),
    stripe_customer_id:
      typeof sub.customer === "string"
        ? sub.customer
        : sub.customer?.id || null,
    stripe_subscription_id: sub.id,
    plan: planFromSubscription(sub),
    current_period_end: subscriptionPeriodEnd(sub),
    cancel_at_period_end: Boolean(sub.cancel_at_period_end || sub.cancel_at),
  };

  if (sub.trial_end) {
    patch.trial_ends_at = unixToIso(sub.trial_end);
  }

  return patch;
}

export function isTrialEligible(billing: BillingSubscription) {
  return !billing.trial_ends_at && !billing.stripe_subscription_id;
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
    cancel_at_period_end: false,
    created_at: "",
    updated_at: "",
  };
}
