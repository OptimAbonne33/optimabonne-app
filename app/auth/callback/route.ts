import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function publicOrigin(request: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (site) return site;

  const proto = (
    request.headers.get("x-forwarded-proto") || "https"
  )
    .split(",")[0]
    .trim();
  const host = (
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    ""
  )
    .split(",")[0]
    .trim();

  if (host && !host.includes("localhost") && !host.startsWith("127.")) {
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const origin = publicOrigin(request);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next === "/reset-password") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      await supabase.rpc("sync_billing_access");

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .maybeSingle();

      const destination = profile?.onboarding_completed
        ? next || "/dashboard"
        : "/onboarding";

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
