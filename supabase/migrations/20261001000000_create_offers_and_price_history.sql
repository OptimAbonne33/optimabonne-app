create table public.offers (
  id uuid primary key default gen_random_uuid(),
  category public.subscription_category not null,
  provider_name text not null,
  offer_name text not null,
  monthly_price numeric(10, 2) not null check (monthly_price >= 0),
  annual_price numeric(10, 2),
  description text,
  affiliate_url text not null,
  is_active boolean not null default true,
  sort_priority int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index offers_category_active_idx
  on public.offers (category, is_active, monthly_price);

create table public.subscription_price_history (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null
    references public.user_subscriptions (id) on delete cascade,
  price numeric(10, 2) not null check (price >= 0),
  recorded_at date not null default current_date,
  label text,
  created_at timestamptz not null default now()
);

create index subscription_price_history_sub_idx
  on public.subscription_price_history (subscription_id, recorded_at);

create unique index subscription_price_history_day_uidx
  on public.subscription_price_history (subscription_id, recorded_at);

alter table public.offers enable row level security;
alter table public.subscription_price_history enable row level security;

create policy "offers_select_active"
  on public.offers for select
  to authenticated
  using (is_active = true);

create policy "price_history_select_own"
  on public.subscription_price_history for select
  using (
    exists (
      select 1 from public.user_subscriptions s
      where s.id = subscription_id and s.user_id = auth.uid()
    )
  );

create policy "price_history_insert_own"
  on public.subscription_price_history for insert
  with check (
    exists (
      select 1 from public.user_subscriptions s
      where s.id = subscription_id and s.user_id = auth.uid()
    )
  );

create policy "price_history_update_own"
  on public.subscription_price_history for update
  using (
    exists (
      select 1 from public.user_subscriptions s
      where s.id = subscription_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_subscriptions s
      where s.id = subscription_id and s.user_id = auth.uid()
    )
  );

create trigger offers_updated_at
  before update on public.offers
  for each row execute function public.set_updated_at();

