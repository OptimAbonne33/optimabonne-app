import { createClient } from "@/lib/supabase/server";
import { loadOptimization } from "@/lib/data";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { IconArrowRight } from "@/components/icons";
import { displayFirstName } from "@/lib/types";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, optimization] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle(),
    loadOptimization(user!.id),
  ]);

  const firstName = displayFirstName(
    profile?.full_name || profile?.email || user!.email,
    "là",
  );

  if (
    !profile?.onboarding_completed &&
    optimization.subscriptions.length === 0
  ) {
    return (
      <div>
        <h1 className="font-[family-name:var(--font-syne)] text-[26px] font-bold tracking-tight">
          {t("hello", { name: firstName })}
        </h1>
        <Link
          href="/onboarding"
          className="mt-6 flex items-center justify-between rounded-2xl border border-accent/30 bg-accent/10 px-6 py-5 text-sm text-accent"
        >
          {t("ctaOnboarding")}
          <IconArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <DashboardView
      firstName={firstName}
      subscriptions={optimization.subscriptions}
      result={optimization.result}
    />
  );
}
