import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { BillingBanner } from "@/components/billing/billing-banner";
import { TallyPrompt } from "@/components/tally-prompt";
import { isAdminUser } from "@/lib/admin";
import { emptyBilling, type BillingAccess } from "@/lib/billing";
import { isStripeConfigured } from "@/lib/stripe";
import type { BillingStatus, BillingSubscription, Profile } from "@/lib/types";

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

  const [{ data: profile }, { data: billingRow }, { data: accessRaw }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("billing_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.rpc("sync_billing_access"),
    ]);

  const access = accessRaw as BillingAccess | null;
  const p = profile as Profile | null;
  const billing =
    (billingRow as BillingSubscription | null) || emptyBilling(user.id);
  const status = (access?.status || billing.status) as BillingStatus;
  const isAdmin = isAdminUser(user);
  const entitled = Boolean(access?.entitled || isAdmin);

  return (
    <div className="relative z-[1] flex min-h-dvh overflow-x-hidden bg-bg">
      <AppSidebar
        userName={p?.full_name || p?.email || user.email || "User"}
        billingStatus={status}
        isAdmin={isAdmin}
      />
      <div className="flex-1 overflow-y-auto px-5 py-6 pb-28 sm:px-8 md:px-10 md:py-8 md:pb-8">
        <BillingBanner
          status={status}
          entitled={entitled}
          configured={isStripeConfigured()}
        />
        {children}
      </div>
      <MobileNav />
      <TallyPrompt open={entitled && p?.tally_completed === false} />
    </div>
  );
}
