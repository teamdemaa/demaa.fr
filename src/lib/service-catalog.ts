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
  duration: string;
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
    duration: "1 mois",
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
    duration: "1 mois",
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
    duration: "1 mois",
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
    shortDescription:
      "Un prévisionnel clair pour défendre votre projet, piloter vos chiffres et sécuriser vos décisions.",
    description:
      "Un prévisionnel financier construit à partir de vos hypothèses pour clarifier chiffre d'affaires, charges, trésorerie et besoin de financement.",
    bestFor:
      "Les lancements, demandes de financement, investissements et activités qui ont besoin de repères chiffrés clairs.",
    duration: "2 semaines",
    price: "550 €",
    tags: ["Financement", "Business plan", "Trésorerie"],
    icon: "TrendingUp",
    deliverables: [
      "Hypothèses de chiffre d'affaires et de charges",
      "Prévisionnel financier complet",
      "Besoin de financement et seuil de rentabilité",
    ],
    usefulFor: ["Financement", "Investissement", "Lancement"],
  },
  {
    slug: "audit-conformite-fiscale",
    name: "Audit d'optimisation et conformité fiscale",
    category: "Finance",
    shortDescription:
      "Un audit ciblé pour repérer les risques, identifier les optimisations possibles et éviter les mauvaises surprises.",
    description:
      "Revue des zones sensibles pour repérer les écarts, sécuriser les pratiques et identifier les optimisations fiscales ou administratives possibles.",
    bestFor:
      "Les entreprises qui veulent vérifier qu'elles sont carrées, éviter les erreurs coûteuses et repérer ce qui peut être optimisé.",
    duration: "2 semaines",
    price: "850 €",
    tags: ["Fiscalité", "Audit", "TVA"],
    icon: "FileSearch",
    deliverables: [
      "Points de risque fiscaux identifiés",
      "Optimisations fiscales ou administratives possibles repérées",
      "Liste d'actions correctives priorisées",
      "Synthèse de conformité remise en fin d'audit",
    ],
    usefulFor: ["TVA", "Caisse", "Contrôle", "Volume"],
  },
  {
    slug: "expert-comptable",
    name: "Expert-comptable",
    category: "Finance",
    shortDescription: "Être mis en relation avec le bon cabinet selon votre contexte.",
    description:
      "Mise en relation avec un expert-comptable selon votre activité, votre stade, vos enjeux et le type d'accompagnement recherché.",
    bestFor:
      "Les dirigeants qui veulent trouver un cabinet adapté pour la création, le suivi courant, la paie, la fiscalité ou un changement d'interlocuteur.",
    duration: "1 mois",
    price: "Sur devis",
    tags: ["Comptabilité", "Mise en relation", "Cabinet"],
    icon: "Calculator",
    deliverables: [
      "Qualification rapide du besoin",
      "Mise en relation avec un cabinet pertinent",
      "Prise de rendez-vous cadrée selon le contexte",
    ],
    usefulFor: ["Création", "Comptabilité", "Paie", "Fiscalité"],
  },
  {
    slug: "site-web",
    name: "Site web & visibilité digitale",
    category: "Acquisition",
    shortDescription:
      "Tous les supports utiles pour présenter votre entreprise, rassurer vos prospects et faciliter la prise de contact.",
    description:
      "Les supports essentiels pour présenter votre entreprise et faciliter la prise de contact.",
    bestFor:
      "Les dirigeants qui ont besoin d'une présence claire et sérieuse pour être trouvés, rassurer et mieux présenter leur activité.",
    duration: "2 semaines",
    price: "1 350 €",
    tags: ["Web", "SEO", "Confiance"],
    icon: "Laptop",
    deliverables: [
      "Site vitrine",
      "Page LinkedIn entreprise",
      "Page LinkedIn dirigeant",
      "Présentation entreprise",
      "Signature email",
      "Carte de visite",
    ],
    usefulFor: ["Visibilité", "Crédibilité", "Prise de contact"],
  },
  {
    slug: "organisation-automatisation",
    name: "Organisation",
    category: "Systèmes",
    shortDescription: "Un audit d'organisation pour repérer les blocages et les priorités.",
    description:
      "Un audit d'organisation pour prendre du recul, identifier les points de blocage, clarifier les priorités et repérer les besoins de structuration les plus utiles.",
    bestFor:
      "Les entreprises qui perdent du temps sur relances, devis, documents, reporting, planning ou suivi client.",
    duration: "1 mois",
    price: "Audit gratuit",
    tags: ["Organisation", "Audit", "Demaa"],
    icon: "Workflow",
    deliverables: [
      "Analyse de vos tâches, blocages et zones de dépendance",
      "Lecture claire des priorités d'organisation",
      "Recommandations concrètes sur les besoins à traiter ensuite",
    ],
    usefulFor: ["Relances", "Documents", "Reporting", "Planning"],
  },
  {
    slug: "marketing-vente",
    name: "Système Marketing & Vente",
    category: "Acquisition",
    shortDescription:
      "Clarifier l'offre, poser un plan d'actions marketing et vente, puis mettre en place un suivi plus régulier.",
    description:
      "Un système marketing et vente avec offre clarifiée, actions séquencées, suivi commercial, tests et ajustements.",
    bestFor:
      "Les activités qui veulent structurer leur acquisition, mieux suivre leurs actions et garder un rythme marketing et commercial plus régulier.",
    duration: "1 mois",
    price: "750 €",
    tags: ["Marketing", "Vente", "CRM"],
    icon: "Target",
    deliverables: [
      "Offres clarifiées",
      "Plan d'actions marketing et vente sur 3 mois",
      "Suivi commercial mis en place",
      "Phase de test et d'ajustement",
      "Suivi sur 1 mois",
    ],
    usefulFor: ["Acquisition", "CRM", "Régularité commerciale"],
  },
  {
    slug: "organisation-equipes",
    name: "Organisation opérationnelle",
    category: "Systèmes",
    shortDescription:
      "Structurer l'organisation interne pour clarifier l'organigramme, les rôles, les responsabilités et la répartition des tâches.",
    description:
      "Mise en place d'une organisation opérationnelle claire avec organigramme, rôles et responsabilités de chacun, politique de rémunération et répartition complète des tâches.",
    bestFor:
      "Les dirigeants qui veulent sortir du flou, mieux cadrer leur équipe et poser un fonctionnement plus lisible, stable et autonome au quotidien.",
    duration: "1 mois",
    price: "850 €",
    tags: ["Organisation", "Rôles", "Management"],
    icon: "Users",
    deliverables: [
      "Organigramme clair et lisible",
      "Rôles et responsabilités de chacun formalisés",
      "Politique de rémunération cadrée",
      "Répartition complète des tâches",
    ],
    usefulFor: ["Structuration interne", "Management", "Croissance d'équipe"],
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
    duration: "1 mois",
    price: "450 € / mois",
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
    duration: "1 mois",
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
    duration: "1 mois",
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
    duration: "1 mois",
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
    name: "Déléguez à un assistant de confiance",
    category: "Support opérationnel",
    shortDescription:
      "Une assistante formée, sélectionnée et intégrée avec méthode pour reprendre l'administratif utile et vous aider à déléguer avec sérénité.",
    description:
      "Demaa vous aide à déléguer efficacement à une assistante formée, sélectionnée et intégrée avec méthode pour reprendre l'administratif utile de votre entreprise.",
    bestFor:
      "Les dirigeants qui veulent déléguer à une personne de confiance, sans porter seuls tout le recrutement, le cadrage et la montée en compétence.",
    duration: "1 mois",
    price: "500 €",
    tags: ["Assistant", "Recrutement", "Délégation"],
    icon: "UserRoundCheck",
    deliverables: [
      "Profil présélectionné",
      "Assistante formée aux bases administratives utiles via POEI",
      "Structuration des processus clés",
      "Intégration cadrée dans l'entreprise",
      "Reprise progressive des tâches administratives",
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

const demaaManagedServiceSlugs = new Set([
  "organisation-automatisation",
  "marketing-vente",
  "organisation-equipes",
  "assistant-polyvalent",
]);

export function isDemaaManagedService(slug: string) {
  return demaaManagedServiceSlugs.has(slug);
}
