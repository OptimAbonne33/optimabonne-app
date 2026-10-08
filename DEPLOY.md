# OptimAbonne — deploy (Milestone 3)

## Stack

- **App:** Next.js on Vercel (staging + production)
- **Auth / DB:** Supabase
- **Payments:** Stripe Checkout + Customer Portal + webhooks
- **Email events:** Zapier → Mailchimp (`ZAPIER_WEBHOOK_URL`)

Do not commit live keys. The app runs without Stripe env vars; billing shows a “not connected” state.

## Environment variables

Copy `.env.example`. See that file for per-variable notes.

| Variable | Required |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (deletion, webhooks) |
| `NEXT_PUBLIC_SITE_URL` | Yes (`http://localhost:3000` / staging / prod URL) |
| `STRIPE_SECRET_KEY` | For payments |
| `STRIPE_WEBHOOK_SECRET` | For payments |
| `STRIPE_PRICE_MONTHLY` | Price id — **9,99€ / month** |
| `STRIPE_PRICE_ANNUAL` | Price id — **49€ / year** |
| `ZAPIER_WEBHOOK_URL` | Optional |

## Stripe setup

1. **Test mode.** Create **two products** (not two prices on one product): Mensuel and Annuel. One recurring price each (9,99€/month, 49€/year).
2. Copy the two **price** ids into `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL`.
3. API key: restricted `rk_test_…` preferred (Customers, Checkout, Portal, Subscriptions write; Invoices & Charges read).
4. **Customer Portal:** enable cancel + payment method update.
5. Run SQL migrations in the OptimAbonne Supabase project (not ByName):
   - `supabase/migrations/20261006000000_stripe_webhook_events.sql`
   - `supabase/migrations/20261008000000_billing_cancel_at_period_end.sql`
6. Local webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Put the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`, then restart `next dev`.

7. Production / staging webhook URL:

```
https://<domain>/api/webhooks/stripe
```

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.paused`
- `customer.subscription.resumed`
- `customer.subscription.trial_will_end`
- `invoice.paid`
- `invoice.payment_failed`
- `charge.refunded`
- `charge.dispute.created`
- `radar.early_fraud_warning.created`

### Trial behaviour (matches brief)

- First checkout: **14-day trial, no card required** (`payment_method_collection: if_required`).
- If no payment method at trial end → subscription **pauses** → app status **expired**.
- Repeat trial is not offered once the user already had a subscription / trial.
- Cancel on the billing page schedules cancel at period end (Résilier). Portal stays for card + invoices.

Stripe Tax / `automatic_tax` is **not** enabled yet. Enable Tax + a registration before turning it on in code.

## Vercel

1. Import the GitHub repo into the Vercel team.
2. Staging + production (two projects, or one project with two env sets).
3. Set env vars per environment; `NEXT_PUBLIC_SITE_URL` = that environment’s public URL.
4. Add the same origin + `/auth/callback` in Supabase Auth redirect allow-list.
5. Point a Stripe webhook endpoint at each public URL (or one endpoint per env with matching `STRIPE_WEBHOOK_SECRET`).

## Smoke tests (when keys are connected)

1. Login → `/billing` shows monthly / annual cards; copy says trial **without** card.
2. Start trial → Checkout completes **without** a card → `/billing?checkout=success` → status **Essai**.
3. Sidebar shows Essai. Zapier gets `trial_started` if configured.
4. **Résilier** → confirm → `cancel_at_period_end` + message with end date; **Reprendre** clears it.
5. **Paiement et factures** opens Customer Portal.
6. Cancelled / expired users can subscribe again **with** card (no second free trial).
7. Optional: Stripe **Test clocks** — advance 14 days with no card → status **expired**; Zapier `trial_ending` when `trial_will_end` fires (~3 days before end).
8. Auth + subscription form (`29,99`) still work.
9. Account deletion cancels the Stripe customer (no further charges).

Without Stripe keys: `/billing` shows “not connected”; the rest of the app stays usable.
