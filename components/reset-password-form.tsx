"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updatePasswordAction } from "@/app/actions";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { isStrongEnoughPassword } from "@/lib/validation";

export function ResetPasswordForm({ hasSession }: { hasSession: boolean }) {
  const t = useTranslations("auth");
  const te = useTranslations("errors");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!hasSession) {
    return (
      <div className="w-full max-w-[420px] rounded-[24px] border border-border bg-surface p-8 text-center sm:p-10">
        <Logo size="lg" href="/login" />
        <h1 className="mt-6 font-[family-name:var(--font-syne)] text-[22px] font-bold">
          {t("resetInvalidTitle")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {t("resetInvalidBody")}
        </p>
        <Link
          href="/forgot-password"
          className="mt-8 inline-flex w-full items-center justify-center rounded-[12px] bg-accent py-[14px] text-sm font-bold text-[#0a0f1e]"
        >
          {t("forgotSubmit")}
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isStrongEnoughPassword(password)) {
      setError(te("weakPassword"));
      return;
    }
    if (password !== confirmPassword) {
      setError(te("passwordMismatch"));
      return;
    }

    const fd = new FormData();
    fd.set("password", password);
    fd.set("confirmPassword", confirmPassword);

    startTransition(async () => {
      const result = await updatePasswordAction(fd);
      if (!result.ok) {
        const known = [
          "weakPassword",
          "passwordMismatch",
          "resetLinkInvalid",
          "notAuthenticated",
        ] as const;
        setError(
          (known as readonly string[]).includes(result.error)
            ? te(result.error as (typeof known)[number])
            : result.error,
        );
        return;
      }
      router.push(result.redirectTo || "/dashboard");
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-[420px] rounded-[24px] border border-border bg-surface p-8 sm:p-10">
      <div className="mb-8 text-center">
        <Logo size="lg" href="/login" />
        <h1 className="mt-6 font-[family-name:var(--font-syne)] text-[22px] font-bold">
          {t("resetTitle")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {t("resetBody")}
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <Field
          label={t("newPassword")}
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(null);
          }}
        />
        <Field
          label={t("confirmPassword")}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          error={error}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setError(null);
          }}
        />
        <Button type="submit" disabled={pending}>
          {pending ? "…" : t("resetSubmit")}
        </Button>
      </form>
    </div>
  );
}
