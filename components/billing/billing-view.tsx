"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  openBillingPortalAction,
  startCheckoutAction,
} from "@/app/actions";
import { SubmitButton } from "@/components/ui/button";
import type { BillingSubscription } from "@/lib/types";
import { isBillingEntitled } from "@/lib/billing";

export function BillingView({
  billing,
  configured,
  checkout,
}: {
  billing: BillingSubscription;
  configured: boolean;
  checkout?: string;
}) {
  const t = useTranslations("billing");
  const te = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const entitled = isBillingEntitled(billing.status);

  function formatDate(value: string | null) {
    if (!value) return null;
    return new Date(value).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  async function onCheckout(formData: FormData) {
    setError(null);
    const result = await startCheckoutAction(formData);
    if (result && !result.ok) setError(te(result.error));
  }

  async function onPortal() {
    setError(null);
    const result = await openBillingPortalAction();
    if (result && !result.ok) setError(te(result.error));
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-[26px] font-bold">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>

      {checkout === "success" ? (
        <p className="mb-5 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-[13px] text-accent">
          {t("checkoutSuccess")}
        </p>
      ) : null}
      {checkout === "cancel" ? (
        <p className="mb-5 rounded-xl border border-border bg-surface2 px-4 py-3 text-[13px] text-muted">
          {t("checkoutCancel")}
        </p>
      ) : null}

      <section className="mb-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-semibold tracking-wide text-muted">
          {t("currentPlan")}
        </p>
        <p className="mt-2 font-[family-name:var(--font-syne)] text-xl font-bold">
          {t(`status.${billing.status}`)}
        </p>
        {billing.plan === "monthly" || billing.plan === "annual" ? (
          <p className="mt-1 text-sm text-muted">{t(`plan.${billing.plan}`)}</p>
        ) : null}
        {billing.status === "trial" && billing.trial_ends_at ? (
          <p className="mt-2 text-[13px] text-accent">
            {t("trialUntil", { date: formatDate(billing.trial_ends_at) || "" })}
          </p>
        ) : null}
        {billing.current_period_end && entitled ? (
          <p className="mt-1 text-[13px] text-muted">
            {t("renewsOn", { date: formatDate(billing.current_period_end) || "" })}
          </p>
        ) : null}
      </section>

      {!configured ? (
        <p className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
          {t("notConfigured")}
        </p>
      ) : entitled ? (
        <form action={onPortal}>
          {error ? (
            <p className="mb-3 rounded-[10px] border border-danger/30 bg-danger/10 px-3 py-2.5 text-[13px] text-danger">
              {error}
            </p>
          ) : null}
          <SubmitButton variant="outline">{t("manage")}</SubmitButton>
        </form>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <form
            action={onCheckout}
            className="rounded-2xl border border-border bg-surface p-5 sm:p-6"
          >
            <input type="hidden" name="plan" value="monthly" />
            <p className="text-[11px] font-semibold tracking-wide text-muted">
              {t("monthlyLabel")}
            </p>
            <p className="mt-2 font-[family-name:var(--font-syne)] text-[32px] font-extrabold text-accent">
              9,99€
              <span className="text-sm font-medium text-muted">{t("perMonth")}</span>
            </p>
            <p className="mb-5 mt-2 text-[13px] text-muted">{t("trialHint")}</p>
            {error ? (
              <p className="mb-3 rounded-[10px] border border-danger/30 bg-danger/10 px-3 py-2.5 text-[13px] text-danger">
                {error}
              </p>
            ) : null}
            <SubmitButton>{t("chooseMonthly")}</SubmitButton>
          </form>

          <form
            action={onCheckout}
            className="rounded-2xl border border-accent/30 bg-accent/10 p-5 sm:p-6"
          >
            <input type="hidden" name="plan" value="annual" />
            <p className="text-[11px] font-semibold tracking-wide text-accent">
              {t("annualLabel")}
            </p>
            <p className="mt-2 font-[family-name:var(--font-syne)] text-[32px] font-extrabold text-accent">
              49€
              <span className="text-sm font-medium text-muted">{t("perYear")}</span>
            </p>
            <p className="mb-5 mt-2 text-[13px] text-muted">{t("trialHint")}</p>
            <SubmitButton>{t("chooseAnnual")}</SubmitButton>
          </form>
        </div>
      )}
    </div>
  );
}