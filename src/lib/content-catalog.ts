export const CONTENT_CATEGORIES = [
  "Clients & ventes",
  "Planning & opérations",
  "Administration & facturation",
  "Outils & automatisation",
  "Gestion & conformité",
] as const;

export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];

export type ContentSurface = "contenus" | "organisation";

export type ContentSource = Readonly<{
  label: string;
  href: string;
}>;

export type ContentArticleSection = Readonly<{
  heading: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
}>;

export type ContentCatalogEntry = Readonly<{
  slug: string;
  title: string;
  shortTitle: string;
  summary: string;
  category: ContentCategory;
  surfaces: readonly ContentSurface[];
  tags: readonly string[];
  status: "draft" | "published";
  publishedAt: string;
  updatedAt: string;
  verifiedAt: string;
  relatedSystemSlugs: readonly string[];
  academyFundamentalSlugs: readonly string[];
  media: Readonly<{
    slides?: readonly string[];
    youtubeId?: string;
    youtubeThumbnail?: string;
    duration?: string;
  }>;
  keyPoints: readonly string[];
  article: readonly ContentArticleSection[];
  sources: readonly ContentSource[];
}>;

type OrganisationContentInput = Readonly<{
  category: ContentCategory;
  checklist: readonly string[];
  friction: string;
  result: string;
  slug: string;
  steps: readonly string[];
  summary: string;
  tags: readonly string[];
  title: string;
  withChatGpt: string;
}>;

function defineOrganisationContent(
  input: OrganisationContentInput,
): ContentCatalogEntry {
  return {
    slug: input.slug,
    title: input.title,
    shortTitle: input.title,
    summary: input.summary,
    category: input.category,
    surfaces: ["organisation"],
    tags: input.tags,
    status: "published",
    publishedAt: "2026-09-02",
    updatedAt: "2026-09-02",
    verifiedAt: "2026-09-02",
    relatedSystemSlugs: [],
    academyFundamentalSlugs: [],
    media: {},
    keyPoints: input.checklist.slice(0, 4),
    article: [
      {
        heading: "Ce qui bloque aujourd’hui",
        paragraphs: [input.friction],
      },
      {
        heading: "Le résultat à obtenir",
        paragraphs: [input.result],
      },
      {
        heading: "La méthode, étape par étape",
        items: input.steps,
      },
      {
        heading: "Construire le système avec ChatGPT",
        paragraphs: [input.withChatGpt],
      },
      {
        heading: "La checklist de mise en place",
        items: input.checklist,
      },
    ],
    sources: [],
  };
}

const FACTURATION_ELECTRONIQUE_SLIDES = Array.from(
  { length: 9 },
  (_, index) => `/images/courses/facturation-electronique/${String(index + 1).padStart(2, "0")}.png`,
);

const contentCatalog = [
  defineOrganisationContent({
    slug: "gerer-les-urgences-sans-subir",
    title: "Je passe mes journées à gérer les urgences",
    summary:
      "Une méthode concrète pour centraliser les demandes, fixer les priorités et rendre la prochaine action visible.",
    category: "Planning & opérations",
    tags: ["urgences", "priorités", "demandes", "équipe", "organisation"],
    friction:
      "Les demandes arrivent par téléphone, message ou e-mail. Personne ne sait toujours qui doit répondre, ce qui est réellement urgent ni quand relancer. Le dirigeant finit par arbitrer chaque situation.",
    result:
      "Toutes les demandes utiles rejoignent une même file de travail. Chacune possède une priorité, un responsable, une prochaine action et une échéance compréhensible par l’équipe.",
    steps: [
      "Observer une semaine de demandes réelles et leurs canaux d’arrivée.",
      "Définir ce qui doit être enregistré et ce qui peut rester une simple information.",
      "Créer trois niveaux de priorité avec des critères concrets.",
      "Attribuer un responsable, une prochaine action et une date à chaque demande.",
      "Tester le circuit sur un petit périmètre avant de l’étendre.",
      "Faire une revue courte des demandes bloquées et ajuster les règles.",
    ],
    withChatGpt:
      "À partir de demandes réelles, ChatGPT peut aider à proposer des catégories, rédiger les règles de priorité et préparer un résumé des points à traiter. Une connexion aux outils existants ne vient qu’après validation du circuit par l’équipe.",
    checklist: [
      "Un point d’entrée ou une file commune existe pour les demandes à traiter.",
      "Les critères d’urgence sont écrits et partagés.",
      "Chaque demande possède un responsable et une prochaine action.",
      "Les échéances sont visibles sans demander au dirigeant.",
      "Une revue régulière traite uniquement les blocages et les exceptions.",
    ],
  }),
  defineOrganisationContent({
    slug: "rassembler-les-taches-dispersees",
    title: "Mes tâches sont dispersées entre plusieurs outils",
    summary:
      "Une méthode pour relier les tâches au bon dossier et retrouver une vision commune sans remplacer tous vos outils.",
    category: "Outils & automatisation",
    tags: ["tâches", "outils", "centralisation", "automatisation", "organisation"],
    friction:
      "Une partie du travail se trouve dans les e-mails, une autre dans un tableur, les messages ou le logiciel métier. L’équipe recopie les informations et le suivi dépend de la mémoire de chacun.",
    result:
      "Chaque tâche est rattachée au bon client, dossier ou intervention. L’équipe sait où regarder pour connaître le responsable, le statut et la prochaine étape, même si plusieurs outils restent utilisés.",
    steps: [
      "Lister les outils réellement utilisés et le rôle de chacun.",
      "Suivre quelques dossiers de l’entrée jusqu’à leur clôture.",
      "Choisir la source de référence pour les tâches et les statuts.",
      "Supprimer les doubles saisies qui n’apportent aucun contrôle utile.",
      "Relier ou automatiser seulement les passages devenus stables.",
      "Vérifier avec l’équipe que l’information reste facile à retrouver.",
    ],
    withChatGpt:
      "ChatGPT peut transformer l’inventaire des outils et des manipulations en carte de fonctionnement, faire ressortir les doublons et préparer les règles de passage entre systèmes. Les connexions sont ensuite limitées aux transferts répétitifs et vérifiables.",
    checklist: [
      "Chaque outil possède un rôle clairement défini.",
      "Une seule source fait référence pour les tâches et leur statut.",
      "Les doublons manuels les plus fréquents sont identifiés.",
      "Les automatisations conservent une trace en cas d’erreur.",
      "Un nouveau salarié peut comprendre où trouver l’information.",
    ],
  }),
  defineOrganisationContent({
    slug: "transformer-reunions-en-actions",
    title: "Après mes réunions, les décisions se perdent",
    summary:
      "Une méthode simple pour transformer chaque décision en action attribuée, datée et suivie.",
    category: "Planning & opérations",
    tags: ["réunions", "décisions", "actions", "compte rendu", "suivi"],
    friction:
      "Les réunions produisent des notes, mais les décisions restent parfois ambiguës. Les mêmes sujets reviennent, certaines actions n’ont pas de responsable et personne ne sait clairement ce qui a été terminé.",
    result:
      "Chaque réunion se termine avec peu d’actions, mais elles sont précises : une décision, un responsable, une échéance et un endroit unique où suivre leur avancement.",
    steps: [
      "Préparer l’objectif de la réunion et les décisions attendues.",
      "Distinguer pendant l’échange les faits, les décisions et les actions.",
      "Formuler chaque action avec un responsable et une échéance.",
      "Faire valider le relevé avant de terminer la réunion.",
      "Rattacher les actions aux dossiers concernés.",
      "Revoir uniquement les actions ouvertes au point suivant.",
    ],
    withChatGpt:
      "À partir des notes ou d’une transcription autorisée, ChatGPT peut préparer un compte rendu structuré, séparer décisions et actions puis signaler les éléments sans responsable ou sans date. L’équipe conserve la validation finale.",
    checklist: [
      "Chaque réunion possède un objectif et les décisions attendues.",
      "Les décisions sont séparées des simples sujets discutés.",
      "Chaque action a un responsable unique et une date.",
      "Le compte rendu est validé dans un délai court.",
      "Le point suivant repart des actions ouvertes, pas des souvenirs.",
    ],
  }),
  defineOrganisationContent({
    slug: "rendre-equipe-autonome-decisions",
    title: "Mon équipe me sollicite pour chaque décision",
    summary:
      "Une méthode pour clarifier ce que l’équipe peut décider seule et ce qui doit réellement remonter au dirigeant.",
    category: "Planning & opérations",
    tags: ["équipe", "délégation", "décision", "autonomie", "dirigeant"],
    friction:
      "Les responsabilités existent dans les intitulés de poste, mais les limites de décision restent floues. Par sécurité, l’équipe demande une validation pour les dépenses, les délais, les clients ou les imprévus courants.",
    result:
      "Les décisions fréquentes suivent des règles simples. L’équipe agit dans un cadre connu et ne sollicite le dirigeant que lorsqu’un seuil, un risque ou une exception le justifie.",
    steps: [
      "Recenser les décisions qui remontent le plus souvent au dirigeant.",
      "Identifier celles qui sont répétitives et réversibles.",
      "Définir pour chacune un responsable, une limite et un seuil d’escalade.",
      "Documenter quelques exemples de décisions acceptables.",
      "Tester la règle avec l’équipe sur des situations réelles.",
      "Réviser les seuils à partir des erreurs et des blocages observés.",
    ],
    withChatGpt:
      "ChatGPT peut regrouper les demandes de validation récurrentes, proposer une première matrice de décision et transformer les arbitrages du dirigeant en règles compréhensibles. Ces règles restent validées avec les personnes qui les appliqueront.",
    checklist: [
      "Les décisions récurrentes qui remontent au dirigeant sont connues.",
      "Chaque décision possède un responsable et une limite explicite.",
      "Les seuils d’escalade portent sur des faits observables.",
      "L’équipe dispose d’exemples pour appliquer les règles.",
      "Les règles sont ajustées après une période de test.",
    ],
  }),
  defineOrganisationContent({
    slug: "retrouver-informations-documents",
    title: "Je recherche constamment les mêmes informations",
    summary:
      "Une méthode pour rendre les documents et informations utiles faciles à retrouver par toute l’équipe.",
    category: "Outils & automatisation",
    tags: ["documents", "informations", "recherche", "drive", "classement"],
    friction:
      "Les documents sont répartis entre les dossiers personnels, la messagerie, le Drive et les outils métier. Les noms varient, plusieurs versions circulent et certaines informations restent connues d’une seule personne.",
    result:
      "Les documents utiles possèdent une place, un nom et un propriétaire clairs. L’équipe retrouve la bonne version depuis le client, le dossier ou le processus concerné.",
    steps: [
      "Relever les documents et informations recherchés le plus souvent.",
      "Séparer les documents à conserver des données à suivre dans un outil.",
      "Construire une arborescence courte autour des usages réels.",
      "Définir les règles de nommage, de version et d’accès.",
      "Relier chaque dossier opérationnel à ses documents de référence.",
      "Tester la recherche avec une personne qui n’a pas créé le classement.",
    ],
    withChatGpt:
      "ChatGPT peut analyser une liste de documents, proposer une arborescence courte, préparer les conventions de nommage et produire un guide de classement. Connecté à un espace autorisé, il peut aussi aider à retrouver un document sans déplacer les fichiers au hasard.",
    checklist: [
      "Les documents recherchés régulièrement sont identifiés.",
      "Le Drive ne contient que des documents qui doivent réellement y rester.",
      "L’arborescence tient sur peu de niveaux.",
      "Les noms et versions suivent une règle commune.",
      "Les accès sensibles sont limités et contrôlés.",
    ],
  }),
  defineOrganisationContent({
    slug: "automatiser-reporting-recurrent",
    title: "Je refais chaque semaine les mêmes tâches administratives",
    summary:
      "Une méthode pour fiabiliser un reporting récurrent avant d’automatiser sa préparation.",
    category: "Administration & facturation",
    tags: ["reporting", "administration", "automatisation", "données", "tableau de bord"],
    friction:
      "Chaque semaine, les mêmes chiffres sont copiés depuis plusieurs fichiers, remis en forme puis envoyés. Le travail prend du temps, les définitions peuvent varier et la vérification recommence depuis le début.",
    result:
      "Le reporting part de sources identifiées, applique les mêmes règles et met en évidence les quelques écarts qui demandent une décision humaine.",
    steps: [
      "Définir la décision que le reporting doit permettre de prendre.",
      "Conserver uniquement les indicateurs réellement utilisés.",
      "Identifier la source, le propriétaire et la fréquence de chaque donnée.",
      "Stabiliser le calcul et le format avant toute automatisation.",
      "Automatiser la collecte et la préparation avec des contrôles visibles.",
      "Comparer régulièrement le résultat produit aux données sources.",
    ],
    withChatGpt:
      "ChatGPT peut aider à expliquer les écarts, produire un commentaire à partir de données structurées et préparer une synthèse adaptée au destinataire. Les calculs et les sources restent déterministes ; le texte généré ne remplace pas leur contrôle.",
    checklist: [
      "Chaque indicateur répond à une décision identifiable.",
      "La source et la définition de chaque chiffre sont documentées.",
      "Le format a été validé avant son automatisation.",
      "Les erreurs de collecte déclenchent une alerte visible.",
      "Une personne contrôle les écarts avant diffusion.",
    ],
  }),
  {
    slug: "facturation-electronique",
    title: "Facturation électronique : l’essentiel pour être prêt en 2026–2027",
    shortTitle: "Facturation électronique : l’essentiel",
    summary:
      "Le calendrier 2026-2027, la différence entre e-invoicing et e-reporting, et les vérifications à mener sur vos outils, votre plateforme et vos données.",
    category: "Gestion & conformité",
    surfaces: ["contenus"],
    tags: [
      "facturation électronique",
      "e-invoicing",
      "e-reporting",
      "plateforme agréée",
      "TVA",
      "gestion",
    ],
    status: "published",
    publishedAt: "2026-08-09",
    updatedAt: "2026-08-09",
    verifiedAt: "2026-08-09",
    relatedSystemSlugs: [],
    academyFundamentalSlugs: [],
    media: {
      slides: FACTURATION_ELECTRONIQUE_SLIDES,
    },
    keyPoints: [
      "Toutes les entreprises concernées doivent pouvoir recevoir des factures électroniques à partir du 1er septembre 2026.",
      "Les PME et micro-entreprises devront émettre leurs factures électroniques et transmettre leurs données de e-reporting à partir du 1er septembre 2027.",
      "Un PDF ordinaire envoyé par e-mail ne répond pas, à lui seul, au nouveau circuit réglementaire.",
      "La première action consiste à vérifier la compatibilité de vos outils et le choix de votre plateforme agréée.",
    ],
    article: [
      {
        heading: "Ce que la réforme change réellement",
        paragraphs: [
          "La réforme ne consiste pas seulement à remplacer le papier par un fichier PDF. Elle modifie le circuit de transmission des factures et de certaines données à l’administration. Les entreprises concernées devront passer par une plateforme agréée, directement ou par l’intermédiaire d’une solution compatible.",
          "Une facture électronique est un document structuré, transmis dans un format normé. Un PDF ordinaire envoyé par e-mail ne suffira donc plus pour les opérations soumises à l’obligation de facturation électronique.",
        ],
      },
      {
        heading: "Pourquoi ce nouveau fonctionnement",
        paragraphs: [
          "Le dispositif vise à standardiser les échanges, faciliter le suivi des statuts de facture, réduire les ressaisies et mieux détecter les incohérences de TVA. Pour une entreprise, l’enjeu concret est surtout de disposer d’un circuit plus traçable, avec des données clients et fournisseurs suffisamment fiables.",
        ],
      },
      {
        heading: "Les deux échéances à retenir",
        items: [
          "1er septembre 2026 : toutes les entreprises concernées doivent être capables de recevoir des factures électroniques. Les grandes entreprises et les entreprises de taille intermédiaire doivent aussi les émettre et transmettre leur e-reporting.",
          "1er septembre 2027 : les PME et micro-entreprises doivent à leur tour émettre leurs factures électroniques et transmettre les données de e-reporting attendues.",
        ],
      },
      {
        heading: "E-invoicing et e-reporting : deux mécanismes différents",
        paragraphs: [
          "L’e-invoicing concerne principalement les factures entre entreprises établies en France et assujetties à la TVA, lorsque l’opération entre dans le champ de la réforme. La facture circule alors entre plateformes agréées.",
          "L’e-reporting correspond à la transmission de données de transaction ou de paiement pour les opérations qui ne passent pas par ce circuit, notamment certaines ventes à des particuliers ou à des clients établis à l’étranger. La facture peut continuer à être adressée au client par le canal habituel, tandis que les données requises sont transmises à l’administration.",
        ],
      },
      {
        heading: "Le nouveau flux au quotidien",
        items: [
          "Vous créez la facture dans votre logiciel ou directement sur une plateforme agréée.",
          "La facture est contrôlée et transmise à la plateforme du client lorsqu’elle relève de l’e-invoicing.",
          "Les données prévues par la réforme sont transmises à l’administration.",
          "Vous suivez les statuts de la facture dans votre outil ou sur la plateforme : dépôt, réception, traitement et paiement selon les informations disponibles.",
          "Vous centralisez également la réception des factures fournisseurs sur la plateforme choisie.",
        ],
      },
      {
        heading: "Vérifier vos outils et votre plateforme",
        paragraphs: [
          "Commencez par demander à votre éditeur de logiciel de facturation, de caisse ou de comptabilité comment il se connectera à une plateforme agréée. Vérifiez ensuite qui crée les factures, qui contrôle les données, qui suit les rejets et qui traite les factures fournisseurs.",
          "Une solution dite compatible peut conserver son rôle dans votre organisation, mais seule une plateforme agréée peut assurer les transmissions réglementaires prévues par la réforme. La liste officielle des plateformes est publiée et mise à jour par l’administration fiscale.",
        ],
      },
      {
        heading: "Fiabiliser les données avant la bascule",
        paragraphs: [
          "Le passage à la facturation électronique rend les erreurs de données plus visibles. Profitez de la préparation pour vérifier les identifiants de vos clients, leurs adresses de facturation, la nature des opérations, les règles de TVA appliquées et les coordonnées utilisées pour acheminer les factures.",
        ],
      },
      {
        heading: "La checklist à lancer maintenant",
        items: [
          "Lister les outils utilisés pour émettre, recevoir et comptabiliser les factures.",
          "Demander à chaque éditeur comment il gère la réforme et avec quelles plateformes agréées il fonctionne.",
          "Choisir la plateforme qui recevra les factures de l’entreprise.",
          "Nettoyer les données clients et fournisseurs essentielles.",
          "Définir le rôle de chaque personne en cas de rejet, d’écart ou de facture en attente.",
          "Tester le circuit complet avant votre échéance d’émission.",
        ],
      },
    ],
    sources: [
      {
      label: "Facturation électronique et plateformes agréées - impots.gouv.fr",
        href: "https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees",
      },
      {
      label: "Tout savoir sur la facturation électronique pour les entreprises - economie.gouv.fr",
        href: "https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises",
      },
      {
      label: "À partir de quand suis-je concerné ? - impots.gouv.fr",
        href: "https://www.impots.gouv.fr/professionnel/questions/partir-de-quand-suis-je-concerne-par-la-reforme-de-la-facturation",
      },
      {
      label: "FAQ facturation électronique - impots.gouv.fr",
        href: "https://www.impots.gouv.fr/foire-aux-questions-japprofondis-la-facturation-electronique",
      },
    ],
  },
] as const satisfies readonly ContentCatalogEntry[];

export function getContentFormat(entry: ContentCatalogEntry) {
  if (entry.media.youtubeId) return "Vidéo" as const;
  if (entry.media.slides?.length) return "Diaporama" as const;
  return "Article" as const;
}

export function getAllPublishedContent(): ContentCatalogEntry[] {
  return contentCatalog
    .filter((entry) => entry.status === "published")
    .map((entry) => ({ ...entry }))
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
}

export function getPublishedOrganisationContent(): ContentCatalogEntry[] {
  return getAllPublishedContent().filter((entry) =>
    entry.surfaces.includes("organisation"),
  );
}

export const ORGANISATION_TRANSVERSE_LAUNCH_MINIMUM = 6;

export function isOrganisationTransverseLibraryReady(
  publishedContentCount = getPublishedOrganisationContent().length,
) {
  return publishedContentCount >= ORGANISATION_TRANSVERSE_LAUNCH_MINIMUM;
}

export function getPublishedContentBySlug(slug: string) {
  return getAllPublishedContent().find((entry) => entry.slug === slug) ?? null;
}
