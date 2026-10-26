import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { BillingAccess } from "@/lib/billing";
import { getSupabaseKey, getSupabaseUrl } from "./env";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((c) => {
    to.cookies.set(c.name, c.value);
  });
  return to;
}

function redirectWithCookies(
  request: NextRequest,
  supabaseResponse: NextResponse,
  pathname: string,
) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";
  return copyCookies(supabaseResponse, NextResponse.redirect(redirectUrl));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = getSupabaseUrl();
  const key = getSupabaseKey();

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([headerKey, value]) =>
          supabaseResponse.headers.set(headerKey, value),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const path = request.nextUrl.pathname;
  const isPublic =
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/forgot-password") ||
    path.startsWith("/verify-email") ||
    path.startsWith("/auth") ||
    path.startsWith("/api/webhooks") ||
    path === "/sitemap.xml" ||
    path === "/robots.txt" ||
    path.startsWith("/cgu") ||
    path.startsWith("/cgv");

  if (!user && !isPublic && path !== "/" && path !== "/reset-password") {
    return redirectWithCookies(request, supabaseResponse, "/login");
  }

  if (
    user &&
    (path.startsWith("/login") ||
      path.startsWith("/signup") ||
      path.startsWith("/forgot-password"))
  ) {
    return redirectWithCookies(request, supabaseResponse, "/");
  }

  const billingExempt =
    isPublic ||
    path === "/" ||
    path.startsWith("/billing") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/reset-password") ||
    path.startsWith("/api/");

  if (user && !billingExempt) {
    const { data: access } = await supabase.rpc("sync_billing_access");
    const billing = access as BillingAccess | null;

    if (billing && billing.email_confirmed === false) {
      return redirectWithCookies(request, supabaseResponse, "/verify-email");
    }

    if (!billing?.entitled) {
      return redirectWithCookies(request, supabaseResponse, "/billing");
    }
  }

  return supabaseResponse;
}
