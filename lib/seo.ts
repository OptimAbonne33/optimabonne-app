export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://optimabonne.fr").replace(
    /\/$/,
    "",
  );
}

export const siteName = "OptimAbonne";

export const defaultTitle =
  "OptimAbonne — Optimisez vos frais fixes récurrents";

export const defaultDescription =
  "Identifiez et réduisez vos abonnements mobile, internet, streaming et énergie. Score d'optimisation, recommandations et économies concrètes.";

export function softwareApplicationJsonLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteName,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    description: defaultDescription,
    url,
    offers: [
      {
        "@type": "Offer",
        name: "Mensuel",
        price: "9.99",
        priceCurrency: "EUR",
        url: `${url}/billing`,
      },
      {
        "@type": "Offer",
        name: "Annuel",
        price: "49.00",
        priceCurrency: "EUR",
        url: `${url}/billing`,
      },
    ],
  };
}
