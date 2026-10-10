import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  loadOffers,
  loadPriceHistory,
} from "@/lib/data";
import {
  buildOptimization,
  formatEuro,
  type PriceHistoryEntry,
  type Recommendation,
} from "@/lib/optimization";
import {
  type UserSubscription,
} from "@/lib/types";
import { CategoryIcon } from "@/components/icons";
import { PriceHistoryChart } from "@/components/subscriptions/price-history-chart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_subscriptions")
    .select("provider_name")
    .eq("id", id)
    .maybeSingle();
  const name = data?.provider_name?.trim();
  return {
    title: name || "Détail abonnement",
    description: name
      ? `Détails, historique de prix et alternatives pour ${name}.`
      : "Détails de votre abonnement, historique de prix et alternatives.",
  };
}

export default async function SubscriptionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("subscriptionDetail");
  const tc = await getTranslations("categories");
  const tr = await getTranslations("recommendations");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!data) notFound();

  const sub = data as UserSubscription;
  const [offers, history] = await Promise.all([
    loadOffers(),
    loadPriceHistory(sub.id),
  ]);

  const result = buildOptimization([sub], offers);
  const meta = result.bySubscription.get(sub.id);
  const alternatives = result.recommendations.filter(
    (r) => r.subscription.id === sub.id,
  );
  const best = meta?.best ?? null;

  const chartHistory =
    history.length > 0
      ? history
      : ([
          {
            id: "current",
            subscription_id: sub.id,
            price: Number(sub.monthly_price),
            recorded_at: new Date().toISOString().slice(0, 10),
            label: "Prix actuel",
          },
        ] satisfies PriceHistoryEntry[]);

  return (
    <div className="min-w-0 animate-[fadeUp_0.5s_ease_both]">
      <Link
        href="/subscriptions"
        className="mb-6 inline-block text-[13px] text-muted hover:text-ink"
      >
        {t("back")}
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface2 text-accent">
            <CategoryIcon category={sub.category} size={26} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted">
              {tc(sub.category)}
            </p>
            <h1 className="font-[family-name:var(--font-syne)] text-[28px] font-bold tracking-tight">
              {sub.provider_name}
            </h1>
            {sub.subscribed_at ? (
              <p className="mt-1 text-sm text-muted">
                {t("since", { date: sub.subscribed_at })}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/subscriptions/${sub.id}/edit`}
            className="rounded-[10px] border border-border px-4 py-2.5 text-[13px] text-muted hover:text-ink"
          >
            {t("edit")}
          </Link>
        </div>
      </div>

      <div className="mb-5 grid min-w-0 gap-3 sm:gap-5 md:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <p className="text-[11px] font-semibold tracking-wide text-muted">
            {t("currentPrice")}
          </p>
          <p className="mt-2 break-words font-[family-name:var(--font-ibm-plex)] text-[26px] font-semibold sm:text-[32px]">
            {formatEuro(Number(sub.monthly_price))}
            <span className="text-sm text-muted">{tr("perMonth")}</span>
          </p>
        </div>
        <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <p className="text-[11px] font-semibold tracking-wide text-muted">
            {t("bestAlt")}
          </p>
          <p className="mt-2 break-words font-[family-name:var(--font-syne)] text-[24px] font-extrabold text-accent sm:text-[28px]">
            {best
              ? formatEuro(Number(best.offer.monthly_price))
              : "—"}
            {best ? (
              <span className="text-sm font-medium text-muted">
                {tr("perMonth")}
              </span>
            ) : null}
          </p>
          {best ? (
            <p className="mt-1 truncate text-xs text-muted">
              {best.offer.offer_name}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted">{t("alreadyBest")}</p>
          )}
        </div>
        <div className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <p className="text-[11px] font-semibold tracking-wide text-muted">
            {t("potential")}
          </p>
          <p
            className={`mt-2 break-words font-[family-name:var(--font-syne)] text-[26px] font-extrabold sm:text-[32px] ${
              best ? "text-warn" : "text-accent"
            }`}
          >
            {best ? `−${formatEuro(best.monthlySavings, 0)}` : formatEuro(0, 0)}
          </p>
          {best ? (
            <p className="mt-1 text-xs text-muted">
              {t("perYear", { amount: formatEuro(best.annualSavings, 0) })}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mb-5 grid min-w-0 gap-5 lg:grid-cols-2">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <h2 className="mb-5 font-[family-name:var(--font-syne)] text-sm font-bold">
            {t("priceHistory")}
          </h2>
          <PriceHistoryChart entries={chartHistory} />
        </section>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <h2 className="mb-5 font-[family-name:var(--font-syne)] text-sm font-bold">
            {t("alternatives")}
          </h2>
          {alternatives.length === 0 ? (
            <p className="text-sm text-muted">{t("noAlts")}</p>
          ) : (
            <ul className="space-y-3">
              {alternatives.map((reco) => (
                <AltRow key={reco.id} reco={reco} cta={t("switchCta")} />
              ))}
            </ul>
          )}
        </section>
      </div>

      {sub.notes ? (
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="mb-2 font-[family-name:var(--font-syne)] text-sm font-bold">
            {t("notes")}
          </h2>
          <p className="text-sm text-muted">{sub.notes}</p>
        </section>
      ) : null}
    </div>
  );
}

function AltRow({ reco, cta }: { reco: Recommendation; cta: string }) {
  const urgent = reco.severity === "urgent";
  return (
    <li className="flex flex-col gap-3 rounded-xl bg-surface2 p-3.5 sm:flex-row sm:items-center sm:gap-3 sm:p-4">
      <div className="min-w-0 flex-1">
        <p className="break-words text-[13px] font-medium">
          {reco.offer.offer_name}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">
          {reco.offer.description}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:contents">
        <div className="shrink-0 text-left sm:text-right">
          <p className="font-[family-name:var(--font-ibm-plex)] text-sm font-semibold">
            {formatEuro(Number(reco.offer.monthly_price))}
          </p>
          <p
            className={`text-[11px] font-medium ${
              urgent ? "text-warn" : "text-accent"
            }`}
          >
            −{formatEuro(reco.monthlySavings, 0)}
          </p>
        </div>
        <a
          href={reco.offer.affiliate_url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 rounded-lg bg-accent/15 px-3 py-2 text-center text-[11px] font-semibold text-accent"
        >
          {cta}
        </a>
      </div>
    </li>
  );
}
