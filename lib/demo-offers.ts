import type { Offer } from "@/lib/optimization";
import type { SubscriptionCategory } from "@/lib/types";

const DEMO: Array<{
  category: SubscriptionCategory;
  provider_name: string;
  offer_name: string;
  monthly_price: number;
  annual_price: number;
  description: string;
  affiliate_url: string;
  sort_priority: number;
}> = [
  {
    category: "mobile",
    provider_name: "Free Mobile",
    offer_name: "Free Mobile 100Go 5G",
    monthly_price: 11.99,
    annual_price: 143.88,
    description:
      "Même forfait 100Go 5G, sans engagement, couverture équivalente.",
    affiliate_url: "https://mobile.free.fr/",
    sort_priority: 10,
  },
  {
    category: "mobile",
    provider_name: "Sosh",
    offer_name: "Sosh 100Go",
    monthly_price: 14.99,
    annual_price: 179.88,
    description: "Offre 100Go sans engagement, réseau Orange.",
    affiliate_url: "https://www.sosh.fr/",
    sort_priority: 20,
  },
  {
    category: "internet",
    provider_name: "Free",
    offer_name: "Free Fibre",
    monthly_price: 19.99,
    annual_price: 239.88,
    description:
      "Fibre jusqu'à 5 Gbit/s, frais de résiliation pris en charge selon éligibilité.",
    affiliate_url: "https://www.free.fr/",
    sort_priority: 10,
  },
  {
    category: "internet",
    provider_name: "RED by SFR",
    offer_name: "RED Fibre",
    monthly_price: 23.99,
    annual_price: 287.88,
    description: "Box fibre sans engagement, débit symétrique.",
    affiliate_url: "https://www.red-by-sfr.fr/",
    sort_priority: 20,
  },
  {
    category: "streaming",
    provider_name: "Spotify",
    offer_name: "Spotify Famille",
    monthly_price: 17.99,
    annual_price: 215.88,
    description:
      "Plan Famille à partager jusqu'à 6 personnes — ~2,83€ / personne.",
    affiliate_url: "https://www.spotify.com/fr/family/",
    sort_priority: 10,
  },
  {
    category: "streaming",
    provider_name: "Netflix",
    offer_name: "Netflix Standard avec pub",
    monthly_price: 5.99,
    annual_price: 71.88,
    description: "Catalogue large avec publicités, idéal si le HD suffit.",
    affiliate_url: "https://www.netflix.com/",
    sort_priority: 20,
  },
  {
    category: "energy",
    provider_name: "Octopus Energy",
    offer_name: "Octopus Tarif Fixe 12 mois",
    monthly_price: 74,
    annual_price: 888,
    description:
      "Tarif fixe garanti 12 mois, 100% renouvelable, changement sans coupure.",
    affiliate_url: "https://octopusenergy.fr/",
    sort_priority: 10,
  },
  {
    category: "energy",
    provider_name: "TotalEnergies",
    offer_name: "TotalEnergies Heures Eco",
    monthly_price: 79,
    annual_price: 948,
    description: "Offre heures creuses compétitive pour foyers éligibles.",
    affiliate_url: "https://www.totalenergies.fr/",
    sort_priority: 20,
  },
];

export function getDemoOffers(): Offer[] {
  return DEMO.map((o, i) => ({
    id: `demo-offer-${i + 1}`,
    ...o,
    is_active: true,
  }));
}
