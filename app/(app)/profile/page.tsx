import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import type { Profile } from "@/lib/types";

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .maybeSingle();

  const profile: Profile = (data as Profile) || {
    id: user!.id,
    full_name: (user!.user_metadata?.full_name as string) || "",
    email: user!.email || "",
    onboarding_completed: false,
    created_at: "",
    updated_at: "",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-syne)] text-[26px] font-bold">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </div>
      <ProfileForm profile={profile} />
    </div>
  );
}
