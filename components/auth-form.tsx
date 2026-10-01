"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signInAction, signUpAction } from "@/app/actions";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import {
  isBlank,
  isEmail,
  isStrongEnoughPassword,
  type FieldErrors,
} from "@/lib/validation";

export function AuthForm({
  initialTab = "login",
}: {
  initialTab?: "login" | "signup";
}) {
  const t = useTranslations("auth");
  const tb = useTranslations("brand");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function switchTab(next: "login" | "signup") {
    setTab(next);
    setFieldErrors({});
    setFormError(null);
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (isBlank(email)) errors.email = te("required");
    else if (!isEmail(email)) errors.email = te("invalidEmail");

    if (isBlank(password)) errors.password = te("required");
    else if (tab === "signup" && !isStrongEnoughPassword(password)) {
      errors.password = te("weakPassword");
    }

    if (tab === "signup" && isBlank(fullName)) {
      errors.fullName = te("required");
    }

    return errors;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    const fd = new FormData();
    fd.set("email", email.trim());
    fd.set("password", password);
    fd.set("fullName", fullName.trim());

    startTransition(async () => {
      try {
        const result =
          tab === "login" ? await signInAction(fd) : await signUpAction(fd);

        if (!result) return;

        if (result.ok) {
          router.replace(result.redirectTo || "/dashboard");
          router.refresh();
          return;
        }

        const key = result.error;
        if (key === "weakPassword") {
          setFieldErrors({ password: te("weakPassword") });
        } else if (key === "emailTaken") {
          setFieldErrors({ email: te("emailTaken") });
        } else if (key === "invalidCredentials") {
          setFormError(te("invalidCredentials"));
        } else if (key.toLowerCase().includes("rate limit")) {
          setFormError(te("emailRateLimit"));
        } else {
          setFormError(key);
        }
      } catch (err) {
        console.error(err);
        setFormError("Une erreur est survenue. Réessayez (hard refresh).");
      }
    });
  }

  return (
    <div className="relative z-10 w-[420px] max-w-[calc(100%-2rem)] rounded-[24px] border border-border bg-surface p-12">
      <div className="mb-2 text-center">
        <Logo size="lg" />
      </div>
      <p className="mb-8 text-center text-[13px] text-muted">{tb("tagline")}</p>

      <div className="mb-7 flex rounded-xl bg-surface2 p-1">
        <button
          type="button"
          onClick={() => switchTab("login")}
          className={`flex-1 rounded-[9px] py-[9px] text-center text-[13px] font-medium ${
            tab === "login" ? "bg-bg text-ink" : "text-muted"
          }`}
        >
          {t("login")}
        </button>
        <button
          type="button"
          onClick={() => switchTab("signup")}
          className={`flex-1 rounded-[9px] py-[9px] text-center text-[13px] font-medium ${
            tab === "signup" ? "bg-bg text-ink" : "text-muted"
          }`}
        >
          {t("signup")}
        </button>
      </div>

      <form onSubmit={onSubmit} noValidate>
        {tab === "signup" ? (
          <Field
            label={t("fullName")}
            name="fullName"
            autoComplete="name"
            value={fullName}
            error={fieldErrors.fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setFieldErrors((prev) => {
                const next = { ...prev };
                delete next.fullName;
                return next;
              });
            }}
          />
        ) : null}
        <Field
          label={t("email")}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="marie@exemple.fr"
          value={email}
          error={fieldErrors.email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((prev) => {
              const next = { ...prev };
              delete next.email;
              return next;
            });
          }}
        />
        <Field
          label={t("password")}
          name="password"
          type="password"
          autoComplete={tab === "login" ? "current-password" : "new-password"}
          placeholder="••••••••"
          value={password}
          error={fieldErrors.password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((prev) => {
              const next = { ...prev };
              delete next.password;
              return next;
            });
          }}
        />

        {tab === "login" ? (
          <div className="mb-5 text-right">
            <span className="text-xs text-muted">{t("forgot")}</span>
          </div>
        ) : null}

        {formError ? (
          <p className="mb-3 rounded-[10px] border border-danger/30 bg-danger/10 px-3 py-2.5 text-[13px] text-danger">
            {formError}
          </p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending
            ? "…"
            : tab === "login"
              ? t("submitLogin")
              : t("submitSignup")}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        {tc("or")}
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        disabled
        className="flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl border border-border bg-surface2 px-4 py-[13px] text-sm font-medium text-muted opacity-60"
      >
        <GoogleIcon />
        {t("google")}
      </button>

      <p className="mt-5 text-center text-xs leading-[1.8] text-muted">
        {tab === "login" ? (
          <>
            {t("noAccount")}{" "}
            <button
              type="button"
              onClick={() => switchTab("signup")}
              className="text-accent"
            >
              {t("createAccount")}
            </button>
          </>
        ) : (
          <>
            {t("hasAccount")}{" "}
            <button
              type="button"
              onClick={() => switchTab("login")}
              className="text-accent"
            >
              {t("goLogin")}
            </button>
          </>
        )}
        <br />
        {t("legal", { terms: t("terms"), privacy: t("privacy") })}
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
