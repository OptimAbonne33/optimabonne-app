import Stripe from "stripe";
import type { BillingPlan } from "@/lib/types";

const TRIAL_DAYS = 14;

export function isStripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.STRIPE_PRICE_MONTHLY &&
      process.env.STRIPE_PRICE_ANNUAL,
  );
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function priceIdForPlan(plan: BillingPlan) {
  return plan === "annual"
    ? process.env.STRIPE_PRICE_ANNUAL || ""
    : process.env.STRIPE_PRICE_MONTHLY || "";
}

export function planFromPriceId(priceId: string | null | undefined): BillingPlan | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return "annual";
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return "monthly";
  return null;
}

export function checkoutTag(plan: BillingPlan) {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  return `oa_checkout_${plan}_${suffix}`;
}

export { TRIAL_DAYS };
