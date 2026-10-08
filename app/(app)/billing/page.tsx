import { createClient } from "@/lib/supabase/server";
import { BillingView } from "@/components/billing/billing-view";
import { emptyBilling, isTrialEligible } from "@/lib/billing";
import { isStripeConfigured } from "@/lib/stripe";
import type { BillingSubscription } from "@/lib/types";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("billing_subscriptions")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  const billing = data
    ? ({
        ...data,
        cancel_at_period_end: Boolean(
          (data as BillingSubscription).cancel_at_period_end,
        ),
      } as BillingSubscription)
    : emptyBilling(user!.id);

  return (
    <BillingView
      billing={billing}
      configured={isStripeConfigured()}
      trialEligible={isTrialEligible(billing)}
      checkout={checkout}
    />
  );
}
