import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionForm } from "@/components/subscription-form";
import type { UserSubscription } from "@/lib/types";

export const metadata: Metadata = {
  title: "Modifier l'abonnement",
  description: "Mettez à jour les informations de votre abonnement OptimAbonne.",
};

export default async function EditSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("subscriptions");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (!data) notFound();

  return (
    <div>
      <Link
        href={`/subscriptions/${id}`}
        className="mb-6 inline-block text-[13px] text-muted hover:text-ink"
      >
        {t("backDetail")}
      </Link>
      <SubscriptionForm mode="edit" initial={data as UserSubscription} />
    </div>
  );
}
