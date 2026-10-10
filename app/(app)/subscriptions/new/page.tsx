import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SubscriptionForm } from "@/components/subscription-form";

export const metadata: Metadata = {
  title: "Nouvel abonnement",
  description: "Ajoutez un abonnement pour enrichir votre score d'optimisation.",
};

export default async function NewSubscriptionPage() {
  const t = await getTranslations("subscriptions");

  return (
    <div>
      <Link
        href="/subscriptions"
        className="mb-6 inline-block text-[13px] text-muted hover:text-ink"
      >
        {t("backList")}
      </Link>
      <SubscriptionForm mode="create" />
    </div>
  );
}
