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
  official_url: string;
  data_allowance: string | null;
  sort_priority: number;
}> = [
  {
    category: "mobile",
    provider_name: "Free Mobile",
    offer_name: "Free Mobile 100Go",
    monthly_price: 12.99,
    annual_price: 155.88,
    description: "Forfait mobile 100Go, sans engagement.",
    affiliate_url: "https://mobile.free.fr/",
    official_url: "https://mobile.free.fr/",
    data_allowance: "100Go",
    sort_priority: 10,
  },
  {
    category: "mobile",
    provider_name: "Youprice",
    offer_name: "Youprice 130Go",
    monthly_price: 9.99,
    annual_price: 119.88,
    description: "Forfait mobile 130Go à prix bas.",
    affiliate_url: "https://www.youprice.fr/",
    official_url: "https://www.youprice.fr/",
    data_allowance: "130Go",
    sort_priority: 20,
  },
  {
    category: "internet",
    provider_name: "Free",
    offer_name: "Free Fibre",
    monthly_price: 19.99,
    annual_price: 239.88,
    description: "Box internet fibre Free.",
    affiliate_url: "https://www.free.fr/freebox",
    official_url: "https://www.free.fr/freebox",
    data_allowance: "Fibre",
    sort_priority: 10,
  },
  {
    category: "internet",
    provider_name: "RED by SFR",
    offer_name: "RED Fibre",
    monthly_price: 22.99,
    annual_price: 275.88,
    description: "Box fibre Red by SFR.",
    affiliate_url: "https://www.red-by-sfr.fr/",
    official_url: "https://www.red-by-sfr.fr/",
    data_allowance: "Fibre",
    sort_priority: 20,
  },
  {
    category: "streaming",
    provider_name: "Netflix",
    offer_name: "Netflix avec publicités",
    monthly_price: 7.99,
    annual_price: 95.88,
    description: "Offre streaming Netflix avec publicités.",
    affiliate_url: "https://www.netflix.com/",
    official_url: "https://www.netflix.com/",
    data_allowance: null,
    sort_priority: 10,
  },
  {
    category: "streaming",
    provider_name: "Disney+",
    offer_name: "Disney+ Standard",
    monthly_price: 5.99,
    annual_price: 71.88,
    description: "Offre Disney+ Standard.",
    affiliate_url: "https://www.disneyplus.com/",
    official_url: "https://www.disneyplus.com/",
    data_allowance: null,
    sort_priority: 20,
  },
  {
    category: "energy",
    provider_name: "Octopus Energy",
    offer_name: "Octopus Energy",
    monthly_price: 74,
    annual_price: 888,
    description: "Offre énergie Octopus Energy.",
    affiliate_url: "https://octopusenergy.fr/",
    official_url: "https://octopusenergy.fr/",
    data_allowance: null,
    sort_priority: 10,
  },
];

export function getDemoOffers(): Offer[] {
  return DEMO.map((o, i) => ({
    id: `demo-offer-${i + 1}`,
    ...o,
    last_verified_at: null,
    is_active: true,
  }));
}
