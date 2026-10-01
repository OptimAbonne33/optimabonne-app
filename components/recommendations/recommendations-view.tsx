"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  formatEuro,
  type Recommendation,
} from "@/lib/optimization";
import {
  CATEGORIES,
  type SubscriptionCategory,
} from "@/lib/types";
import { CategoryIcon, IconArrowRight } from "@/components/icons";

type Filter = "all" | SubscriptionCategory;

export function RecommendationsView({
  recommendations,
  totalSavings,
  annualSavings,
}: {
  recommendations: Recommendation[];
  totalSavings: number;
  annualSavings: number;
}) {
  const t = useTranslations("recommendations");
  const tc = useTranslations("categories");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return recommendations;
    return recommendations.filter((r) => r.subscription.category === filter);
  }, [filter, recommendations]);

  const bestPerSub = useMemo(() => {
    const seen = new Set<string>();
    return filtered.filter((r) => {
      if (seen.has(r.subscription.id)) return false;
      seen.add(r.subscription.id);
      return true;
    });
  }, [filtered]);

  const filters: Array<{ id: Filter; label: string }> = [
    { id: "all", label: t("filterAll") },
    ...CATEGORIES.map((c) => ({ id: c as Filter, label: tc(c) })),
  ];

  return (
    <div className="animate-[fadeUp_0.5s_ease_both]">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-[26px] font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
        {totalSavings > 0 ? (
          <div className="rounded-xl border border-accent/25 bg-accent/10 px-5 py-3 text-right">
            <p className="font-[family-name:var(--font-syne)] text-2xl font-extrabold text-accent">
              {formatEuro(totalSavings, 0)}
              <span className="text-sm font-medium text-accent/70">{t("perMonth")}</span>
            </p>
            <p className="text-[11px] text-muted">
              {t("yearPotential", { amount: formatEuro(annualSavings, 0) })}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-3.5 py-2 text-[12px] font-medium transition ${
                active
                  ? "bg-accent/15 text-accent"
                  : "border border-border bg-surface text-muted hover:text-ink"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {bestPerSub.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <p className="font-[family-name:var(--font-syne)] text-lg font-semibold">
            {t("empty")}
          </p>
          <p className="mt-2 text-sm text-muted">{t("emptyHint")}</p>
          <Link
            href="/subscriptions/new"
            className="mt-6 inline-flex rounded-[10px] bg-accent px-5 py-2.5 text-[13px] font-semibold text-[#0a0f1e]"
          >
            {t("addSub")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bestPerSub.map((reco) => {
            const alts = filtered.filter(
              (r) =>
                r.subscription.id === reco.subscription.id &&
                r.offer.id !== reco.offer.id,
            );
            return (
              <RecoCard
                key={reco.id}
                reco={reco}
                alternatives={alts}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function RecoCard({
  reco,
  alternatives,
}: {
  reco: Recommendation;
  alternatives: Recommendation[];
}) {
  const t = useTranslations("recommendations");
  const tc = useTranslations("categories");
  const urgent = reco.severity === "urgent";

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div
        className={`flex flex-col gap-5 p-6 md:flex-row md:items-start ${
          urgent ? "border-l-[3px] border-l-warn" : "border-l-[3px] border-l-accent"
        }`}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface2 text-accent">
          <CategoryIcon category={reco.subscription.category} size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                urgent
                  ? "bg-warn/15 text-warn"
                  : "bg-accent/15 text-accent"
              }`}
            >
              {urgent ? t("badgeUrgent") : t("badgeSaving")}
            </span>
            <span className="text-[11px] text-muted">
              {tc(reco.subscription.category)}
            </span>
          </div>

          <h2 className="font-[family-name:var(--font-syne)] text-base font-bold">
            {t("switchTo", {
              from: reco.subscription.provider_name,
              to: reco.offer.offer_name,
            })}
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            {reco.offer.description}
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">
                {t("youPay")}
              </p>
              <p className="font-[family-name:var(--font-ibm-plex)] text-lg font-semibold text-muted line-through">
                {formatEuro(Number(reco.subscription.monthly_price))}
              </p>
            </div>
            <div className="text-muted">
              <IconArrowRight size={16} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">
                {t("newPrice")}
              </p>
              <p className="font-[family-name:var(--font-ibm-plex)] text-lg font-semibold text-accent">
                {formatEuro(Number(reco.offer.monthly_price))}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted">
                {t("save")}
              </p>
              <p
                className={`font-[family-name:var(--font-syne)] text-xl font-extrabold ${
                  urgent ? "text-warn" : "text-accent"
                }`}
              >
                −{formatEuro(reco.monthlySavings, 0)}
                <span className="text-xs font-medium text-muted">
                  {t("perMonth")}
                </span>
              </p>
            </div>
          </div>

          {alternatives.length > 0 ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-[11px] font-medium text-muted">
                {t("alternatives")}
              </p>
              <ul className="space-y-2">
                {alternatives.slice(0, 3).map((alt) => (
                  <li
                    key={alt.id}
                    className="flex items-center justify-between gap-3 text-[13px]"
                  >
                    <span className="truncate text-ink">
                      {alt.offer.offer_name}
                    </span>
                    <span className="shrink-0 text-accent">
                      −{formatEuro(alt.monthlySavings, 0)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 md:w-[160px]">
          <a
            href={reco.offer.affiliate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-[10px] bg-accent px-4 py-2.5 text-center text-[13px] font-semibold text-[#0a0f1e] transition hover:bg-[#00ffb3]"
          >
            {t("switchCta")}
          </a>
          <Link
            href={`/subscriptions/${reco.subscription.id}`}
            className="inline-flex items-center justify-center rounded-[10px] border border-border px-4 py-2.5 text-center text-[13px] text-muted hover:text-ink"
          >
            {t("seeDetail")}
          </Link>
        </div>
      </div>
    </article>
  );
}
