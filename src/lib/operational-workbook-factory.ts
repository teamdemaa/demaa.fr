import rawEnterpriseAnnuaire from "@/lib/enterprise-annuaire.json";
import rawProcessRegistry from "@/lib/process-registry.generated.json";
import rawProcessSteps from "@/lib/process-steps.generated.json";
import { ACCOUNTING_RECOMMENDATION } from "@/lib/accounting-recommendation";
import { plumbingPilotEcosystemRecommendations } from "@/lib/plumbing-ecosystem-pilot";
import { plumbingPilotTeamRoles } from "@/lib/plumbing-workbook-pilot";
import { getRecommendedSuppliersForSystem } from "@/lib/supplier-recommendations";
import { getCuratedToolRecommendationsForSystem } from "@/lib/system-tool-recommendations";
import {
  getToolDirectoryItemBySlug,
  getToolDirectorySlug,
} from "@/lib/tool-directory";

export const OPERATIONAL_WORKBOOK_SHEET_ORDER = [
  "Synthèse",
  "Actions",
  "Process",
  "Équipe",
  "Prévisionnel financier",
  "Calendrier marketing",
  "Écosystème",
] as const;

export type OperationalWorkbookVariant = "demo" | "editable";

type ProcessRegistry = {
  processes: Array<{
    pillarLabel: string;
    process: string;
    processId: string;
  }>;
  documents: Array<{
    name: string;
    processId: string;
  }>;
};

type ProcessStep = {
  contentType:
    | "implementation_action"
    | "operating_rule"
    | "operational_step"
    | "recurring_control";
  defaultOwner: string;
  métierId: string;
  processId: string;
  recurrence: string;
  step: string;
};

type Enterprise = {
  audience?: "b2b" | "b2c" | "mixed";
  name: string;
  offerType?: string;
  sectorLabel: string;
  slug: string;
  toolRefs?: Array<{ slug: string; usage?: string }>;
};

export type OperationalWorkbookProcessRow = {
  pillar: string;
  process: string;
  contentType: string;
  content: string;
  recommendedOwner: string;
  recurrence: string;
  support: string;
};

export type OperationalWorkbookActionRow = {
  id: string;
  pillar: string;
  process: string;
  action: string;
  owner: string;
  support: string;
  priority: string;
  start: string;
  due: string;
  status: string;
  expectedResult: string;
  notes: string;
};

export type OperationalWorkbookTeamRow = {
  role: string;
  person: string;
  situation: string;
  manager: string;
  mainResponsibility: string;
  relatedProcesses: string;
  targetDate: string;
  notes: string;
};

export type OperationalWorkbookEcosystemRow = {
  category:
    | "Outil métier"
    | "Professionnel"
    | "Fournisseur"
    | "Banque / assurance / financement";
  need: string;
  name: string;
  chosenSolution: string;
  status: string;
  cost: string;
  targetDate: string;
  url: string;
  notes: string;
};

export type OperationalWorkbookCalendarRow = {
  due: string;
  phase: string;
  action: string;
  channel: string;
  owner: string;
  status: string;
  notes: string;
};

export type OperationalWorkbookBlueprint = {
  actionRows: OperationalWorkbookActionRow[];
  calendarRows: OperationalWorkbookCalendarRow[];
  companyName: string;
  ecosystemRows: OperationalWorkbookEcosystemRow[];
  financialProfile: {
    activityUnit: string;
    monthlyRevenue: number;
    operatingMarginRate: number;
  };
  notices: Record<(typeof OPERATIONAL_WORKBOOK_SHEET_ORDER)[number], string>;
  processRows: OperationalWorkbookProcessRow[];
  sheetOrder: typeof OPERATIONAL_WORKBOOK_SHEET_ORDER;
  systemName: string;
  systemSlug: string;
  teamRows: OperationalWorkbookTeamRow[];
  variant: OperationalWorkbookVariant;
};

const registry = rawProcessRegistry as ProcessRegistry;
const allSteps = (rawProcessSteps as { steps: ProcessStep[] }).steps;
const enterprises = (rawEnterpriseAnnuaire as { enterprises: Enterprise[] })
  .enterprises;
const processById = new Map(
  registry.processes.map((process) => [process.processId, process]),
);
const documentByProcessId = new Map(
  registry.documents.map((document) => [document.processId, document]),
);
const enterpriseBySlug = new Map(
  enterprises.map((enterprise) => [enterprise.slug, enterprise]),
);

const contentTypeLabels: Record<ProcessStep["contentType"], string> = {
  implementation_action: "Action de mise en place",
  operational_step: "Étape opérationnelle",
  operating_rule: "Règle",
  recurring_control: "Contrôle récurrent",
};

const demoPeople = [
  "Camille Martin",
  "Sarah Bernard",
  "Nicolas Robert",
  "Amina Benali",
  "Julien Petit",
  "Léa Moreau",
  "Thomas Garcia",
  "Inès Roux",
  "Mehdi Laurent",
  "Chloé Simon",
  "Yanis Michel",
  "Emma Leroy",
];

function addDays(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getFictionalCompanyName(systemName: string) {
  const simplifiedName = systemName
    .replace(/^Cabinet d['’]/i, "")
    .replace(/^Agence de /i, "")
    .replace(/^Agence /i, "")
    .trim();

  return `${simplifiedName} Horizon`;
}

function getFinancialProfile(enterprise: Enterprise) {
  const sectorProfiles: Record<
    string,
    { activityUnit: string; monthlyRevenue: number; operatingMarginRate: number }
  > = {
    "BTP & services techniques": {
      activityUnit: "Chantiers / mois",
      monthlyRevenue: 65_000,
      operatingMarginRate: 0.12,
    },
    "Commerce & retail": {
      activityUnit: "Ventes / mois",
      monthlyRevenue: 75_000,
      operatingMarginRate: 0.1,
    },
    "Éducation & formation": {
      activityUnit: "Bénéficiaires / mois",
      monthlyRevenue: 48_000,
      operatingMarginRate: 0.11,
    },
    Restauration: {
      activityUnit: "Couverts / mois",
      monthlyRevenue: 90_000,
      operatingMarginRate: 0.08,
    },
    "Santé, bien-être & esthétique": {
      activityUnit: "Clients ou patients / mois",
      monthlyRevenue: 55_000,
      operatingMarginRate: 0.13,
    },
  };

  return (
    sectorProfiles[enterprise.sectorLabel] ?? {
      activityUnit:
        enterprise.offerType === "product"
          ? "Ventes / mois"
          : enterprise.audience === "b2b"
            ? "Dossiers clients / mois"
            : "Clients / mois",
      monthlyRevenue: enterprise.audience === "b2b" ? 60_000 : 45_000,
      operatingMarginRate: 0.15,
    }
  );
}

function buildProcessRows(steps: ProcessStep[]) {
  return steps.map((step) => {
    const process = processById.get(step.processId);
    const document = documentByProcessId.get(step.processId);

    if (!process || !document) {
      throw new Error(`Référentiel incomplet pour ${step.processId}.`);
    }

    return {
      pillar: process.pillarLabel,
      process: process.process,
      contentType: contentTypeLabels[step.contentType],
      content: step.step,
      recommendedOwner: step.defaultOwner,
      recurrence: step.recurrence,
      support: document.name,
    };
  });
}

function buildActionRows(
  steps: ProcessStep[],
  variant: OperationalWorkbookVariant,
) {
  return steps
    .filter((step) => step.contentType === "implementation_action")
    .map((step, index) => {
      const process = processById.get(step.processId);
      const document = documentByProcessId.get(step.processId);

      if (!process || !document) {
        throw new Error(`Action sans processus ou support : ${step.processId}.`);
      }

      const start = addDays("2026-08-03", index * 7);

      return {
        id: `ACT-${String(index + 1).padStart(3, "0")}`,
        pillar: process.pillarLabel,
        process: process.process,
        action: step.step,
        owner: variant === "demo" ? step.defaultOwner : "",
        support: document.name,
        priority:
          variant === "demo"
            ? index < 3
              ? "P1"
              : index < 8
                ? "P2"
                : "P3"
            : "À définir",
        start: variant === "demo" ? start : "",
        due: variant === "demo" ? addDays(start, 14) : "",
        status:
          variant === "demo"
            ? ["En cours", "À faire", "À planifier"][index % 3]
            : "À planifier",
        expectedResult: `Action appliquée, responsable désigné et preuve ajoutée dans « ${document.name} ».`,
        notes:
          variant === "demo"
            ? "Exemple fictif à remplacer par les informations de votre entreprise."
            : "",
      };
    });
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function extractOwnerRoles(defaultOwner: string) {
  const parts = defaultOwner
    .split(/\s+ou\s+|\s*\/\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);
  const firstPart = parts[0] ?? "";
  const sharedPrefix = firstPart.match(/^(Responsable|Référent)\s+/i)?.[1];

  return parts.map((part, index) => {
    if (
      index > 0 &&
      sharedPrefix &&
      !/^(responsable|référent|direction|dirigeant|gestionnaire|équipe|administration|pharmacien|personnel)/i.test(
        part,
      )
    ) {
      return `${capitalize(sharedPrefix)} ${part.toLowerCase()}`;
    }

    return capitalize(part);
  });
}

function buildGenericTeamRows(
  steps: ProcessStep[],
  variant: OperationalWorkbookVariant,
) {
  const counts = new Map<string, number>();

  for (const step of steps) {
    for (const role of extractOwnerRoles(step.defaultOwner)) {
      if (role) counts.set(role, (counts.get(role) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .toSorted((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 12)
    .map(([role], index) => {
      const relatedProcesses = [
        ...new Set(
          steps
            .filter((step) => extractOwnerRoles(step.defaultOwner).includes(role))
            .map((step) => processById.get(step.processId)?.process)
            .filter((process): process is string => Boolean(process)),
        ),
      ].slice(0, 4);

      return {
        role,
        person: variant === "demo" ? demoPeople[index % demoPeople.length] : "",
        situation: variant === "demo" ? "En poste" : "",
        manager: index === 0 ? "" : "Direction",
        mainResponsibility: `Piloter les contenus attribués au rôle « ${role} » et signaler les écarts.`,
        relatedProcesses: relatedProcesses.join(" · "),
        targetDate: "",
        notes:
          variant === "demo"
            ? "Affectation fictive : une personne peut cumuler plusieurs rôles."
            : "",
      };
    });
}

function buildTeamRows(
  systemSlug: string,
  steps: ProcessStep[],
  variant: OperationalWorkbookVariant,
) {
  if (systemSlug !== "plomberie-chauffage") {
    return buildGenericTeamRows(steps, variant);
  }

  return plumbingPilotTeamRoles.map((role, index) => ({
    role: role.role,
    person: variant === "demo" ? demoPeople[index % demoPeople.length] : "",
    situation: variant === "demo" ? "En poste" : "",
    manager: role.manager,
    mainResponsibility: role.mainResponsibility,
    relatedProcesses: role.relatedProcesses,
    targetDate: "",
    notes:
      variant === "demo"
        ? "Affectation fictive : une personne peut cumuler plusieurs rôles."
        : "",
  }));
}

function buildToolRows(enterprise: Enterprise) {
  const slugs = [
    ...(getCuratedToolRecommendationsForSystem(enterprise.slug) ?? []),
    ...(enterprise.toolRefs?.map((tool) => tool.slug) ?? []),
  ].filter((slug, index, values) => values.indexOf(slug) === index);
  const usageBySlug = new Map(
    enterprise.toolRefs?.map((tool) => [tool.slug, tool.usage ?? ""]) ?? [],
  );

  return slugs
    .map((slug) => {
      const tool = getToolDirectoryItemBySlug(slug);
      if (!tool) return null;
      const canonicalSlug = getToolDirectorySlug(tool);
      const usage =
        usageBySlug.get(slug) ||
        tool.bestFor ||
        tool.description;

      return {
        category: "Outil métier" as const,
        need: usage,
        name: tool.name,
        chosenSolution: "",
        status: "À comparer",
        cost: tool.pricingHint || "Voir tarif actuel",
        targetDate: "",
        url: `https://demaa.co/annuaire-outils/${canonicalSlug}`,
        notes: tool.bestFor,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .slice(0, 4);
}

function buildEcosystemRows(
  enterprise: Enterprise,
  variant: OperationalWorkbookVariant,
) {
  if (enterprise.slug === "plomberie-chauffage") {
    const selectedDemoSolutions = new Set([
      "Obat",
      "Google Business Profile",
      "EM2A Expertise",
    ]);

    return plumbingPilotEcosystemRecommendations.map((recommendation) => {
      const isSelectedDemoSolution =
        variant === "demo" &&
        selectedDemoSolutions.has(recommendation.name);

      return {
        category: recommendation.category,
        need: recommendation.need,
        name: recommendation.name,
        chosenSolution: isSelectedDemoSolution ? recommendation.name : "",
        status: isSelectedDemoSolution
          ? "Déjà utilisé"
          : recommendation.initialStatus,
        cost: recommendation.cost,
        targetDate: "",
        url: recommendation.url,
        notes: recommendation.recommendation,
      };
    });
  }

  const toolRows = buildToolRows(enterprise);
  const normalizedToolNames = toolRows.map((row) =>
    row.name
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ""),
  );
  const suppliers = getRecommendedSuppliersForSystem(
    enterprise.slug,
    enterprise.sectorLabel,
  ).filter((supplier) => {
    const normalizedSupplierName = supplier.name
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    return !normalizedToolNames.some(
      (toolName) =>
        toolName.startsWith(normalizedSupplierName) ||
        normalizedSupplierName.startsWith(toolName),
    );
  });
  const operationalSuppliers = suppliers
    .filter(
      (supplier) =>
        ![
          "Banque",
          "Assurance",
          "Mutuelle",
          "Avantages salariés",
          "Protection sociale",
        ].includes(supplier.category),
    )
    .slice(0, 3)
    .map((supplier) => ({
      category: "Fournisseur" as const,
      need: supplier.shortDescription,
      name: supplier.name,
      chosenSolution: "",
      status: "À comparer",
      cost: supplier.offerHint,
      targetDate: "",
      url: `https://demaa.co/annuaire-fournisseurs/${supplier.slug}`,
      notes: supplier.bestFor,
    }));
  const financialSupplier = suppliers.find((supplier) =>
    [
      "Banque",
      "Assurance",
      "Mutuelle",
      "Avantages salariés",
      "Protection sociale",
    ].includes(supplier.category),
  );
  const rows: OperationalWorkbookEcosystemRow[] = [
    ...toolRows,
    {
      category: "Professionnel",
      need: "Comptabilité, TVA, paie, bilan et conseil",
      name: ACCOUNTING_RECOMMENDATION.firmName,
      chosenSolution: "",
      status: "À étudier",
      cost: "Sur devis",
      targetDate: "",
      url: ACCOUNTING_RECOMMENDATION.profileUrl,
      notes: "Cabinet inscrit à l’Ordre des experts-comptables.",
    },
    ...operationalSuppliers,
  ];

  if (financialSupplier) {
    rows.push({
      category: "Banque / assurance / financement",
      need: financialSupplier.shortDescription,
      name: financialSupplier.name,
      chosenSolution: "",
      status: "À comparer",
      cost: financialSupplier.offerHint,
      targetDate: "",
      url: `https://demaa.co/annuaire-fournisseurs/${financialSupplier.slug}`,
      notes: financialSupplier.bestFor,
    });
  }

  return rows.map((row, index) => ({
    ...row,
    chosenSolution: variant === "demo" && index < 3 ? row.name : "",
    status:
      variant === "demo" && index < 3 ? "Déjà utilisé" : row.status,
  }));
}

function buildCalendarRows(
  processRows: OperationalWorkbookProcessRow[],
  variant: OperationalWorkbookVariant,
) {
  const marketingRows = processRows.filter(
    (row) =>
      /marketing|vente|commercial/i.test(row.pillar) ||
      /prospect|client|offre|avis|visibilit|acquisition|vente/i.test(row.content),
  );
  const selectedRows = (marketingRows.length >= 6 ? marketingRows : processRows)
    .slice(0, 6);

  if (variant === "editable") return [];

  return selectedRows.map((row, index) => ({
    due: addDays("2026-08-03", index * 14),
    phase: row.pillar,
    action: row.content,
    channel: /avis|google|visibilit/i.test(row.content)
      ? "En ligne"
      : "E-mail et téléphone",
    owner: row.recommendedOwner,
    status: index === 0 ? "En cours" : "À faire",
    notes: "Exemple fictif à adapter au calendrier réel de l’entreprise.",
  }));
}

function buildNotices(input: {
  actionCount: number;
  companyName: string;
  processCount: number;
  systemName: string;
  variant: OperationalWorkbookVariant;
}) {
  const prefix = input.variant === "demo" ? "DÉMONSTRATION" : "VERSION MODIFIABLE";
  const context =
    input.variant === "demo"
      ? `Données fictives de ${input.companyName}.`
      : "Complétez les cellules prévues avec les données de votre entreprise.";

  return {
    Synthèse: `${prefix} - ${context} Commencez par les Actions.`,
    Actions: `${prefix} - ${input.actionCount} actions de mise en place sont préchargées.`,
    Process: `${prefix} - ${input.processCount} process et 74 contenus concrets pour ${input.systemName}.`,
    Équipe: `${prefix} - Attribuez les rôles ; une personne peut cumuler plusieurs rôles.`,
    "Prévisionnel financier": `${prefix} - ${
      input.variant === "demo"
        ? "Les montants sont fictifs et montrent le fonctionnement."
        : "Choisissez le premier mois puis renseignez vos données."
    }`,
    "Calendrier marketing": `${prefix} - ${
      input.variant === "demo"
        ? `Calendrier commercial fictif de ${input.companyName}.`
        : "Planifiez vos actions commerciales."
    }`,
    Écosystème: `${prefix} - Outils, professionnels et fournisseurs nommés avec leurs liens.`,
  };
}

export function buildOperationalWorkbookBlueprint(
  systemSlug: string,
  variant: OperationalWorkbookVariant,
): OperationalWorkbookBlueprint {
  const enterprise = enterpriseBySlug.get(systemSlug);

  if (!enterprise) {
    throw new Error(`Métier inconnu : ${systemSlug}.`);
  }

  const steps = allSteps.filter(
    (step) => step.métierId === `metier.${systemSlug}`,
  );
  const processIds = new Set(steps.map((step) => step.processId));

  if (steps.length !== 74 || processIds.size === 0) {
    throw new Error(
      `Référentiel incomplet pour ${systemSlug} : ${steps.length} contenus, ${processIds.size} process.`,
    );
  }

  const processRows = buildProcessRows(steps);
  const actionRows = buildActionRows(steps, variant);
  const companyName = getFictionalCompanyName(enterprise.name);

  return {
    actionRows,
    calendarRows: buildCalendarRows(processRows, variant),
    companyName,
    ecosystemRows: buildEcosystemRows(enterprise, variant),
    financialProfile: getFinancialProfile(enterprise),
    notices: buildNotices({
      actionCount: actionRows.length,
      companyName,
      processCount: processIds.size,
      systemName: enterprise.name,
      variant,
    }),
    processRows,
    sheetOrder: OPERATIONAL_WORKBOOK_SHEET_ORDER,
    systemName: enterprise.name,
    systemSlug,
    teamRows: buildTeamRows(systemSlug, steps, variant),
    variant,
  };
}

export function buildOperationalWorkbookPair(systemSlug: string) {
  return {
    demo: buildOperationalWorkbookBlueprint(systemSlug, "demo"),
    editable: buildOperationalWorkbookBlueprint(systemSlug, "editable"),
  };
}

export function getOperationalWorkbookFactorySlugs() {
  return enterprises.map((enterprise) => enterprise.slug);
}
