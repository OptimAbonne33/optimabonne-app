import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { UserSubscription } from "@/lib/types";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: subs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
    supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
  ]);

  const items = (subs || []) as UserSubscription[];
  const total = items.reduce((s, i) => s + Number(i.monthly_price), 0);

  return (
    <div>
      <div className="mb-9">
        <h1 className="font-[family-name:var(--font-syne)] text-[26px] font-bold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {t("welcome")}
          {profile?.full_name ? `, ${profile.full_name}` : ""} — {t("subtitle")}
        </p>
      </div>

      <div className="mb-5 grid gap-5 md:grid-cols-2">
        <div className="rounded-[16px] border border-border bg-surface p-6">
          <p className="text-[11px] font-semibold tracking-wide text-muted">
            {t("totalSpend")}
          </p>
          <p className="mt-3 font-[family-name:var(--font-ibm-plex)] text-[36px] font-semibold text-accent">
            {total.toFixed(2)}€
          </p>
        </div>
        <div className="rounded-[16px] border border-border bg-surface p-6">
          <p className="text-[11px] font-semibold tracking-wide text-muted">
            {t("count")}
          </p>
          <p className="mt-3 font-[family-name:var(--font-syne)] text-[36px] font-extrabold">
            {items.length}
          </p>
        </div>
      </div>

      {!profile?.onboarding_completed || items.length === 0 ? (
        <Link
          href="/onboarding"
          className="mb-5 flex items-center justify-between rounded-2xl border border-accent/30 bg-accent/10 px-6 py-5 text-sm text-accent"
        >
          {t("ctaOnboarding")}
          <span>→</span>
        </Link>
      ) : null}

      <p className="rounded-2xl border border-border bg-surface p-6 text-[14px] text-muted">
        {t("soon")}
      </p>
    </div>
  );
}
