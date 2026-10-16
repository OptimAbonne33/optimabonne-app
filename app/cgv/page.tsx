import type { Metadata } from "next";
import { LegalArticle, LegalShell } from "@/components/legal/legal-shell";
import { LEGAL, editorLegalBlurb } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description: `CGV du service ${LEGAL.brand} — essai ${LEGAL.trialDays} jours, abonnement mensuel ou annuel.`,
};

export default function CgvPage() {
  return (
    <LegalShell title="Conditions Générales de Vente (CGV)">
      <LegalArticle title="Article 1 — Objet et Éditeur du site">
        <p>
          Les présentes Conditions Générales de Vente (ci-après « CGV »)
          régissent les relations contractuelles entre :
        </p>
        <p>
          <strong>L&apos;Éditeur :</strong> {editorLegalBlurb()}
        </p>
        <p>
          <strong>L&apos;Utilisateur / Le Client :</strong> toute personne
          physique, majeure et non professionnelle (consommateur), résidant en
          France, qui souscrit au service SaaS proposé sur le site internet{" "}
          {LEGAL.site}.
        </p>
        <p>
          Le site {LEGAL.site} est un logiciel en ligne (SaaS) conçu pour aider
          les particuliers à optimiser et réduire le coût de leurs frais fixes
          et abonnements.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 2 — Acceptation des CGV et parcours d'achat">
        <p>
          La souscription aux services sur le site implique l&apos;acceptation
          pleine, entière et sans réserve des présentes CGV par le Client.
        </p>
        <p>
          Cette acceptation est matérialisée lors du parcours de création de
          compte et de paiement par une case à cocher obligatoire. Les présentes
          CGV sont opposables au Client dès leur validation.
        </p>
      </LegalArticle>

      <LegalArticle title={`Article 3 — Période d'essai gratuit (${LEGAL.trialDays} jours)`}>
        <p>
          <strong>3.1. Modalités d&apos;activation :</strong> L&apos;Éditeur
          propose au Client une période d&apos;essai gratuit d&apos;une durée de{" "}
          {LEGAL.trialDays} jours calendaires à compter de l&apos;activation de
          l&apos;essai sur {LEGAL.site}. L&apos;activation s&apos;effectue via
          le système de paiement sécurisé Stripe.
        </p>
        <p>
          <strong>3.2. Absence de débit initial :</strong> Aucun montant
          n&apos;est prélevé au cours de cette période de {LEGAL.trialDays}{" "}
          jours. Selon le parcours Stripe, une empreinte de carte ou une
          authentification à 0 € peut être demandée afin de vérifier la validité
          du moyen de paiement, lorsque celui-ci est fourni.
        </p>
        <p>
          <strong>3.3. Résiliation pendant l&apos;essai :</strong> Le Client
          peut mettre fin à son essai gratuit à tout moment et sans frais pendant
          les {LEGAL.trialDays} jours, en self-service depuis l&apos;espace
          client via le Portail Client Stripe. Si la résiliation intervient avant
          la fin de la période d&apos;essai, aucun prélèvement n&apos;est
          effectué et l&apos;accès au service prend fin.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 4 — Tarifs, facturation et modalités de paiement via Stripe">
        <p>
          <strong>4.1. Tarifs :</strong> Si le Client ne résilie pas son offre
          avant la fin des {LEGAL.trialDays} jours d&apos;essai gratuit,
          l&apos;essai est automatiquement converti en un abonnement payant. Les
          tarifs applicables sont de <strong>{LEGAL.priceMonthly} € TTC par
          mois</strong> ou <strong>{LEGAL.priceAnnual} € TTC par an</strong>,
          selon la formule choisie. Les prix sont indiqués en euros et
          s&apos;entendent toutes taxes comprises (TVA française de 20 %
          incluse, le cas échéant).
        </p>
        <p>
          <strong>4.2. Prélèvement et récurrence :</strong> Le paiement
          s&apos;effectue par carte bancaire via le prestataire de paiement
          sécurisé Stripe. Les données bancaires du Client sont chiffrées et
          traitées directement par Stripe (conformité PCI-DSS). Le prélèvement
          est automatique et récurrent à chaque échéance de la période
          d&apos;abonnement (mensuelle ou annuelle), sauf résiliation.
        </p>
        <p>
          <strong>4.3. Défaut de paiement :</strong> En cas d&apos;échec de
          prélèvement (carte expirée, solde insuffisant), Stripe procédera à
          plusieurs tentatives de relance automatiques. Si le paiement n&apos;est
          pas régularisé, l&apos;Éditeur se réserve le droit de suspendre ou de
          résilier immédiatement l&apos;accès au SaaS {LEGAL.site}.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 5 — Droit de rétractation et renonciation expresse">
        <p>
          Conformément à l&apos;article L.221-18 du Code de la consommation, le
          consommateur dispose normalement d&apos;un droit de rétractation de 14
          jours pour un contrat conclu à distance.
        </p>
        <p>
          Cependant, s&apos;agissant d&apos;un contenu numérique non fourni sur
          un support matériel dont l&apos;exécution commence immédiatement après
          l&apos;inscription (pendant l&apos;essai gratuit), le Client accepte
          expressément, en cochant la case de validation lors du paiement,
          d&apos;accéder immédiatement aux services d&apos;{LEGAL.brand} et
          renonce ainsi expressément à son droit de rétractation, conformément à
          l&apos;article L.221-28 13° du Code de la consommation.
        </p>
      </LegalArticle>

      <LegalArticle title='Article 6 — Durée, reconduction et résiliation en "3 clics"'>
        <p>
          <strong>6.1. Reconduction tacite :</strong> L&apos;abonnement est
          conclu pour une durée indéterminée avec une période d&apos;engagement
          minimale correspondant à la formule choisie (mois ou an). Il se
          renouvelle automatiquement pour des périodes successives de même durée.
        </p>
        <p>
          <strong>6.2. Notification de renouvellement (Loi Chatel) :</strong>{" "}
          Pour les formules annuelles, l&apos;Éditeur informera le Client par
          email, au plus tôt trois mois et au plus tard un mois avant le terme
          de la période, de la possibilité de ne pas reconduire le contrat.
        </p>
        <p>
          <strong>6.3. Résiliation simplifiée :</strong> Le Client peut résilier
          son abonnement à tout moment, sans frais ni motif. Conformément à la
          législation française sur la résiliation en « 3 clics », la
          résiliation s&apos;effectue directement depuis l&apos;espace personnel
          du Client via le Stripe Customer Portal.
        </p>
        <p>
          Toute période d&apos;abonnement entamée reste due. La résiliation
          prend effet à la fin de la période de facturation en cours, et le
          Client conserve son accès au SaaS jusqu&apos;à cette date.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 7 — Disponibilité du service et responsabilité">
        <p>
          <strong>7.1. Accès au SaaS :</strong> L&apos;Éditeur s&apos;efforce
          d&apos;assurer la disponibilité d&apos;{LEGAL.site} 24h/24 et 7j/7.
          Toutefois, l&apos;accès peut être temporairement suspendu pour des
          raisons de maintenance technique, d&apos;amélioration des
          fonctionnalités ou de force majeure.
        </p>
        <p>
          <strong>7.2. Limitation de responsabilité :</strong> L&apos;Éditeur
          fournit des outils d&apos;aide à la décision et à l&apos;optimisation
          des abonnements, mais ne saurait être tenu pour responsable du refus
          d&apos;un tiers (fournisseur d&apos;énergie, de télécom, etc.)
          d&apos;appliquer une baisse de tarif. La responsabilité de
          l&apos;Éditeur est strictement limitée aux dommages directs subis par
          le Client et ne pourra excéder le montant total versé par le Client au
          cours des 12 derniers mois d&apos;abonnement.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 8 — Protection des données personnelles (RGPD)">
        <p>
          L&apos;Éditeur collecte et traite les données personnelles du Client
          pour assurer la gestion des abonnements, l&apos;accès au SaaS et le
          traitement des paiements. Stripe agit en tant que sous-traitant
          certifié pour la sécurisation des données de paiement.
        </p>
        <p>
          Conformément au RGPD et à la loi Informatique et Libertés, le Client
          dispose d&apos;un droit d&apos;accès, de rectification, d&apos;effacement
          et de portabilité de ses données, qu&apos;il peut exercer en envoyant
          un email à :{" "}
          <a className="text-accent" href={`mailto:${LEGAL.contactEmail}`}>
            {LEGAL.contactEmail}
          </a>
          .
        </p>
      </LegalArticle>

      <LegalArticle title="Article 9 — Droit applicable et règlement des litiges">
        <p>
          <strong>9.1. Loi applicable :</strong> Les présentes CGV sont soumises
          exclusivement au droit français.
        </p>
        <p>
          <strong>9.2. Médiation de la consommation :</strong> En cas de litige,
          le Client doit d&apos;abord contacter le service client d&apos;
          {LEGAL.brand} par email. Si aucune solution amiable n&apos;est trouvée
          dans un délai de deux (2) mois, le Client est informé qu&apos;il peut
          recourir gratuitement à un médiateur de la consommation agréé.
          Conformément à l&apos;article L612-1 du code de la consommation, tout
          consommateur a le droit de recourir gratuitement à un médiateur de la
          consommation en vue de la résolution amiable du litige qui l&apos;oppose
          à un professionnel. À cet effet, le professionnel garantit au
          consommateur le recours effectif à un dispositif de médiation de la
          consommation.
        </p>
        <p>
          Le médiateur compétent est {LEGAL.mediator.fullName},{" "}
          {LEGAL.mediator.address}. Site :{" "}
          <a
            className="text-accent"
            href={LEGAL.mediator.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {LEGAL.mediator.url}
          </a>
          . {LEGAL.mediator.name} vous aide à résoudre à l&apos;amiable votre
          litige de la consommation, en mettant à votre disposition un médiateur
          de la consommation, en cas de litige non résolu avec un commerçant, un
          artisan ou un prestataire de service.
        </p>
        <p>
          <strong>9.3. Tribunal compétent :</strong> Tout litige qui ne pourrait
          être réglé à l&apos;amiable sera soumis aux tribunaux français
          compétents selon les règles de droit commun.
        </p>
      </LegalArticle>

      <LegalArticle title="Article 10 — Droit de rétractation et contenu numérique">
        <p>
          Conformément à l&apos;article L. 221-28 13° du Code de la
          consommation, le droit de rétractation ne peut être exercé pour les
          contrats de fourniture d&apos;un contenu numérique non fourni sur un
          support matériel dont l&apos;exécution a commencé après accord
          préalable exprès du consommateur et renoncement exprès à son droit de
          rétractation. En cochant la case dédiée lors de la validation de sa
          commande, l&apos;Utilisateur demande l&apos;accès immédiat au logiciel
          SaaS « {LEGAL.brand} » avant l&apos;expiration du délai légal de
          quatorze (14) jours et renonce expressément à bénéficier de son droit
          de rétractation. Aucun remboursement ne pourra être effectué une fois
          l&apos;accès au service activé.
        </p>
        <p>
          <strong>10.2. Période d&apos;essai gratuit et transition vers
          l&apos;abonnement :</strong>{" "}
          L&apos;Éditeur propose à l&apos;Utilisateur une période d&apos;essai
          gratuit d&apos;une durée de quatre (4) jours calendaires à compter de
          son inscription. Durant cette période, l&apos;Utilisateur peut
          résilier son accès à tout moment et sans frais depuis son espace
          client. À l&apos;expiration de ces quatre (4) jours, et sauf
          résiliation préalable par l&apos;Utilisateur, l&apos;abonnement payant
          choisi lors de l&apos;inscription débute automatiquement.
          L&apos;Utilisateur ayant expressément renoncé à son droit de
          rétractation lors de son inscription initiale pour accéder
          immédiatement au service, aucun remboursement ne sera accordé après le
          déclenchement du premier prélèvement.
        </p>
      </LegalArticle>
    </LegalShell>
  );
}
