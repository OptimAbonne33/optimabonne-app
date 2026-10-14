"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { isAdminUser } from "@/lib/admin";
import type { SubscriptionCategory } from "@/lib/types";
import type { Offer } from "@/lib/optimization";
import type { ActionResult } from "@/app/actions";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminUser(user)) {
    return { ok: false as const, error: "forbidden" };
  }
  return { ok: true as const, user, admin: createServiceClient() };
}

function snapshot(row: Record<string, unknown>) {
  return {
    category: row.category,
    provider_name: row.provider_name,
    offer_name: row.offer_name,
    monthly_price: row.monthly_price,
    annual_price: row.annual_price,
    description: row.description,
    affiliate_url: row.affiliate_url,
    official_url: row.official_url,
    data_allowance: row.data_allowance,
    last_verified_at: row.last_verified_at,
    is_active: row.is_active,
    sort_priority: row.sort_priority,
  };
}

async function logRevision(
  admin: ReturnType<typeof createServiceClient>,
  offerId: string,
  actorUserId: string,
  action: string,
  row: Record<string, unknown>,
) {
  await admin.from("offer_revisions").insert({
    offer_id: offerId,
    actor_user_id: actorUserId,
    action,
    snapshot: snapshot(row),
  });
}

type ParsedOffer =
  | { ok: false; error: string }
  | {
      ok: true;
      data: {
        category: SubscriptionCategory;
        provider_name: string;
        offer_name: string;
        monthly_price: number;
        annual_price: number;
        description: string | null;
        affiliate_url: string;
        official_url: string;
        data_allowance: string | null;
        last_verified_at: string;
        is_active: boolean;
        sort_priority: number;
      };
    };

function parseOfferForm(formData: FormData): ParsedOffer {
  const category = String(formData.get("category") || "mobile") as SubscriptionCategory;
  const provider_name = String(formData.get("provider_name") || "").trim();
  const offer_name = String(formData.get("offer_name") || "").trim();
  const monthlyRaw = String(formData.get("monthly_price") || "").replace(",", ".");
  const monthly_price = Number(monthlyRaw);
  const annualRaw = String(formData.get("annual_price") || "").replace(",", ".");
  const annual_price = annualRaw ? Number(annualRaw) : null;
  const description = String(formData.get("description") || "").trim() || null;
  const affiliate_url = String(formData.get("affiliate_url") || "").trim();
  const officialRaw = String(formData.get("official_url") || "").trim();
  const official_url = officialRaw || affiliate_url;
  const data_allowance = String(formData.get("data_allowance") || "").trim() || null;
  const last_verified_at =
    String(formData.get("last_verified_at") || "").trim() ||
    new Date().toISOString().slice(0, 10);
  const is_active = String(formData.get("is_active") || "") === "on";
  const sort_priority = Number(formData.get("sort_priority") || 0) || 0;

  if (!provider_name || !offer_name || !affiliate_url) {
    return { ok: false, error: "required" };
  }
  if (!Number.isFinite(monthly_price) || monthly_price < 0) {
    return { ok: false, error: "invalidPrice" };
  }
  if (annual_price !== null && (!Number.isFinite(annual_price) || annual_price < 0)) {
    return { ok: false, error: "invalidPrice" };
  }

  return {
    ok: true,
    data: {
      category,
      provider_name,
      offer_name,
      monthly_price,
      annual_price:
        annual_price === null ? Math.round(monthly_price * 12 * 100) / 100 : annual_price,
      description,
      affiliate_url,
      official_url,
      data_allowance,
      last_verified_at,
      is_active,
      sort_priority,
    },
  };
}

export async function listAdminOffersAction(): Promise<
  { ok: true; offers: Offer[] } | { ok: false; error: string }
> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate;

  const { data, error } = await gate.admin
    .from("offers")
    .select("*")
    .order("category")
    .order("sort_priority")
    .order("monthly_price");

  if (error) return { ok: false, error: error.message };
  return { ok: true, offers: (data || []) as Offer[] };
}

export async function createOfferAction(formData: FormData): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const parsed = parseOfferForm(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { data: row, error } = await gate.admin
    .from("offers")
    .insert(parsed.data)
    .select("*")
    .single();

  if (error || !row) return { ok: false, error: error?.message || "billingUnavailable" };

  await logRevision(gate.admin, row.id, gate.user.id, "create", row);
  revalidatePath("/admin/offers");
  revalidatePath("/recommendations");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateOfferAction(formData: FormData): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, error: "required" };

  const parsed = parseOfferForm(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { data: row, error } = await gate.admin
    .from("offers")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !row) return { ok: false, error: error?.message || "billingUnavailable" };

  await logRevision(gate.admin, row.id, gate.user.id, "update", row);
  revalidatePath("/admin/offers");
  revalidatePath("/recommendations");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function setOfferActiveAction(formData: FormData): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const id = String(formData.get("id") || "");
  const is_active = String(formData.get("is_active") || "") === "true";
  if (!id) return { ok: false, error: "required" };

  const { data: row, error } = await gate.admin
    .from("offers")
    .update({
      is_active,
      last_verified_at: new Date().toISOString().slice(0, 10),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !row) return { ok: false, error: error?.message || "billingUnavailable" };

  await logRevision(
    gate.admin,
    row.id,
    gate.user.id,
    is_active ? "activate" : "deactivate",
    row,
  );
  revalidatePath("/admin/offers");
  revalidatePath("/recommendations");
  revalidatePath("/dashboard");
  return { ok: true };
}
