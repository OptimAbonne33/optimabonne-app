"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  completeOnboardingAction,
  skipOnboardingAction,
} from "@/app/actions";
import { CATEGORIES, CATEGORY_ICONS, type SubscriptionCategory } from "@/lib/types";
import { SubmitButton, Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  isBlank,
  isPositivePrice,
  type FieldErrors,
} from "@/lib/validation";

type Draft = {
  category: SubscriptionCategory;
  provider_name: string;
  monthly_price: string;
  subscribed_at: string;
};

const emptyDraft = (): Draft => ({
  category: "mobile",
  provider_name: "",
  monthly_price: "",
  subscribed_at: "",
});

export function OnboardingForm() {
  const t = useTranslations("onboarding");
  const tc = useTranslations("categories");
  const te = useTranslations("errors");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [queue, setQueue] = useState<Draft[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const steps = useMemo(
    () => [
      { label: t("stepAccount"), state: "done" as const },
      { label: t("stepSubs"), state: "current" as const },
      { label: t("stepAnalysis"), state: "todo" as const },
      { label: t("stepDashboard"), state: "todo" as const },
    ],
    [t],
  );

  function validateDraft(d: Draft): FieldErrors {
    const errors: FieldErrors = {};
    if (isBlank(d.provider_name)) errors.provider_name = te("required");
    if (isBlank(d.monthly_price)) errors.monthly_price = te("required");
    else if (!isPositivePrice(d.monthly_price)) {
      errors.monthly_price = te("invalidPrice");
    }
    return errors;
  }

  function addAnother() {
    const errors = validateDraft(draft);
    setFieldErrors(errors);
    setFormError(null);
    if (Object.keys(errors).length) return;

    setQueue((q) => [...q, draft]);
    setDraft(emptyDraft());
  }

  function onSubmit() {
    setFormError(null);
    const all = [...queue];
    const draftFilled = !isBlank(draft.provider_name) || !isBlank(draft.monthly_price);

    if (draftFilled) {
      const errors = validateDraft(draft);
      setFieldErrors(errors);
      if (Object.keys(errors).length) return;
      all.push(draft);
    } else {
      setFieldErrors({});
    }

    if (!all.length) {
      setFormError(te("required"));
      setFieldErrors({
        provider_name: te("required"),
        monthly_price: te("required"),
      });
      return;
    }

    const fd = new FormData();
    fd.set(
      "subscriptions",
      JSON.stringify(
        all.map((d) => ({
          provider_name: d.provider_name,
          category: d.category,
          monthly_price: Number(d.monthly_price),
          subscribed_at: d.subscribed_at || null,
        })),
      ),
    );

    startTransition(async () => {
      const result = await completeOnboardingAction(fd);
      if (result && !result.ok) setFormError(result.error);
    });
  }

  return (
    <div className="flex w-full max-w-[520px] flex-col items-center px-6 py-[60px]">
      <div className="mb-12 flex items-center">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 font-[family-name:var(--font-ibm-plex)] text-[13px] font-semibold ${
                  step.state === "done"
                    ? "border-accent bg-accent text-[#0a0f1e]"
                    : step.state === "current"
                      ? "border-accent bg-surface text-accent"
                      : "border-border bg-surface text-muted"
                }`}
              >
                {step.state === "done" ? "✓" : i + 1}
              </div>
              <span
                className={`whitespace-nowrap text-[11px] ${
                  step.state === "current" ? "text-accent" : "text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <div
                className={`mb-5 h-px w-[60px] ${
                  step.state === "done" ? "bg-accent" : "bg-border"
                }`}
              />
            ) : null}
          </div>
        ))}
      </div>

      <div className="w-full rounded-[24px] border border-border bg-surface p-12">
        <h1 className="mb-1.5 font-[family-name:var(--font-syne)] text-[22px] font-bold">
          {t("title")}
        </h1>
        <p className="mb-8 text-sm text-muted">{t("subtitle")}</p>

        {queue.length > 0 ? (
          <ul className="mb-5 space-y-2">
            {queue.map((item, idx) => (
              <li
                key={`${item.provider_name}-${idx}`}
                className="flex items-center justify-between rounded-[10px] border border-border bg-surface2 px-4 py-3 text-[13px]"
              >
                <span>
                  {CATEGORY_ICONS[item.category]} {item.provider_name}
                </span>
                <span className="font-[family-name:var(--font-ibm-plex)] text-accent">
                  {item.monthly_price}€
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mb-1.5 text-[12px] font-semibold tracking-[0.3px] text-muted">
          {t("category")}
        </p>
        <div className="mb-6 grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => {
            const selected = draft.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, category: cat }))}
                className={`flex items-center gap-3 rounded-xl border-[1.5px] p-4 text-left transition-all ${
                  selected
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent hover:bg-accent/[0.04]"
                }`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-surface2 text-base">
                  {CATEGORY_ICONS[cat]}
                </span>
                <span>
                  <span className="block text-[13px] font-medium">
                    {tc(cat)}
                  </span>
                  <span className="mt-px block text-[11px] text-muted">
                    {tc(`${cat}Sub`)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mb-1 grid grid-cols-2 gap-3">
          <Field
            label={t("provider")}
            value={draft.provider_name}
            placeholder="Orange"
            error={fieldErrors.provider_name}
            onChange={(e) => {
              setDraft((d) => ({ ...d, provider_name: e.target.value }));
              setFieldErrors((err) => {
                const next = { ...err };
                delete next.provider_name;
                return next;
              });
            }}
          />
          <Field
            label={t("price")}
            value={draft.monthly_price}
            type="text"
            inputMode="decimal"
            placeholder="29.99"
            error={fieldErrors.monthly_price}
            onChange={(e) => {
              setDraft((d) => ({ ...d, monthly_price: e.target.value }));
              setFieldErrors((err) => {
                const next = { ...err };
                delete next.monthly_price;
                return next;
              });
            }}
          />
        </div>

        <Field
          label={t("date")}
          type="date"
          value={draft.subscribed_at}
          onChange={(e) =>
            setDraft((d) => ({ ...d, subscribed_at: e.target.value }))
          }
        />

        <button
          type="button"
          onClick={addAnother}
          className="mb-6 flex w-full items-center gap-2 border-t border-border py-3 text-[13px] text-accent"
        >
          <span className="text-base">+</span> {t("addAnother")}
        </button>

        {formError ? (
          <p className="mb-3 rounded-[10px] border border-danger/30 bg-danger/10 px-3 py-2.5 text-[13px] text-danger">
            {formError}
          </p>
        ) : null}

        <Button onClick={onSubmit}>{t("submit")}</Button>

        <form action={skipOnboardingAction} className="mt-3">
          <SubmitButton variant="outline">{t("skip")}</SubmitButton>
        </form>
      </div>
    </div>
  );
}
