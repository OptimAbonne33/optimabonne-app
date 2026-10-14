import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/admin";
import { OffersAdmin } from "@/components/admin/offers-admin";
import type { Offer } from "@/lib/optimization";

export const metadata: Metadata = {
  title: "Admin offres",
  description: "Gérez le catalogue d'offres OptimAbonne.",
};

export default async function AdminOffersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) redirect("/dashboard");

  const admin = createServiceClient();
  const { data } = await admin
    .from("offers")
    .select("*")
    .order("category")
    .order("sort_priority")
    .order("monthly_price");

  return <OffersAdmin offers={(data || []) as Offer[]} />;
}
