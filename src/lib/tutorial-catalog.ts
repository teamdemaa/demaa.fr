export const TUTORIAL_CATEGORIES = [
  "Clients & ventes",
  "Planning & opérations",
] as const;

export type TutorialCategory = (typeof TUTORIAL_CATEGORIES)[number];

export type TutorialField = Readonly<{
  name: string;
  purpose: string;
  type: string;
}>;

export type TutorialScreenshot = Readonly<{
  alt: string;
  caption: string;
  src: string;
}>;

export type TutorialStep = Readonly<{
  items?: readonly string[];
  paragraphs: readonly string[];
  screenshot?: TutorialScreenshot;
  title: string;
}>;

export type TutorialDefinition = Readonly<{
  category: TutorialCategory;
  fields: readonly TutorialField[];
  keyPoints: readonly string[];
  minutes: number;
  modelSlug: string;
  publishedAt: string;
  searchTerms: readonly string[];
  slug: string;
  steps: readonly TutorialStep[];
  summary: string;
  thumbnail: string;
  title: string;
  tool: "Airtable";
  updatedAt: string;
}>;

const tutorials = [
  {
    slug: "creer-pipeline-commercial-airtable",
    title: "Créer un pipeline commercial dans Airtable",
    summary:
      "Centralisez vos opportunités, visualisez leur étape et retrouvez immédiatement la prochaine action à mener.",
    category: "Clients & ventes",
    tool: "Airtable",
    minutes: 25,
    modelSlug: "suivi-commercial-et-devis",
    publishedAt: "2026-09-12",
    updatedAt: "2026-09-12",
    thumbnail: "/images/organiser/thumbnails/creer-pipeline-commercial-airtable.png?v=20260912-tutorials",
    searchTerms: ["pipeline", "commercial", "crm", "prospect", "vente", "airtable"],
    keyPoints: [
      "Une opportunité correspond à une vente potentielle, pas à un simple contact.",
      "Chaque ligne doit avoir une étape, un responsable et une prochaine action datée.",
      "La vue Pipeline sert à décider quoi faire, la grille sert à fiabiliser les données.",
      "Le modèle Demaa est déjà structuré : copiez-le avant de l’adapter.",
    ],
    fields: [
      { name: "Opportunité", type: "Texte", purpose: "Nommer clairement la vente potentielle" },
      { name: "Entreprise liée", type: "Lien", purpose: "Rattacher l’opportunité au bon compte" },
      { name: "Contact principal", type: "Lien", purpose: "Savoir qui contacter" },
      { name: "Montant estimé", type: "Devise", purpose: "Mesurer la valeur du pipeline" },
      { name: "Étape", type: "Sélection", purpose: "Visualiser l’avancement" },
      { name: "Responsable", type: "Collaborateur", purpose: "Rendre le suivi explicite" },
      { name: "Prochaine action", type: "Texte", purpose: "Décider ce qui doit se passer ensuite" },
      { name: "Date de prochaine action", type: "Date", purpose: "Éviter les relances oubliées" },
    ],
    steps: [
      {
        title: "Copier le modèle et repérer les cinq tables",
        paragraphs: [
          "Ouvrez le modèle Demaa puis cliquez sur « Copier la base ». Vous récupérez les tables Entreprises, Contacts, Opportunités, Devis et Activités & relances dans votre espace Airtable.",
          "Commencez dans la table Opportunités. Les autres tables enrichissent le suivi, mais vous n’avez pas besoin de les personnaliser toutes dès le premier jour.",
        ],
        screenshot: {
          src: "/images/tutoriels/creer-pipeline-commercial-airtable/opportunites.png",
          alt: "Table Opportunités du modèle Airtable Demaa avec les entreprises, montants et étapes commerciales",
          caption: "La vraie table Opportunités du modèle Demaa : les informations utiles sont déjà reliées.",
        },
      },
      {
        title: "Garder un pipeline court et compréhensible",
        paragraphs: [
          "Utilisez des étapes qui décrivent une décision commerciale réelle. Six à sept étapes suffisent dans la majorité des petites entreprises.",
        ],
        items: [
          "Nouvelle demande",
          "À qualifier",
          "Devis à préparer",
          "Devis envoyé",
          "Négociation",
          "Gagnée",
          "Perdue",
        ],
      },
      {
        title: "Créer la vue Pipeline groupée par étape",
        paragraphs: [
          "Ajoutez une vue Kanban dans la table Opportunités et choisissez le champ Étape comme regroupement. Chaque carte doit au minimum afficher le nom de l’opportunité, l’entreprise, le montant et la prochaine action.",
          "Cette vue n’est pas un tableau décoratif : elle doit permettre de repérer en moins d’une minute les opportunités bloquées ou sans prochaine action.",
        ],
        screenshot: {
          src: "/images/tutoriels/creer-pipeline-commercial-airtable/pipeline.png",
          alt: "Vue Pipeline du modèle Airtable Demaa groupée par étape commerciale",
          caption: "La vue Pipeline regroupe les cartes par étape ; la grille reste la source de vérité.",
        },
      },
      {
        title: "Créer une vue À traiter",
        paragraphs: [
          "Filtrez les opportunités dont la date de prochaine action est aujourd’hui ou dépassée, en excluant les étapes Gagnée et Perdue. Triez ensuite par priorité puis par date.",
          "Cette vue devient la liste de travail quotidienne : si elle est vide, aucune relance commerciale n’est en retard.",
        ],
      },
      {
        title: "Installer une routine de quinze minutes",
        paragraphs: [
          "Chaque matin, ouvrez À traiter. Après chaque échange client, mettez à jour l’étape, la prochaine action et sa date. Une fois par semaine, vérifiez les opportunités restées trop longtemps dans la même étape.",
        ],
        items: [
          "Aucune opportunité active sans prochaine action",
          "Aucune date de relance dépassée sans explication",
          "Les opportunités gagnées ou perdues sont clôturées",
        ],
      },
    ],
  },
  {
    slug: "suivre-devis-relances-airtable",
    title: "Suivre ses devis et ses relances dans Airtable",
    summary:
      "Réunissez les devis envoyés, leurs échéances et les relances à faire dans une vue quotidienne simple.",
    category: "Clients & ventes",
    tool: "Airtable",
    minutes: 20,
    modelSlug: "suivi-commercial-et-devis",
    publishedAt: "2026-09-12",
    updatedAt: "2026-09-12",
    thumbnail: "/images/organiser/thumbnails/suivre-devis-relances-airtable.png?v=20260912-tutorials",
    searchTerms: ["devis", "relance", "commercial", "vente", "airtable"],
    keyPoints: [
      "Un devis envoyé doit toujours avoir une date de relance.",
      "Le statut du devis et la prochaine action répondent à deux questions différentes.",
      "Une vue filtrée suffit pour construire la liste de relances du jour.",
      "Les relances importantes doivent être historisées dans Activités & relances.",
    ],
    fields: [
      { name: "Numéro du devis", type: "Texte", purpose: "Identifier le document sans ambiguïté" },
      { name: "Opportunité liée", type: "Lien", purpose: "Conserver le contexte commercial" },
      { name: "Montant TTC", type: "Devise", purpose: "Prioriser les enjeux" },
      { name: "Statut", type: "Sélection", purpose: "Distinguer brouillon, envoyé, accepté ou refusé" },
      { name: "Date d’envoi", type: "Date", purpose: "Mesurer le délai de réponse" },
      { name: "Date de relance", type: "Date", purpose: "Faire apparaître le devis au bon moment" },
      { name: "Prochaine action", type: "Texte", purpose: "Préparer un suivi précis" },
    ],
    steps: [
      {
        title: "Copier le modèle et ouvrir la table Devis",
        paragraphs: [
          "Copiez le modèle Suivi commercial et devis, puis ouvrez la table Devis. Conservez le lien vers Opportunités : il évite de ressaisir l’entreprise, le contact et le contexte de la demande.",
        ],
      },
      {
        title: "Définir quatre statuts utiles",
        paragraphs: [
          "Commencez avec Brouillon, Envoyé, Accepté et Refusé. Ajoutez Expiré seulement si cette distinction déclenche une action différente dans votre entreprise.",
        ],
      },
      {
        title: "Créer la vue Relances du jour",
        paragraphs: [
          "Filtrez les devis au statut Envoyé dont la date de relance est aujourd’hui ou antérieure. Triez d’abord par date de relance, puis par montant décroissant.",
        ],
      },
      {
        title: "Tracer chaque échange important",
        paragraphs: [
          "Après un appel ou un e-mail significatif, ajoutez une activité liée au devis. Notez le résultat, puis fixez immédiatement la prochaine action et sa date.",
        ],
      },
      {
        title: "Contrôler le portefeuille une fois par semaine",
        paragraphs: [
          "Repérez les devis envoyés sans relance, ceux dont le montant est absent et ceux qui restent ouverts sans décision. Clôturez ce qui doit l’être pour garder une vue fiable.",
        ],
      },
    ],
  },
  {
    slug: "organiser-projets-missions-clients-airtable",
    title: "Organiser ses projets et missions clients dans Airtable",
    summary:
      "Cadrez chaque mission vendue, ses livrables, son responsable et ses échéances sans multiplier les tableaux.",
    category: "Planning & opérations",
    tool: "Airtable",
    minutes: 30,
    modelSlug: "projets-et-missions-clients",
    publishedAt: "2026-09-12",
    updatedAt: "2026-09-12",
    thumbnail: "/images/organiser/thumbnails/organiser-projets-missions-clients-airtable.png?v=20260912-tutorials",
    searchTerms: ["projet", "mission", "client", "livrable", "planning", "airtable"],
    keyPoints: [
      "Un projet porte le résultat vendu ; les étapes décrivent le chemin pour le livrer.",
      "Chaque livrable doit avoir un responsable et une date attendue.",
      "Les vues par responsable et par échéance remplacent les tableaux parallèles.",
      "Le point hebdomadaire doit se concentrer sur les blocages et les retards.",
    ],
    fields: [
      { name: "Mission", type: "Texte", purpose: "Nommer le résultat client" },
      { name: "Client", type: "Lien", purpose: "Regrouper l’historique par client" },
      { name: "Statut", type: "Sélection", purpose: "Voir l’avancement global" },
      { name: "Responsable", type: "Collaborateur", purpose: "Clarifier le pilotage" },
      { name: "Date de début", type: "Date", purpose: "Situer la mission dans le planning" },
      { name: "Échéance", type: "Date", purpose: "Anticiper les retards" },
      { name: "Prochaine étape", type: "Texte", purpose: "Rendre l’avancement actionnable" },
    ],
    steps: [
      {
        title: "Copier le modèle Projets et missions clients",
        paragraphs: [
          "Dupliquez la base puis supprimez uniquement les exemples dont vous n’avez pas besoin. Gardez les relations entre Clients, Projets, Étapes et Livrables.",
        ],
      },
      {
        title: "Créer une fiche par mission vendue",
        paragraphs: [
          "Nommez la mission avec un résultat compréhensible, rattachez le client, indiquez le responsable, les dates et la prochaine étape concrète.",
        ],
      },
      {
        title: "Découper la livraison en étapes vérifiables",
        paragraphs: [
          "Évitez les listes de micro-tâches. Créez plutôt cinq à huit étapes qui correspondent à des validations ou livrables observables par l’équipe et le client.",
        ],
      },
      {
        title: "Créer les vues En retard et Cette semaine",
        paragraphs: [
          "Filtrez les échéances dépassées non terminées pour la première vue. Pour la seconde, gardez les livrables attendus dans les sept prochains jours et groupez-les par responsable.",
        ],
      },
      {
        title: "Faire un point de pilotage hebdomadaire",
        paragraphs: [
          "Passez uniquement les éléments en retard, bloqués ou sans responsable. Mettez à jour la prochaine étape avant de quitter la réunion.",
        ],
      },
    ],
  },
  {
    slug: "planifier-interventions-chantiers-airtable",
    title: "Planifier ses interventions et chantiers dans Airtable",
    summary:
      "Transformez les demandes terrain en interventions planifiées, affectées et suivies jusqu’au compte rendu.",
    category: "Planning & opérations",
    tool: "Airtable",
    minutes: 30,
    modelSlug: "interventions-et-chantiers",
    publishedAt: "2026-09-12",
    updatedAt: "2026-09-12",
    thumbnail: "/images/organiser/thumbnails/planifier-interventions-chantiers-airtable.png?v=20260912-tutorials",
    searchTerms: ["intervention", "chantier", "planning", "équipe", "technicien", "airtable"],
    keyPoints: [
      "La demande, l’intervention et le compte rendu sont trois objets différents.",
      "Une intervention n’est planifiée que si la date, le site et l’équipe sont renseignés.",
      "La vue calendrier répond à la question quand ; la grille répond à la question pourquoi.",
      "Les imprévus se replanifient dans la même fiche pour conserver l’historique.",
    ],
    fields: [
      { name: "Intervention", type: "Texte", purpose: "Identifier le travail à réaliser" },
      { name: "Demande liée", type: "Lien", purpose: "Conserver le besoin d’origine" },
      { name: "Client et site", type: "Lien", purpose: "Préparer le déplacement" },
      { name: "Équipe", type: "Lien", purpose: "Affecter les bonnes personnes" },
      { name: "Début prévu", type: "Date et heure", purpose: "Alimenter le planning" },
      { name: "Fin prévue", type: "Date et heure", purpose: "Éviter les chevauchements" },
      { name: "Statut", type: "Sélection", purpose: "Suivre planification, réalisation et clôture" },
      { name: "Compte rendu", type: "Texte long", purpose: "Tracer le résultat terrain" },
    ],
    steps: [
      {
        title: "Copier le modèle Interventions et chantiers",
        paragraphs: [
          "Dupliquez la base Demaa et gardez les tables Clients et sites, Demandes, Interventions, Équipes et Suivi terrain. Elles évitent de recopier les mêmes informations à chaque passage.",
        ],
      },
      {
        title: "Qualifier la demande avant de planifier",
        paragraphs: [
          "Vérifiez le site, le type de travail, le niveau d’urgence, les contraintes d’accès et les compétences nécessaires. Une demande incomplète reste À qualifier.",
        ],
      },
      {
        title: "Créer l’intervention et affecter l’équipe",
        paragraphs: [
          "Transformez la demande qualifiée en intervention. Renseignez les dates, le site, l’équipe, la durée prévue et les consignes utiles au terrain.",
        ],
      },
      {
        title: "Construire les vues Calendrier et À confirmer",
        paragraphs: [
          "La vue Calendrier affiche les interventions par date de début. La vue À confirmer filtre celles qui n’ont pas encore d’équipe ou dont le créneau n’est pas validé.",
        ],
      },
      {
        title: "Clôturer avec un compte rendu",
        paragraphs: [
          "À la fin, renseignez le résultat, les éventuelles réserves, les photos ou documents et la prochaine action. Passez ensuite le statut à Terminée ou À reprendre.",
        ],
      },
    ],
  },
] as const satisfies readonly TutorialDefinition[];

export function getPublishedTutorials(): TutorialDefinition[] {
  return tutorials.map((tutorial) => ({ ...tutorial }));
}

export function getPublishedTutorialBySlug(slug: string): TutorialDefinition | null {
  return tutorials.find((tutorial) => tutorial.slug === slug) ?? null;
}

export function getPublishedTutorialRouteParams() {
  return tutorials.map(({ slug }) => ({ slug }));
}
