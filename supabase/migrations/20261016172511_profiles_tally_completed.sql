alter table public.profiles
  add column if not exists tally_completed boolean not null default true;

comment on column public.profiles.tally_completed is
  'True once the post-signup Tally form was shown/dismissed. Existing users default true; new signups start false.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, tally_completed)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    false
  );
  insert into public.billing_subscriptions (user_id)
  values (new.id);
  return new;
end;
$$;
