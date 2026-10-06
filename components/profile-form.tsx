"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  deleteAccountAction,
  signOutAction,
  updateProfileAction,
} from "@/app/actions";
import type { Profile } from "@/lib/types";
import { Field } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import {
  isBlank,
  isEmail,
  isStrongEnoughPassword,
  type FieldErrors,
} from "@/lib/validation";

export function ProfileForm({ profile }: { profile: Profile }) {
  const t = useTranslations("profile");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const [msg, setMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteFieldError, setDeleteFieldError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function clearErr(key: string) {
    setFieldErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  function onSave(formData: FormData) {
    setMsg(null);
    setFormError(null);

    const errors: FieldErrors = {};
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const fullName = String(formData.get("fullName") || "");

    if (isBlank(fullName)) errors.fullName = te("required");
    if (isBlank(email)) errors.email = te("required");
    else if (!isEmail(email)) errors.email = te("invalidEmail");
    if (password && !isStrongEnoughPassword(password)) {
      errors.password = te("weakPassword");
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result.ok) setMsg(tc("success"));
      else if (result.error === "emailRateLimit") setFormError(te("emailRateLimit"));
      else setFormError(result.error);
    });
  }

  function onDelete(formData: FormData) {
    setDeleteError(null);
    const confirm = String(formData.get("confirm") || "").trim();

    if (isBlank(confirm)) {
      setDeleteFieldError(te("required"));
      return;
    }
    if (confirm !== t("deleteWord")) {
      setDeleteFieldError(te("invalidConfirm"));
      return;
    }
    setDeleteFieldError(null);

    startTransition(async () => {
      const result = await deleteAccountAction(formData);
      if (result && !result.ok) setDeleteError(result.error);
    });
  }

  return (
    <div className="grid max-w-3xl gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="mb-5 font-[family-name:var(--font-syne)] text-sm font-bold">
          {t("title")}
        </h2>
        <form action={onSave} noValidate>
          <Field
            label={t("fullName")}
            name="fullName"
            autoComplete="given-name"
            placeholder={t("fullNamePlaceholder")}
            defaultValue={profile.full_name || ""}
            error={fieldErrors.fullName}
            onChange={() => clearErr("fullName")}
          />
          <Field
            label={t("email")}
            name="email"
            type="email"
            defaultValue={profile.email || ""}
            error={fieldErrors.email}
            onChange={() => clearErr("email")}
          />
          <Field
            label={t("password")}
            name="password"
            type="password"
            hint={t("passwordHint")}
            placeholder="••••••••"
            error={fieldErrors.password}
            onChange={() => clearErr("password")}
          />
          {msg ? <p className="mb-3 text-[13px] text-accent">{msg}</p> : null}
          {formError ? (
            <p className="mb-3 rounded-[10px] border border-danger/30 bg-danger/10 px-3 py-2.5 text-[13px] text-danger">
              {formError}
            </p>
          ) : null}
          <SubmitButton>{t("save")}</SubmitButton>
        </form>
        <form action={signOutAction} className="mt-3">
          <SubmitButton variant="outline">{t("logout")}</SubmitButton>
        </form>
      </div>

      <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6">
        <h2 className="mb-2 font-[family-name:var(--font-syne)] text-sm font-bold text-danger">
          {t("danger")}
        </h2>
        <p className="mb-5 text-[13px] text-muted">{t("deleteHint")}</p>
        <form action={onDelete} noValidate>
          <Field
            label={t("deleteConfirm")}
            name="confirm"
            placeholder={t("deleteWord")}
            error={deleteFieldError}
            onChange={() => setDeleteFieldError(null)}
          />
          {deleteError ? (
            <p className="mb-3 rounded-[10px] border border-danger/30 bg-danger/10 px-3 py-2.5 text-[13px] text-danger">
              {deleteError}
            </p>
          ) : null}
          <SubmitButton variant="danger">{t("deleteAccount")}</SubmitButton>
        </form>
      </div>
    </div>
  );
}
