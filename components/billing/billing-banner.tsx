"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import type { BillingStatus } from "@/lib/types";

export function BillingBanner({
  status,
  entitled,
  configured,
}: {
  status: BillingStatus;
  entitled: boolean;
  configured: boolean;
}) {
  const pathname = usePathname();
  const t = useTranslations("billing");

  if (pathname.startsWith("/billing")) return null;

  if (status === "past_due") {
    return (
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-warn/20 bg-warn/[0.08] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-warn">{t("bannerPastDue")}</p>
        <Link
          href="/billing"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-[#0a0f1e]"
        >
          {t("bannerPastDueCta")}
        </Link>
      </div>
    );
  }

  if (!configured) return null;
  if (entitled) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-warn/20 bg-warn/[0.08] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] text-warn">{t("bannerLocked")}</p>
      <Link
        href="/billing"
        className="inline-flex shrink-0 items-center justify-center rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-[#0a0f1e]"
      >
        {t("bannerCta")}
      </Link>
    </div>
  );
}
