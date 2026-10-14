
update public.offers o
set
  monthly_price = v.monthly_price,
  annual_price = v.annual_price,
  description = v.description,
  affiliate_url = v.affiliate_url,
  official_url = v.official_url,
  data_allowance = v.data_allowance,
  last_verified_at = current_date,
  is_active = true,
  sort_priority = v.sort_priority,
  updated_at = now()
from (
  values
    ('mobile'::public.subscription_category, 'Free Mobile', 'Free Mobile 100Go', 12.99::numeric, 155.88::numeric, 'Forfait mobile 100Go, sans engagement.', 'https://mobile.free.fr/', 'https://mobile.free.fr/', '100Go', 10),
    ('mobile', 'Youprice', 'Youprice 130Go', 9.99, 119.88, 'Forfait mobile 130Go à prix bas.', 'https://www.youprice.fr/', 'https://www.youprice.fr/', '130Go', 20),
    ('internet', 'Free', 'Free Fibre', 19.99, 239.88, 'Box internet fibre Free.', 'https://www.free.fr/freebox', 'https://www.free.fr/freebox', 'Fibre', 10),
    ('internet', 'RED by SFR', 'RED Fibre', 22.99, 275.88, 'Box fibre Red by SFR.', 'https://www.red-by-sfr.fr/', 'https://www.red-by-sfr.fr/', 'Fibre', 20),
    ('streaming', 'Netflix', 'Netflix avec publicités', 7.99, 95.88, 'Offre streaming Netflix avec publicités.', 'https://www.netflix.com/', 'https://www.netflix.com/', null::text, 10),
    ('streaming', 'Disney+', 'Disney+ Standard', 5.99, 71.88, 'Offre Disney+ Standard.', 'https://www.disneyplus.com/', 'https://www.disneyplus.com/', null, 20),
    ('energy', 'Octopus Energy', 'Octopus Energy', 74.00, 888.00, 'Offre énergie Octopus Energy.', 'https://octopusenergy.fr/', 'https://octopusenergy.fr/', null, 10)
) as v(category, provider_name, offer_name, monthly_price, annual_price, description, affiliate_url, official_url, data_allowance, sort_priority)
where o.provider_name = v.provider_name
  and o.offer_name = v.offer_name;

insert into public.offers (
  category,
  provider_name,
  offer_name,
  monthly_price,
  annual_price,
  description,
  affiliate_url,
  official_url,
  data_allowance,
  last_verified_at,
  is_active,
  sort_priority
)
select
  v.category,
  v.provider_name,
  v.offer_name,
  v.monthly_price,
  v.annual_price,
  v.description,
  v.affiliate_url,
  v.official_url,
  v.data_allowance,
  current_date,
  true,
  v.sort_priority
from (
  values
    ('mobile'::public.subscription_category, 'Free Mobile', 'Free Mobile 100Go', 12.99::numeric, 155.88::numeric, 'Forfait mobile 100Go, sans engagement.', 'https://mobile.free.fr/', 'https://mobile.free.fr/', '100Go', 10),
    ('mobile', 'Youprice', 'Youprice 130Go', 9.99, 119.88, 'Forfait mobile 130Go à prix bas.', 'https://www.youprice.fr/', 'https://www.youprice.fr/', '130Go', 20),
    ('internet', 'Free', 'Free Fibre', 19.99, 239.88, 'Box internet fibre Free.', 'https://www.free.fr/freebox', 'https://www.free.fr/freebox', 'Fibre', 10),
    ('internet', 'RED by SFR', 'RED Fibre', 22.99, 275.88, 'Box fibre Red by SFR.', 'https://www.red-by-sfr.fr/', 'https://www.red-by-sfr.fr/', 'Fibre', 20),
    ('streaming', 'Netflix', 'Netflix avec publicités', 7.99, 95.88, 'Offre streaming Netflix avec publicités.', 'https://www.netflix.com/', 'https://www.netflix.com/', null::text, 10),
    ('streaming', 'Disney+', 'Disney+ Standard', 5.99, 71.88, 'Offre Disney+ Standard.', 'https://www.disneyplus.com/', 'https://www.disneyplus.com/', null, 20),
    ('energy', 'Octopus Energy', 'Octopus Energy', 74.00, 888.00, 'Offre énergie Octopus Energy.', 'https://octopusenergy.fr/', 'https://octopusenergy.fr/', null, 10)
) as v(category, provider_name, offer_name, monthly_price, annual_price, description, affiliate_url, official_url, data_allowance, sort_priority)
where not exists (
  select 1 from public.offers o
  where o.provider_name = v.provider_name and o.offer_name = v.offer_name
);

update public.offers
set is_active = false, updated_at = now()
where (provider_name, offer_name) not in (
  ('Free Mobile', 'Free Mobile 100Go'),
  ('Youprice', 'Youprice 130Go'),
  ('Free', 'Free Fibre'),
  ('RED by SFR', 'RED Fibre'),
  ('Netflix', 'Netflix avec publicités'),
  ('Disney+', 'Disney+ Standard'),
  ('Octopus Energy', 'Octopus Energy')
)
and is_active = true;
