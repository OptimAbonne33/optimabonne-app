export const LEGAL = {
  brand: "OptimAbonne",
  site: "Optimabonne.fr",
  company: "SAS LOWFEE",
  legalForm: "SAS",
  capital: "5 000",
  siren: "109 778 183",
  siret: "109 778 183 00011",
  rcs: "Bordeaux",
  representative: "AMOROS Fabien",
  address: "87 Avenue Jean Jaurès Bat10, 33270 FLOIRAC",
  phone: "06 70 95 16 80",
  phoneTel: "+33670951680",
  contactEmail: "fabbdm03@outlook.fr",
  priceMonthly: "9,99",
  priceAnnual: "49",
  trialDays: 4,
  effectiveDate: "14 octobre 2026",
  mediator: {
    name: "CM2C",
    fullName:
      "CM2C, Centre de la Médiation de la Consommation de Conciliateurs de Justice",
    address: "49 rue de Ponthieu, 75008 PARIS",
    url: "https://www.cm2c.net",
  },
} as const;

export function editorLegalBlurb() {
  return `Le service logiciel SaaS « ${LEGAL.brand} » est édité par la société ${LEGAL.company}, au capital de ${LEGAL.capital} euros, immatriculée au RCS de ${LEGAL.rcs} sous le numéro SIREN : ${LEGAL.siren} (SIRET : ${LEGAL.siret}), enregistrée et représentée par ${LEGAL.representative}, ${LEGAL.address}, tél. : ${LEGAL.phone}, mail : ${LEGAL.contactEmail}.`;
}
