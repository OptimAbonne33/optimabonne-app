# OptimAbonne

French B2C SaaS to track fixed monthly expenses (mobile, internet, streaming, energy), score optimization potential, and surface affiliate recommendations. Monetized with Stripe subscriptions (€9.99/month or €49/year, 14-day free trial without a card).

## Stack

- Next.js (App Router)
- Supabase (Auth, Postgres, RLS)
- Stripe (Checkout, Customer Portal, webhooks)
- Zapier → Mailchimp for lifecycle emails
- Deploy: Vercel (staging + production). See [DEPLOY.md](./DEPLOY.md).

## Local setup

1. Copy env file and fill values:

```bash
cp .env.example .env.local
```

2. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

3. Apply Supabase migrations from `supabase/migrations/` on the OptimAbonne project (SQL Editor or CLI). Do not run them on unrelated projects.

4. Stripe (optional until Milestone 3 go-live): create two products/prices, set the four `STRIPE_*` vars, run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Use the `whsec_…` from that command as `STRIPE_WEBHOOK_SECRET`. Details and webhook event list: [DEPLOY.md](./DEPLOY.md).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Project layout (short)

- `app/(app)/` — authenticated UI (dashboard, subscriptions, recommendations, billing, profile)
- `app/api/webhooks/stripe` — Stripe webhook (signature + idempotency via `stripe_events`)
- `app/actions.ts` — server actions (auth, CRUD, Checkout, Portal, cancel/resume)
- `lib/billing.ts` / `lib/stripe.ts` — billing helpers
- `locales/fr.json` — French UI copy (primary)
- `supabase/migrations/` — schema + Stripe tables

## Billing statuses

Mapped from Stripe into `billing_subscriptions.status`: `none` | `trial` | `active` | `expired` | `cancelled`.

## Notes

- Without Stripe keys the product UI works; `/billing` shows a not-configured state.
- Privacy policy / cookie consent are separate NFR deliverables (not required to run the app locally).
