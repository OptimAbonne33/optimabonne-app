"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  createOfferAction,
  setOfferActiveAction,
  updateOfferAction,
} from "@/app/offers-actions";
import { SubmitButton } from "@/components/ui/button";
import type { Offer } from "@/lib/optimization";
import { CATEGORIES, type SubscriptionCategory } from "@/lib/types";

export function OffersAdmin({ offers }: { offers: Offer[] }) {
  const t = useTranslations("adminOffers");
  const te = useTranslations("errors");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [creating, setCreating] = useState(false);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    const result = await action();
    if (!result.ok) {
      setError(te(result.error || "required"));
      return;
    }
    setEditing(null);
    setCreating(false);
    router.refresh();
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-[26px] font-bold">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditing(null);
          }}
          className="rounded-[12px] bg-accent px-4 py-2.5 text-sm font-bold text-[#0a0f1e]"
        >
          {t("newOffer")}
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-[10px] border border-danger/30 bg-danger/10 px-3 py-2.5 text-[13px] text-danger">
          {error}
        </p>
      ) : null}

      {(creating || editing) && (
        <OfferForm
          key={editing?.id || "new"}
          offer={editing}
          submitLabel={editing ? t("save") : t("create")}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSubmit={(formData) =>
            run(() =>
              editing ? updateOfferAction(formData) : createOfferAction(formData),
            )
          }
        />
      )}

      <div className="mt-6 space-y-3">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {offer.category}
                  {offer.data_allowance ? ` · ${offer.data_allowance}` : ""}
                </p>
                <p className="mt-1 font-[family-name:var(--font-syne)] text-lg font-bold">
                  {offer.provider_name} — {offer.offer_name}
                </p>
                <p className="mt-1 text-sm text-accent">
                  {Number(offer.monthly_price).toFixed(2)}€ / mois
                  {!offer.is_active ? (
                    <span className="ml-2 text-danger">{t("inactive")}</span>
                  ) : null}
                </p>
                {offer.last_verified_at ? (
                  <p className="mt-1 text-[12px] text-muted">
                    {t("verified", { date: offer.last_verified_at })}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-xl border border-border px-3 py-2 text-[13px] font-semibold"
                  onClick={() => {
                    setEditing(offer);
                    setCreating(false);
                  }}
                >
                  {t("edit")}
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-border px-3 py-2 text-[13px] font-semibold"
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("id", offer.id);
                    fd.set("is_active", offer.is_active ? "false" : "true");
                    void run(() => setOfferActiveAction(fd));
                  }}
                >
                  {offer.is_active ? t("deactivate") : t("activate")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OfferForm({
  offer,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  offer: Offer | null;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void | Promise<void>;
}) {
  const t = useTranslations("adminOffers");

  return (
    <form
      action={onSubmit}
      className="mb-6 rounded-2xl border border-accent/30 bg-accent/5 p-4 sm:p-6"
    >
      {offer ? <input type="hidden" name="id" value={offer.id} /> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-[12px] font-semibold text-muted">
          {t("category")}
          <select
            name="category"
            defaultValue={offer?.category || "mobile"}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink"
          >
            {CATEGORIES.map((c: SubscriptionCategory) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[12px] font-semibold text-muted">
          {t("dataAllowance")}
          <input
            name="data_allowance"
            defaultValue={offer?.data_allowance || ""}
            placeholder="100Go"
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink"
          />
        </label>
        <label className="text-[12px] font-semibold text-muted">
          {t("provider")}
          <input
            name="provider_name"
            required
            defaultValue={offer?.provider_name || ""}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink"
          />
        </label>
        <label className="text-[12px] font-semibold text-muted">
          {t("offerName")}
          <input
            name="offer_name"
            required
            defaultValue={offer?.offer_name || ""}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink"
          />
        </label>
        <label className="text-[12px] font-semibold text-muted">
          {t("monthlyPrice")}
          <input
            name="monthly_price"
            required
            defaultValue={offer ? String(offer.monthly_price) : ""}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink"
          />
        </label>
        <label className="text-[12px] font-semibold text-muted">
          {t("annualPrice")}
          <input
            name="annual_price"
            defaultValue={offer?.annual_price != null ? String(offer.annual_price) : ""}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink"
          />
        </label>
        <label className="text-[12px] font-semibold text-muted sm:col-span-2">
          {t("officialUrl")}
          <input
            name="official_url"
            defaultValue={offer?.official_url || ""}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink"
          />
        </label>
        <label className="text-[12px] font-semibold text-muted sm:col-span-2">
          {t("affiliateUrl")}
          <input
            name="affiliate_url"
            required
            defaultValue={offer?.affiliate_url || ""}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink"
          />
        </label>
        <label className="text-[12px] font-semibold text-muted sm:col-span-2">
          {t("description")}
          <textarea
            name="description"
            rows={2}
            defaultValue={offer?.description || ""}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink"
          />
        </label>
        <label className="text-[12px] font-semibold text-muted">
          {t("lastVerified")}
          <input
            type="date"
            name="last_verified_at"
            defaultValue={offer?.last_verified_at?.slice(0, 10) || ""}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink"
          />
        </label>
        <label className="text-[12px] font-semibold text-muted">
          {t("sortPriority")}
          <input
            name="sort_priority"
            defaultValue={offer ? String(offer.sort_priority) : "10"}
            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-ink"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink sm:col-span-2">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={offer?.is_active ?? true}
            className="size-4"
          />
          {t("active")}
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <SubmitButton className="sm:!w-auto">{submitLabel}</SubmitButton>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[12px] border border-border px-5 py-[14px] text-sm font-bold"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
