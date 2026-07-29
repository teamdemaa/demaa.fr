import rawProcessRegistry from "@/lib/process-registry.generated.json";
import rawProcessSteps from "@/lib/process-steps.generated.json";
import { buildOperationalWorkbookBlueprint } from "@/lib/operational-workbook-factory";
import {
  isOperationalWorkbookV2PilotSlug,
  OPERATIONAL_WORKBOOK_V2_ASSET_REVISION,
  OPERATIONAL_WORKBOOK_V2_SCHEMA_VERSION,
  OPERATIONAL_WORKBOOK_V2_SHEET_ORDER,
  OPERATIONAL_WORKBOOK_V2_VERSION,
  type OperationalWorkbookV2Blueprint,
  type OperationalWorkbookV2FinancialAssumptions,
  type OperationalWorkbookV2ForecastPeriod,
  type OperationalWorkbookV2PilotSlug,
  type OperationalWorkbookV2RoutineRow,
  type OperationalWorkbookV2Variant,
} from "@/lib/operational-workbook-v2";
import {
  getOperationalWorkbookV2PilotProfile,
  getOperationalWorkbookV2PilotProfiles,
} from "@/lib/operational-workbook-v2-profiles";

type ProcessRegistry = {
  processes: Array<{
    processId: string;
    process: string;
    pillarLabel: string;
  }>;
};

type ProcessStep = {
  stepId: string;
  métierId: string;
  processId: string;
  step: string;
  defaultOwner: string;
  recurrence: string;
  status: string;
};

const processRegistry = rawProcessRegistry as ProcessRegistry;
const processSteps = (rawProcessSteps as { steps: ProcessStep[] }).steps;
const processById = new Map(
  processRegistry.processes.map((process) => [process.processId, process]),
);
const stepById = new Map(processSteps.map((step) => [step.stepId, step]));
const demoPeople = [
  "Camille Martin",
  "Sarah Bernard",
  "Nicolas Robert",
  "Amina Benali",
  "Julien Petit",
];
const forecastStart = { monthIndex: 7, year: 2026 } as const;
const frenchMonthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
] as const;

function buildForecastPeriodLabel(index: number) {
  const absoluteMonth = forecastStart.monthIndex + index;
  const monthIndex = absoluteMonth % 12;
  const year = forecastStart.year + Math.floor(absoluteMonth / 12);
  return `${frenchMonthNames[monthIndex]} ${year}`;
}

function assertPilotSlug(systemSlug: string): OperationalWorkbookV2PilotSlug {
  if (!isOperationalWorkbookV2PilotSlug(systemSlug)) {
    throw new Error(
      `La factory v2 D-061 est limitée aux cinq pilotes : ${systemSlug}.`,
    );
  }

  return systemSlug;
}

function buildRoutineRows(
  systemSlug: OperationalWorkbookV2PilotSlug,
): OperationalWorkbookV2RoutineRow[] {
  const profile = getOperationalWorkbookV2PilotProfile(systemSlug);
  if (!profile) {
    throw new Error(`Profil v2 absent pour ${systemSlug}.`);
  }

  if (profile.routines.length < 8 || profile.routines.length > 12) {
    throw new Error(
      `${systemSlug} doit contenir entre 8 et 12 routines dirigeantes.`,
    );
  }

  const routineIds = new Set<string>();
  const métierId = `metier.${systemSlug}`;

  return profile.routines.map((routine) => {
    if (routineIds.has(routine.routineId)) {
      throw new Error(`Routine v2 dupliquée : ${routine.routineId}.`);
    }
    routineIds.add(routine.routineId);

    if (
      routine.sourceStepIds.length < 2 ||
      routine.sourceStepIds.length > 4
    ) {
      throw new Error(
        `${routine.routineId} doit référencer entre 2 et 4 contenus sources.`,
      );
    }

    for (const processId of routine.sourceProcessIds) {
      if (!processById.has(processId)) {
        throw new Error(
          `${routine.routineId} référence un processus inconnu : ${processId}.`,
        );
      }
    }

    const sourceSteps = routine.sourceStepIds.map((stepId) => {
      const step = stepById.get(stepId);

      if (
        !step ||
        step.status !== "Actif" ||
        step.métierId !== métierId ||
        !routine.sourceProcessIds.includes(step.processId)
      ) {
        throw new Error(
          `${routine.routineId} référence un contenu source invalide : ${stepId}.`,
        );
      }

      return step;
    });

    return {
      ...routine,
      bullets: sourceSteps.map((step) => step.step) as [
        string,
        string,
        ...string[],
      ],
      support: null,
    };
  });
}

function assertFinancialAssumptions(
  systemSlug: string,
  assumptions: OperationalWorkbookV2FinancialAssumptions,
) {
  const variableCostRate = assumptions.variableCostDrivers.reduce(
    (total, driver) => total + driver.rate,
    0,
  );
  const fixedCosts = assumptions.monthlyFixedCosts.reduce(
    (total, cost) => total + cost.value,
    0,
  );

  if (
    assumptions.averageRevenuePerUnit <= 0 ||
    variableCostRate <= 0 ||
    variableCostRate >= 0.9 ||
    fixedCosts <= 0 ||
    assumptions.averageVatRate < 0 ||
    assumptions.averageVatRate > 0.25
  ) {
    throw new Error(`Structure financière non crédible pour ${systemSlug}.`);
  }
}

export function calculateOperationalWorkbookV2Forecast(input: {
  assumptions: OperationalWorkbookV2FinancialAssumptions | null;
  systemSlug: string;
  volumes: readonly number[];
}): OperationalWorkbookV2ForecastPeriod[] {
  const profile = getOperationalWorkbookV2PilotProfile(input.systemSlug);
  if (!profile) {
    throw new Error(`Profil financier v2 absent pour ${input.systemSlug}.`);
  }

  const assumptions = input.assumptions;
  if (assumptions) {
    assertFinancialAssumptions(input.systemSlug, assumptions);
  }

  let runningCash = assumptions?.openingCash ?? null;
  let previousRevenue = 0;
  let previousSupplierCost = 0;
  let previousVatPosition = 0;

  return input.volumes.map((volume, index) => {
    const label = buildForecastPeriodLabel(index);

    if (!assumptions) {
      return {
        label,
        status: "À renseigner",
        activityVolume: volume || null,
        revenue: null,
        variableCosts: profile.finance.demoAssumptions.variableCostDrivers.map(
          (driver) => ({
            label: driver.label,
            value: null,
          }),
        ),
        fixedCosts: profile.finance.demoAssumptions.monthlyFixedCosts.map(
          (cost) => ({
            label: cost.label,
            value: null,
          }),
        ),
        operatingResult: null,
        operatingMarginRate: null,
        customerReceipts: null,
        supplierPayments: null,
        vatSettlement: null,
        debtService: null,
        investment: null,
        netCashMovement: null,
        closingCash: null,
      };
    }

    const revenue = Math.round(
      volume * assumptions.averageRevenuePerUnit,
    );
    const variableCosts = assumptions.variableCostDrivers.map((driver) => ({
      label: driver.label,
      value: Math.round(revenue * driver.rate),
    }));
    const fixedCosts = assumptions.monthlyFixedCosts.map((cost) => ({
      label: cost.label,
      value: cost.value,
    }));
    const totalVariableCosts = variableCosts.reduce(
      (total, cost) => total + (cost.value ?? 0),
      0,
    );
    const totalFixedCosts = fixedCosts.reduce(
      (total, cost) => total + (cost.value ?? 0),
      0,
    );
    const operatingResult =
      revenue - totalVariableCosts - totalFixedCosts;
    const customerReceipts =
      assumptions.customerCollectionDelayMonths === 0
        ? Math.round(revenue * (1 + assumptions.averageVatRate))
        : index === 0
          ? assumptions.openingReceivables
          : Math.round(
              previousRevenue * (1 + assumptions.averageVatRate),
            );
    const supplierPayments =
      assumptions.supplierPaymentDelayMonths === 0
        ? Math.round(
            totalVariableCosts * (1 + assumptions.averageVatRate),
          )
        : index === 0
          ? assumptions.openingPayables
          : Math.round(
              previousSupplierCost * (1 + assumptions.averageVatRate),
            );
    const deductibleVariableCosts =
      assumptions.variableCostDrivers.reduce(
        (total, driver, driverIndex) =>
          total +
          (driver.vatDeductible
            ? (variableCosts[driverIndex]?.value ?? 0)
            : 0),
        0,
      );
    const currentVatPosition = Math.max(
      0,
      Math.round(
        (revenue - deductibleVariableCosts) *
          assumptions.averageVatRate,
      ),
    );
    const vatSettlement =
      index === 0 ? assumptions.openingVatPayable : previousVatPosition;
    const debtService = assumptions.monthlyDebtService;
    const investment = assumptions.investmentPerMonth;
    const netCashMovement =
      customerReceipts -
      supplierPayments -
      totalFixedCosts -
      vatSettlement -
      debtService -
      investment;
    runningCash = (runningCash ?? 0) + netCashMovement;
    previousRevenue = revenue;
    previousSupplierCost = totalVariableCosts;
    previousVatPosition = currentVatPosition;

    return {
      label,
      status: "Scénario démo",
      activityVolume: volume,
      revenue,
      variableCosts,
      fixedCosts,
      operatingResult,
      operatingMarginRate: operatingResult / revenue,
      customerReceipts,
      supplierPayments,
      vatSettlement,
      debtService,
      investment,
      netCashMovement,
      closingCash: runningCash,
    };
  });
}

function buildForecastPeriods(
  systemSlug: OperationalWorkbookV2PilotSlug,
  variant: OperationalWorkbookV2Variant,
): OperationalWorkbookV2ForecastPeriod[] {
  const profile = getOperationalWorkbookV2PilotProfile(systemSlug);
  if (!profile) {
    throw new Error(`Profil financier v2 absent pour ${systemSlug}.`);
  }

  return calculateOperationalWorkbookV2Forecast({
    assumptions:
      variant === "demo" ? profile.finance.demoAssumptions : null,
    systemSlug,
    volumes:
      variant === "demo"
        ? profile.finance.activityDriver.demoVolumes
        : Array.from({ length: 12 }, () => 0),
  });
}

export function buildOperationalWorkbookV2Blueprint(
  inputSlug: string,
  variant: OperationalWorkbookV2Variant,
): OperationalWorkbookV2Blueprint {
  const systemSlug = assertPilotSlug(inputSlug);
  const profile = getOperationalWorkbookV2PilotProfile(systemSlug);
  if (!profile) {
    throw new Error(`Profil v2 absent pour ${systemSlug}.`);
  }

  const sourceBlueprint = buildOperationalWorkbookBlueprint(
    systemSlug,
    variant,
  );
  const routineRows = buildRoutineRows(systemSlug);

  if (sourceBlueprint.processRows.length !== 74) {
    throw new Error(
      `${systemSlug} ne conserve pas ses 74 contenus opérationnels sources.`,
    );
  }

  const actionRows = routineRows.map((routine, index) => {
    const firstStep = stepById.get(routine.sourceStepIds[0]);
    const firstProcess = processById.get(routine.sourceProcessIds[0]);

    if (!firstStep || !firstProcess) {
      throw new Error(`Routine incomplète : ${routine.routineId}.`);
    }

    return {
      id: `ACT-${String(index + 1).padStart(3, "0")}`,
      category: firstProcess.pillarLabel,
      project: routine.title,
      action: routine.bullets[0],
      owner: variant === "demo" ? firstStep.defaultOwner : "",
      support: routine.support?.name ?? "",
      priority: variant === "demo" ? (index < 4 ? "P1" : "P2") : "À définir",
      start: "",
      due: "",
      status: variant === "demo" ? "À faire" : "À planifier",
      destination: routine.title,
      notes:
        variant === "demo"
          ? "Scénario fictif à remplacer par les données de l’entreprise."
          : "",
    };
  });

  return {
    schemaVersion: OPERATIONAL_WORKBOOK_V2_SCHEMA_VERSION,
    workbookVersion: OPERATIONAL_WORKBOOK_V2_VERSION,
    assetRevision: OPERATIONAL_WORKBOOK_V2_ASSET_REVISION,
    variant,
    systemSlug,
    systemName: sourceBlueprint.systemName,
    companyName: sourceBlueprint.companyName,
    sheetOrder: OPERATIONAL_WORKBOOK_V2_SHEET_ORDER,
    sourceContentCount: 74,
    routineRows,
    actionRows,
    teamRows: profile.team.map((entry, index) => ({
      person: variant === "demo" ? demoPeople[index % demoPeople.length] : "",
      role: entry.role,
      status: variant === "demo" ? "En poste" : "",
      manager: entry.manager,
      site: entry.site,
      responsibility: entry.responsibility,
      operatingModes: entry.operatingModes,
      notes:
        variant === "demo"
          ? "Organisation fictive à adapter à l’équipe réelle."
          : "",
    })),
    ecosystemRows: sourceBlueprint.ecosystemRows.map((entry) => ({
      category: entry.category,
      name: entry.name,
      usage: entry.need,
      contact: "",
      documentOrAccess: entry.url,
    })),
    calendarRows: profile.calendar.map((entry) => ({
      ...entry,
      timing: variant === "demo" ? entry.timing : "",
      status: variant === "demo" ? "À planifier" : "",
      notes:
        variant === "demo"
          ? "Scénario éditorial fictif, sans donnée clinique."
          : "",
    })),
    financialProfile: profile.finance,
    forecastPeriods: buildForecastPeriods(systemSlug, variant),
  };
}

export function buildOperationalWorkbookV2Pair(systemSlug: string) {
  return {
    demo: buildOperationalWorkbookV2Blueprint(systemSlug, "demo"),
    editable: buildOperationalWorkbookV2Blueprint(systemSlug, "editable"),
  };
}

export function getOperationalWorkbookV2PilotSlugs() {
  return getOperationalWorkbookV2PilotProfiles().map(
    (profile) => profile.systemSlug,
  );
}
