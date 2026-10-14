import type { User } from "@supabase/supabase-js";

export function isAdminUser(user: User | null | undefined) {
  if (!user) return false;
  const role = user.app_metadata?.role;
  return role === "admin";
}
