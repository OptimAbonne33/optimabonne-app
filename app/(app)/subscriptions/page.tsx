import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionList } from "@/components/subscription-list";
import type { UserSubscription } from "@/lib/types";

export const metadata: Metadata = {
  title: "Mes abonnements",
  description:
    "Gérez vos abonnements mobile, internet, streaming et énergie au même endroit.",
};

export default async function SubscriptionsPage() {
  const t = await getTranslations("subscriptions");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-[26px] font-bold">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>
      <SubscriptionList items={(data || []) as UserSubscription[]} />
    </div>
  );
}
