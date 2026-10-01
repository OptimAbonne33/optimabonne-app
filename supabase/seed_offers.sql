insert into public.offers (
    category,
    provider_name,
    offer_name,
    monthly_price,
    annual_price,
    description,
    affiliate_url,
    sort_priority
  )
select *
from (
    values (
        'mobile'::public.subscription_category,
        'Free Mobile',
        'Free Mobile 100Go 5G',
        11.99::numeric,
        143.88::numeric,
        'Même forfait 100Go 5G, sans engagement, couverture équivalente.',
        'https://mobile.free.fr/',
        10
      ),
      (
        'mobile'::public.subscription_category,
        'Sosh',
        'Sosh 100Go',
        14.99::numeric,
        179.88::numeric,
        'Offre 100Go sans engagement, réseau Orange.',
        'https://www.sosh.fr/',
        20
      ),
      (
        'internet'::public.subscription_category,
        'Free',
        'Free Fibre',
        19.99::numeric,
        239.88::numeric,
        'Fibre jusqu''à 5 Gbit/s, frais de résiliation pris en charge selon éligibilité.',
        'https://www.free.fr/',
        10
      ),
      (
        'internet'::public.subscription_category,
        'RED by SFR',
        'RED Fibre',
        23.99::numeric,
        287.88::numeric,
        'Box fibre sans engagement, débit symétrique.',
        'https://www.red-by-sfr.fr/',
        20
      ),
      (
        'streaming'::public.subscription_category,
        'Spotify',
        'Spotify Famille',
        17.99::numeric,
        215.88::numeric,
        'Plan Famille à partager jusqu''à 6 personnes — ~2,83€ / personne.',
        'https://www.spotify.com/fr/family/',
        10
      ),
      (
        'streaming'::public.subscription_category,
        'Netflix',
        'Netflix Standard avec pub',
        5.99::numeric,
        71.88::numeric,
        'Catalogue large avec publicités, idéal si le HD suffit.',
        'https://www.netflix.com/',
        20
      ),
      (
        'energy'::public.subscription_category,
        'Octopus Energy',
        'Octopus Tarif Fixe 12 mois',
        74.00::numeric,
        888.00::numeric,
        'Tarif fixe garanti 12 mois, 100% renouvelable, changement sans coupure.',
        'https://octopusenergy.fr/',
        10
      ),
      (
        'energy'::public.subscription_category,
        'TotalEnergies',
        'TotalEnergies Heures Eco',
        79.00::numeric,
        948.00::numeric,
        'Offre heures creuses compétitive pour foyers éligibles.',
        'https://www.totalenergies.fr/',
        20
      )
  ) as v(
    category,
    provider_name,
    offer_name,
    monthly_price,
    annual_price,
    description,
    affiliate_url,
    sort_priority
  )
where not exists (
    select 1
    from public.offers o
    where o.offer_name = v.offer_name
      and o.provider_name = v.provider_name
  );