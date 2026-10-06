export type SubscriptionCategory =
  | "mobile"
  | "internet"
  | "streaming"
  | "energy";

export type BillingStatus =
  | "none"
  | "trial"
  | "active"
  | "expired"
  | "cancelled";

export type BillingPlan = "monthly" | "annual";

export type BillingSubscription = {
  id: string;
  user_id: string;
  status: BillingStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: BillingPlan | string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type UserSubscription = {
  id: string;
  user_id: string;
  provider_name: string;
  category: SubscriptionCategory;
  monthly_price: number;
  subscribed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const CATEGORIES: SubscriptionCategory[] = [
  "mobile",
  "internet",
  "streaming",
  "energy",
];

export function displayFirstName(
  raw: string | null | undefined,
  fallback = "",
) {
  const value = (raw || "").trim();
  if (!value) return fallback;
  const token = value.includes("@")
    ? value.split("@")[0]
    : value.split(/\s+/)[0];
  return token || fallback;
}

