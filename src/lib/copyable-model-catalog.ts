export type CopyableModelPlatform = "airtable" | "google-drive" | "google-sheets";
export type CopyableModelAvailability = "available" | "planned";

export type CopyableModelDefinition = Readonly<{
  slug: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  category: string;
  platform: CopyableModelPlatform;
  availability: CopyableModelAvailability;
  featuredRank: number;
  workflowStart: string;
  workflowEnd: string;
  benefits: readonly string[];
  includedSections: readonly string[];
  searchTerms: readonly string[];
  compatibleSystemSlugs: "all" | readonly string[];
  driveFolderTemplateSlug?: "structure-google-drive-entreprise";
  documentModelSlug?: string;
  relatedOrganiserSlug?: string;
  relatedOrganiserLabel?: string;
}>;

const INTERVENTION_AND_WORKSITE_SYSTEM_SLUGS = [
  "batiment",
  "plomberie-chauffage",
  "electricite-generale",
  "renovation-interieur",
  "couvreur",
  "architecte-maitre-oeuvre",
  "carreleur",
  "climatisation",
  "menuiserie-agencement",
  "maconnerie-gros-oeuvre",
  "nettoyage-professionnel",
  "geometre",
  "paysagiste",
  "peintre-en-batiment",
  "pisciniste",
  "serrurier",
] as const;

const copyableModelDefinitions: readonly CopyableModelDefinition[] = [
  {
    slug: "structure-google-drive-entreprise",
    title: "Structure Google Drive pour organiser son entreprise",
    description: "Créez une arborescence claire pour la direction, la finance, l’administration, les clients, l’équipe et les processus.",
    seoTitle: "Structure Google Drive pour organiser son entreprise | Demaa",
    seoDescription: "Créez gratuitement dans Google Drive une structure de dossiers pragmatique pour organiser les documents de votre entreprise.",
    category: "Organisation",
    platform: "google-drive",
    availability: "available",
    featuredRank: 1,
    workflowStart: "Les documents sont dispersés ou rangés différemment par chaque personne",
    workflowEnd: "Chaque document a un emplacement clair, partagé et durable",
    benefits: ["Retrouver les documents plus vite", "Séparer les espaces sensibles", "Archiver sans encombrer le travail courant"],
    includedSections: ["Direction", "Finance", "Administration", "Commercial", "Clients", "Équipe & RH", "Marketing", "Processus", "Informatique", "Archives"],
    searchTerms: ["drive", "google drive", "dossiers", "arborescence", "classement", "documents", "organisation"],
    compatibleSystemSlugs: "all",
    driveFolderTemplateSlug: "structure-google-drive-entreprise",
  },
  {
    slug: "suivi-commercial-et-devis",
    title: "Suivi commercial et devis",
    description: "Centralisez les demandes, les opportunités, les devis et les relances jusqu’à la décision du client.",
    seoTitle: "Modèle de suivi commercial et devis à copier | Demaa",
    seoDescription: "Un modèle Airtable gratuit pour suivre les demandes commerciales, les devis, les relances et les décisions clients.",
    category: "Commercial",
    platform: "airtable",
    availability: "available",
    featuredRank: 2,
    workflowStart: "Une demande ou une opportunité entre",
    workflowEnd: "Le devis est accepté, refusé ou à relancer",
    benefits: ["Ne perdre aucune demande", "Savoir quels devis relancer", "Lire le pipeline en un coup d’œil"],
    includedSections: ["Contacts et entreprises", "Demandes", "Opportunités", "Devis", "Relances"],
    searchTerms: ["crm", "prospect", "vente", "devis", "relance", "commercial"],
    compatibleSystemSlugs: "all",
    documentModelSlug: "pilotage-marketing-vente",
    relatedOrganiserSlug: "transformer-demande-en-client",
    relatedOrganiserLabel: "Comprendre le processus demande → client",
  },
  {
    slug: "projets-et-missions-clients",
    title: "Projets et missions clients",
    description: "Cadrez les missions vendues, les étapes, les livrables, les responsables et les échéances client.",
    seoTitle: "Modèle de suivi des projets et missions clients | Demaa",
    seoDescription: "Un modèle Airtable gratuit pour organiser les missions clients, les livrables, les responsables et les échéances.",
    category: "Production",
    platform: "airtable",
    availability: "available",
    featuredRank: 4,
    workflowStart: "Une mission est validée",
    workflowEnd: "Les livrables sont remis et la mission clôturée",
    benefits: ["Voir l’avancement réel", "Clarifier qui fait quoi", "Anticiper les retards"],
    includedSections: ["Clients", "Projets", "Étapes", "Livrables", "Échéances"],
    searchTerms: ["projet", "mission", "client", "agence", "conseil", "livrable"],
    compatibleSystemSlugs: "all",
    documentModelSlug: "projets-et-missions-clients",
    relatedOrganiserSlug: "livrer-prestation-sans-tout-reinventer",
    relatedOrganiserLabel: "Comprendre le processus de livraison client",
  },
  {
    slug: "interventions-et-chantiers",
    title: "Interventions et chantiers",
    description: "Centralisez les demandes terrain, les sites, la planification, les équipes et les comptes rendus jusqu’à la clôture.",
    seoTitle: "Modèle de suivi des interventions et chantiers | Demaa",
    seoDescription: "Un modèle Airtable gratuit pour planifier et suivre les interventions, les chantiers, les équipes et leur avancement.",
    category: "Terrain",
    platform: "airtable",
    availability: "available",
    featuredRank: 5,
    workflowStart: "Une demande terrain est reçue et qualifiée",
    workflowEnd: "Le travail est terminé, contrôlé et son compte rendu archivé",
    benefits: ["Centraliser les demandes et les sites", "Voir la prochaine action de chaque intervention", "Conserver l’historique terrain"],
    includedSections: ["Clients et sites", "Demandes", "Interventions", "Équipes", "Suivi terrain"],
    searchTerms: ["chantier", "intervention", "btp", "artisan", "planning", "technicien", "maintenance", "terrain"],
    compatibleSystemSlugs: INTERVENTION_AND_WORKSITE_SYSTEM_SLUGS,
    documentModelSlug: "interventions-et-chantiers",
    relatedOrganiserSlug: "centraliser-demandes-telephone-sms-whatsapp",
    relatedOrganiserLabel: "Comprendre le processus demande → intervention",
  },
  {
    slug: "suivi-previsionnel-financier",
    title: "Suivi et prévisionnel financier",
    description: "Suivez les entrées, les sorties et la trésorerie prévisionnelle pour décider avant les tensions de cash.",
    seoTitle: "Suivi et prévisionnel financier à copier | Demaa",
    seoDescription: "Copiez gratuitement un modèle Google Sheets de suivi et prévisionnel financier pour piloter votre trésorerie.",
    category: "Finance",
    platform: "google-sheets",
    availability: "available",
    featuredRank: 3,
    workflowStart: "Les encaissements et décaissements prévus sont renseignés",
    workflowEnd: "La trésorerie future est visible et les écarts sont arbitrés",
    benefits: ["Sortir du pilotage à vue", "Anticiper les tensions de trésorerie", "Comparer le prévu au réalisé"],
    includedSections: ["Budget", "Entrées", "Sorties", "Prévisionnel", "Synthèse"],
    searchTerms: ["finance", "budget", "tresorerie", "prévisionnel", "cash"],
    compatibleSystemSlugs: "all",
    documentModelSlug: "suivi-previsionnel-financier",
    relatedOrganiserSlug: "piloter-sa-tresorerie",
    relatedOrganiserLabel: "Comprendre comment piloter sa trésorerie",
  },
  {
    slug: "suivi-administratif-et-echeances",
    title: "Suivi administratif et échéances",
    description: "Regroupez les obligations, documents, responsables, dates limites et relances administratives.",
    seoTitle: "Modèle de suivi administratif et échéances | Demaa",
    seoDescription: "Un modèle Airtable gratuit pour suivre les obligations, les documents et les échéances administratives.",
    category: "Administration",
    platform: "airtable",
    availability: "available",
    featuredRank: 6,
    workflowStart: "Une obligation ou un document est identifié",
    workflowEnd: "L’action est réalisée, vérifiée et archivée",
    benefits: ["Réduire les oublis", "Attribuer chaque échéance", "Retrouver les justificatifs"],
    includedSections: ["Dossiers administratifs", "Échéances", "Documents", "Organismes", "Responsables"],
    searchTerms: ["administratif", "échéance", "document", "obligation", "conformité"],
    compatibleSystemSlugs: "all",
    documentModelSlug: "suivi-administratif-et-echeances",
  },
  {
    slug: "planning-marketing-et-contenus",
    title: "Planning marketing et contenus",
    description: "Organisez les idées, les canaux, la production, la validation et la publication de vos contenus.",
    seoTitle: "Modèle de planning marketing et contenus | Demaa",
    seoDescription: "Un modèle Airtable gratuit pour organiser un planning marketing, la production et la publication des contenus.",
    category: "Marketing",
    platform: "airtable",
    availability: "available",
    featuredRank: 8,
    workflowStart: "Une idée ou une campagne est planifiée",
    workflowEnd: "Le contenu est publié et ses résultats sont suivis",
    benefits: ["Voir le calendrier éditorial", "Fluidifier les validations", "Réutiliser les idées"],
    includedSections: ["Campagnes", "Contenus", "Calendrier de publication", "Canaux et formats", "Performances"],
    searchTerms: ["marketing", "contenu", "planning", "réseaux sociaux", "campagne"],
    compatibleSystemSlugs: "all",
    documentModelSlug: "planning-marketing-et-contenus",
  },
  {
    slug: "recrutement-et-candidatures",
    title: "Recrutement et candidatures",
    description: "Suivez les postes, les candidatures, les entretiens, les prochaines actions et les décisions de recrutement.",
    seoTitle: "Modèle de suivi du recrutement et des candidatures | Demaa",
    seoDescription: "Un modèle Airtable gratuit pour suivre les postes, les candidatures, les entretiens et les décisions de recrutement.",
    category: "Équipe",
    platform: "airtable",
    availability: "available",
    featuredRank: 9,
    workflowStart: "Un besoin de recrutement est ouvert",
    workflowEnd: "La décision est prise et le dossier est clôturé",
    benefits: ["Centraliser les candidatures", "Partager les évaluations", "Ne manquer aucune relance"],
    includedSections: ["Postes", "Candidatures", "Entretiens", "Prochaines actions", "Décisions"],
    searchTerms: ["recrutement", "candidat", "rh", "entretien", "équipe"],
    compatibleSystemSlugs: "all",
    documentModelSlug: "recrutement-et-candidatures",
  },
  {
    slug: "suivi-client-et-support",
    title: "Suivi client et demandes de support",
    description: "Centralisez les demandes clients, leur priorité, le responsable, les réponses et la résolution.",
    seoTitle: "Modèle de suivi client et demandes de support | Demaa",
    seoDescription: "Un modèle Airtable gratuit pour centraliser, prioriser et résoudre les demandes de support client.",
    category: "Relation client",
    platform: "airtable",
    availability: "available",
    featuredRank: 7,
    workflowStart: "Une demande client est reçue",
    workflowEnd: "La demande est résolue et la réponse tracée",
    benefits: ["Réunir toutes les demandes", "Prioriser les urgences", "Conserver l’historique client"],
    includedSections: ["Clients", "Demandes", "Priorités et statuts", "Actions de suivi", "Résolutions"],
    searchTerms: ["client", "support", "sav", "ticket", "demande", "assistance"],
    compatibleSystemSlugs: "all",
    documentModelSlug: "suivi-client-et-support",
  },
];

const contextualModelSlugsByOrganiserSlug = {
  "organiser-entreprise-plomberie": "interventions-et-chantiers",
  "organiser-demandes-devis-renovation": "suivi-commercial-et-devis",
  "organiser-chantier-menuiserie": "interventions-et-chantiers",
  "organiser-interventions-nettoyage": "interventions-et-chantiers",
  "organiser-parcours-client-garage": "interventions-et-chantiers",
  "organiser-suivi-administratif-formation": "suivi-administratif-et-echeances",
  "organiser-mission-agence": "projets-et-missions-clients",
  "organiser-planning-plusieurs-techniciens": "interventions-et-chantiers",
  "bon-intervention-facture-sans-ressaisie": "interventions-et-chantiers",
} as const satisfies Readonly<Record<string, string>>;

function compareModels(left: CopyableModelDefinition, right: CopyableModelDefinition) {
  return left.featuredRank - right.featuredRank;
}

export function getAllCopyableModelDefinitions(): CopyableModelDefinition[] {
  return [...copyableModelDefinitions].sort(compareModels);
}

export function getPublishedCopyableModels(): CopyableModelDefinition[] {
  return getAllCopyableModelDefinitions().filter((model) => model.availability === "available");
}

export function getCopyableModelBySlug(slug: string): CopyableModelDefinition | null {
  return copyableModelDefinitions.find((model) => model.slug === slug) ?? null;
}

export function getPublishedCopyableModelBySlug(slug: string): CopyableModelDefinition | null {
  const model = getCopyableModelBySlug(slug);
  return model?.availability === "available" ? model : null;
}

export function getPublishedCopyableModelForOrganiserSlug(
  organiserSlug: string,
): CopyableModelDefinition | null {
  const directlyRelatedModel = copyableModelDefinitions.find(
    (model) => model.relatedOrganiserSlug === organiserSlug,
  );
  if (directlyRelatedModel?.availability === "available") {
    return directlyRelatedModel;
  }

  const contextualModelSlug = contextualModelSlugsByOrganiserSlug[
    organiserSlug as keyof typeof contextualModelSlugsByOrganiserSlug
  ];
  return contextualModelSlug
    ? getPublishedCopyableModelBySlug(contextualModelSlug)
    : null;
}

export function getPublishedCopyableModelsForSystemSlug(systemSlug: string): CopyableModelDefinition[] {
  return getPublishedCopyableModels().filter((model) => (
    model.compatibleSystemSlugs === "all" || model.compatibleSystemSlugs.includes(systemSlug)
  ));
}

export function getPublishedCopyableModelRouteParams() {
  return getPublishedCopyableModels().map((model) => ({ slug: model.slug }));
}
