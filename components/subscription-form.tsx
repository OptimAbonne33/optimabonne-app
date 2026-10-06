"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  deleteSubscriptionAction,
  upsertSubscriptionAction,
} from "@/app/actions";
import {
  CATEGORIES,
  type SubscriptionCategory,
  type UserSubscription,
} from "@/lib/types";
import { CategoryIcon } from "@/components/icons";
import { SubmitButton, Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { isBlank, isPositivePrice, type FieldErrors } from "@/lib/validation";

export function SubscriptionForm({
  initial,
  mode = "create",
}: {
  initial?: Partial<UserSubscription>;
  mode?: "create" | "edit";
}) {
  const t = useTranslations("subscriptions");
  const tc = useTranslations("categories");
  const te = useTranslations("errors");
  const [category, setCategory] = useState<SubscriptionCategory>(
    initial?.category || "mobile",
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function validate(fd: FormData): FieldErrors {
    const errors: FieldErrors = {};
    const provider = String(fd.get("provider_name") || "");
    const price = fd.get("monthly_price");

    if (isBlank(provider)) errors.provider_name = te("required");
    if (isBlank(price)) errors.monthly_price = te("required");
    else if (!isPositivePrice(price)) errors.monthly_price = te("invalidPrice");

    return errors;
  }

  function clearErr(key: string) {
    setFieldErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function onSubmit(formData: FormData) {
    formData.set("category", category);
    if (initial?.id) formData.set("id", initial.id);
    setFormError(null);

    const errors = validate(formData);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    startTransition(async () => {
      const result = await upsertSubscriptionAction(formData);
      if (result && !result.ok) {
        setFormError(result.error);
        return;
      }
      router.push(
        mode === "edit" && initial?.id
          ? `/subscriptions/${initial.id}`
          : "/subscriptions",
      );
      router.refresh();
    });
  }

  function onDelete() {
    if (!initial?.id) return;
    if (!confirm(t("deleteConfirm"))) return;
    const fd = new FormData();
    fd.set("id", initial.id);
    startTransition(async () => {
      await deleteSubscriptionAction(fd);
      router.push("/subscriptions");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} noValidate className="max-w-lg">
      <h1 className="mb-6 font-[family-name:var(--font-syne)] text-[22px] font-bold">
        {mode === "edit" ? t("editTitle") : t("createTitle")}
      </h1>

      <p className="mb-1.5 text-[12px] font-semibold text-muted">
        {t("category")}
      </p>
      <div className="mb-5 grid grid-cols-2 gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-[13px] ${
              category === cat
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface2 text-muted"
            }`}
          >
            <CategoryIcon category={cat} size={16} />
            <span className={category === cat ? "text-ink" : ""}>{tc(cat)}</span>
          </button>
        ))}
      </div>

      <Field
        label={t("provider")}
        name="provider_name"
        defaultValue={initial?.provider_name || ""}
        error={fieldErrors.provider_name}
        onChange={() => clearErr("provider_name")}
      />
      <Field
        label={t("price")}
        name="monthly_price"
        type="text"
        inputMode="decimal"
        placeholder="29,99"
        defaultValue={
          initial?.monthly_price != null
            ? String(initial.monthly_price).replace(".", ",")
            : ""
        }
        error={fieldErrors.monthly_price}
        onChange={() => clearErr("monthly_price")}
      />
      <Field
        label={t("date")}
        name="subscribed_at"
        type="date"
        defaultValue={initial?.subscribed_at || ""}
      />

      {formError ? (
        <p className="mb-3 rounded-[10px] border border-danger/30 bg-danger/10 px-3 py-2.5 text-[13px] text-danger">
          {formError}
        </p>
      ) : null}

      <SubmitButton>{t("save")}</SubmitButton>

      {mode === "edit" ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="mt-3 w-full text-center text-[13px] text-danger"
        >
          {t("deleteConfirm")}
        </button>
      ) : null}

      <div className="mt-4">
        <Button variant="outline" onClick={() => router.push("/subscriptions")}>
          {t("backList")}
        </Button>
      </div>
    </form>
  );
}
