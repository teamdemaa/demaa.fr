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
              Le responsable du traitement des données collectées sur {LEGAL.domain} est <strong>{LEGAL.legalEntityName}</strong>, entrepreneur individuel, dans le cadre de l&apos;exploitation de la marque <strong>{LEGAL.brandName}</strong>.
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
              <li>système métier et ressource dont vous demandez l&apos;envoi ;</li>
              <li>contenu de votre demande, besoin métier, préférences outils et informations transmises dans les formulaires ;</li>
              <li>entreprise, site ou page professionnelle et problématique proposés à la newsletter Structure, ainsi que la preuve de votre accord de publication lorsque vous le donnez ;</li>
              <li>enregistrement vocal et transcription associés à une proposition Structure, uniquement lorsque cette option est disponible et que vous choisissez de l&apos;utiliser ;</li>
              <li>contenu transmis à l&apos;assistant IA et plans générés ; lorsque vous choisissez de sauvegarder un plan, celui-ci est rattaché à l&apos;adresse email vérifiée par lien magique ;</li>
              <li>données techniques liées à la navigation et à la mesure d&apos;audience ;</li>
              <li>données agrégées d&apos;ouverture des systèmes : système concerné, date, page d&apos;origine et paramètres UTM éventuels, sans adresse email, adresse IP enregistrée ni identifiant visiteur ;</li>
              <li>données d&apos;attribution liées aux demandes : première et dernière source, paramètres UTM, campagne, page d&apos;entrée, référent, page de conversion et statut du consentement ;</li>
              <li>localisation approximative au niveau pays, région ou ville, ainsi que type d&apos;appareil, navigateur et système d&apos;exploitation, lorsque ces informations sont disponibles ;</li>
            </ul>
      </PrivacySection>

      <PrivacySection title="3. Finalités et bases juridiques">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Répondre à vos demandes, devis, audits et demandes d&apos;automatisation :</strong> exécution de mesures précontractuelles prises à votre demande.</li>
              <li><strong>Vous envoyer, à votre demande, une ressource ou le lien permettant de créer une copie personnelle :</strong> exécution du service demandé.</li>
              <li><strong>Gérer les formulaires de contact et vous répondre, notamment sur WhatsApp lorsque vous choisissez ce canal :</strong> intérêt légitime et, selon les cas, mesures précontractuelles.</li>
              <li><strong>Vous adresser des conseils et actualités par e-mail :</strong> uniquement lorsque vous y consentez séparément ; ce choix facultatif n&apos;est jamais nécessaire pour recevoir la ressource demandée.</li>
              <li><strong>Étudier une problématique proposée à la newsletter Structure :</strong> traitement de votre demande et consentement explicite avant toute présentation de votre entreprise, de votre site ou de votre situation ; l&apos;équipe vous contacte avant toute publication.</li>
              <li><strong>Fournir l&apos;assistant IA :</strong> exécution du service demandé ; avant sauvegarde, le résultat reste uniquement dans la page ouverte.</li>
              <li><strong>Sauvegarder et retrouver vos plans :</strong> exécution du service demandé lorsque vous cliquez sur « Sauvegarder » puis vérifiez votre adresse email par lien magique.</li>
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
              <li><strong>Google Firebase / Firestore</strong> pour le stockage sécurisé des demandes, des plans que vous choisissez de sauvegarder, de leur contexte d&apos;attribution et des compteurs agrégés d&apos;ouverture des systèmes ;</li>
              <li><strong>Resend</strong> pour l&apos;envoi des emails demandés et la gestion des contacts concernés ;</li>
              <li><strong>Vercel AI Gateway et le fournisseur de modèle sélectionné par Demaa, notamment OpenAI</strong>, pour la génération des réponses de l&apos;assistant IA ;</li>
              <li><strong>Slack</strong> pour la réception interne de notifications liées à certaines demandes ;</li>
              <li><strong>WhatsApp</strong> pour répondre aux demandes lorsque la personne fournit un numéro WhatsApp à cette fin ;</li>
              <li>les outils de messagerie, de contact ou de support effectivement utilisés par Demaa pour répondre à votre demande.</li>
            </ul>
            <p>
              Les données ne sont accessibles qu&apos;aux personnes habilitées chez Demaa et aux prestataires strictement nécessaires au fonctionnement du service.
            </p>
      </PrivacySection>

      <PrivacySection title="5. Durée de conservation">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Demandes commerciales et de contact :</strong> jusqu&apos;à 3 ans à compter du dernier échange utile, sauf obligation légale contraire.</li>
              <li><strong>Propositions écrites à la newsletter Structure et preuve du consentement associé :</strong> jusqu&apos;à 3 ans à compter du dernier échange utile, sauf retrait de votre consentement ou obligation légale contraire.</li>
              <li><strong>Enregistrements vocaux Structure, lorsque cette option sera activée :</strong> 30 jours maximum ; leur transcription suit ensuite la durée applicable à la proposition écrite.</li>
              <li><strong>Données d&apos;attribution rattachées à une demande :</strong> même durée que la demande concernée, avec suppression ou anonymisation lors de sa suppression.</li>
              <li><strong>Attribution enregistrée dans le navigateur après consentement :</strong> 90 jours maximum.</li>
              <li><strong>Choix relatifs aux traceurs :</strong> 6 mois maximum avant une nouvelle demande de choix.</li>
              <li><strong>Plan en attente de vérification de l&apos;email :</strong> une heure maximum lorsqu&apos;il n&apos;est pas rattaché à un compte.</li>
              <li><strong>Plans sauvegardés dans votre espace :</strong> jusqu&apos;à 3 ans après leur dernière mise à jour, puis suppression ou anonymisation.</li>
              <li><strong>Données techniques de sécurité et journaux :</strong> pendant la durée nécessaire à l&apos;exploitation et à la sécurité du site.</li>
              <li><strong>Compteurs agrégés d&apos;ouverture des systèmes :</strong> pendant la durée d&apos;exploitation du service, ces compteurs ne contenant ni adresse email, ni adresse IP enregistrée, ni identifiant visiteur.</li>
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
              Le site utilise des outils de mesure d&apos;audience et des traceurs marketing selon vos choix. Le plan affiché avant sauvegarde reste dans la mémoire de la page ouverte : Demaa n&apos;utilise ni localStorage ni sessionStorage pour le conserver durablement.
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
