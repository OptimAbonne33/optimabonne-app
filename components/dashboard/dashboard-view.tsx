import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import {
  formatEuro,
  type OptimizationResult,
  type Recommendation,
} from "@/lib/optimization";
import type { UserSubscription } from "@/lib/types";
import {
  CategoryIcon,
  IconArrowRight,
  IconPlus,
  IconWarning,
} from "@/components/icons";
import { CategoryChart, ScoreRing } from "@/components/dashboard/score-ring";

const CHART_COLORS = ["#00e5a0", "#0066ff", "#ff6b35", "#a78bfa"];

export async function DashboardView({
  firstName,
  subscriptions,
  result,
}: {
  firstName: string;
  subscriptions: UserSubscription[];
  result: OptimizationResult;
}) {
  const t = await getTranslations("dashboard");
  const tc = await getTranslations("categories");
  const tr = await getTranslations("recommendations");
  const locale = await getLocale();
  const warn = result.score < 70;
  const monthLabel = new Date().toLocaleDateString(
    locale === "en" ? "en-GB" : "fr-FR",
    { month: "long", year: "numeric" },
  );

  const chartItems = result.breakdown.map((b, i) => ({
    label: tc(b.category),
    total: b.total,
    share: b.share,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));

  const topRecos = result.bestRecommendations.slice(0, 3);
  const perMonth = locale === "en" ? "/mo" : "/mois";

  return (
    <div className="animate-[fadeUp_0.5s_ease_both]">
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="break-words font-[family-name:var(--font-syne)] text-[26px] font-bold tracking-tight">
            {t("hello", { name: firstName })}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t("subtitleMonth", { month: monthLabel })}
          </p>
        </div>
        <Link
          href="/subscriptions/new"
          className="inline-flex items-center justify-center gap-1.5 self-start rounded-[10px] bg-accent px-5 py-2.5 text-[13px] font-semibold text-[#0a0f1e] transition hover:-translate-y-px hover:bg-[#00ffb3]"
        >
          <IconPlus size={14} />
          {t("addSub")}
        </Link>
      </div>

      {result.totalSavings > 0 ? (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-warn/20 bg-warn/[0.08] px-4 py-3 text-[13px] text-warn">
          <IconWarning size={16} className="shrink-0" />
          <p className="min-w-0 flex-1">
            <strong>
              {t("alertCount", { count: result.bestRecommendations.length })}
            </strong>{" "}
            <span className="text-muted">
              {t("alertBody")}{" "}
              <strong className="text-warn">
                {formatEuro(result.totalSavings, 0)}
                {perMonth}
              </strong>
            </span>
          </p>
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1 rounded-lg border border-accent/20 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent"
          >
            {t("seeRecos")}
            <IconArrowRight size={12} />
          </Link>
        </div>
      ) : null}

      <div className="relative mb-7 grid overflow-hidden rounded-[18px] border border-border bg-surface p-5 sm:p-7 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(0,229,160,0.12)_0%,transparent_70%)]" />
        <ScoreRing score={result.score} warn={warn} />
        <div>
          <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold">
            {result.overpayPercent > 0 ? (
              <>
                {t("payingTooMuchPrefix")}{" "}
                <span className={warn ? "text-warn" : "text-accent"}>
                  {t("payingTooMuch", { percent: result.overpayPercent })}
                </span>
              </>
            ) : (
              t("wellOptimized")
            )}
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">
            {t("scoreExplain", { score: result.score })}
          </p>
        </div>
        <div className="mt-4 rounded-[14px] border border-accent/25 bg-accent/10 px-7 py-5 text-center md:mt-0">
          <div className="font-[family-name:var(--font-syne)] text-[32px] font-extrabold leading-none text-accent">
            {formatEuro(result.totalSavings, 0)}
          </div>
          <div className="mt-1 text-xs text-muted">{t("savableMonth")}</div>
          <div className="mt-1.5 text-[13px] font-medium text-accent/70">
            {t("savableYear", { amount: formatEuro(result.annualSavings, 0) })}
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-[18px] flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-syne)] text-sm font-bold">
              {t("mySubs")}
            </h3>
            <span className="text-[11px] text-muted">
              {t("activeCount", { count: subscriptions.length })}
            </span>
          </div>
          {subscriptions.length === 0 ? (
            <p className="text-sm text-muted">{t("emptySubs")}</p>
          ) : (
            <ul className="space-y-1">
              {subscriptions.map((sub) => {
                const meta = result.bySubscription.get(sub.id);
                const best = meta?.best;
                const severity = meta?.severity ?? "ok";
                const statusColor =
                  severity === "urgent"
                    ? "bg-danger"
                    : severity === "saving"
                      ? "bg-warn"
                      : "bg-accent";

                return (
                  <li key={sub.id}>
                    <Link
                      href={`/subscriptions/${sub.id}`}
                      className="flex items-center gap-3.5 rounded-xl px-1 py-3 transition hover:bg-surface2"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface2 text-accent">
                        <CategoryIcon category={sub.category} size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">
                          {sub.provider_name}
                        </p>
                        <p className="truncate text-xs text-muted">
                          {tc(sub.category)}
                          {sub.subscribed_at
                            ? ` — ${sub.subscribed_at}`
                            : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-[family-name:var(--font-syne)] text-sm font-bold">
                          {formatEuro(Number(sub.monthly_price))}
                        </p>
                        {best ? (
                          <p className="text-[10px] font-medium text-warn">
                            −{formatEuro(best.monthlySavings, 0)} {t("possible")}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${statusColor}`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-3.5 flex items-center justify-between border-t border-border pt-3.5">
            <span className="text-[13px] text-muted">{t("totalLabel")}</span>
            <span className="font-[family-name:var(--font-syne)] text-lg font-bold">
              {formatEuro(result.totalMonthly)}
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-[18px] flex items-center justify-between">
            <h3 className="font-[family-name:var(--font-syne)] text-sm font-bold">
              {t("topRecos")}
            </h3>
            <Link
              href="/recommendations"
              className="text-[11px] font-medium text-accent"
            >
              {t("seeAll")}
            </Link>
          </div>
          {topRecos.length === 0 ? (
            <p className="text-sm text-muted">{t("noRecos")}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topRecos.map((reco) => (
                <RecoMini
                  key={reco.id}
                  reco={reco}
                  urgentLabel={tr("badgeUrgent")}
                  savingLabel={tr("badgeSaving")}
                  perMonth={perMonth}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <section className="rounded-2xl border border-border bg-surface p-6 md:col-span-1">
          <h3 className="mb-4 font-[family-name:var(--font-syne)] text-sm font-bold">
            {t("byCategory")}
          </h3>
          {chartItems.length ? (
            <CategoryChart items={chartItems} />
          ) : (
            <p className="text-sm text-muted">{t("emptySubs")}</p>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6 md:col-span-2">
          <h3 className="mb-5 font-[family-name:var(--font-syne)] text-sm font-bold">
            {t("snapshot")}
          </h3>
          <div className="flex items-stretch">
            <Stat
              value={formatEuro(result.totalMonthly, 0)}
              label={t("totalSpend")}
              tone="blue"
            />
            <div className="w-px self-stretch bg-border" />
            <Stat
              value={String(subscriptions.length)}
              label={t("count")}
              tone="green"
            />
            <div className="w-px self-stretch bg-border" />
            <Stat
              value={formatEuro(result.annualSavings, 0)}
              label={t("yearPotential")}
              tone="orange"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function RecoMini({
  reco,
  urgentLabel,
  savingLabel,
  perMonth,
}: {
  reco: Recommendation;
  urgentLabel: string;
  savingLabel: string;
  perMonth: string;
}) {
  const urgent = reco.severity === "urgent";
  return (
    <Link
      href={`/subscriptions/${reco.subscription.id}`}
      className={`relative block overflow-hidden rounded-xl bg-surface2 p-4 transition hover:brightness-110 ${
        urgent ? "border-l-[3px] border-l-warn" : "border-l-[3px] border-l-accent"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3.5">
        <span
          className={`w-fit shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
            urgent
              ? "bg-warn/15 text-warn"
              : "bg-accent/15 text-accent"
          }`}
        >
          {urgent ? urgentLabel : savingLabel}
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words text-[13px] font-medium">
            {reco.offer.offer_name} — {reco.subscription.provider_name}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            {reco.offer.description}
          </p>
        </div>
        <div
          className={`shrink-0 text-left font-[family-name:var(--font-syne)] text-[15px] font-bold sm:text-right ${
            urgent ? "text-warn" : "text-accent"
          }`}
        >
          −{formatEuro(reco.monthlySavings, 0)}
          <span className="mt-0.5 block font-[family-name:var(--font-dm-sans)] text-[10px] font-normal text-muted">
            {perMonth}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: "green" | "blue" | "orange";
}) {
  const color =
    tone === "green"
      ? "text-accent"
      : tone === "blue"
        ? "text-blue"
        : "text-warn";

  return (
    <div className="flex-1 px-2 text-center">
      <p
        className={`break-words font-[family-name:var(--font-syne)] text-[22px] font-extrabold leading-none sm:text-[28px] ${color}`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-xs text-muted">{label}</p>
    </div>
  );
}
