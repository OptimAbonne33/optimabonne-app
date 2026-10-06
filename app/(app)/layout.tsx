import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { BillingBanner } from "@/components/billing/billing-banner";
import { emptyBilling } from "@/lib/billing";
import { isStripeConfigured } from "@/lib/stripe";
import type { BillingSubscription, Profile } from "@/lib/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, { data: billingRow }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("billing_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const p = profile as Profile | null;
  const billing =
    (billingRow as BillingSubscription | null) || emptyBilling(user.id);

  return (
    <div className="relative z-[1] flex min-h-screen overflow-x-hidden bg-bg">
      <AppSidebar
        userName={p?.full_name || p?.email || user.email || "User"}
        billingStatus={billing.status}
      />
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-28 sm:px-6 md:px-10 md:py-8 md:pb-8">
        <BillingBanner
          status={billing.status}
          configured={isStripeConfigured()}
        />
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
