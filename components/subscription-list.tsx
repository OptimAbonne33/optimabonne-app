"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteSubscriptionAction } from "@/app/actions";
import { CATEGORY_ICONS, type UserSubscription } from "@/lib/types";

export function SubscriptionList({ items }: { items: UserSubscription[] }) {
  const t = useTranslations("subscriptions");
  const tc = useTranslations("categories");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [, startTransition] = useTransition();

  const total = items.reduce((sum, s) => sum + Number(s.monthly_price), 0);

  function onDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await deleteSubscriptionAction(fd);
      router.refresh();
    });
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
        <p className="font-[family-name:var(--font-syne)] text-lg font-semibold">
          {t("empty")}
        </p>
        <p className="mt-2 text-sm text-muted">{t("emptyHint")}</p>
        <Link
          href="/subscriptions/new"
          className="mt-6 inline-flex rounded-[10px] bg-accent px-5 py-2.5 text-[13px] font-semibold text-[#0a0f1e]"
        >
          {t("add")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[12px] text-muted">{t("total")}</p>
          <p className="font-[family-name:var(--font-ibm-plex)] text-[34px] font-semibold text-accent">
            {total.toFixed(2)}€
            <span className="text-sm text-muted">{t("monthly")}</span>
          </p>
        </div>
        <Link
          href="/subscriptions/new"
          className="rounded-[10px] bg-accent px-5 py-2.5 text-[13px] font-semibold text-[#0a0f1e] hover:bg-[#00ffb3]"
        >
          + {t("add")}
        </Link>
      </div>

      <ul className="space-y-3">
        {items.map((sub) => (
          <li
            key={sub.id}
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface2 text-xl">
              {CATEGORY_ICONS[sub.category]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-[family-name:var(--font-syne)] text-base font-bold">
                {sub.provider_name}
              </p>
              <p className="text-[13px] text-muted">{tc(sub.category)}</p>
            </div>
            <p className="font-[family-name:var(--font-ibm-plex)] text-xl font-semibold">
              {Number(sub.monthly_price).toFixed(2)}€
              <span className="text-xs text-muted">{t("monthly")}</span>
            </p>
            <div className="flex gap-2">
              <Link
                href={`/subscriptions/${sub.id}`}
                className="rounded-lg border border-border px-3 py-2 text-[12px] text-muted hover:text-ink"
              >
                {tCommon("edit")}
              </Link>
              <button
                type="button"
                onClick={() => onDelete(sub.id)}
                className="rounded-lg border border-danger/30 px-3 py-2 text-[12px] text-danger"
              >
                ✕
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
