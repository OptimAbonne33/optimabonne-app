import type { Metadata } from "next";
import { LegalArticle, LegalShell } from "@/components/legal/legal-shell";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  description: `CGU du service ${LEGAL.brand} édité par ${LEGAL.company}.`,
};

export default function CguPage() {
  return (
    <LegalShell title="Conditions Générales d'Utilisation (CGU)">
      <LegalArticle title="Article 1 — Objet">
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (ci-après « CGU
          ») ont pour objet de définir les modalités d&apos;accès et
          d&apos;utilisation du service SaaS {LEGAL.brand} accessible à
          l&apos;adresse {LEGAL.site}, édité par {LEGAL.company}, représentée
          par {LEGAL.representative}.
        </p>
        <p>
          Le service permet aux particuliers de renseigner leurs abonnements et
          frais fixes récurrents, d&apos;obtenir un score d&apos;optimisation et
          des recommandations d&apos;offres alternatives.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 2 — Acceptation">
        <p>
          L&apos;accès au service implique l&apos;acceptation pleine et entière
          des présentes CGU. Lors de la création de compte, l&apos;Utilisateur
          confirme avoir pris connaissance des CGU et des Conditions Générales
          de Vente (CGV).
        </p>
      </LegalArticle>

      <LegalArticle title="Article 3 — Création de compte">
        <p>
          L&apos;Utilisateur s&apos;engage à fournir des informations exactes et
          à jour, à préserver la confidentialité de ses identifiants et à
          informer sans délai {LEGAL.company} en cas d&apos;usage non autorisé
          de son compte.
        </p>
        <p>
          Le service est destiné aux personnes physiques majeures, non
          professionnelles, résidant principalement en France.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 4 — Obligations de l'Utilisateur">
        <p>L&apos;Utilisateur s&apos;interdit notamment de :</p>
        <p>
          — utiliser le service à des fins illicites ou frauduleuses ;
          <br />
          — tenter d&apos;accéder aux systèmes, données ou comptes d&apos;autrui
          ;
          <br />
          — perturber le fonctionnement du service ;
          <br />— reproduire, revendre ou exploiter commercialement le service
          sans autorisation.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 5 — Propriété intellectuelle">
        <p>
          L&apos;ensemble des éléments du site et du service {LEGAL.brand}{" "}
          (logiciel, marques, textes, interfaces, bases de données) reste la
          propriété exclusive de {LEGAL.company} ou de ses partenaires.
          L&apos;Utilisateur dispose d&apos;un droit d&apos;usage personnel,
          non exclusif et non cessible, limité à la durée de son accès.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 6 — Contenu et recommandations">
        <p>
          Les scores, comparaisons et recommandations fournis par {LEGAL.brand}{" "}
          constituent une aide à la décision. Ils ne garantissent pas
          l&apos;acceptation d&apos;une offre par un tiers (opérateur, fournisseur,
          etc.) ni un montant d&apos;économies précis. L&apos;Utilisateur reste
          seul responsable des décisions qu&apos;il prend.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 7 — Disponibilité">
        <p>
          {LEGAL.company} s&apos;efforce d&apos;assurer la disponibilité du
          service. Des interruptions peuvent toutefois intervenir pour
          maintenance, mise à jour, incident technique ou cas de force majeure,
          sans que cela ouvre droit à indemnité.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 8 — Responsabilité">
        <p>
          Dans les limites autorisées par la loi, la responsabilité de{" "}
          {LEGAL.company} est limitée aux dommages directs et prévisibles,
          à l&apos;exclusion des dommages indirects. Pour les utilisateurs
          abonnés, cette responsabilité ne saurait excéder les montants
          effectivement payés au cours des douze (12) derniers mois.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 9 — Données personnelles">
        <p>
          Le traitement des données personnelles est décrit dans la politique de
          confidentialité du service et s&apos;effectue conformément au RGPD.
          Pour exercer ses droits, l&apos;Utilisateur peut écrire à{" "}
          <a className="text-accent" href={`mailto:${LEGAL.contactEmail}`}>
            {LEGAL.contactEmail}
          </a>
          .
        </p>
      </LegalArticle>

      <LegalArticle title="Article 10 — Suspension et résiliation du compte">
        <p>
          L&apos;Utilisateur peut demander la suppression de son compte depuis
          son espace personnel, conformément à la réglementation applicable.
          {LEGAL.company} peut suspendre ou résilier un compte en cas de
          manquement grave aux présentes CGU, après information lorsque cela est
          possible.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 11 — Droit applicable">
        <p>
          Les présentes CGU sont soumises au droit français. Tout litige relatif
          à leur interprétation ou exécution sera soumis aux tribunaux français
          compétents.
        </p>
      </LegalArticle>
    </LegalShell>
  );
}
