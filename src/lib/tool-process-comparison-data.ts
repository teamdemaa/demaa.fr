import type {
  ToolProcessComparisonReview,
  ToolProcessComparisonStatus,
} from "@/lib/tool-process-comparison-contract";

type FeatureDefinition = Readonly<{
  featureId: string;
  label: string;
  description?: string;
}>;
type EvidenceInput = Readonly<{
  suffix: string;
  sourceRef: string;
  claim: string;
}>;
type FeatureReviewInput = Readonly<{
  status: ToolProcessComparisonStatus;
  evidenceSuffixes: readonly string[];
  note?: string;
}>;

const covered = (...evidenceSuffixes: string[]): FeatureReviewInput => ({
  status: "covered",
  evidenceSuffixes,
});

const configurable = (
  evidenceSuffixes: readonly string[],
  note?: string,
): FeatureReviewInput => ({
  status: "configurable",
  evidenceSuffixes,
  note,
});

const notDocumented = (): FeatureReviewInput => ({
  status: "not_documented",
  evidenceSuffixes: [],
});

const REVIEWED_AT = "2026-08-31";
const EXPIRES_AT = "2027-02-28";

const ACCOUNTING_FEATURES = {
  clientPortal: "accounting.client-portal",
  clientOnboarding: "accounting.client-onboarding",
  engagementSignature: "accounting.engagement-signature",
  clientRequests: "accounting.client-requests",
  requestReminders: "accounting.request-reminders",
  payrollCollection: "accounting.payroll-collection",
  legalCollection: "accounting.legal-collection",
  accountingCollection: "accounting.accounting-collection",
  automatedBookkeeping: "accounting.automated-bookkeeping",
  production: "accounting.production",
  review: "accounting.review",
  tax: "accounting.tax-returns",
  electronicInvoicing: "accounting.electronic-invoicing",
  practiceTasks: "accounting.practice-tasks",
  timeProfitability: "accounting.time-profitability",
} as const;

export const TOOL_PROCESS_COMPARISON_FEATURES: Readonly<
  Record<string, readonly FeatureDefinition[]>
> = {
  "cabinet-comptable": [
    {
      featureId: ACCOUNTING_FEATURES.production,
      label: "Production comptable",
      description: "Tenue, génération des écritures et production des comptes dans l’outil.",
    },
    {
      featureId: ACCOUNTING_FEATURES.review,
      label: "Révision comptable",
      description: "Diligences, contrôles, cycles de révision et supervision des dossiers.",
    },
    {
      featureId: ACCOUNTING_FEATURES.tax,
      label: "Déclarations fiscales et liasse",
      description: "Préparation, contrôle et transmission des déclarations fiscales et de la liasse.",
    },
    {
      featureId: ACCOUNTING_FEATURES.automatedBookkeeping,
      label: "Saisie et rapprochement automatisés",
      description: "Automatisation de la saisie comptable et du rapprochement bancaire.",
    },
    {
      featureId: ACCOUNTING_FEATURES.accountingCollection,
      label: "Collecte des pièces comptables",
      description: "Réception, classement et exploitation des justificatifs utiles à la tenue.",
    },
    {
      featureId: ACCOUNTING_FEATURES.electronicInvoicing,
      label: "Facturation électronique",
      description: "Émission, réception ou traitement des factures électroniques dans le cadre réglementaire.",
    },
    {
      featureId: ACCOUNTING_FEATURES.clientRequests,
      label: "Gestion des demandes clients",
      description: "Demandes structurées avec responsable, statut, échéance et visibilité cabinet-client.",
    },
    {
      featureId: ACCOUNTING_FEATURES.requestReminders,
      label: "Automatisation des e-mails et relances",
      description: "Envoi automatique d’e-mails à partir des demandes, échéances ou scénarios du cabinet.",
    },
    {
      featureId: ACCOUNTING_FEATURES.clientPortal,
      label: "Portail client",
      description: "Espace dédié où le client retrouve ses demandes, documents, statuts et actions attendues.",
    },
    {
      featureId: ACCOUNTING_FEATURES.clientOnboarding,
      label: "Onboarding des nouveaux clients",
      description: "Parcours du prospect à l’ouverture du dossier, avec collecte des informations initiales.",
    },
    {
      featureId: ACCOUNTING_FEATURES.engagementSignature,
      label: "Lettres de mission et signature",
      description: "Création, envoi, signature et suivi de la lettre de mission.",
    },
    {
      featureId: ACCOUNTING_FEATURES.payrollCollection,
      label: "Collecte des variables de paie",
      description: "Collecte récurrente des variables et pièces nécessaires à la préparation de la paie.",
    },
    {
      featureId: ACCOUNTING_FEATURES.legalCollection,
      label: "Gestion des demandes juridiques",
      description: "Demandes, collecte, suivi et relances des informations nécessaires aux formalités juridiques.",
    },
    {
      featureId: ACCOUNTING_FEATURES.practiceTasks,
      label: "Missions, tâches et échéances",
      description: "Planification et suivi des missions, tâches, responsables et échéances du cabinet.",
    },
    {
      featureId: ACCOUNTING_FEATURES.timeProfitability,
      label: "Temps et rentabilité du cabinet",
      description: "Suivi des temps, budgets, honoraires et rentabilité par mission ou dossier.",
    },
  ],
};

function buildReview(input: {
  systemSlug: string;
  resourceSlug: string;
  positioning: string;
  evidence: readonly EvidenceInput[];
  features: Readonly<Record<string, FeatureReviewInput>>;
  configurableNote?: string;
}): ToolProcessComparisonReview {
  const evidenceIdBySuffix = new Map<string, string>();
  for (const item of input.evidence) {
    if (evidenceIdBySuffix.has(item.suffix)) {
      throw new Error(
        `Suffixe de preuve dupliqué ${input.systemSlug}/${input.resourceSlug}/${item.suffix}`,
      );
    }
    evidenceIdBySuffix.set(
      item.suffix,
      `${input.systemSlug}-${input.resourceSlug}-${item.suffix}`,
    );
  }
  const evidence = input.evidence.map((item) => ({
    evidenceId: evidenceIdBySuffix.get(item.suffix)!,
    sourceRef: item.sourceRef,
    claim: item.claim,
    capturedAt: REVIEWED_AT,
  }));

  return {
    systemSlug: input.systemSlug,
    resourceSlug: input.resourceSlug,
    positioning: input.positioning,
    reviewedAt: REVIEWED_AT,
    expiresAt: EXPIRES_AT,
    configurableNote:
      input.configurableNote ??
      "Couverture partielle, selon l’offre ou via un module connecté.",
    evidence,
    features: Object.fromEntries(
      Object.entries(input.features).map(([featureId, feature]) => {
        if (
          feature.status !== "not_documented" &&
          feature.evidenceSuffixes.length === 0
        ) {
          throw new Error(
            `Preuve absente ${input.systemSlug}/${input.resourceSlug}/${featureId}`,
          );
        }
        const evidenceIds = feature.evidenceSuffixes.map((suffix) => {
          const evidenceId = evidenceIdBySuffix.get(suffix);
          if (!evidenceId) {
            throw new Error(
              `Preuve inconnue ${input.systemSlug}/${input.resourceSlug}/${featureId}/${suffix}`,
            );
          }
          return evidenceId;
        });
        return [
          featureId,
          {
            status: feature.status,
            evidenceIds,
            note: feature.note,
          },
        ];
      }),
    ),
  };
}

export const TOOL_PROCESS_COMPARISON_REVIEWS: readonly ToolProcessComparisonReview[] = [
  buildReview({
    systemSlug: "cabinet-comptable",
    resourceSlug: "pennylane",
    positioning: "Production comptable",
    evidence: [
      {
        suffix: "production",
        sourceRef: "https://www.pennylane.com/fr/expert-comptable",
        claim: "Production comptable, collaboration, facturation électronique, pilotage et intégrations.",
      },
      {
        suffix: "practice-management",
        sourceRef: "https://www.pennylane.com/fr/expert-comptable/gestion-interne",
        claim: "Missions, facturation, suivi des temps, rentabilité et lettres de mission connectées.",
      },
      {
        suffix: "review",
        sourceRef: "https://www.pennylane.com/fr/expert-comptable/revision",
        claim: "Révision, diligences, contrôles, demandes comptables et supervision.",
      },
    ],
    features: {
      [ACCOUNTING_FEATURES.clientPortal]: configurable(["production"]),
      [ACCOUNTING_FEATURES.clientOnboarding]: covered("production"),
      [ACCOUNTING_FEATURES.engagementSignature]: covered("practice-management"),
      [ACCOUNTING_FEATURES.clientRequests]: configurable(["review"]),
      [ACCOUNTING_FEATURES.requestReminders]: configurable(["review"]),
      [ACCOUNTING_FEATURES.payrollCollection]: configurable(["production"]),
      [ACCOUNTING_FEATURES.legalCollection]: notDocumented(),
      [ACCOUNTING_FEATURES.accountingCollection]: covered("production"),
      [ACCOUNTING_FEATURES.automatedBookkeeping]: covered("production"),
      [ACCOUNTING_FEATURES.production]: covered("production"),
      [ACCOUNTING_FEATURES.review]: covered("review"),
      [ACCOUNTING_FEATURES.tax]: covered("production"),
      [ACCOUNTING_FEATURES.electronicInvoicing]: covered("production"),
      [ACCOUNTING_FEATURES.practiceTasks]: covered("practice-management"),
      [ACCOUNTING_FEATURES.timeProfitability]: covered("practice-management"),
    },
  }),
  buildReview({
    systemSlug: "cabinet-comptable",
    resourceSlug: "tiimora",
    positioning: "Relation client",
    evidence: [
      {
        suffix: "official",
        sourceRef: "https://www.tiimora.com/",
        claim: "Accueil client, signature des lettres de mission, portail, demandes, relances automatisées, documents, collecte paie et suivi comptable.",
      },
      {
        suffix: "requests",
        sourceRef: "https://www.tiimora.com/gestion-demandes-cabinet-comptable",
        claim: "Demandes, statuts, éléments attendus, relances et visibilité partagée entre le cabinet et le client.",
      },
    ],
    features: {
      [ACCOUNTING_FEATURES.clientPortal]: covered("official"),
      [ACCOUNTING_FEATURES.clientOnboarding]: covered("official"),
      [ACCOUNTING_FEATURES.engagementSignature]: covered("official"),
      [ACCOUNTING_FEATURES.clientRequests]: covered("requests"),
      [ACCOUNTING_FEATURES.requestReminders]: covered("requests"),
      [ACCOUNTING_FEATURES.payrollCollection]: covered("official"),
      [ACCOUNTING_FEATURES.legalCollection]: configurable(
        ["requests"],
        "Les demandes génériques peuvent être structurées pour cet usage. Un module juridique dédié n’est pas documenté comme disponible dans les sources publiques vérifiées.",
      ),
      [ACCOUNTING_FEATURES.accountingCollection]: configurable(["official"]),
      [ACCOUNTING_FEATURES.automatedBookkeeping]: notDocumented(),
      [ACCOUNTING_FEATURES.production]: notDocumented(),
      [ACCOUNTING_FEATURES.review]: notDocumented(),
      [ACCOUNTING_FEATURES.tax]: notDocumented(),
      [ACCOUNTING_FEATURES.electronicInvoicing]: notDocumented(),
      [ACCOUNTING_FEATURES.practiceTasks]: covered("requests"),
      [ACCOUNTING_FEATURES.timeProfitability]: notDocumented(),
    },
  }),
  buildReview({
    systemSlug: "cabinet-comptable",
    resourceSlug: "sage-generation-experts",
    positioning: "Suite comptable",
    evidence: [
      {
        suffix: "official",
        sourceRef: "https://www.sage.com/fr-fr/experts-comptables/produits/sage-generation-experts-connect/",
        claim: "Collecte, production, révision, fiscalité, gestion du cabinet, suivi des temps et API.",
      },
      {
        suffix: "accountants-suite",
        sourceRef: "https://www.sage.com/fr-fr/experts-comptables",
        claim: "Portail, gestion client, lettres de mission et paie via les modules connectés Sage for Accountants.",
      },
    ],
    features: {
      [ACCOUNTING_FEATURES.clientPortal]: configurable(["accountants-suite"]),
      [ACCOUNTING_FEATURES.clientOnboarding]: configurable(["accountants-suite"]),
      [ACCOUNTING_FEATURES.engagementSignature]: configurable(["accountants-suite"]),
      [ACCOUNTING_FEATURES.clientRequests]: configurable(["accountants-suite"]),
      [ACCOUNTING_FEATURES.requestReminders]: configurable(["accountants-suite"]),
      [ACCOUNTING_FEATURES.payrollCollection]: configurable(["accountants-suite"]),
      [ACCOUNTING_FEATURES.legalCollection]: configurable(["accountants-suite"]),
      [ACCOUNTING_FEATURES.accountingCollection]: covered("official"),
      [ACCOUNTING_FEATURES.automatedBookkeeping]: covered("official"),
      [ACCOUNTING_FEATURES.production]: covered("official"),
      [ACCOUNTING_FEATURES.review]: covered("official"),
      [ACCOUNTING_FEATURES.tax]: covered("official"),
      [ACCOUNTING_FEATURES.electronicInvoicing]: configurable(["official"]),
      [ACCOUNTING_FEATURES.practiceTasks]: covered("official"),
      [ACCOUNTING_FEATURES.timeProfitability]: covered("official"),
    },
  }),
  buildReview({
    systemSlug: "cabinet-comptable",
    resourceSlug: "cegid-loop",
    positioning: "Production comptable",
    evidence: [
      {
        suffix: "official",
        sourceRef: "https://www.cegid.com/fr/lp/cpa-cpa-cegid-loop-callback-avantages_ia_marges/",
        claim: "Automatisation de la chaîne comptable de la collecte à la révision, pilotage des missions et suivi client.",
      },
      {
        suffix: "practice-management",
        sourceRef: "https://www.cegid.com/fr/cgv/?slugFileName=livret-de-services_module-gestion-des-ressources-et-des-missions-pour-cegid-loop",
        claim: "Organisation des missions, suivi des temps, facturation et analyse de la rentabilité.",
      },
    ],
    features: {
      [ACCOUNTING_FEATURES.clientPortal]: configurable(["official"]),
      [ACCOUNTING_FEATURES.clientOnboarding]: notDocumented(),
      [ACCOUNTING_FEATURES.engagementSignature]: notDocumented(),
      [ACCOUNTING_FEATURES.clientRequests]: notDocumented(),
      [ACCOUNTING_FEATURES.requestReminders]: notDocumented(),
      [ACCOUNTING_FEATURES.payrollCollection]: notDocumented(),
      [ACCOUNTING_FEATURES.legalCollection]: notDocumented(),
      [ACCOUNTING_FEATURES.accountingCollection]: covered("official"),
      [ACCOUNTING_FEATURES.automatedBookkeeping]: covered("official"),
      [ACCOUNTING_FEATURES.production]: covered("official"),
      [ACCOUNTING_FEATURES.review]: covered("official"),
      [ACCOUNTING_FEATURES.tax]: covered("official"),
      [ACCOUNTING_FEATURES.electronicInvoicing]: covered("official"),
      [ACCOUNTING_FEATURES.practiceTasks]: covered("practice-management"),
      [ACCOUNTING_FEATURES.timeProfitability]: covered("practice-management"),
    },
  }),
  buildReview({
    systemSlug: "cabinet-comptable",
    resourceSlug: "inqom-expert",
    positioning: "Production comptable",
    evidence: [
      {
        suffix: "official",
        sourceRef: "https://www.inqom.com/expert/",
        claim: "Collecte, écritures automatisées, banque, production, révision, fiscalité, tableaux de bord et connecteurs.",
      },
    ],
    features: {
      [ACCOUNTING_FEATURES.clientPortal]: configurable(["official"]),
      [ACCOUNTING_FEATURES.clientOnboarding]: notDocumented(),
      [ACCOUNTING_FEATURES.engagementSignature]: notDocumented(),
      [ACCOUNTING_FEATURES.clientRequests]: notDocumented(),
      [ACCOUNTING_FEATURES.requestReminders]: notDocumented(),
      [ACCOUNTING_FEATURES.payrollCollection]: notDocumented(),
      [ACCOUNTING_FEATURES.legalCollection]: notDocumented(),
      [ACCOUNTING_FEATURES.accountingCollection]: covered("official"),
      [ACCOUNTING_FEATURES.automatedBookkeeping]: covered("official"),
      [ACCOUNTING_FEATURES.production]: covered("official"),
      [ACCOUNTING_FEATURES.review]: covered("official"),
      [ACCOUNTING_FEATURES.tax]: covered("official"),
      [ACCOUNTING_FEATURES.electronicInvoicing]: covered("official"),
      [ACCOUNTING_FEATURES.practiceTasks]: configurable(["official"]),
      [ACCOUNTING_FEATURES.timeProfitability]: notDocumented(),
    },
  }),
  buildReview({
    systemSlug: "cabinet-comptable",
    resourceSlug: "silae",
    positioning: "Paie et social",
    evidence: [
      {
        suffix: "payroll",
        sourceRef: "https://www.silae.fr/solution-rh-paie/logiciel-paie/",
        claim: "Production de la paie, DSN, workflows RH, tableaux de bord, droits et API.",
      },
      {
        suffix: "dsn",
        sourceRef: "https://www.silae.fr/solution-rh-paie/logiciel-paie/dsn/",
        claim: "Génération, contrôle et transmission des DSN.",
      },
    ],
    features: {
      [ACCOUNTING_FEATURES.clientPortal]: notDocumented(),
      [ACCOUNTING_FEATURES.clientOnboarding]: notDocumented(),
      [ACCOUNTING_FEATURES.engagementSignature]: notDocumented(),
      [ACCOUNTING_FEATURES.clientRequests]: notDocumented(),
      [ACCOUNTING_FEATURES.requestReminders]: configurable(["payroll"]),
      [ACCOUNTING_FEATURES.payrollCollection]: covered("payroll", "dsn"),
      [ACCOUNTING_FEATURES.legalCollection]: notDocumented(),
      [ACCOUNTING_FEATURES.accountingCollection]: notDocumented(),
      [ACCOUNTING_FEATURES.automatedBookkeeping]: notDocumented(),
      [ACCOUNTING_FEATURES.production]: notDocumented(),
      [ACCOUNTING_FEATURES.review]: notDocumented(),
      [ACCOUNTING_FEATURES.tax]: notDocumented(),
      [ACCOUNTING_FEATURES.electronicInvoicing]: notDocumented(),
      [ACCOUNTING_FEATURES.practiceTasks]: configurable(["payroll"]),
      [ACCOUNTING_FEATURES.timeProfitability]: configurable(["payroll"]),
    },
  }),
];
