import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";

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

  return (
    <main className="relative z-[1] flex min-h-screen flex-col items-center justify-center bg-bg">
      <OnboardingForm />
    </main>
  );
}
