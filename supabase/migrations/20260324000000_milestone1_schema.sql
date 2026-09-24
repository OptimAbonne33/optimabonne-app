-- init schema
create extension if not exists "pgcrypto";

create type public.subscription_category as enum (
  'mobile',
  'internet',
  'streaming',
  'energy'
);

create type public.billing_status as enum (
  'none',
  'trial',
  'active',
  'expired',
  'cancelled'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider_name text not null,
  category public.subscription_category not null,
  monthly_price numeric(10, 2) not null check (monthly_price >= 0),
  subscribed_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_subscriptions_user_id_idx on public.user_subscriptions (user_id);

-- placeholder for M3 stripe state
create table public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  status public.billing_status not null default 'none',
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.billing_subscriptions enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "subs_select_own"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

create policy "subs_insert_own"
  on public.user_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "subs_update_own"
  on public.user_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "subs_delete_own"
  on public.user_subscriptions for delete
  using (auth.uid() = user_id);

create policy "billing_select_own"
  on public.billing_subscriptions for select
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  insert into public.billing_subscriptions (user_id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger user_subscriptions_updated_at
  before update on public.user_subscriptions
  for each row execute function public.set_updated_at();

create trigger billing_subscriptions_updated_at
  before update on public.billing_subscriptions
  for each row execute function public.set_updated_at();
