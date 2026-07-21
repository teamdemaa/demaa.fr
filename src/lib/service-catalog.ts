type ServiceCategory =
  | "Juridique"
  | "Finance"
  | "Organisation"
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
    price: "600 € HT",
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
    name: "Pilotage financier",
    category: "Finance",
    shortDescription:
      "Un pilotage financier plus clair pour suivre votre trésorerie, voir venir, anticiper et ajuster vos décisions.",
    description:
      "Un accompagnement pour mieux piloter votre trésorerie, anticiper les écarts, voir venir plus sereinement et ajuster vos choix en fonction de votre activité.",
    bestFor:
      "Les dirigeants qui veulent mieux suivre leurs chiffres, anticiper les tensions de trésorerie et décider plus tôt au lieu de subir.",
    duration: "2 semaines",
    price: "550 € HT",
    tags: ["Pilotage", "Trésorerie", "Anticipation"],
    icon: "TrendingUp",
    deliverables: [
      "Lecture claire des entrées et sorties de trésorerie",
      "Projection simple pour voir venir et anticiper",
      "Ajustements concrets selon votre activité",
    ],
    usefulFor: ["Trésorerie", "Pilotage", "Anticipation"],
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
    price: "850 € HT",
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
    price: "1 350 € HT",
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
    name: "Session d’organisation offerte",
    category: "Organisation",
    shortDescription: "Une session de 30 minutes pour commencer à adapter votre kit à votre activité.",
    description:
      "Pendant 30 minutes, nous identifions le process prioritaire et commençons à cadrer ses tâches, son responsable et sa récurrence dans votre tableau.",
    bestFor:
      "Les dirigeants qui veulent démarrer leur kit avec un premier process clair, concret et adapté à leur organisation.",
    duration: "30 minutes",
    price: "Offerte",
    tags: ["Organisation", "Process", "Kit opérationnel"],
    icon: "Workflow",
    deliverables: [
      "Choix du process à structurer en priorité",
      "Première liste de tâches à adapter dans le tableau",
      "Responsable, récurrence et prochaine action clarifiés",
    ],
    usefulFor: ["Process", "Tâches", "Responsable", "Récurrence"],
  },
  {
    slug: "marketing-vente",
    name: "Organisation Marketing & Vente",
    category: "Acquisition",
    shortDescription:
      "Clarifier l'offre, poser un plan d'actions marketing et vente, puis mettre en place un suivi plus régulier.",
    description:
      "Une organisation marketing et vente avec offre clarifiée, actions séquencées, suivi commercial, tests et ajustements.",
    bestFor:
      "Les activités qui veulent structurer leur acquisition, mieux suivre leurs actions et garder un rythme marketing et commercial plus régulier.",
    duration: "1 mois",
    price: "750 € HT",
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
    category: "Organisation",
    shortDescription:
      "Structurer l'organisation interne pour clarifier l'organigramme, les rôles, les responsabilités et la répartition des tâches.",
    description:
      "Mise en place d'une organisation opérationnelle claire avec organigramme, rôles et responsabilités de chacun, politique de rémunération et répartition complète des tâches.",
    bestFor:
      "Les dirigeants qui veulent sortir du flou, mieux cadrer leur équipe et poser un fonctionnement plus lisible, stable et autonome au quotidien.",
    duration: "1 mois",
    price: "850 € HT",
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
    price: "450 € / mois HT",
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
    slug: "assistante-facturation",
    name: "Assistance facturation",
    category: "Support opérationnel",
    shortDescription:
      "Deux forfaits mensuels pour reprendre factures clients, factures fournisseurs et transmission comptable sans recruter tout de suite.",
    description:
      "Un appui mensuel pour reprendre la collecte WhatsApp des factures fournisseurs, l'émission des factures clients et la transmission comptable, avec un forfait Confort qui ajoute relances clients et reporting mensuel.",
    bestFor:
      "Les dirigeants qui veulent fiabiliser leur facturation et leur transmission comptable avec un cadre mensuel clair, sans lancer un recrutement complet dès maintenant.",
    duration: "Abonnement mensuel",
    price: "350 € à 600 € / mois HT",
    tags: ["Facturation", "Devis", "Relances"],
    icon: "UserRoundCheck",
    deliverables: [
      "Collecte WhatsApp des factures fournisseurs",
      "Émission des factures clients",
      "Transmission comptable à l'outil ou au comptable",
      "Relances clients et reporting mensuel selon le forfait choisi",
    ],
    usefulFor: ["Facturation", "Transmission comptable", "Relances", "Reporting"],
  },
  {
    slug: "recrutement-assistante-facturation",
    name: "Recrutement assistante facturation",
    category: "Support opérationnel",
    shortDescription:
      "Une assistante formée, sélectionnée et intégrée avec méthode pour reprendre devis, facturation, relances et transmission comptable.",
    description:
      "Un accompagnement au recrutement d'une assistante facturation pour reprendre le cycle devis, facture, relance et transmission comptable avec une intégration plus claire et plus sereine.",
    bestFor:
      "Les dirigeants qui veulent déléguer la chaîne devis, facturation et relances à une personne de confiance, sans porter seuls le recrutement, le cadrage et la montée en compétence.",
    duration: "1 mois",
    price: "500 € HT",
    tags: ["Facturation", "Recrutement", "Délégation"],
    icon: "UserRoundCheck",
    deliverables: [
      "Profil présélectionné",
      "Assistante formée aux bases devis, facturation et relances via POEI",
      "Structuration du cycle devis, facture, relance et transmission comptable",
      "Intégration cadrée dans l'entreprise et dans vos outils",
      "Reprise progressive des tâches de facturation et de suivi",
    ],
    usefulFor: ["Facturation", "Relances", "Transmission comptable", "Renfort"],
  },
] satisfies DemaaService[];

export type DemaaServiceSlug = (typeof demaaServices)[number]["slug"];

export function getDemaaServiceBySlug(slug: string): DemaaService | null {
  return demaaServices.find((service) => service.slug === slug) ?? null;
}
