import type { SubscriptionCategory, UserSubscription } from "@/lib/types";

export type Offer = {
  id: string;
  category: SubscriptionCategory;
  provider_name: string;
  offer_name: string;
  monthly_price: number;
  annual_price: number | null;
  description: string | null;
  affiliate_url: string;
  is_active: boolean;
  sort_priority: number;
};

export type PriceHistoryEntry = {
  id: string;
  subscription_id: string;
  price: number;
  recorded_at: string;
  label: string | null;
};

export type MatchSeverity = "urgent" | "saving" | "ok";

export type Recommendation = {
  id: string;
  subscription: UserSubscription;
  offer: Offer;
  monthlySavings: number;
  annualSavings: number;
  severity: MatchSeverity;
};

export type CategoryBreakdown = {
  category: SubscriptionCategory;
  total: number;
  share: number;
};

export type OptimizationResult = {
  score: number;
  overpayPercent: number;
  totalMonthly: number;
  totalSavings: number;
  annualSavings: number;
  recommendations: Recommendation[];
  bestRecommendations: Recommendation[];
  breakdown: CategoryBreakdown[];
  bySubscription: Map<
    string,
    { best: Recommendation | null; severity: MatchSeverity }
  >;
};

function severityFor(savings: number): MatchSeverity {
  if (savings >= 12) return "urgent";
  if (savings >= 4) return "saving";
  return "ok";
}

export function buildOptimization(
  subscriptions: UserSubscription[],
  offers: Offer[],
): OptimizationResult {
  const activeOffers = offers.filter((o) => o.is_active);
  const totalMonthly = subscriptions.reduce(
    (sum, s) => sum + Number(s.monthly_price),
    0,
  );

  const recommendations: Recommendation[] = [];
  const bySubscription = new Map<
    string,
    { best: Recommendation | null; severity: MatchSeverity }
  >();

  for (const sub of subscriptions) {
    const price = Number(sub.monthly_price);
    const candidates = activeOffers
      .filter(
        (o) =>
          o.category === sub.category && Number(o.monthly_price) < price - 0.01,
      )
      .map((offer) => {
        const monthlySavings = round2(price - Number(offer.monthly_price));
        return {
          id: `${sub.id}:${offer.id}`,
          subscription: sub,
          offer,
          monthlySavings,
          annualSavings: round2(monthlySavings * 12),
          severity: severityFor(monthlySavings),
        } satisfies Recommendation;
      })
      .sort((a, b) => b.monthlySavings - a.monthlySavings);

    const best = candidates[0] ?? null;
    bySubscription.set(sub.id, {
      best,
      severity: best?.severity ?? "ok",
    });

    recommendations.push(...candidates);
  }

  recommendations.sort((a, b) => b.monthlySavings - a.monthlySavings);

  const bestRecommendations = [...bySubscription.values()]
    .map((v) => v.best)
    .filter((r): r is Recommendation => r != null)
    .sort((a, b) => b.monthlySavings - a.monthlySavings);

  const totalSavings = round2(
    bestRecommendations.reduce((sum, r) => sum + r.monthlySavings, 0),
  );
  const overpayPercent =
    totalMonthly > 0 ? round2((totalSavings / totalMonthly) * 100) : 0;
  const score =
    subscriptions.length === 0
      ? 100
      : clamp(Math.round(100 - overpayPercent), 0, 100);

  const totals = new Map<SubscriptionCategory, number>();
  for (const sub of subscriptions) {
    totals.set(
      sub.category,
      (totals.get(sub.category) ?? 0) + Number(sub.monthly_price),
    );
  }

  const breakdown: CategoryBreakdown[] = [...totals.entries()]
    .map(([category, total]) => ({
      category,
      total: round2(total),
      share: totalMonthly > 0 ? total / totalMonthly : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    score,
    overpayPercent,
    totalMonthly: round2(totalMonthly),
    totalSavings,
    annualSavings: round2(totalSavings * 12),
    recommendations,
    bestRecommendations,
    breakdown,
    bySubscription,
  };
}

export function formatEuro(value: number, digits = 2) {
  return `${value.toFixed(digits).replace(".", ",")}€`;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
