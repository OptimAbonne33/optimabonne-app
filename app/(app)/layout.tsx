import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import type { Profile } from "@/lib/types";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const p = profile as Profile | null;

  return (
    <div className="relative z-[1] flex min-h-screen bg-bg">
      <AppSidebar userName={p?.full_name || p?.email || user.email || "User"} />
      <div className="flex-1 overflow-y-auto px-6 py-8 pb-24 md:px-10 md:pb-8">
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
