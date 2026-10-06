"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyZapier } from "@/lib/zapier";
import type { BillingPlan, SubscriptionCategory } from "@/lib/types";
import { parsePrice } from "@/lib/validation";
import {
  TRIAL_DAYS,
  checkoutTag,
  getSiteUrl,
  getStripe,
  isStripeConfigured,
  priceIdForPlan,
} from "@/lib/stripe";

export type ActionResult =
  | { ok: true; redirectTo?: string }
  | { ok: false; error: string };

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "").trim();

  if (!email || !password) {
    return { ok: false, error: "required" };
  }
  if (password.length < 6) {
    return { ok: false, error: "weakPassword" };
  }

  const supabase = await createClient();
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return { ok: false, error: "emailTaken" };
    }
    return { ok: false, error: error.message };
  }

  notifyZapier("new_signup", {
    user_id: data.user?.id,
    email,
    full_name: fullName,
  });

  if (data.session) {
    return { ok: true, redirectTo: "/onboarding" };
  }

  return { ok: true, redirectTo: "/verify-email" };
}

export async function signInAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: "invalidCredentials" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .maybeSingle();

  return {
    ok: true,
    redirectTo: profile?.onboarding_completed ? "/dashboard" : "/onboarding",
  };
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "notAuthenticated" };

  const fullName = String(formData.get("fullName") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const currentEmail = (user.email || "").toLowerCase();

  // profile table first 
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, email })
    .eq("id", user.id);

  if (profileError) return { ok: false, error: profileError.message };

  const emailChanged = Boolean(email) && email !== currentEmail;
  const passwordChanged = password.length >= 6;
  const metaChanged = fullName !== (user.user_metadata?.full_name || "");

  if (!emailChanged && !passwordChanged && !metaChanged) {
    return { ok: true };
  }

  const authUpdates: { email?: string; password?: string; data?: object } = {};
  if (metaChanged) authUpdates.data = { full_name: fullName };
  if (emailChanged) authUpdates.email = email;
  if (passwordChanged) authUpdates.password = password;

  const { error: authError } = await supabase.auth.updateUser(authUpdates);
  if (authError) {
    const msg = authError.message.toLowerCase();
    if (msg.includes("rate limit") || msg.includes("email rate")) {
      return { ok: false, error: "emailRateLimit" };
    }
    return { ok: false, error: authError.message };
  }

  return { ok: true };
}

export async function deleteAccountAction(
  formData: FormData,
): Promise<ActionResult> {
  const confirm = String(formData.get("confirm") || "");
  if (confirm !== "SUPPRIMER" && confirm !== "DELETE") {
    return { ok: false, error: "required" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "notAuthenticated" };

  try {
    const { createServiceClient } = await import("@/lib/supabase/admin");
    const admin = createServiceClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return { ok: false, error: error.message };
  } catch {
    return {
      ok: false,
      error: "Service role key missing — cannot delete auth user yet",
    };
  }

  await supabase.auth.signOut();
  redirect("/login");
}

export async function upsertSubscriptionAction(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "notAuthenticated" };

  const id = String(formData.get("id") || "");
  const provider_name = String(formData.get("provider_name") || "").trim();
  const category = String(formData.get("category") || "") as SubscriptionCategory;
  const monthly_price = parsePrice(formData.get("monthly_price"));
  const subscribed_at = String(formData.get("subscribed_at") || "") || null;

  if (!provider_name || !category) {
    return { ok: false, error: "required" };
  }
  if (!Number.isFinite(monthly_price) || monthly_price <= 0) {
    return { ok: false, error: "invalidPrice" };
  }

  const row = {
    provider_name,
    category,
    monthly_price,
    subscribed_at,
    user_id: user.id,
  };

  if (id) {
    const { data: prev } = await supabase
      .from("user_subscriptions")
      .select("monthly_price")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    const { error } = await supabase
      .from("user_subscriptions")
      .update(row)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return { ok: false, error: error.message };

    if (
      !prev ||
      Number(prev.monthly_price) !== monthly_price
    ) {
      const { ensurePriceHistoryPoint } = await import("@/lib/data");
      await ensurePriceHistoryPoint(
        id,
        monthly_price,
        prev ? "Mise à jour" : "Prix actuel",
      );
    }
  } else {
    const { data: created, error } = await supabase
      .from("user_subscriptions")
      .insert(row)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };

    const { ensurePriceHistoryPoint } = await import("@/lib/data");
    await ensurePriceHistoryPoint(
      created.id,
      monthly_price,
      subscribed_at ? "Prix initial" : "Prix actuel",
    );
  }

  return { ok: true };
}

export async function deleteSubscriptionAction(
  formData: FormData,
): Promise<ActionResult> {
  const id = String(formData.get("id") || "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "notAuthenticated" };

  const { error } = await supabase
    .from("user_subscriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function completeOnboardingAction(
  formData: FormData,
): Promise<ActionResult> {
  const raw = String(formData.get("subscriptions") || "[]");
  let items: Array<{
    provider_name: string;
    category: SubscriptionCategory;
    monthly_price: number;
    subscribed_at: string | null;
  }> = [];

  try {
    items = JSON.parse(raw);
  } catch {
    return { ok: false, error: "required" };
  }

  items = items.map((item) => ({
    ...item,
    provider_name: String(item.provider_name || "").trim(),
    monthly_price: parsePrice(item.monthly_price),
    subscribed_at: item.subscribed_at || null,
  }));

  if (
    items.some(
      (item) =>
        !item.provider_name ||
        !item.category ||
        !Number.isFinite(item.monthly_price) ||
        item.monthly_price <= 0,
    )
  ) {
    return { ok: false, error: "invalidPrice" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "notAuthenticated" };

  if (items.length) {
    const { data: created, error } = await supabase
      .from("user_subscriptions")
      .insert(items.map((item) => ({ ...item, user_id: user.id })))
      .select("id, monthly_price, subscribed_at");
    if (error) return { ok: false, error: error.message };

    const { ensurePriceHistoryPoint } = await import("@/lib/data");
    await Promise.all(
      (created || []).map((row) =>
        ensurePriceHistoryPoint(
          row.id,
          Number(row.monthly_price),
          row.subscribed_at ? "Prix initial" : "Prix actuel",
        ),
      ),
    );
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (profileError) return { ok: false, error: profileError.message };

  redirect("/dashboard");
}

export async function skipOnboardingAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  redirect("/dashboard");
}

export async function startCheckoutAction(formData: FormData): Promise<ActionResult> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "billingNotConfigured" };
  }

  const planRaw = String(formData.get("plan") || "");
  const plan: BillingPlan = planRaw === "annual" ? "annual" : "monthly";
  const stripe = getStripe();
  const priceId = priceIdForPlan(plan);
  if (!stripe || !priceId) {
    return { ok: false, error: "billingNotConfigured" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "notAuthenticated" };

  const { data: billing } = await supabase
    .from("billing_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let customerId = billing?.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("billing_subscriptions")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id);
  }

  const siteUrl = getSiteUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    locale: "fr",
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { user_id: user.id, plan },
    },
    metadata: { user_id: user.id, plan },
    success_url: `${siteUrl}/billing?checkout=success`,
    cancel_url: `${siteUrl}/billing?checkout=cancel`,
    integration_identifier: checkoutTag(plan),
  });

  if (!session.url) return { ok: false, error: "billingUnavailable" };
  redirect(session.url);
}

export async function openBillingPortalAction(): Promise<ActionResult> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "billingNotConfigured" };
  }

  const stripe = getStripe();
  if (!stripe) return { ok: false, error: "billingNotConfigured" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "notAuthenticated" };

  const { data: billing } = await supabase
    .from("billing_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!billing?.stripe_customer_id) {
    return { ok: false, error: "billingUnavailable" };
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: billing.stripe_customer_id,
    return_url: `${getSiteUrl()}/billing`,
  });

  if (!portal.url) return { ok: false, error: "billingUnavailable" };
  redirect(portal.url);
}
