export type LiveSessionSlot = {
  id: string;
  startsAt: string;
};

type LiveTrainingSession = {
  slug: string;
  title: string;
  description: string;
  audience: string;
  learningGoals: readonly [string, string, string];
  includedModels: readonly string[];
  qAndA: string;
  duration: string;
  unitAmount: number;
  slots: readonly LiveSessionSlot[];
};

export type LiveSessionPurchaseDetails = {
  training: LiveTrainingSession;
  slot: LiveSessionSlot;
  sourceSystemSlug: string | null;
};

const LIVE_SESSION_SYSTEM_SEPARATOR = "--systeme-";

export const PUBLIC_LIVE_CATALOG_VERSION = "academy-live-catalog-2026-08-v1";

export type PublicLiveTraining = LiveTrainingSession & {
  duration: "2 h";
  publicationStatus: "published";
  catalogVersion: typeof PUBLIC_LIVE_CATALOG_VERSION;
  scheduleValidationStatus: "pending";
  validationStatus: "validated";
};

const publicLiveTrainings = [
  {
    slug: "etre-visible-sur-google",
    title: "Être visible sur Google",
    description: "Améliorer sa présence locale et rendre son activité plus facile à trouver au bon moment.",
    audience: "Dirigeants et indépendants qui souhaitent développer une visibilité Google utile et durable.",
    learningGoals: [
      "Comprendre les leviers de visibilité locale.",
      "Améliorer sa fiche et ses contenus prioritaires.",
      "Construire un plan d’action mesurable sur un mois.",
    ],
    includedModels: ["Checklist de visibilité Google", "Plan d’action local sur 30 jours"],
    qAndA: "Un temps de questions-réponses pour adapter les actions à votre activité.",
    duration: "2 h",
    unitAmount: 250_00,
    publicationStatus: "published",
    validationStatus: "validated",
    catalogVersion: PUBLIC_LIVE_CATALOG_VERSION,
    scheduleValidationStatus: "pending",
    slots: [],
  },
  {
    slug: "trouver-des-clients",
    title: "Trouver des clients",
    description: "Choisir des actions d’acquisition cohérentes et mettre en place une prospection régulière.",
    audience: "Dirigeants et indépendants qui veulent rendre leur acquisition plus prévisible.",
    learningGoals: [
      "Préciser les clients à cibler en priorité.",
      "Choisir des canaux d’acquisition adaptés.",
      "Organiser un rythme de prospection réaliste.",
    ],
    includedModels: ["Trame de cible client", "Plan de prospection hebdomadaire"],
    qAndA: "Un temps de questions-réponses pour adapter la méthode à votre marché.",
    duration: "2 h",
    unitAmount: 250_00,
    publicationStatus: "published",
    validationStatus: "validated",
    catalogVersion: PUBLIC_LIVE_CATALOG_VERSION,
    scheduleValidationStatus: "pending",
    slots: [],
  },
  {
    slug: "communiquer-reseaux-sociaux",
    title: "Communiquer sur les réseaux sociaux",
    description: "Construire une présence régulière sans multiplier les plateformes ni publier au hasard.",
    audience: "Dirigeants et indépendants qui veulent communiquer avec constance et clarté.",
    learningGoals: [
      "Choisir les réseaux réellement utiles.",
      "Définir des thèmes de publication durables.",
      "Préparer un calendrier simple à tenir.",
    ],
    includedModels: ["Matrice de contenus", "Calendrier éditorial mensuel"],
    qAndA: "Un temps de questions-réponses pour construire votre ligne éditoriale.",
    duration: "2 h",
    unitAmount: 250_00,
    publicationStatus: "published",
    validationStatus: "validated",
    catalogVersion: PUBLIC_LIVE_CATALOG_VERSION,
    scheduleValidationStatus: "pending",
    slots: [],
  },
  {
    slug: "vendre-et-convaincre",
    title: "Vendre et convaincre",
    description: "Mener un échange commercial clair, traiter les objections et aider le client à décider.",
    audience: "Dirigeants et équipes commerciales qui souhaitent vendre avec plus de méthode.",
    learningGoals: [
      "Structurer un entretien de vente utile.",
      "Présenter la valeur de son offre avec clarté.",
      "Répondre aux objections sans pression.",
    ],
    includedModels: ["Trame d’entretien commercial", "Grille de suivi des objections"],
    qAndA: "Un temps de questions-réponses pour travailler vos situations de vente.",
    duration: "2 h",
    unitAmount: 250_00,
    publicationStatus: "published",
    validationStatus: "validated",
    catalogVersion: PUBLIC_LIVE_CATALOG_VERSION,
    scheduleValidationStatus: "pending",
    slots: [],
  },
  {
    slug: "outils-numeriques-ia",
    title: "Utiliser les outils numériques et l’IA",
    description: "Choisir des usages numériques et IA concrets pour gagner du temps sans perdre le contrôle.",
    audience: "Dirigeants et équipes qui veulent adopter des outils utiles avec méthode.",
    learningGoals: [
      "Repérer les tâches qui peuvent être simplifiées.",
      "Choisir des outils adaptés à ses besoins.",
      "Encadrer les usages de l’IA et les données sensibles.",
    ],
    includedModels: ["Grille de choix d’outils", "Cadre d’usage responsable de l’IA"],
    qAndA: "Un temps de questions-réponses pour prioriser vos propres usages.",
    duration: "2 h",
    unitAmount: 250_00,
    publicationStatus: "published",
    validationStatus: "validated",
    catalogVersion: PUBLIC_LIVE_CATALOG_VERSION,
    scheduleValidationStatus: "pending",
    slots: [],
  },
  {
    slug: "gestion-financiere-cadre-legal",
    title: "Maîtriser la gestion financière et le cadre légal de son entreprise",
    description: "Suivre les bons indicateurs et mieux comprendre les obligations essentielles de l’entreprise.",
    audience: "Dirigeants qui veulent prendre de meilleures décisions financières et administratives.",
    learningGoals: [
      "Lire les indicateurs financiers utiles au dirigeant.",
      "Identifier les principales échéances et obligations.",
      "Mettre en place un suivi mensuel simple.",
    ],
    includedModels: ["Tableau de suivi financier", "Calendrier des obligations essentielles"],
    qAndA: "Un temps de questions-réponses pour appliquer les repères à votre entreprise.",
    duration: "2 h",
    unitAmount: 250_00,
    publicationStatus: "published",
    validationStatus: "validated",
    catalogVersion: PUBLIC_LIVE_CATALOG_VERSION,
    scheduleValidationStatus: "pending",
    slots: [],
  },
] as const satisfies readonly PublicLiveTraining[];

const historicalLiveTrainings = [
  {
    slug: "obligations-finances-entreprise",
    title: "Maîtriser les obligations et les finances de son entreprise",
    description: "Comprendre les échéances essentielles et mieux piloter les finances de son entreprise.",
    audience: "Dirigeants et responsables administratifs qui souhaitent clarifier leurs obligations fiscales, sociales et financières.",
    learningGoals: [
      "Identifier les principales obligations et leurs échéances.",
      "Comprendre les indicateurs financiers utiles au dirigeant.",
      "Mettre en place un rythme de suivi simple et régulier.",
    ],
    includedModels: [
      "P&L, suivi et prévisionnel financier",
      "Tableau de suivi opérationnel adapté à votre activité",
    ],
    qAndA: "Un temps de questions-réponses pour appliquer les modèles à votre entreprise.",
    duration: "2 h 30",
    unitAmount: 149_00,
    slots: [
      { id: "2026-08-18-1000", startsAt: "2026-08-18T10:00:00+02:00" },
      { id: "2026-09-15-1000", startsAt: "2026-09-15T10:00:00+02:00" },
      { id: "2026-10-20-1000", startsAt: "2026-10-20T10:00:00+02:00" },
      { id: "2026-11-17-1000", startsAt: "2026-11-17T10:00:00+01:00" },
    ],
  },
  {
    slug: "repondre-appels-offres-btp",
    title: "Répondre à un appel d’offres",
    description: "Constituer un dossier convaincant et bénéficier d’un accompagnement sur votre première réponse.",
    audience: "Dirigeants, responsables commerciaux et équipes administratives qui répondent à des marchés publics ou privés.",
    learningGoals: [
      "Repérer les pièces attendues et les critères de sélection.",
      "Structurer un mémoire technique clair et différenciant.",
      "Contrôler son dossier avant le dépôt pour limiter les oublis.",
    ],
    includedModels: [
      "Checklist du dossier d’appel d’offres",
      "Trame de mémoire technique",
      "Tableau de suivi des appels d’offres",
      "Accompagnement à votre première réponse",
    ],
    qAndA: "Un temps de questions-réponses pour clarifier votre dossier et vos prochaines réponses.",
    duration: "2 h 30",
    unitAmount: 450_00,
    slots: [
      { id: "2026-08-20-1000", startsAt: "2026-08-20T10:00:00+02:00" },
      { id: "2026-09-17-1000", startsAt: "2026-09-17T10:00:00+02:00" },
      { id: "2026-10-22-1000", startsAt: "2026-10-22T10:00:00+02:00" },
      { id: "2026-11-19-1000", startsAt: "2026-11-19T10:00:00+01:00" },
    ],
  },
  {
    slug: "entreprise-autonome",
    title: "Rendre son entreprise plus autonome (process & organisation)",
    description: "Clarifier les responsabilités et réduire la dépendance au dirigeant.",
    audience: "Dirigeants et responsables d’équipe qui veulent déléguer davantage sans perdre en visibilité.",
    learningGoals: [
      "Repérer les dépendances qui ralentissent l’entreprise.",
      "Clarifier les responsabilités et les règles de décision.",
      "Mettre en place un rythme de délégation et de suivi simple.",
    ],
    includedModels: [
      "Système opérationnel adapté à votre activité",
      "Modèles de process, responsabilités et routines de suivi",
    ],
    qAndA: "Un temps de questions-réponses pour adapter les process à votre organisation.",
    duration: "2 h 30",
    unitAmount: 149_00,
    slots: [
      { id: "2026-08-19-1000", startsAt: "2026-08-19T10:00:00+02:00" },
      { id: "2026-09-16-1000", startsAt: "2026-09-16T10:00:00+02:00" },
      { id: "2026-10-21-1000", startsAt: "2026-10-21T10:00:00+02:00" },
      { id: "2026-11-18-1000", startsAt: "2026-11-18T10:00:00+01:00" },
    ],
  },
  {
    slug: "facturation-electronique-impacts",
    title: "Facturation électronique : comprendre les impacts",
    description: "Comprendre la réforme et préparer concrètement son entreprise aux nouvelles obligations.",
    audience: "Dirigeants et responsables administratifs qui veulent anticiper la facturation électronique sans complexifier leur organisation.",
    learningGoals: [
      "Comprendre le calendrier et les obligations de la réforme.",
      "Identifier les impacts sur les outils et les processus internes.",
      "Préparer les actions prioritaires pour être prêt à temps.",
    ],
    includedModels: [
      "Checklist de préparation à la facturation électronique",
      "Plan d’actions de mise en conformité",
    ],
    qAndA: "Un temps de questions-réponses pour identifier les impacts propres à votre entreprise.",
    duration: "2 h 30",
    unitAmount: 149_00,
    slots: [
      { id: "2026-08-21-1400", startsAt: "2026-08-21T14:00:00+02:00" },
      { id: "2026-09-18-1400", startsAt: "2026-09-18T14:00:00+02:00" },
      { id: "2026-10-23-1400", startsAt: "2026-10-23T14:00:00+02:00" },
      { id: "2026-11-20-1400", startsAt: "2026-11-20T14:00:00+01:00" },
    ],
  },
  {
    slug: "systeme-marketing-vente",
    title: "Organiser son Marketing & Vente",
    description: "Structurer un parcours simple pour attirer, convertir et fidéliser ses clients.",
    audience: "Dirigeants et responsables commerciaux qui souhaitent rendre leur acquisition et leur suivi commercial plus réguliers.",
    learningGoals: [
      "Clarifier les étapes du parcours marketing et commercial.",
      "Choisir les actions et outils réellement utiles.",
      "Mettre en place un rythme de suivi pour améliorer les résultats.",
    ],
    includedModels: [
      "CRM de suivi commercial sur Airtable",
      "Pipeline commercial, relances et suivi des conversions",
    ],
    qAndA: "Un temps de questions-réponses pour adapter le tableau à votre cycle de vente.",
    duration: "2 h 30",
    unitAmount: 250_00,
    slots: [
      { id: "2026-08-26-1000", startsAt: "2026-08-26T10:00:00+02:00" },
      { id: "2026-09-23-1000", startsAt: "2026-09-23T10:00:00+02:00" },
      { id: "2026-10-28-1000", startsAt: "2026-10-28T10:00:00+01:00" },
      { id: "2026-11-25-1000", startsAt: "2026-11-25T10:00:00+01:00" },
    ],
  },
] as const satisfies readonly LiveTrainingSession[];

const historicalDecodableLiveTrainings: readonly LiveTrainingSession[] = [
  ...historicalLiveTrainings,
];

function assertPublicLiveCatalog() {
  const expectedTitles = new Set([
    "Être visible sur Google",
    "Trouver des clients",
    "Communiquer sur les réseaux sociaux",
    "Vendre et convaincre",
    "Utiliser les outils numériques et l’IA",
    "Maîtriser la gestion financière et le cadre légal de son entreprise",
  ]);
  if (publicLiveTrainings.length !== 6) {
    throw new Error("Le catalogue public doit contenir exactement six formations en direct.");
  }

  for (const training of publicLiveTrainings) {
    if (
      !expectedTitles.delete(training.title) ||
      training.duration !== "2 h" ||
      training.unitAmount !== 250_00 ||
      training.publicationStatus !== "published" ||
      training.validationStatus !== "validated" ||
      training.catalogVersion !== PUBLIC_LIVE_CATALOG_VERSION ||
      training.scheduleValidationStatus !== "pending" ||
      training.slots.length !== 0
    ) {
      throw new Error(`Formation publique invalide : ${training.slug}.`);
    }
  }

  if (expectedTitles.size > 0) {
    throw new Error("Le catalogue public ne contient pas les six intitulés validés.");
  }
}

assertPublicLiveCatalog();

export function getPublicLiveTrainings(): readonly PublicLiveTraining[] {
  return publicLiveTrainings;
}

export function getPublicLiveTrainingBySlug(slug: string): PublicLiveTraining | null {
  return publicLiveTrainings.find((training) => training.slug === slug) ?? null;
}

export function getPublicLiveSessionSlot(trainingSlug: string, slotId: string) {
  const training = getPublicLiveTrainingBySlug(trainingSlug);
  if (!training) return null;
  const slot = training.slots.find((candidate) => candidate.id === slotId);
  return slot ? { training, slot } : null;
}

function getLiveSessionPurchaseSlug(
  trainingSlug: string,
  slotId: string,
  sourceSystemSlug?: string,
) {
  const baseSlug = `session-direct-${trainingSlug}-${slotId}`;
  const normalizedSystemSlug = sourceSystemSlug?.trim();

  return normalizedSystemSlug
    ? `${baseSlug}${LIVE_SESSION_SYSTEM_SEPARATOR}${normalizedSystemSlug}`
    : baseSlug;
}

export function getLiveSessionPurchaseDetails(
  purchaseSlug: string,
): LiveSessionPurchaseDetails | null {
  for (const training of historicalDecodableLiveTrainings) {
    for (const slot of training.slots) {
      const baseSlug = getLiveSessionPurchaseSlug(training.slug, slot.id);

      if (purchaseSlug === baseSlug) {
        return { training, slot, sourceSystemSlug: null };
      }

      const contextualPrefix = `${baseSlug}${LIVE_SESSION_SYSTEM_SEPARATOR}`;

      if (purchaseSlug.startsWith(contextualPrefix)) {
        const sourceSystemSlug = purchaseSlug.slice(contextualPrefix.length).trim();

        if (sourceSystemSlug) {
          return { training, slot, sourceSystemSlug };
        }
      }
    }
  }

  return null;
}
export { formatLiveSessionDate } from "@/lib/live-session-format";
