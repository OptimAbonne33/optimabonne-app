import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";
import { SiteFooter } from "@/components/site-footer";
import { TallyPrompt } from "@/components/tally-prompt";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = {
  title: "Onboarding",
  description:
    "Ajoutez votre premier abonnement et démarrez votre optimisation OptimAbonne.",
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tally_completed")
    .eq("id", user.id)
    .maybeSingle();

  const showTally =
    (profile as Pick<Profile, "tally_completed"> | null)?.tally_completed ===
    false;

  return (
    <div className="relative z-[1] flex min-h-dvh flex-col bg-bg">
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <OnboardingForm />
      </main>
      <div className="px-5 sm:px-8">
        <SiteFooter />
      </div>
      <TallyPrompt open={showTally} />
    </div>
  );
}
