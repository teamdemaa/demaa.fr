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
              <li>préférence de langue du membre, ainsi que marché, pays et devise de l&apos;entreprise lorsqu&apos;ils sont renseignés ;</li>
              <li>système métier et ressource dont vous demandez l&apos;envoi ;</li>
              <li>contenu de votre demande, besoin métier, préférences outils et informations transmises dans les formulaires ;</li>
              <li>entreprise, site ou page professionnelle et problématique proposés à la newsletter Structure, ainsi que la preuve de votre accord de publication lorsque vous le donnez ;</li>
              <li>enregistrement vocal et transcription associés à une proposition Structure, uniquement lorsque cette option est disponible et que vous choisissez de l&apos;utiliser ;</li>
              <li>contenu transmis à l&apos;assistant IA et plans générés ; dans le parcours public sans compte, le plan est conservé temporairement sous une référence technique protégée ; dans l&apos;espace avec compte lorsqu&apos;il est proposé, chaque plan sauvegardé est rattaché à une entreprise technique par défaut, elle-même reliée à votre identifiant Firebase par une appartenance active ;</li>
              <li>adresse e-mail à laquelle vous demandez l&apos;envoi d&apos;un plan, ainsi que l&apos;état technique de cet envoi ;</li>
              <li>adresse e-mail, numéro de téléphone facultatif, message facultatif et copie du plan lorsque vous demandez un diagnostic à l&apos;équipe Demaa ;</li>
              <li>questions adressées à l&apos;équipe Demaa et réponses associées, rattachées à votre identifiant Firebase afin de rendre l&apos;historique de la conversation visible dans l&apos;application ; lorsque vous rédigez avant de vous connecter, le brouillon du message est conservé temporairement puis rattaché à cet identifiant après connexion ;</li>
              <li>identifiant client Stripe, statut de l&apos;abonnement Coach business, période de facturation et identifiants techniques de paiement ; Demaa ne reçoit pas le numéro complet de votre carte ;</li>
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
              <li><strong>Fournir l&apos;assistant IA :</strong> exécution du service demandé. Dans le parcours public sans compte, le texte saisi, un identifiant technique et le plan généré sont conservés temporairement afin d&apos;afficher le résultat et de reprendre une génération interrompue sans créer de doublon.</li>
              <li><strong>Vous envoyer votre plan par e-mail :</strong> exécution du service demandé. Cet envoi ne vous inscrit pas à une liste marketing.</li>
              <li><strong>Transmettre une demande de diagnostic à l&apos;équipe Demaa :</strong> mesures précontractuelles prises à votre demande et consentement au contact. La copie du plan et les informations facultatives que vous ajoutez permettent à l&apos;équipe de comprendre votre situation et de vous répondre par e-mail.</li>
              <li><strong>Enregistrer et retrouver vos plans dans un espace avec compte lorsqu&apos;il est proposé :</strong> exécution du service demandé. Après la création ou la reprise de votre accès par e-mail et mot de passe ou par Google, Demaa rattache les plans sauvegardés à votre entreprise par défaut et conserve leurs modifications. Demaa ne reçoit ni ne conserve votre mot de passe, géré par Firebase Authentication.</li>
              <li><strong>Piloter votre entreprise :</strong> exécution du service demandé. Les chiffres mensuels et les réponses de Stratégie par cycles sont rattachés à l&apos;entreprise, indépendamment de ses plans. Ils ne sont pas transmis au service de génération par intelligence artificielle.</li>
              <li><strong>Traiter votre clarification et vos demandes d&apos;accompagnement :</strong> exécution du service demandé ou mesures précontractuelles ; avant votre connexion, votre brouillon est conservé temporairement afin de reprendre le parcours après authentification, puis l&apos;historique est conservé sous votre identifiant Firebase.</li>
              <li><strong>Vérifier l&apos;avantage d&apos;accompagnement mensuel :</strong> exécution du contrat ; le statut de l&apos;accompagnement rattaché à votre identifiant Firebase permet de confirmer côté serveur l&apos;application éventuelle des 12 % aux prestations Demaa éligibles.</li>
              <li><strong>Gérer une recommandation privée :</strong> mesures précontractuelles demandées par l&apos;utilisateur ; la recommandation, son rattachement à la conversation et la demande de mise en relation sont conservés afin d&apos;organiser le contact avec le professionnel retenu.</li>
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
              <li><strong>Google Firebase / Firestore et Firebase Authentication</strong> pour l&apos;authentification de l&apos;équipe et, lorsqu&apos;un espace avec compte est proposé, l&apos;authentification de ses membres ; Firestore héberge notamment les demandes, les plans temporaires ou sauvegardés, les entreprises techniques, leurs appartenances, les préférences, les chiffres mensuels, les cycles de Stratégie, des brouillons temporaires, les conversations, leur contexte d&apos;attribution et les compteurs agrégés d&apos;ouverture des systèmes ;</li>
              <li><strong>Stripe</strong> pour le paiement sécurisé, la facturation, la gestion des abonnements concernés et la prévention de la fraude ; Stripe traite directement les données de carte selon ses propres conditions de confidentialité ;</li>
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
              <li><strong>Choix relatifs aux traceurs :</strong> 180 jours maximum avant une nouvelle demande de choix, ou plus tôt si la version du consentement change.</li>
              <li><strong>Plans sauvegardés :</strong> jusqu&apos;à 3 ans après leur dernière mise à jour, puis suppression ou anonymisation.</li>
              <li><strong>Plans publics générés sans compte :</strong> 24 heures maximum, puis suppression automatique. La clé d&apos;accès temporaire n&apos;est pas stockée en clair par Demaa.</li>
              <li><strong>Suivi technique d&apos;un envoi de plan par e-mail :</strong> 90 jours maximum afin d&apos;éviter les doubles envois et de permettre une nouvelle tentative en cas d&apos;échec.</li>
              <li><strong>Demandes de diagnostic et copie du plan associée :</strong> jusqu&apos;à 3 ans à compter du dernier échange utile, sauf obligation légale contraire ou demande d&apos;effacement recevable.</li>
              <li><strong>Demandes de génération interrompues ou inachevées :</strong> 30 jours maximum afin de permettre une reprise et le diagnostic technique, puis suppression.</li>
              <li><strong>Texte préparé avant authentification pour créer un plan :</strong> 2 heures maximum dans la session du navigateur, puis suppression automatique ; il est supprimé plus tôt lorsque le plan est créé ou lorsque vous annulez.</li>
              <li><strong>Entreprise technique par défaut et appartenance associée :</strong> pendant la durée d&apos;existence de votre accès, puis suppression ou anonymisation avec celui-ci ou à la suite d&apos;une demande d&apos;effacement recevable, sous réserve des obligations légales applicables.</li>
              <li><strong>Préférence de langue du membre :</strong> pendant la durée d&apos;existence de son accès, puis suppression avec celui-ci ou à la suite d&apos;une demande d&apos;effacement recevable.</li>
              <li><strong>Chiffres mensuels et cycles de Stratégie :</strong> conservés avec l&apos;entreprise, y compris lorsqu&apos;un plan est supprimé ou qu&apos;un membre quitte l&apos;entreprise. Ils sont supprimés lors de la suppression effective de l&apos;entreprise, sous réserve des obligations légales applicables. Les cycles archivés n&apos;expirent pas automatiquement.</li>
              <li><strong>Brouillon de message destiné à un spécialiste avant connexion :</strong> utilisable pendant 60 minutes maximum, puis supprimé lors du prochain nettoyage technique des données expirées.</li>
              <li><strong>Brouillon de proposition d&apos;annonce avant connexion :</strong> utilisable pendant 2 heures maximum, puis supprimé lors du prochain nettoyage technique des données expirées.</li>
              <li><strong>Conversations avec l&apos;équipe Demaa :</strong> jusqu&apos;à 3 ans après le dernier échange utile, puis suppression ou anonymisation.</li>
              <li><strong>Statut de la première clarification offerte :</strong> conservé sous votre identifiant Firebase tant que le compte existe, y compris après la suppression de l&apos;historique, afin de faire respecter le caractère unique de l&apos;offre ; il est supprimé avec le compte.</li>
              <li><strong>Données d&apos;abonnement et de facturation :</strong> pendant la relation contractuelle puis pendant les durées légales comptables et probatoires applicables.</li>
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
              Le site utilise des outils de mesure d&apos;audience et des traceurs marketing selon vos choix. Dans le parcours public sans compte, la clé d&apos;accès au plan temporaire peut être conservée uniquement dans la session du navigateur afin d&apos;afficher le résultat et de demander son envoi ; le plan lui-même reste côté serveur et expire au bout de 24 heures. Dans les parcours nécessitant encore une connexion, le texte saisi peut être conservé temporairement dans cette session afin d&apos;éviter sa perte. Un brouillon de proposition d&apos;annonce peut également y être conservé jusqu&apos;à sa soumission.
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
