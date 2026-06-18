export type ServiceCategory =
  | "Juridique"
  | "Finance"
  | "Systèmes"
  | "Acquisition"
  | "Contenu"
  | "Support opérationnel";

export type DemaaService = {
  slug: string;
  name: string;
  category: ServiceCategory;
  shortDescription: string;
  description: string;
  bestFor: string;
  price: string;
  tags: string[];
  icon: string;
  deliverables: string[];
  usefulFor: string[];
};

export const demaaServices = [
  {
    slug: "creation-societe",
    name: "Création de société",
    category: "Juridique",
    shortDescription: "Créer l'entreprise sans se perdre dans l'administratif.",
    description:
      "Accompagnement pour choisir le statut, préparer les documents, publier l'annonce légale et suivre l'immatriculation jusqu'au Kbis.",
    bestFor:
      "Les porteurs de projet qui veulent lancer proprement leur activité avec une structure adaptée.",
    price: "600 €",
    tags: ["Création", "Kbis", "Statuts"],
    icon: "Building2",
    deliverables: [
      "Choix du statut adapté",
      "Préparation des statuts et formalités",
      "Suivi jusqu'à l'immatriculation",
    ],
    usefulFor: ["Lancement", "Nouvelle activité", "Projet financé"],
  },
  {
    slug: "modification-societe",
    name: "Modification de société",
    category: "Juridique",
    shortDescription: "Modifier la société sans bloquer l'activité.",
    description:
      "Prise en charge des modifications courantes : siège, dirigeant, activité, capital, dénomination ou statuts.",
    bestFor:
      "Les entreprises qui évoluent et doivent mettre leurs informations juridiques à jour rapidement.",
    price: "Sur devis",
    tags: ["Modification", "Statuts", "Formalités"],
    icon: "FilePenLine",
    deliverables: [
      "Cadrage de la modification",
      "Préparation des actes nécessaires",
      "Dépôt et suivi de la formalité",
    ],
    usefulFor: ["Changement de siège", "Nouvelle activité", "Évolution capital"],
  },
  {
    slug: "fermeture-societe",
    name: "Fermeture de société",
    category: "Juridique",
    shortDescription: "Fermer proprement une société.",
    description:
      "Accompagnement sur les étapes de dissolution, liquidation, publication et radiation pour clôturer l'entreprise sans oubli.",
    bestFor:
      "Les dirigeants qui veulent arrêter une société avec une procédure claire et suivie.",
    price: "Sur devis",
    tags: ["Fermeture", "Dissolution", "Radiation"],
    icon: "Ban",
    deliverables: [
      "Plan de fermeture",
      "Documents de dissolution et liquidation",
      "Suivi de radiation",
    ],
    usefulFor: ["Arrêt activité", "Société dormante", "Réorganisation"],
  },
  {
    slug: "previsionnel-financier",
    name: "Prévisionnel financier",
    category: "Finance",
    shortDescription: "Un modèle financier clair et défendable.",
    description:
      "Construction d'un prévisionnel avec hypothèses, chiffre d'affaires, charges, trésorerie, seuil de rentabilité et besoin de financement.",
    bestFor:
      "Les lancements, demandes de financement, investissements et modèles avec coûts importants.",
    price: "550 €",
    tags: ["Financement", "Business plan", "Trésorerie"],
    icon: "TrendingUp",
    deliverables: [
      "Hypothèses structurées",
      "Prévisionnel financier",
      "Lecture des besoins de financement",
    ],
    usefulFor: ["Financement", "Investissement", "Lancement"],
  },
  {
    slug: "audit-conformite-fiscale",
    name: "Audit de conformité fiscale",
    category: "Finance",
    shortDescription: "Identifier les risques avant qu'ils coûtent cher.",
    description:
      "Revue des zones sensibles : TVA, caisse, justificatifs, notes de frais, cohérence bancaire et pratiques administratives.",
    bestFor:
      "Les activités avec caisse, TVA, volume, historique désorganisé ou risque documentaire.",
    price: "1 250 €",
    tags: ["Fiscalité", "Audit", "TVA"],
    icon: "FileSearch",
    deliverables: [
      "Points de risque",
      "Actions correctives",
      "Synthèse de conformité",
    ],
    usefulFor: ["TVA", "Caisse", "Contrôle", "Volume"],
  },
  {
    slug: "site-web",
    name: "Site web",
    category: "Acquisition",
    shortDescription: "Une présence claire pour inspirer confiance.",
    description:
      "Création d'un site vitrine sobre, rapide et orienté conversion avec structure, contenus, pages essentielles et configuration technique.",
    bestFor:
      "Les activités qui doivent rassurer, être trouvées, expliquer leur offre et convertir les visiteurs en contacts.",
    price: "750 €",
    tags: ["Web", "SEO", "Confiance"],
    icon: "Laptop",
    deliverables: [
      "Structure du site",
      "Pages essentielles",
      "Mise en ligne et configuration",
    ],
    usefulFor: ["Visibilité", "Crédibilité", "Prise de contact"],
  },
  {
    slug: "organisation-automatisation",
    name: "Organisation & Automatisation",
    category: "Systèmes",
    shortDescription: "Organiser l'activité puis automatiser ce qui se répète.",
    description:
      "Offre Demaa pour organiser les flux de travail, choisir les bons outils, connecter les étapes et automatiser les tâches répétitives.",
    bestFor:
      "Les entreprises qui perdent du temps sur relances, devis, documents, reporting, planning ou suivi client.",
    price: "Sur devis",
    tags: ["Organisation", "Automatisation", "Demaa"],
    icon: "Workflow",
    deliverables: [
      "Analyse de vos tâches et blocages",
      "Organisation des outils et documents",
      "Automatisations testées et documentées",
    ],
    usefulFor: ["Relances", "Documents", "Reporting", "Planning"],
  },
  {
    slug: "marketing-vente",
    name: "Système Marketing & Vente",
    category: "Acquisition",
    shortDescription: "Transformer l'attention en demandes entrantes.",
    description:
      "Construction d'un système d'acquisition : offre, tunnel, page de conversion, CRM, séquences et suivi commercial.",
    bestFor:
      "Les activités qui doivent générer des leads régulièrement et suivre les opportunités sans dispersion.",
    price: "Sur devis",
    tags: ["Marketing", "Vente", "CRM"],
    icon: "Target",
    deliverables: [
      "Architecture du tunnel",
      "CRM et suivi commercial",
      "Séquences et points de conversion",
    ],
    usefulFor: ["Lead generation", "CRM", "Relance commerciale"],
  },
  {
    slug: "publicite-google",
    name: "Publicité Google",
    category: "Acquisition",
    shortDescription: "Être visible quand les clients cherchent déjà.",
    description:
      "Création et pilotage de campagnes Google Search, Shopping ou Display selon l'activité et l'intention de recherche.",
    bestFor:
      "Les métiers avec une demande active : urgence, local, devis, réservation ou achat comparé.",
    price: "Frais de gestion %",
    tags: ["Google Ads", "Search", "Local"],
    icon: "Search",
    deliverables: [
      "Structure de campagne",
      "Ciblage et annonces",
      "Suivi des conversions",
    ],
    usefulFor: ["Recherche active", "Local", "Devis"],
  },
  {
    slug: "publicite-facebook-instagram",
    name: "Publicité Facebook Instagram",
    category: "Acquisition",
    shortDescription: "Créer de la demande avec Meta.",
    description:
      "Création et pilotage de campagnes Facebook et Instagram avec audiences, visuels, messages et suivi de performance.",
    bestFor:
      "Les activités visuelles, locales, événementielles, e-commerce, formation, beauté, sport ou coaching.",
    price: "Frais de gestion %",
    tags: ["Facebook", "Instagram", "Meta"],
    icon: "Share2",
    deliverables: [
      "Ciblage d'audience",
      "Création des campagnes",
      "Optimisation des performances",
    ],
    usefulFor: ["Social ads", "Local", "E-commerce", "Image"],
  },
  {
    slug: "publicite-tiktok",
    name: "Publicité TikTok",
    category: "Acquisition",
    shortDescription: "Tester l'acquisition sur formats courts.",
    description:
      "Pilotage de campagnes TikTok Ads avec angle créatif, ciblage et logique de test pour les offres adaptées au format vidéo court.",
    bestFor:
      "Les marques visuelles, e-commerce, contenu, formation, beauté, restauration ou offres grand public.",
    price: "Frais de gestion %",
    tags: ["TikTok", "UGC", "Vidéo"],
    icon: "Music",
    deliverables: [
      "Angles créatifs",
      "Campagnes TikTok Ads",
      "Lecture des tests",
    ],
    usefulFor: ["Formats courts", "E-commerce", "Grand public"],
  },
  {
    slug: "montage-video",
    name: "Montage vidéo",
    category: "Contenu",
    shortDescription: "Des vidéos prêtes à publier.",
    description:
      "Montage de contenus pour réseaux sociaux, publicités, pages de vente ou supports pédagogiques : rythme, sous-titres, habillage et exports.",
    bestFor:
      "Les activités où la preuve visuelle, la pédagogie ou la présence social media influencent la décision.",
    price: "Sur devis",
    tags: ["Vidéo", "Social", "Contenu"],
    icon: "Video",
    deliverables: [
      "Montage des séquences",
      "Sous-titres et habillage",
      "Exports aux formats utiles",
    ],
    usefulFor: ["Réseaux sociaux", "Publicité", "Pédagogie"],
  },
  {
    slug: "assistant-polyvalent",
    name: "Recruter un assistant polyvalent",
    category: "Support opérationnel",
    shortDescription:
      "Déléguez vos tâches administratives à une professionnelle formée, sans supporter le coût d'une embauche classique.",
    description:
      "Déléguez vos tâches administratives à une professionnelle formée, sans supporter le coût d'une embauche classique.",
    bestFor:
      "Les dirigeants qui veulent récupérer du temps sans supporter le coût plein d'une embauche classique.",
    price: "Sur devis",
    tags: ["Assistant", "Recrutement", "Délégation"],
    icon: "UserRoundCheck",
    deliverables: [
      "Tâches administratives déléguées",
      "Parcours encadré et sécurisé",
      "Renfort adapté à vos besoins réels",
    ],
    usefulFor: ["Délégation", "Admin", "Temps gagné", "Renfort"],
  },
] satisfies DemaaService[];

export const serviceCategories = [
  "Juridique",
  "Finance",
  "Systèmes",
  "Acquisition",
  "Contenu",
  "Support opérationnel",
] satisfies ServiceCategory[];

export type DemaaServiceSlug = (typeof demaaServices)[number]["slug"];

export function getDemaaServices(): DemaaService[] {
  return [...demaaServices];
}

export function getDemaaServiceBySlug(slug: string): DemaaService | null {
  return demaaServices.find((service) => service.slug === slug) ?? null;
}
