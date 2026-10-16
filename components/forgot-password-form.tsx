"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { requestPasswordResetAction } from "@/app/actions";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { isBlank, isEmail } from "@/lib/validation";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const te = useTranslations("errors");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isBlank(email) || !isEmail(email)) {
      setError(te("required"));
      return;
    }

    const fd = new FormData();
    fd.set("email", email.trim());

    startTransition(async () => {
      const result = await requestPasswordResetAction(fd);
      if (!result.ok) {
        setError(
          result.error === "required" ? te("required") : result.error,
        );
        return;
      }
      setSent(true);
    });
  }

  return (
    <div className="w-full max-w-[420px] rounded-[24px] border border-border bg-surface p-8 sm:p-10">
      <div className="mb-8 text-center">
        <Logo size="lg" href="/login" />
        <h1 className="mt-6 font-[family-name:var(--font-syne)] text-[22px] font-bold">
          {t("forgotTitle")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {sent ? t("forgotSentBody") : t("forgotBody")}
        </p>
      </div>

      {sent ? (
        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center rounded-[12px] bg-accent py-[14px] text-sm font-bold text-[#0a0f1e]"
        >
          {t("goLogin")}
        </Link>
      ) : (
        <form onSubmit={onSubmit}>
          <Field
            label={t("email")}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="marie@exemple.fr"
            value={email}
            error={error}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
          />
          <Button type="submit" disabled={pending}>
            {pending ? "…" : t("forgotSubmit")}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-[13px] text-muted">
        <Link href="/login" className="text-accent hover:underline">
          {t("backToLogin")}
        </Link>
      </p>
    </div>
  );
}
