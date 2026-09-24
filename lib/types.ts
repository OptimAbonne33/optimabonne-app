export type SubscriptionCategory =
  | "mobile"
  | "internet"
  | "streaming"
  | "energy";

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

export const CATEGORY_ICONS: Record<SubscriptionCategory, string> = {
  mobile: "📱",
  internet: "🌐",
  streaming: "🎬",
  energy: "⚡",
};
