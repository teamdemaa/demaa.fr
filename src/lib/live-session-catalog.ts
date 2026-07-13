export type LiveSessionSlot = {
  id: string;
  startsAt: string;
};

export type LiveTrainingSession = {
  slug: string;
  title: string;
  description: string;
  audience: string;
  learningGoals: readonly [string, string, string];
  includedModels: readonly string[];
  qAndA: string;
  duration: "2 h 30";
  unitAmount: number;
  slots: readonly LiveSessionSlot[];
};

export type LiveSessionPurchaseConfig = {
  slug: string;
  serviceSlug: string;
  name: string;
  shortDescription: string;
  unitAmount: number;
  currency: "eur";
  billingType: "one_time";
  kind: "live_session";
  sessionStartsAt: string;
  sourceSystemSlug?: string;
};

export type LiveSessionPurchaseDetails = {
  training: LiveTrainingSession;
  slot: LiveSessionSlot;
  sourceSystemSlug: string | null;
};

const LIVE_SESSION_SYSTEM_SEPARATOR = "--systeme-";

const liveTrainings = [
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
      "Tableau de pilotage adapté à votre activité",
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
    title: "Rendre son entreprise plus autonome (process & système)",
    description: "Clarifier les responsabilités et réduire la dépendance au dirigeant.",
    audience: "Dirigeants et responsables d’équipe qui veulent déléguer davantage sans perdre en visibilité.",
    learningGoals: [
      "Repérer les dépendances qui ralentissent l’entreprise.",
      "Clarifier les responsabilités et les règles de décision.",
      "Mettre en place un rythme de délégation et de suivi simple.",
    ],
    includedModels: [
      "Kit Process & Système adapté à votre activité",
      "Modèles de process, responsabilités et routines de suivi",
    ],
    qAndA: "Un temps de questions-réponses pour adapter le système à votre organisation.",
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
    title: "Construire un système Marketing & Vente",
    description: "Structurer un parcours simple pour attirer, convertir et fidéliser ses clients.",
    audience: "Dirigeants et responsables commerciaux qui souhaitent rendre leur acquisition et leur suivi commercial plus réguliers.",
    learningGoals: [
      "Clarifier les étapes du parcours marketing et commercial.",
      "Choisir les actions et outils réellement utiles.",
      "Mettre en place un rythme de suivi pour améliorer les résultats.",
    ],
    includedModels: [
      "Système Marketing & Vente sur Airtable",
      "Pipeline commercial, relances et suivi des conversions",
    ],
    qAndA: "Un temps de questions-réponses pour adapter le système à votre cycle de vente.",
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

const allLiveTrainings = [...liveTrainings];

export function formatLiveSessionDate(startsAt: string) {
  const date = new Date(startsAt);
  const day = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  }).format(date);
  const time = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Europe/Paris",
  })
    .format(date)
    .replace(":", "h");

  return `${day} à ${time}`;
}

export function getLiveSessionPurchaseSlug(
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

export function getLiveTrainingsForSystem() {
  return [...liveTrainings];
}

export function getAllLiveSessionPurchaseConfigs(): LiveSessionPurchaseConfig[] {
  return allLiveTrainings.flatMap((training) =>
    training.slots.map((slot) => ({
      slug: getLiveSessionPurchaseSlug(training.slug, slot.id),
      serviceSlug: "session-en-direct",
      name: `${training.title} · ${formatLiveSessionDate(slot.startsAt)}`,
      shortDescription: `Session Demaa en direct de ${training.duration}.`,
      unitAmount: training.unitAmount,
      currency: "eur" as const,
      billingType: "one_time" as const,
      kind: "live_session" as const,
      sessionStartsAt: slot.startsAt,
    })),
  );
}

export function getLiveSessionPurchaseDetails(
  purchaseSlug: string,
): LiveSessionPurchaseDetails | null {
  for (const training of allLiveTrainings) {
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
