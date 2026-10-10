import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: "Vérifiez votre e-mail",
  description:
    "Confirmez votre adresse e-mail pour activer votre compte OptimAbonne.",
};

export default async function VerifyEmailPage() {
  const t = await getTranslations("auth");

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md rounded-[24px] border border-border bg-surface p-12 text-center">
        <Logo size="lg" />
        <div className="mt-8 text-[40px]">📧</div>
        <h1 className="mt-4 font-[family-name:var(--font-syne)] text-[22px] font-bold">
          {t("verifyTitle")}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{t("verifyBody")}</p>
        <p className="mt-2 text-[12px] text-muted">{t("checkSpam")}</p>
        <Link
          href="/login"
          className="mt-8 inline-flex w-full items-center justify-center rounded-[12px] bg-accent py-[14px] text-sm font-bold text-[#0a0f1e]"
        >
          {t("goLogin")}
        </Link>
      </div>
    </main>
  );
}
