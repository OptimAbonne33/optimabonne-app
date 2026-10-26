create or replace function public.is_billing_entitled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
    or exists (
      select 1
      from public.billing_subscriptions b
      where b.user_id = auth.uid()
        and (
          (
            b.status = 'trial'
            and b.trial_ends_at is not null
            and b.trial_ends_at > now()
          )
          or b.status = 'active'
          or b.status = 'past_due'
        )
    );
$$;

revoke all on function public.is_billing_entitled() from public;
grant execute on function public.is_billing_entitled() to authenticated;

create or replace function public.sync_billing_access()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  b public.billing_subscriptions;
  confirmed boolean := false;
  entitled boolean := false;
begin
  if uid is null then
    return jsonb_build_object(
      'entitled', false,
      'status', 'none',
      'email_confirmed', false
    );
  end if;

  if coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false) then
    return jsonb_build_object(
      'entitled', true,
      'status', 'active',
      'email_confirmed', true,
      'admin', true
    );
  end if;

  select u.email_confirmed_at is not null
  into confirmed
  from auth.users u
  where u.id = uid;

  select *
  into b
  from public.billing_subscriptions
  where user_id = uid
  for update;

  if not found then
    insert into public.billing_subscriptions (user_id)
    values (uid)
    returning * into b;
  end if;

  if b.status = 'trial'
     and b.trial_ends_at is not null
     and b.trial_ends_at <= now() then
    update public.billing_subscriptions
    set status = 'expired'
    where user_id = uid
    returning * into b;
  end if;

  if confirmed
     and b.trial_ends_at is null
     and b.stripe_subscription_id is null
     and b.status = 'none' then
    update public.billing_subscriptions
    set
      status = 'trial',
      trial_ends_at = now() + interval '4 days'
    where user_id = uid
    returning * into b;
  end if;

  entitled :=
    (
      b.status = 'trial'
      and b.trial_ends_at is not null
      and b.trial_ends_at > now()
    )
    or b.status = 'active'
    or b.status = 'past_due';

  return jsonb_build_object(
    'entitled', entitled,
    'status', b.status,
    'trial_ends_at', b.trial_ends_at,
    'email_confirmed', coalesce(confirmed, false)
  );
end;
$$;

revoke all on function public.sync_billing_access() from public;
grant execute on function public.sync_billing_access() to authenticated;

drop policy if exists "subs_select_own" on public.user_subscriptions;
drop policy if exists "subs_insert_own" on public.user_subscriptions;
drop policy if exists "subs_update_own" on public.user_subscriptions;
drop policy if exists "subs_delete_own" on public.user_subscriptions;

create policy "subs_select_own"
  on public.user_subscriptions for select
  using (auth.uid() = user_id and public.is_billing_entitled());

create policy "subs_insert_own"
  on public.user_subscriptions for insert
  with check (auth.uid() = user_id and public.is_billing_entitled());

create policy "subs_update_own"
  on public.user_subscriptions for update
  using (auth.uid() = user_id and public.is_billing_entitled())
  with check (auth.uid() = user_id and public.is_billing_entitled());

create policy "subs_delete_own"
  on public.user_subscriptions for delete
  using (auth.uid() = user_id and public.is_billing_entitled());

drop policy if exists "price_history_select_own" on public.subscription_price_history;
drop policy if exists "price_history_insert_own" on public.subscription_price_history;
drop policy if exists "price_history_update_own" on public.subscription_price_history;

create policy "price_history_select_own"
  on public.subscription_price_history for select
  using (
    public.is_billing_entitled()
    and exists (
      select 1 from public.user_subscriptions s
      where s.id = subscription_id and s.user_id = auth.uid()
    )
  );

create policy "price_history_insert_own"
  on public.subscription_price_history for insert
  with check (
    public.is_billing_entitled()
    and exists (
      select 1 from public.user_subscriptions s
      where s.id = subscription_id and s.user_id = auth.uid()
    )
  );

create policy "price_history_update_own"
  on public.subscription_price_history for update
  using (
    public.is_billing_entitled()
    and exists (
      select 1 from public.user_subscriptions s
      where s.id = subscription_id and s.user_id = auth.uid()
    )
  )
  with check (
    public.is_billing_entitled()
    and exists (
      select 1 from public.user_subscriptions s
      where s.id = subscription_id and s.user_id = auth.uid()
    )
  );
