export const OPERATIONAL_WORKBOOK_V2_SCHEMA_VERSION =
  "operational-workbook-v2" as const;
export const OPERATIONAL_WORKBOOK_V2_VERSION = "2.0.0-pilot" as const;
export const OPERATIONAL_WORKBOOK_V2_PREVIOUS_ASSET_REVISION =
  "d061-v2-pilot-2026-07-29-01" as const;
export const OPERATIONAL_WORKBOOK_V2_ASSET_REVISION =
  "d061-v2-pilot-2026-07-30-02" as const;

export const OPERATIONAL_WORKBOOK_V2_PILOT_SLUGS = [
  "batiment",
  "restaurant",
  "agence-marketing",
  "pharmacie",
  "assistant-administratif-externalise",
] as const;

export type OperationalWorkbookV2PilotSlug =
  (typeof OPERATIONAL_WORKBOOK_V2_PILOT_SLUGS)[number];

const OPERATIONAL_WORKBOOK_V2_CANONICAL_SYSTEM_NAMES = Object.freeze({
  batiment: "Bâtiment",
  restaurant: "Restaurant",
  "agence-marketing": "Agence marketing",
  pharmacie: "Pharmacie",
  "assistant-administratif-externalise":
    "Assistant administratif externalisé",
} as const satisfies Record<OperationalWorkbookV2PilotSlug, string>);

export function getOperationalWorkbookV2CanonicalSystemName(
  systemSlug: OperationalWorkbookV2PilotSlug,
) {
  const systemName =
    OPERATIONAL_WORKBOOK_V2_CANONICAL_SYSTEM_NAMES[systemSlug];
  if (!systemName) {
    throw new Error(`Métier pilote v2 inconnu : ${systemSlug}.`);
  }
  return systemName;
}

export const OPERATIONAL_WORKBOOK_V2_SHEET_ORDER = [
  "Synthèse",
  "Prévisionnel financier",
  "Actions",
  "Équipe",
  "Écosystème",
  "Calendrier marketing",
  "Process",
] as const;

export type OperationalWorkbookV2Variant = "demo" | "editable";

export type OperationalWorkbookV2RoutineSource = {
  routineId: string;
  title: string;
  frequency: string;
  sourceProcessIds: [string, ...string[]];
  sourceStepIds: [string, string, ...string[]];
};

export type OperationalWorkbookV2RoutineRow = {
  routineId: string;
  title: string;
  frequency: string;
  sourceProcessIds: [string, ...string[]];
  sourceStepIds: [string, string, ...string[]];
  bullets: [string, string, ...string[]];
  support: null | {
    assetRevision: string;
    name: string;
    url: string;
  };
};

export type OperationalWorkbookV2FinancialProfile = {
  activityDriver: {
    label: string;
    unit: string;
    demoVolumes: [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ];
  };
  demoAssumptions: OperationalWorkbookV2FinancialAssumptions;
};

export type OperationalWorkbookV2FinancialAssumptions = {
  averageRevenuePerUnit: number;
  variableCostDrivers: Array<{
    label: string;
    rate: number;
    vatDeductible: boolean;
  }>;
  monthlyFixedCosts: Array<{
    label: string;
    value: number;
  }>;
  openingCash: number;
  openingReceivables: number;
  openingPayables: number;
  openingVatPayable: number;
  customerCollectionDelayMonths: 0 | 1;
  supplierPaymentDelayMonths: 0 | 1;
  averageVatRate: number;
  monthlyDebtService: number;
  investmentPerMonth: number;
};

export type OperationalWorkbookV2TeamProfile = {
  role: string;
  manager: string;
  site: string;
  responsibility: string;
  operatingModes: string;
};

export type OperationalWorkbookV2CalendarProfile = {
  category: string;
  action: string;
  channel: string;
  owner: string;
  timing: string;
};

export type OperationalWorkbookV2PilotProfile = {
  systemSlug: OperationalWorkbookV2PilotSlug;
  routines: OperationalWorkbookV2RoutineSource[];
  team: OperationalWorkbookV2TeamProfile[];
  calendar: OperationalWorkbookV2CalendarProfile[];
  finance: OperationalWorkbookV2FinancialProfile;
};

export type OperationalWorkbookV2ActionRow = {
  id: string;
  category: string;
  project: string;
  action: string;
  owner: string;
  support: string;
  priority: string;
  start: string;
  due: string;
  status: string;
  destination: string;
  notes: string;
};

export type OperationalWorkbookV2TeamRow = {
  person: string;
  role: string;
  status: string;
  manager: string;
  site: string;
  responsibility: string;
  operatingModes: string;
  notes: string;
};

export type OperationalWorkbookV2EcosystemRow = {
  category: string;
  name: string;
  usage: string;
  contact: string;
  documentOrAccess: string;
};

export type OperationalWorkbookV2CalendarRow = {
  timing: string;
  category: string;
  action: string;
  channel: string;
  owner: string;
  status: string;
  notes: string;
};

export type OperationalWorkbookV2ForecastPeriod = {
  label: string;
  status: "Scénario démo" | "À renseigner";
  activityVolume: number | null;
  revenue: number | null;
  variableCosts: Array<{
    label: string;
    value: number | null;
  }>;
  fixedCosts: Array<{
    label: string;
    value: number | null;
  }>;
  operatingResult: number | null;
  operatingMarginRate: number | null;
  customerReceipts: number | null;
  supplierPayments: number | null;
  vatSettlement: number | null;
  debtService: number | null;
  investment: number | null;
  netCashMovement: number | null;
  closingCash: number | null;
};

export type OperationalWorkbookV2Blueprint = {
  schemaVersion: typeof OPERATIONAL_WORKBOOK_V2_SCHEMA_VERSION;
  workbookVersion: typeof OPERATIONAL_WORKBOOK_V2_VERSION;
  assetRevision: typeof OPERATIONAL_WORKBOOK_V2_ASSET_REVISION;
  variant: OperationalWorkbookV2Variant;
  systemSlug: OperationalWorkbookV2PilotSlug;
  systemName: string;
  companyName: string;
  sheetOrder: typeof OPERATIONAL_WORKBOOK_V2_SHEET_ORDER;
  sourceContentCount: 74;
  routineRows: OperationalWorkbookV2RoutineRow[];
  actionRows: OperationalWorkbookV2ActionRow[];
  teamRows: OperationalWorkbookV2TeamRow[];
  ecosystemRows: OperationalWorkbookV2EcosystemRow[];
  calendarRows: OperationalWorkbookV2CalendarRow[];
  financialProfile: OperationalWorkbookV2FinancialProfile;
  forecastPeriods: OperationalWorkbookV2ForecastPeriod[];
};

export function isOperationalWorkbookV2PilotSlug(
  value: string,
): value is OperationalWorkbookV2PilotSlug {
  return (OPERATIONAL_WORKBOOK_V2_PILOT_SLUGS as readonly string[]).includes(
    value,
  );
}
