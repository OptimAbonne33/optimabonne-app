# OptimAbonne — deploy (Milestone 3)

## Stack

- **App:** Next.js on Vercel (staging + production)
- **Auth / DB:** Supabase (already used)
- **Payments:** Stripe Checkout + Customer Portal + webhooks
- **Email events:** Zapier (`ZAPIER_WEBHOOK_URL`)

Do not put live keys in git. Leave Stripe env vars empty until Fabien invites you to Stripe / Vercel.

## Environment variables

Copy `.env.example`. Required for the app today:

| Variable | Where |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) | Vercel + local |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + local (server only) |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` locally; `https://staging…` / prod domain on Vercel |

Optional until Stripe is connected (app stays usable without them):

| Variable | Notes |
| --- | --- |
| `STRIPE_SECRET_KEY` | Restricted key (`rk_test_…` / `rk_live_…`) preferred over `sk_` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` from the webhook endpoint |
| `STRIPE_PRICE_MONTHLY` | Price id for **9,99€ / month** |
| `STRIPE_PRICE_ANNUAL` | Price id for **49€ / year** |
| `ZAPIER_WEBHOOK_URL` | signup + trial/subscription events |

Create **two products** in Stripe (not two prices on one product): Mensuel and Annuel. Attach one price each. Enable a 14-day trial on Checkout in code (`trial_period_days: 14`).

Webhook URL (once Vercel is live):

```
https://<domain>/api/webhooks/stripe
```

Events to subscribe:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `charge.refunded`
- `charge.dispute.created`
- `radar.early_fraud_warning.created`

Also run SQL migration `supabase/migrations/20261006000000_stripe_webhook_events.sql` in the OptimAbonne project (not ByName).

Customer Portal: enable in Stripe Dashboard (cancel, payment method update).

If you charge in the EU/US, enable Stripe Tax + an active registration before turning `automatic_tax` on. The app does **not** enable `automatic_tax` yet.

## Vercel

1. Import the GitHub repo into the Vercel team.
2. Create **Preview/staging** and **Production** projects (or one project with two env sets).
3. Set the env vars above per environment.
4. Set `NEXT_PUBLIC_SITE_URL` to that environment’s public URL.
5. Add the same URL + `/auth/callback` in Supabase Auth redirect allow-list.

Local Stripe webhook (after keys exist):

```
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Smoke tests (when keys are connected)

1. Login → `/billing` shows monthly / annual cards.
2. Start trial on monthly → Stripe Checkout (FR) → test card `4242…` → back to `/billing?checkout=success`.
3. Webhook updates `billing_subscriptions.status` to `trial`.
4. Sidebar shows **Essai**. Zapier receives `trial_started` if the URL is set.
5. Customer Portal from **Gérer mon abonnement** opens.
6. Cancel in Portal → webhook → status `cancelled`.
7. Auth still works (login, profile). Adding a subscription with `29,99` still works.

Without Stripe keys: `/billing` shows the “not connected yet” state; dashboard / recommendations stay open.
