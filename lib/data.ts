import { createClient } from "@/lib/supabase/server";
import { getDemoOffers } from "@/lib/demo-offers";
import {
  buildOptimization,
  type Offer,
  type OptimizationResult,
  type PriceHistoryEntry,
} from "@/lib/optimization";
import type { UserSubscription } from "@/lib/types";

export async function loadUserSubscriptions(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as UserSubscription[];
}

function isMissingRelation(error: { code?: string; message?: string }) {
  const msg = error.message?.toLowerCase() || "";
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table") ||
    msg.includes("schema cache")
  );
}

export async function loadOffers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("is_active", true)
    .order("monthly_price", { ascending: true });

  if (error) {
    if (isMissingRelation(error)) return getDemoOffers();
    throw error;
  }

  const offers = (data || []) as Offer[];
  return offers.length ? offers : getDemoOffers();
}

export async function loadOptimization(userId: string): Promise<{
  subscriptions: UserSubscription[];
  offers: Offer[];
  result: OptimizationResult;
}> {
  const [subscriptions, offers] = await Promise.all([
    loadUserSubscriptions(userId),
    loadOffers(),
  ]);

  return {
    subscriptions,
    offers,
    result: buildOptimization(subscriptions, offers),
  };
}

export async function loadPriceHistory(subscriptionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscription_price_history")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .order("recorded_at", { ascending: true });

  if (error) {
    if (isMissingRelation(error)) return [] as PriceHistoryEntry[];
    throw error;
  }
  return (data || []) as PriceHistoryEntry[];
}

export async function ensurePriceHistoryPoint(
  subscriptionId: string,
  price: number,
  label?: string,
) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing, error: selectError } = await supabase
    .from("subscription_price_history")
    .select("id, price")
    .eq("subscription_id", subscriptionId)
    .eq("recorded_at", today)
    .maybeSingle();

  if (selectError) {
    if (isMissingRelation(selectError)) return;
    throw selectError;
  }

  if (existing) {
    if (Number(existing.price) !== price) {
      await supabase
        .from("subscription_price_history")
        .update({ price, label: label ?? null })
        .eq("id", existing.id);
    }
    return;
  }

  const { error: insertError } = await supabase
    .from("subscription_price_history")
    .insert({
      subscription_id: subscriptionId,
      price,
      recorded_at: today,
      label: label ?? null,
    });

  if (insertError && !isMissingRelation(insertError)) {
    throw insertError;
  }
}
