alter table public.offers
  add column if not exists data_allowance text,
  add column if not exists last_verified_at date,
  add column if not exists official_url text;

update public.offers
set official_url = affiliate_url
where official_url is null;

create table if not exists public.offer_revisions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.offers (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  action text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists offer_revisions_offer_idx
  on public.offer_revisions (offer_id, created_at desc);

alter table public.offer_revisions enable row level security;

comment on column public.offers.data_allowance is 'e.g. 100Go, Fibre — display only';
comment on column public.offers.last_verified_at is 'Last date the offer price was verified';
comment on column public.offers.official_url is 'Public / official offer URL (defaults to affiliate_url)';
