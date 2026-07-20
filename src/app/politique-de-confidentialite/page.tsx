import LegalPageLayout from "@/components/LegalPageLayout";
import { LEGAL, LEGAL_COPY } from "@/lib/legal";

export const metadata = {
  title: "Politique de confidentialité - Demaa",
  description: "Politique de confidentialité du site Demaa.fr.",
};

function PrivacySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-black/5 bg-white px-6 py-7 md:px-8 md:py-9">
      <h2 className="text-2xl font-black tracking-tight text-brand-blue">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600 md:text-base">
        {children}
      </div>
    </section>
  );
}

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalPageLayout
      title="Politique de"
      titleAccent="confidentialité"
      description="Cette page explique quelles données sont collectées sur Demaa.fr, pourquoi elles le sont et comment vous pouvez exercer vos droits."
    >
      <PrivacySection title="1. Responsable du traitement">
            <p>
              Le responsable du traitement des données collectées sur {LEGAL.domain} est <strong>{LEGAL.legalEntityName}</strong>, représentée par <strong>{LEGAL.legalRepresentative}</strong>, dans le cadre de l&apos;exploitation de la marque <strong>{LEGAL.brandName}</strong>.
            </p>
            <p>{LEGAL_COPY.brandOperatorSentence}</p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Entité juridique :</strong> {LEGAL.legalEntityName}</li>
              <li><strong>Marque exploitée :</strong> {LEGAL.brandName}</li>
              <li><strong>Email :</strong> {LEGAL.email}</li>
              <li><strong>Téléphone :</strong> {LEGAL.phone}</li>
              <li><strong>SIREN :</strong> {LEGAL.siren}</li>
              <li><strong>TVA intracommunautaire :</strong> {LEGAL.vatNumber}</li>
              <li><strong>Adresse :</strong> {LEGAL.address}</li>
            </ul>
      </PrivacySection>

      <PrivacySection title="2. Données collectées">
            <p>Selon les formulaires et services utilisés sur le site, Demaa peut collecter les données suivantes :</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>nom et prénom ;</li>
              <li>adresse email ;</li>
              <li>numéro de téléphone / WhatsApp ;</li>
              <li>nom d&apos;entreprise ;</li>
              <li>secteur d&apos;activité ;</li>
              <li>contenu de votre demande, besoin métier, préférences outils et informations transmises dans les formulaires ;</li>
              <li>contenu saisi dans l&apos;assistant IA et plans générés ;</li>
              <li>données techniques liées à la navigation et à la mesure d&apos;audience ;</li>
              <li>données d&apos;attribution liées aux demandes : première et dernière source, paramètres UTM, campagne, page d&apos;entrée, référent, page de conversion et statut du consentement ;</li>
              <li>localisation approximative au niveau pays, région ou ville, ainsi que type d&apos;appareil, navigateur et système d&apos;exploitation, lorsque ces informations sont disponibles ;</li>
              <li>données conservées localement dans votre navigateur pour l&apos;expérience assistant.</li>
            </ul>
      </PrivacySection>

      <PrivacySection title="3. Finalités et bases juridiques">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Répondre à vos demandes, devis, audits et demandes d&apos;automatisation :</strong> exécution de mesures précontractuelles prises à votre demande.</li>
              <li><strong>Gérer les formulaires de contact, rappels et échanges commerciaux :</strong> intérêt légitime et, selon les cas, mesures précontractuelles.</li>
              <li><strong>Fournir l&apos;assistant IA et enregistrer vos générations :</strong> exécution du service demandé et intérêt légitime d&apos;amélioration et de suivi.</li>
              <li><strong>Gérer les listes d&apos;attente ou demandes d&apos;information sur un outil :</strong> consentement ou intérêt légitime selon le contexte de la demande.</li>
              <li><strong>Comprendre l&apos;origine d&apos;une demande et mesurer l&apos;efficacité des contenus et campagnes :</strong> intérêt légitime pour les informations rattachées à la demande, et consentement préalable pour les traceurs ou stockages optionnels.</li>
              <li><strong>Mesure d&apos;audience, sécurité et maintenance :</strong> intérêt légitime, et consentement si la réglementation l&apos;impose pour certains traceurs.</li>
            </ul>
      </PrivacySection>

      <PrivacySection title="4. Outils et destinataires">
            <p>Les données peuvent être traitées ou hébergées par les prestataires techniques utilisés pour faire fonctionner le site et ses services, notamment :</p>
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Vercel</strong> pour l&apos;hébergement et la mesure d&apos;audience ;</li>
              <li><strong>Google Analytics</strong> pour la mesure des parcours lorsque vous l&apos;autorisez ;</li>
              <li><strong>Meta Pixel</strong> pour la mesure publicitaire lorsque vous l&apos;autorisez ;</li>
              <li><strong>Google Firebase / Firestore</strong> pour le stockage sécurisé des demandes et de leur contexte d&apos;attribution ;</li>
              <li><strong>Resend</strong> pour l&apos;envoi des emails demandés et la gestion des contacts concernés ;</li>
              <li><strong>Anthropic</strong> pour la génération des réponses de l&apos;assistant IA ;</li>
              <li><strong>Slack</strong> pour la réception interne de notifications liées à certaines demandes ;</li>
              <li>les outils de messagerie, de contact ou de support effectivement utilisés par Demaa pour répondre à votre demande.</li>
            </ul>
            <p>
              Les données ne sont accessibles qu&apos;aux personnes habilitées chez Demaa et aux prestataires strictement nécessaires au fonctionnement du service.
            </p>
      </PrivacySection>

      <PrivacySection title="5. Durée de conservation">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Demandes commerciales et de contact :</strong> jusqu&apos;à 3 ans à compter du dernier échange utile, sauf obligation légale contraire.</li>
              <li><strong>Données d&apos;attribution rattachées à une demande :</strong> même durée que la demande concernée, avec suppression ou anonymisation lors de sa suppression.</li>
              <li><strong>Attribution enregistrée dans le navigateur après consentement :</strong> 90 jours maximum.</li>
              <li><strong>Choix relatifs aux traceurs :</strong> 6 mois maximum avant une nouvelle demande de choix.</li>
              <li><strong>Générations de l&apos;assistant IA et historique associé :</strong> pendant la durée nécessaire au service et au suivi commercial, puis suppression ou anonymisation.</li>
              <li><strong>Données conservées localement dans votre navigateur :</strong> jusqu&apos;à suppression manuelle ou effacement par votre navigateur.</li>
              <li><strong>Données techniques de sécurité et journaux :</strong> pendant la durée nécessaire à l&apos;exploitation et à la sécurité du site.</li>
            </ul>
      </PrivacySection>

      <PrivacySection title="6. Vos droits">
            <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez notamment des droits suivants :</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>droit d&apos;accès ;</li>
              <li>droit de rectification ;</li>
              <li>droit d&apos;effacement ;</li>
              <li>droit à la limitation ;</li>
              <li>droit d&apos;opposition ;</li>
              <li>droit à la portabilité lorsque celui-ci est applicable ;</li>
              <li>droit de retirer votre consentement à tout moment lorsque le traitement repose sur celui-ci.</li>
            </ul>
            <p>
              Vous pouvez exercer ces droits en écrivant à <strong>{LEGAL.email}</strong>. En cas de difficulté non résolue, vous pouvez également saisir la CNIL.
            </p>
      </PrivacySection>

      <PrivacySection title="7. Transferts hors Union européenne">
            <p>
              Certains prestataires techniques utilisés par Demaa peuvent héberger ou traiter des données en dehors de l&apos;Union européenne, notamment aux États-Unis.
            </p>
            <p>
              Lorsque de tels transferts existent, ils s&apos;appuient sur les mécanismes juridiques appropriés prévus par la réglementation applicable, notamment les clauses contractuelles types de la Commission européenne lorsque cela est nécessaire.
            </p>
      </PrivacySection>

      <PrivacySection title="8. Cookies, traceurs et stockage local">
            <p>
              Le site utilise des outils de mesure d&apos;audience, des traceurs marketing et des mécanismes de stockage local pour améliorer l&apos;expérience utilisateur, mesurer l&apos;usage du site et mémoriser certaines informations liées à l&apos;assistant.
            </p>
            <p>
              Lorsqu&apos;un traceur nécessite votre consentement, notamment pour la mesure d&apos;audience, l&apos;attribution persistante ou la publicité, Demaa recueille ce consentement avant chargement via son bandeau cookies. Les choix « mesure d&apos;audience » et « publicité » peuvent être modifiés séparément à tout moment depuis la politique de cookies.
            </p>
      </PrivacySection>

      <PrivacySection title="9. Mise à jour">
            <p>
              Cette politique peut être modifiée à tout moment pour refléter l&apos;évolution du site, des services proposés ou des obligations légales.
            </p>
      </PrivacySection>
    </LegalPageLayout>
  );
}
