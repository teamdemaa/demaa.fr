import { createHash } from "node:crypto";
import { CANONICAL_OPERATIONAL_WORKBOOK_SHEET_IDS } from "@/lib/operational-workbook-sheet-compiler";
import {
  getOperationalWorkbookV2CanonicalSystemName,
  OPERATIONAL_WORKBOOK_V2_PREVIOUS_ASSET_REVISION,
  type OperationalWorkbookV2Blueprint,
} from "@/lib/operational-workbook-v2";

export const OPERATIONAL_WORKBOOK_V2_SHEET_IDS = {
  summary: 610610001,
  forecast: 610610002,
  actions: 610610003,
  team: 610610004,
  ecosystem: 610610005,
  calendar: 610610006,
  process: 610610007,
} as const;

type SheetKey = keyof typeof OPERATIONAL_WORKBOOK_V2_SHEET_IDS;

const OPERATIONAL_WORKBOOK_V2_SHEET_DEFINITIONS = [
  ["summary", "Synthèse", 0, 100, 4],
  ["forecast", "Prévisionnel financier", 1, 179, 31],
  ["actions", "Actions", 2, 120, 10],
  ["team", "Équipe", 3, 120, 8],
  ["ecosystem", "Écosystème", 4, 120, 5],
  ["calendar", "Calendrier marketing", 5, 120, 7],
  ["process", "Process", 6, 120, 4],
] as const;

const OPERATIONAL_WORKBOOK_V1_SHEET_DEFINITIONS = [
  ["summary", "Synthèse", 0],
  ["actions", "Actions", 1],
  ["process", "Process", 2],
  ["team", "Équipe", 3],
  ["forecast", "Prévisionnel financier", 4],
  ["calendar", "Calendrier marketing", 5],
  ["ecosystem", "Écosystème", 6],
] as const;

export type OperationalWorkbookV2SheetPreflight = {
  capturedAt: string;
  developerMetadata: ReadonlyArray<{
    key: string;
    location: {
      dimensionRange?: unknown;
      sheetId?: number;
      spreadsheet?: boolean;
    };
    value: string;
    visibility: string;
  }>;
  revisionToken: string;
  sheets: ReadonlyArray<{
    columnCount?: number;
    frozenRowCount?: number;
    index: number;
    rowCount?: number;
    sheetId: number;
    title: string;
  }>;
  spreadsheetId: string;
  spreadsheetTitle: string;
  stateFingerprint: string;
};

type OperationalWorkbookV2PreflightInput = Omit<
  OperationalWorkbookV2SheetPreflight,
  "stateFingerprint"
>;

export type OperationalWorkbookV2Identity = {
  assetRevision: string;
  systemSlug: string;
  variant: OperationalWorkbookV2Blueprint["variant"];
  workbookVersion: string;
};

export type OperationalWorkbookV2ApplicationGuard = {
  preflightRevisionToken: string;
  preflightStateFingerprint: string;
  preflightSpreadsheetTitle: string;
  requestsFingerprint: string;
  spreadsheetId: string;
  targetIdentity: OperationalWorkbookV2Identity;
};

export type OperationalWorkbookV2ApplicationPlan = {
  applicableOnlyAfter: "assertOperationalWorkbookV2ApplicationPlan";
  applicationGuard: OperationalWorkbookV2ApplicationGuard;
  kind: "demaa.operational-workbook-v2.sealed-plan";
  planFingerprint: string;
  requests: ReadonlyArray<unknown>;
  summary: {
    action:
      | "already-applied"
      | "rebuilt-from-v1"
      | "repaired-from-v2";
    assetRevision: string;
    rebuiltSheets: string[];
    routines: number;
    schemaVersion: string;
    sourceContents: number;
    systemSlug: string;
    variant: OperationalWorkbookV2Blueprint["variant"];
    workbookVersion: string;
  };
};

export type OperationalWorkbookV2SheetState =
  | "already-v2"
  | "repairable-v2"
  | "unknown"
  | "v1";

const IDENTITY_METADATA_KEYS = {
  assetRevision: "demaa.assetRevision",
  systemSlug: "demaa.systemSlug",
  variant: "demaa.variant",
  workbookVersion: "demaa.workbookVersion",
} as const;
const STAGING_SHEET_ID = 610619999;
const TITLE_BACKGROUND = { red: 0.082, green: 0.188, blue: 0.133 };
const HEADER_BACKGROUND = { red: 0.867, green: 0.914, blue: 0.875 };
const INPUT_BACKGROUND = { red: 0.953, green: 0.976, blue: 0.957 };
const WHITE = { red: 1, green: 1, blue: 1 };
const DARK_GREEN = { red: 0.082, green: 0.188, blue: 0.133 };

type Formula = { formulaValue: string };
type CellValue = Formula | number | string;

type AssumptionLayout = {
  averageRevenuePerUnit: number;
  variableCostDrivers: number[];
  totalVariableCostRate: number;
  monthlyFixedCosts: number[];
  openingCash: number;
  openingReceivables: number;
  openingPayables: number;
  openingVatPayable: number;
  customerCollectionDelayMonths: number;
  supplierPaymentDelayMonths: number;
  averageVatRate: number;
  monthlyDebtService: number;
  investmentPerMonth: number;
};

type ForecastLayout = {
  activity: number;
  revenue: number;
  variableCosts: number[];
  fixedCosts: number[];
  operatingResult: number;
  operatingMargin: number;
  customerReceipts: number;
  supplierPayments: number;
  fixedPayments: number;
  vatSettlement: number;
  debtService: number;
  investment: number;
  netCashMovement: number;
  openingCash: number;
  closingCash: number;
};

function formula(formulaValue: string): Formula {
  return { formulaValue };
}

function hyperlink(url: string, label = "Ouvrir"): Formula {
  return formula(`=HYPERLINK("${url}";"${label}")`);
}

function cell(value: CellValue) {
  if (typeof value === "number") {
    return { userEnteredValue: { numberValue: value } };
  }

  if (typeof value === "object") {
    return { userEnteredValue: { formulaValue: value.formulaValue } };
  }

  return { userEnteredValue: { stringValue: value } };
}

function row(values: CellValue[]) {
  return { values: values.map(cell) };
}

function range(
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number,
) {
  return {
    sheetId,
    startRowIndex,
    endRowIndex,
    startColumnIndex,
    endColumnIndex,
  };
}

function writeValues(
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number,
  values: CellValue[][],
) {
  return {
    updateCells: {
      range: range(
        sheetId,
        startRowIndex,
        endRowIndex,
        startColumnIndex,
        endColumnIndex,
      ),
      rows: values.map(row),
      fields: "userEnteredValue",
    },
  };
}

function formatCells(
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number,
  userEnteredFormat: Record<string, unknown>,
) {
  return {
    repeatCell: {
      range: range(
        sheetId,
        startRowIndex,
        endRowIndex,
        startColumnIndex,
        endColumnIndex,
      ),
      cell: { userEnteredFormat },
      fields: "userEnteredFormat",
    },
  };
}

function setColumnWidth(
  sheetId: number,
  startIndex: number,
  endIndex: number,
  pixelSize: number,
) {
  return {
    updateDimensionProperties: {
      range: {
        sheetId,
        dimension: "COLUMNS",
        startIndex,
        endIndex,
      },
      properties: { pixelSize },
      fields: "pixelSize",
    },
  };
}

function autoResizeRows(
  sheetId: number,
  startIndex: number,
  endIndex: number,
) {
  return {
    autoResizeDimensions: {
      dimensions: {
        sheetId,
        dimension: "ROWS",
        startIndex,
        endIndex,
      },
    },
  };
}

function readableDataRows(
  sheetId: number,
  endRowIndex: number,
  columnCount: number,
) {
  if (endRowIndex <= 4) {
    return [];
  }

  return [
    formatCells(sheetId, 4, endRowIndex, 0, columnCount, {
      verticalAlignment: "TOP",
      wrapStrategy: "WRAP",
    }),
    autoResizeRows(sheetId, 4, endRowIndex),
  ];
}

function setValidation(
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number,
  condition: Record<string, unknown>,
) {
  return {
    setDataValidation: {
      range: range(
        sheetId,
        startRowIndex,
        endRowIndex,
        startColumnIndex,
        endColumnIndex,
      ),
      rule: {
        condition,
        strict: true,
        showCustomUi: true,
      },
    },
  };
}

function protectWarning(
  sheetId: number,
  startRowIndex: number,
  endRowIndex: number,
  startColumnIndex: number,
  endColumnIndex: number,
  description: string,
) {
  return {
    addProtectedRange: {
      protectedRange: {
        range: range(
          sheetId,
          startRowIndex,
          endRowIndex,
          startColumnIndex,
          endColumnIndex,
        ),
        description,
        warningOnly: true,
      },
    },
  };
}

function toColumnLetter(columnIndex: number) {
  let current = columnIndex + 1;
  let result = "";

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
}

function a1(rowIndex: number, columnIndex: number, absolute = false) {
  const column = toColumnLetter(columnIndex);
  const rowNumber = rowIndex + 1;
  return absolute ? `$${column}$${rowNumber}` : `${column}${rowNumber}`;
}

function orBlank(references: string[]) {
  return `OR(${references.map((reference) => `${reference}=""`).join(";")})`;
}

function buildOperationalWorkbookV2Identity(
  blueprint: OperationalWorkbookV2Blueprint,
): OperationalWorkbookV2Identity {
  return {
    assetRevision: blueprint.assetRevision,
    systemSlug: blueprint.systemSlug,
    variant: blueprint.variant,
    workbookVersion: blueprint.workbookVersion,
  };
}

function identityMetadata(
  identity: OperationalWorkbookV2Identity,
) {
  return [
    {
      key: IDENTITY_METADATA_KEYS.systemSlug,
      location: { spreadsheet: true },
      value: identity.systemSlug,
      visibility: "DOCUMENT",
    },
    {
      key: IDENTITY_METADATA_KEYS.variant,
      location: { spreadsheet: true },
      value: identity.variant,
      visibility: "DOCUMENT",
    },
    {
      key: IDENTITY_METADATA_KEYS.workbookVersion,
      location: { spreadsheet: true },
      value: identity.workbookVersion,
      visibility: "DOCUMENT",
    },
    {
      key: IDENTITY_METADATA_KEYS.assetRevision,
      location: { spreadsheet: true },
      value: identity.assetRevision,
      visibility: "DOCUMENT",
    },
  ];
}

function hasExpectedIdentityMetadata(
  entries: OperationalWorkbookV2SheetPreflight["developerMetadata"],
  expectedIdentity: OperationalWorkbookV2Identity,
) {
  const identityKeys = new Set<string>(
    Object.values(IDENTITY_METADATA_KEYS),
  );
  const identityEntries = entries.filter((entry) =>
    identityKeys.has(entry.key),
  );
  const metadata = new Map(
    identityEntries.map((entry) => [entry.key, entry.value]),
  );

  return (
    identityEntries.length ===
      Object.keys(IDENTITY_METADATA_KEYS).length &&
    metadata.size === Object.keys(IDENTITY_METADATA_KEYS).length &&
    identityEntries.every(
      (entry) =>
        entry.location.spreadsheet === true &&
        entry.location.sheetId === undefined &&
        entry.location.dimensionRange === undefined &&
        entry.visibility === "DOCUMENT",
    ) &&
    identityMetadata(expectedIdentity).every(
      (entry) => metadata.get(entry.key) === entry.value,
    )
  );
}

type CanonicalJson =
  | boolean
  | null
  | number
  | string
  | CanonicalJson[]
  | { [key: string]: CanonicalJson };

function canonicalizeJson(value: unknown, path = "$"): CanonicalJson {
  if (
    value === undefined ||
    typeof value === "function" ||
    typeof value === "symbol" ||
    typeof value === "bigint"
  ) {
    throw new Error(
      `Payload JSON non canonique à ${path} : type interdit.`,
    );
  }

  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(
        `Payload JSON non canonique à ${path} : nombre non fini.`,
      );
    }
    return value;
  }

  if (Array.isArray(value)) {
    return Array.from({ length: value.length }, (_, index) => {
      if (!(index in value)) {
        throw new Error(
          `Payload JSON non canonique à ${path}[${index}] : tableau sparse.`,
        );
      }
      return canonicalizeJson(value[index], `${path}[${index}]`);
    });
  }

  if (value instanceof Date) {
    throw new Error(
      `Payload JSON non canonique à ${path} : Date interdite.`,
    );
  }

  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error(
      `Payload JSON non canonique à ${path} : objet non simple.`,
    );
  }

  if (Object.getOwnPropertySymbols(value).length > 0) {
    throw new Error(
      `Payload JSON non canonique à ${path} : clé Symbol interdite.`,
    );
  }

  const record = value as Record<string, unknown>;
  const canonical = Object.create(null) as {
    [key: string]: CanonicalJson;
  };
  for (const key of Object.keys(record).sort()) {
    if (key === "__proto__") {
      throw new Error(
        `Payload JSON non canonique à ${path} : clé __proto__ interdite.`,
      );
    }
    canonical[key] = canonicalizeJson(record[key], `${path}.${key}`);
  }
  return canonical;
}

function canonicalJsonString(value: unknown) {
  return JSON.stringify(canonicalizeJson(value));
}

function fingerprint(value: unknown) {
  return createHash("sha256").update(canonicalJsonString(value)).digest("hex");
}

function operationalWorkbookTitle(
  blueprint: OperationalWorkbookV2Blueprint,
) {
  const canonicalSystemName =
    getOperationalWorkbookV2CanonicalSystemName(blueprint.systemSlug);
  if (blueprint.systemName !== canonicalSystemName) {
    throw new Error(
      `Identité du blueprint incohérente : ${blueprint.systemSlug} doit utiliser le nom canonique ${canonicalSystemName}.`,
    );
  }

  return blueprint.variant === "demo"
    ? `Démonstration - Système opérationnel - ${canonicalSystemName}`
    : `Système opérationnel modifiable - ${canonicalSystemName}`;
}

function normalizePreflightForFingerprint(
  preflight: OperationalWorkbookV2PreflightInput,
) {
  return {
    developerMetadata: [...preflight.developerMetadata]
      .map((entry) => ({
        key: entry.key,
        location: {
          dimensionRange: entry.location.dimensionRange ?? null,
          sheetId: entry.location.sheetId ?? null,
          spreadsheet: entry.location.spreadsheet === true,
        },
        value: entry.value,
        visibility: entry.visibility,
      }))
      .sort((left, right) => left.key.localeCompare(right.key)),
    revisionToken: preflight.revisionToken,
    sheets: [...preflight.sheets]
      .map((sheet) => ({
        columnCount: sheet.columnCount ?? null,
        frozenRowCount: sheet.frozenRowCount ?? null,
        index: sheet.index,
        rowCount: sheet.rowCount ?? null,
        sheetId: sheet.sheetId,
        title: sheet.title,
      }))
      .sort((left, right) => left.sheetId - right.sheetId),
    spreadsheetId: preflight.spreadsheetId,
    spreadsheetTitle: preflight.spreadsheetTitle,
  };
}

export function sealOperationalWorkbookV2Preflight(
  preflight: OperationalWorkbookV2PreflightInput,
): OperationalWorkbookV2SheetPreflight {
  const stateFingerprint = createHash("sha256")
    .update(
      JSON.stringify(normalizePreflightForFingerprint(preflight)),
    )
    .digest("hex");
  return { ...preflight, stateFingerprint };
}

function hasValidPreflightFingerprint(
  preflight: OperationalWorkbookV2SheetPreflight,
) {
  const input: OperationalWorkbookV2PreflightInput = {
    capturedAt: preflight.capturedAt,
    developerMetadata: preflight.developerMetadata,
    revisionToken: preflight.revisionToken,
    sheets: preflight.sheets,
    spreadsheetId: preflight.spreadsheetId,
    spreadsheetTitle: preflight.spreadsheetTitle,
  };
  return (
    preflight.stateFingerprint ===
    sealOperationalWorkbookV2Preflight(input).stateFingerprint
  );
}

function assertOperationalWorkbookV2ApplicationPreflightFreshness(
  guard: OperationalWorkbookV2ApplicationGuard,
  freshPreflight: OperationalWorkbookV2SheetPreflight,
) {
  if (
    !hasValidPreflightFingerprint(freshPreflight) ||
    freshPreflight.spreadsheetId !== guard.spreadsheetId ||
    freshPreflight.spreadsheetTitle !==
      guard.preflightSpreadsheetTitle ||
    freshPreflight.revisionToken !== guard.preflightRevisionToken ||
    freshPreflight.stateFingerprint !==
      guard.preflightStateFingerprint
  ) {
    throw new Error(
      "Préflight obsolète : relire le classeur avant application.",
    );
  }

  return true;
}

function requestIdentityMetadata(
  requests: ReadonlyArray<unknown>,
  sourceEntries: OperationalWorkbookV2SheetPreflight["developerMetadata"],
) {
  const entries = sourceEntries.map((entry) => ({
    ...entry,
    location: { ...entry.location },
  }));

  for (const request of requests) {
    const typedRequest = request as {
      createDeveloperMetadata?: {
        developerMetadata?: {
          metadataKey?: string;
          metadataValue?: string;
          location?: {
            dimensionRange?: unknown;
            sheetId?: number;
            spreadsheet?: boolean;
          };
          visibility?: string;
        };
      };
      updateDeveloperMetadata?: {
        dataFilters?: Array<{
          developerMetadataLookup?: {
            locationType?: string;
            metadataKey?: string;
            visibility?: string;
          };
        }>;
        developerMetadata?: {
          metadataValue?: string;
        };
        fields?: string;
      };
    };
    const created =
      typedRequest.createDeveloperMetadata?.developerMetadata;

    if (
      created?.metadataKey &&
      created.metadataValue &&
      created.location &&
      created.visibility
    ) {
      entries.push({
        key: created.metadataKey,
        location: created.location,
        value: created.metadataValue,
        visibility: created.visibility,
      });
    }

    const updated = typedRequest.updateDeveloperMetadata;
    const lookup =
      updated?.dataFilters?.length === 1
        ? updated.dataFilters[0]?.developerMetadataLookup
        : undefined;
    if (
      lookup?.metadataKey &&
      lookup.locationType === "SPREADSHEET" &&
      lookup.visibility === "DOCUMENT" &&
      updated?.developerMetadata?.metadataValue &&
      updated.fields === "metadataValue"
    ) {
      for (const entry of entries) {
        if (
          entry.key === lookup.metadataKey &&
          entry.location.spreadsheet === true &&
          entry.visibility === lookup.visibility
        ) {
          entry.value = updated.developerMetadata.metadataValue;
        }
      }
    }
  }

  return entries;
}

function sealOperationalWorkbookV2ApplicationPlan(
  guardInput: Omit<OperationalWorkbookV2ApplicationGuard, "requestsFingerprint">,
  requests: ReadonlyArray<unknown>,
  summary: OperationalWorkbookV2ApplicationPlan["summary"],
): OperationalWorkbookV2ApplicationPlan {
  const canonicalRequests = canonicalizeJson(requests);
  if (!Array.isArray(canonicalRequests)) {
    throw new Error("Le batch canonique doit être un tableau.");
  }
  const applicationGuard: OperationalWorkbookV2ApplicationGuard = {
    ...guardInput,
    requestsFingerprint: fingerprint(canonicalRequests),
  };
  const envelope = {
    applicableOnlyAfter:
      "assertOperationalWorkbookV2ApplicationPlan" as const,
    applicationGuard,
    kind: "demaa.operational-workbook-v2.sealed-plan" as const,
    summary,
  };

  return canonicalizeJson({
    ...envelope,
    planFingerprint: fingerprint(envelope),
    requests: canonicalRequests,
  }) as unknown as OperationalWorkbookV2ApplicationPlan;
}

export function assertOperationalWorkbookV2ApplicationPlan(
  plan: OperationalWorkbookV2ApplicationPlan,
  freshPreflight: OperationalWorkbookV2SheetPreflight,
) {
  let canonicalRequests: CanonicalJson;
  try {
    canonicalRequests = canonicalizeJson(plan.requests);
  } catch {
    throw new Error(
      "Plan scellé invalide : payload JSON non canonique.",
    );
  }
  const envelope = {
    applicableOnlyAfter: plan.applicableOnlyAfter,
    applicationGuard: plan.applicationGuard,
    kind: plan.kind,
    summary: plan.summary,
  };
  const targetIdentity = plan.applicationGuard.targetIdentity;
  const summaryMatchesTarget =
    plan.summary.assetRevision === targetIdentity.assetRevision &&
    plan.summary.systemSlug === targetIdentity.systemSlug &&
    plan.summary.variant === targetIdentity.variant &&
    plan.summary.workbookVersion === targetIdentity.workbookVersion;
  const actionMatchesRequests =
    (plan.summary.action === "already-applied" &&
      plan.requests.length === 0) ||
    ((plan.summary.action === "rebuilt-from-v1" ||
      plan.summary.action === "repaired-from-v2") &&
      plan.requests.length > 0);
  const identityEntries =
    plan.requests.length === 0
      ? freshPreflight.developerMetadata
      : requestIdentityMetadata(
          plan.requests,
          freshPreflight.developerMetadata,
        );

  if (
    plan.kind !== "demaa.operational-workbook-v2.sealed-plan" ||
    plan.applicableOnlyAfter !==
      "assertOperationalWorkbookV2ApplicationPlan" ||
    plan.applicationGuard.requestsFingerprint !==
      fingerprint(canonicalRequests) ||
    plan.planFingerprint !== fingerprint(envelope) ||
    !summaryMatchesTarget ||
    !actionMatchesRequests ||
    !hasExpectedIdentityMetadata(identityEntries, targetIdentity)
  ) {
    throw new Error(
      "Plan scellé invalide : identité ou empreinte du batch incohérente.",
    );
  }

  assertOperationalWorkbookV2ApplicationPreflightFreshness(
    plan.applicationGuard,
    freshPreflight,
  );

  return true;
}

export function serializeOperationalWorkbookV2ApplicationPlan(
  plan: OperationalWorkbookV2ApplicationPlan,
) {
  return canonicalJsonString(plan);
}

function buildAssumptionRows(
  blueprint: OperationalWorkbookV2Blueprint,
): {
  layout: AssumptionLayout;
  rows: CellValue[][];
} {
  const assumptions =
    blueprint.variant === "demo"
      ? blueprint.financialProfile.demoAssumptions
      : null;
  const rows: CellValue[][] = [["Hypothèse", "Valeur", "Unité"]];
  const value = (demoValue: number) =>
    assumptions === null ? "" : demoValue;
  const layout = {} as AssumptionLayout;

  layout.averageRevenuePerUnit = rows.length + 3;
  rows.push([
    "Revenu moyen par unité d’activité",
    value(blueprint.financialProfile.demoAssumptions.averageRevenuePerUnit),
    "€ HT",
  ]);

  layout.variableCostDrivers = [];
  for (const driver of blueprint.financialProfile.demoAssumptions
    .variableCostDrivers) {
    layout.variableCostDrivers.push(rows.length + 3);
    rows.push([`Taux variable - ${driver.label}`, value(driver.rate), "% du CA"]);
  }
  layout.totalVariableCostRate = rows.length + 3;
  const firstVariableRate = a1(
    layout.variableCostDrivers[0],
    15,
  );
  const lastVariableRate = a1(
    layout.variableCostDrivers[
      layout.variableCostDrivers.length - 1
    ],
    15,
  );
  rows.push([
    "Total des taux variables (strictement inférieur à 90 %)",
    formula(
      `=IF(COUNTA(${firstVariableRate}:${lastVariableRate})=0;"";SUM(${firstVariableRate}:${lastVariableRate}))`,
    ),
    "Alerte au-delà de 90 %",
  ]);

  layout.monthlyFixedCosts = [];
  for (const cost of blueprint.financialProfile.demoAssumptions
    .monthlyFixedCosts) {
    layout.monthlyFixedCosts.push(rows.length + 3);
    rows.push([`Charge fixe - ${cost.label}`, value(cost.value), "€ / mois"]);
  }

  const pushAssumption = (
    key:
      | "openingCash"
      | "openingReceivables"
      | "openingPayables"
      | "openingVatPayable"
      | "customerCollectionDelayMonths"
      | "supplierPaymentDelayMonths"
      | "averageVatRate"
      | "monthlyDebtService"
      | "investmentPerMonth",
    label: string,
    demoValue: number,
    unit: string,
  ) => {
    layout[key] = rows.length + 3;
    rows.push([label, value(demoValue), unit]);
  };
  const demo = blueprint.financialProfile.demoAssumptions;
  pushAssumption("openingCash", "Trésorerie d’ouverture", demo.openingCash, "€");
  pushAssumption(
    "openingReceivables",
    "Créances clients à encaisser",
    demo.openingReceivables,
    "€ TTC",
  );
  pushAssumption(
    "openingPayables",
    "Dettes fournisseurs à payer",
    demo.openingPayables,
    "€ TTC",
  );
  pushAssumption(
    "openingVatPayable",
    "TVA d’ouverture à décaisser",
    demo.openingVatPayable,
    "€",
  );
  pushAssumption(
    "customerCollectionDelayMonths",
    "Décalage d’encaissement client",
    demo.customerCollectionDelayMonths,
    "0 ou 1 mois",
  );
  pushAssumption(
    "supplierPaymentDelayMonths",
    "Décalage de paiement fournisseur",
    demo.supplierPaymentDelayMonths,
    "0 ou 1 mois",
  );
  pushAssumption(
    "averageVatRate",
    "Taux moyen de TVA",
    demo.averageVatRate,
    "%",
  );
  pushAssumption(
    "monthlyDebtService",
    "Remboursements d’emprunts",
    demo.monthlyDebtService,
    "€ / mois",
  );
  pushAssumption(
    "investmentPerMonth",
    "Investissements planifiés",
    demo.investmentPerMonth,
    "€ / mois",
  );

  return { layout, rows };
}

function buildForecastRows(
  blueprint: OperationalWorkbookV2Blueprint,
  assumptions: AssumptionLayout,
) {
  const variableDrivers =
    blueprint.financialProfile.demoAssumptions.variableCostDrivers;
  const fixedCosts =
    blueprint.financialProfile.demoAssumptions.monthlyFixedCosts;
  const rows: CellValue[][] = [
    [`PRÉVISIONNEL FINANCIER - ${blueprint.systemName.toUpperCase()}`],
    [
      blueprint.variant === "demo"
        ? "Scénario fictif explicite : remplacez toutes les hypothèses par les données de l’entreprise."
        : "Saisissez les volumes et toutes les hypothèses visibles. Les calculs restent vides tant que la saisie est incomplète.",
    ],
    [],
    ["Indicateur", ...blueprint.forecastPeriods.map((period) => period.label)],
    [
      "Nature des données",
      ...blueprint.forecastPeriods.map((period) => period.status),
    ],
    [
      `${blueprint.financialProfile.activityDriver.label} (${blueprint.financialProfile.activityDriver.unit})`,
      ...blueprint.forecastPeriods.map((period) => period.activityVolume ?? ""),
    ],
    [],
    ["Chiffre d’affaires HT"],
    ["Coûts variables"],
  ];
  const layout = {} as ForecastLayout;
  layout.activity = 5;
  layout.revenue = 7;
  layout.variableCosts = [];

  for (const driver of variableDrivers) {
    layout.variableCosts.push(rows.length);
    rows.push([driver.label]);
  }

  rows.push(["Charges fixes"]);
  layout.fixedCosts = [];
  for (const cost of fixedCosts) {
    layout.fixedCosts.push(rows.length);
    rows.push([cost.label]);
  }

  layout.operatingResult = rows.length;
  rows.push(["Résultat d’exploitation"]);
  layout.operatingMargin = rows.length;
  rows.push(["Marge d’exploitation"]);
  rows.push(["Pont de trésorerie simplifié"]);
  rows.push([
    "Limite : la TVA récupérable sur les charges fixes n’est pas modélisée.",
  ]);
  layout.customerReceipts = rows.length;
  rows.push(["Encaissements clients TTC"]);
  layout.supplierPayments = rows.length;
  rows.push(["Paiements fournisseurs TTC"]);
  layout.fixedPayments = rows.length;
  rows.push(["Décaissements de charges fixes"]);
  layout.vatSettlement = rows.length;
  rows.push(["TVA décaissée"]);
  layout.debtService = rows.length;
  rows.push(["Remboursements d’emprunts"]);
  layout.investment = rows.length;
  rows.push(["Investissements"]);
  layout.netCashMovement = rows.length;
  rows.push(["Variation nette de trésorerie"]);
  layout.openingCash = rows.length;
  rows.push(["Trésorerie d’ouverture"]);
  layout.closingCash = rows.length;
  rows.push(["Trésorerie de clôture"]);

  for (const values of rows) {
    while (values.length < 13) values.push("");
  }

  for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
    const columnIndex = monthIndex + 1;
    const revenue = a1(layout.revenue, columnIndex);
    const activity = a1(layout.activity, columnIndex);
    const averageRevenue = a1(assumptions.averageRevenuePerUnit, 15, true);
    rows[layout.revenue][columnIndex] = formula(
      `=IF(${orBlank([activity, averageRevenue])};"";${activity}*${averageRevenue})`,
    );

    for (const [driverIndex, rowIndex] of layout.variableCosts.entries()) {
      const rate = a1(
        assumptions.variableCostDrivers[driverIndex],
        15,
        true,
      );
      rows[rowIndex][columnIndex] = formula(
        `=IF(${orBlank([revenue, rate])};"";${revenue}*${rate})`,
      );
    }

    for (const [costIndex, rowIndex] of layout.fixedCosts.entries()) {
      const fixedCost = a1(
        assumptions.monthlyFixedCosts[costIndex],
        15,
        true,
      );
      rows[rowIndex][columnIndex] = formula(
        `=IF(${fixedCost}="";"";${fixedCost})`,
      );
    }

    const variableReferences = layout.variableCosts.map((rowIndex) =>
      a1(rowIndex, columnIndex),
    );
    const fixedReferences = layout.fixedCosts.map((rowIndex) =>
      a1(rowIndex, columnIndex),
    );
    const operatingResult = a1(layout.operatingResult, columnIndex);
    rows[layout.operatingResult][columnIndex] = formula(
      `=IF(${orBlank([revenue, ...variableReferences, ...fixedReferences])};"";${revenue}-SUM(${variableReferences.join(";")})-SUM(${fixedReferences.join(";")}))`,
    );
    rows[layout.operatingMargin][columnIndex] = formula(
      `=IF(OR(${operatingResult}="";${revenue}=0);"";${operatingResult}/${revenue})`,
    );

    const vatRate = a1(assumptions.averageVatRate, 15, true);
    const customerDelay = a1(
      assumptions.customerCollectionDelayMonths,
      15,
      true,
    );
    const supplierDelay = a1(
      assumptions.supplierPaymentDelayMonths,
      15,
      true,
    );
    const openingReceivables = a1(
      assumptions.openingReceivables,
      15,
      true,
    );
    const openingPayables = a1(assumptions.openingPayables, 15, true);
    const openingVatPayable = a1(
      assumptions.openingVatPayable,
      15,
      true,
    );
    const currentVariableSum = `SUM(${variableReferences.join(";")})`;
    const previousRevenue =
      monthIndex === 0 ? null : a1(layout.revenue, columnIndex - 1);
    const previousVariableReferences =
      monthIndex === 0
        ? []
        : layout.variableCosts.map((rowIndex) =>
            a1(rowIndex, columnIndex - 1),
          );
    const previousDeductibleReferences =
      monthIndex === 0
        ? []
        : layout.variableCosts
            .filter((_, driverIndex) => variableDrivers[driverIndex].vatDeductible)
            .map((rowIndex) => a1(rowIndex, columnIndex - 1));
    const customerBase =
      monthIndex === 0
        ? openingReceivables
        : `${previousRevenue}*(1+${vatRate})`;
    const supplierBase =
      monthIndex === 0
        ? openingPayables
        : `SUM(${previousVariableReferences.join(";")})*(1+${vatRate})`;
    const receipts = a1(layout.customerReceipts, columnIndex);
    const supplierPayments = a1(layout.supplierPayments, columnIndex);
    const fixedPayments = a1(layout.fixedPayments, columnIndex);
    const vatSettlement = a1(layout.vatSettlement, columnIndex);
    const debtService = a1(assumptions.monthlyDebtService, 15, true);
    const investment = a1(assumptions.investmentPerMonth, 15, true);
    const debtPayment = a1(layout.debtService, columnIndex);
    const investmentPayment = a1(layout.investment, columnIndex);
    const netMovement = a1(layout.netCashMovement, columnIndex);
    const openingCash = a1(layout.openingCash, columnIndex);

    rows[layout.customerReceipts][columnIndex] = formula(
      `=IF(${orBlank([customerDelay, vatRate, revenue, openingReceivables])};"";IF(${customerDelay}=0;${revenue}*(1+${vatRate});${customerBase}))`,
    );
    rows[layout.supplierPayments][columnIndex] = formula(
      `=IF(${orBlank([supplierDelay, vatRate, ...variableReferences, openingPayables])};"";IF(${supplierDelay}=0;${currentVariableSum}*(1+${vatRate});${supplierBase}))`,
    );
    rows[layout.fixedPayments][columnIndex] = formula(
      `=IF(${orBlank(fixedReferences)};"";SUM(${fixedReferences.join(";")}))`,
    );
    const vatFormula =
      monthIndex === 0
        ? openingVatPayable
        : `MAX(0;${previousRevenue}*${vatRate}-SUM(${previousDeductibleReferences.join(";")})*${vatRate})`;
    rows[layout.vatSettlement][columnIndex] = formula(
      `=IF(${orBlank([
        vatRate,
        openingVatPayable,
        ...(monthIndex === 0
          ? []
          : [previousRevenue as string, ...previousDeductibleReferences]),
      ])};"";${vatFormula})`,
    );
    rows[layout.debtService][columnIndex] = formula(
      `=IF(${debtService}="";"";${debtService})`,
    );
    rows[layout.investment][columnIndex] = formula(
      `=IF(${investment}="";"";${investment})`,
    );
    rows[layout.netCashMovement][columnIndex] = formula(
      `=IF(${orBlank([
        receipts,
        supplierPayments,
        fixedPayments,
        vatSettlement,
        debtPayment,
        investmentPayment,
      ])};"";${receipts}-${supplierPayments}-${fixedPayments}-${vatSettlement}-${debtPayment}-${investmentPayment})`,
    );
    const openingCashAssumption = a1(assumptions.openingCash, 15, true);
    rows[layout.openingCash][columnIndex] = formula(
      monthIndex === 0
        ? `=IF(${openingCashAssumption}="";"";${openingCashAssumption})`
        : `=IF(${a1(layout.closingCash, columnIndex - 1)}="";"";${a1(layout.closingCash, columnIndex - 1)})`,
    );
    rows[layout.closingCash][columnIndex] = formula(
      `=IF(${orBlank([openingCash, netMovement])};"";${openingCash}+${netMovement})`,
    );
  }

  return { layout, rows };
}

function sheetDefinition(
  sheetId: number,
  title: string,
  index: number,
  rowCount: number,
  columnCount: number,
  frozenRowCount = 4,
) {
  return {
    addSheet: {
      properties: {
        sheetId,
        title,
        index,
        gridProperties: {
          rowCount,
          columnCount,
          frozenRowCount,
        },
      },
    },
  };
}

export function buildOperationalWorkbookV2ExpectedV1Preflight(
  blueprint: OperationalWorkbookV2Blueprint,
  input: {
    capturedAt?: string;
    revisionToken?: string;
    spreadsheetId?: string;
  } = {},
): OperationalWorkbookV2SheetPreflight {
  return sealOperationalWorkbookV2Preflight({
    capturedAt: input.capturedAt ?? "2026-07-29T00:00:00.000Z",
    developerMetadata: [],
    revisionToken: input.revisionToken ?? "fixture-v1-revision",
    sheets: OPERATIONAL_WORKBOOK_V1_SHEET_DEFINITIONS.map(
      ([key, title, index]) => ({
        index,
        sheetId: CANONICAL_OPERATIONAL_WORKBOOK_SHEET_IDS[key],
        title,
      }),
    ),
    spreadsheetId: input.spreadsheetId ?? "fixture-v1-spreadsheet",
    spreadsheetTitle: operationalWorkbookTitle(blueprint),
  });
}

export function buildOperationalWorkbookV2ExpectedAppliedPreflight(
  blueprint: OperationalWorkbookV2Blueprint,
  input: {
    capturedAt?: string;
    revisionToken?: string;
    spreadsheetId?: string;
  } = {},
): OperationalWorkbookV2SheetPreflight {
  return sealOperationalWorkbookV2Preflight({
    capturedAt: input.capturedAt ?? "2026-07-29T00:01:00.000Z",
    developerMetadata: identityMetadata(
      buildOperationalWorkbookV2Identity(blueprint),
    ),
    revisionToken: input.revisionToken ?? "fixture-v2-revision",
    sheets: OPERATIONAL_WORKBOOK_V2_SHEET_DEFINITIONS.map(
      ([key, title, index, rowCount, columnCount]) => ({
        columnCount,
        frozenRowCount: 4,
        index,
        rowCount,
        sheetId: OPERATIONAL_WORKBOOK_V2_SHEET_IDS[key],
        title,
      }),
    ),
    spreadsheetId: input.spreadsheetId ?? "fixture-v1-spreadsheet",
    spreadsheetTitle: operationalWorkbookTitle(blueprint),
  });
}

export function classifyOperationalWorkbookV2SheetState(
  preflight: OperationalWorkbookV2SheetPreflight,
  expectedIdentity: OperationalWorkbookV2Identity,
  expectedSpreadsheetTitle: string,
): OperationalWorkbookV2SheetState {
  if (
    !hasValidPreflightFingerprint(preflight) ||
    preflight.sheets.length !== 7 ||
    preflight.spreadsheetTitle !== expectedSpreadsheetTitle
  ) {
    return "unknown";
  }

  const byId = new Map(
    preflight.sheets.map((sheet) => [sheet.sheetId, sheet]),
  );
  const isV1 = OPERATIONAL_WORKBOOK_V1_SHEET_DEFINITIONS.every(
    ([key, title, index]) => {
      const sheet =
        byId.get(CANONICAL_OPERATIONAL_WORKBOOK_SHEET_IDS[key]);
      return sheet?.title === title && sheet.index === index;
    },
  );
  const identityKeys = new Set<string>(
    Object.values(IDENTITY_METADATA_KEYS),
  );
  const hasIdentityMetadata = preflight.developerMetadata.some(
    (entry) => identityKeys.has(entry.key),
  );
  if (isV1 && !hasIdentityMetadata) {
    return "v1";
  }

  const isV2 = OPERATIONAL_WORKBOOK_V2_SHEET_DEFINITIONS.every(
    ([key, title, index, rowCount, columnCount]) => {
      const sheet = byId.get(OPERATIONAL_WORKBOOK_V2_SHEET_IDS[key]);
      return (
        sheet?.title === title &&
        sheet.index === index &&
        sheet.rowCount === rowCount &&
        sheet.columnCount === columnCount &&
        sheet.frozenRowCount === 4
      );
    },
  );
  if (!isV2) {
    return "unknown";
  }

  if (
    hasExpectedIdentityMetadata(
      preflight.developerMetadata,
      expectedIdentity,
    )
  ) {
    return "already-v2";
  }

  return hasExpectedIdentityMetadata(
    preflight.developerMetadata,
    {
      ...expectedIdentity,
      assetRevision:
        OPERATIONAL_WORKBOOK_V2_PREVIOUS_ASSET_REVISION,
    },
  )
    ? "repairable-v2"
    : "unknown";
}

function standardSheetRequests(
  sheetId: number,
  columnCount: number,
  headerRowIndex: number,
) {
  return [
    formatCells(sheetId, 0, 1, 0, columnCount, {
      backgroundColor: TITLE_BACKGROUND,
      textFormat: {
        foregroundColor: WHITE,
        bold: true,
        fontSize: 14,
      },
      verticalAlignment: "MIDDLE",
    }),
    formatCells(sheetId, headerRowIndex, headerRowIndex + 1, 0, columnCount, {
      backgroundColor: HEADER_BACKGROUND,
      textFormat: { foregroundColor: DARK_GREEN, bold: true },
      wrapStrategy: "WRAP",
    }),
    protectWarning(
      sheetId,
      0,
      headerRowIndex + 1,
      0,
      columnCount,
      "Structure v2 - modifier avec prudence",
    ),
  ];
}

function buildSummaryRows(
  blueprint: OperationalWorkbookV2Blueprint,
  forecastLayout: ForecastLayout,
) {
  const firstMonthRevenue =
    `'Prévisionnel financier'!${a1(forecastLayout.revenue, 1)}`;
  const lastMonthClosingCash =
    `'Prévisionnel financier'!${a1(
      forecastLayout.closingCash,
      blueprint.forecastPeriods.length,
    )}`;

  return [
    [`${blueprint.systemName.toUpperCase()} - SYSTÈME OPÉRATIONNEL`],
    [
      blueprint.variant === "demo"
        ? "Démonstration fictive à remplacer par les données réelles de l’entreprise."
        : "Classeur personnel : commencez par renseigner les hypothèses du Prévisionnel financier.",
    ],
    [],
    ["Repère", "Valeur", "Statut", "Source"],
    ["Version du classeur", blueprint.workbookVersion, "Pilote", "D-061"],
    ["Révision des ressources", blueprint.assetRevision, "Pilote", "D-061"],
    ["Routines dirigeantes", blueprint.routineRows.length, "Structuré", "Process"],
    ["Actions prioritaires", blueprint.actionRows.length, "À adapter", "Actions"],
    [
      "CA du premier mois",
      formula(
        `=IF(${firstMonthRevenue}="";"";${firstMonthRevenue})`,
      ),
      blueprint.variant === "demo" ? "Scénario démo" : "À renseigner",
      "Prévisionnel financier",
    ],
    [
      "Trésorerie de clôture à 12 mois",
      formula(
        `=IF(${lastMonthClosingCash}="";"";${lastMonthClosingCash})`,
      ),
      blueprint.variant === "demo" ? "Scénario démo" : "À renseigner",
      "Prévisionnel financier",
    ],
  ] satisfies CellValue[][];
}

function buildSimpleSheetValues(blueprint: OperationalWorkbookV2Blueprint) {
  const titles = {
    actions: `ACTIONS - ${blueprint.systemName.toUpperCase()}`,
    team: `ÉQUIPE - ${blueprint.systemName.toUpperCase()}`,
    ecosystem: `ÉCOSYSTÈME - ${blueprint.systemName.toUpperCase()}`,
    calendar: `CALENDRIER MARKETING - ${blueprint.systemName.toUpperCase()}`,
    process: `PROCESS - ${blueprint.systemName.toUpperCase()}`,
  };
  const notice =
    blueprint.variant === "demo"
      ? "Scénario fictif à personnaliser."
      : "Renseignez uniquement les données réelles de l’entreprise.";

  return {
    actions: [
      [titles.actions],
      [notice],
      [],
      [
        "Projet",
        "Action",
        "Responsable",
        "Support",
        "Priorité",
        "Début",
        "Échéance",
        "Statut",
        "Destination",
        "Notes",
      ],
      ...blueprint.actionRows.map((entry) => [
        entry.project,
        entry.action,
        entry.owner,
        entry.support,
        entry.priority,
        entry.start,
        entry.due,
        entry.status,
        entry.destination,
        entry.notes,
      ]),
    ],
    team: [
      [titles.team],
      [notice],
      [],
      [
        "Personne",
        "Rôle",
        "Statut",
        "Responsable hiérarchique",
        "Site",
        "Responsabilité",
        "Modes opératoires",
        "Notes",
      ],
      ...blueprint.teamRows.map((entry) => [
        entry.person,
        entry.role,
        entry.status,
        entry.manager,
        entry.site,
        entry.responsibility,
        entry.operatingModes,
        entry.notes,
      ]),
    ],
    ecosystem: [
      [titles.ecosystem],
      [notice],
      [],
      ["Catégorie", "Nom", "Utilisation", "Contact", "Document / accès"],
      ...blueprint.ecosystemRows.map((entry) => [
        entry.category,
        entry.name,
        entry.usage,
        entry.contact,
        entry.documentOrAccess
          ? hyperlink(entry.documentOrAccess)
          : "",
      ]),
    ],
    calendar: [
      [titles.calendar],
      [
        blueprint.calendarRows.length === 0
          ? "Aucune action marketing dédiée validée pour ce pilote."
          : notice,
      ],
      [],
      [
        "Période",
        "Catégorie",
        "Action",
        "Canal",
        "Responsable",
        "Statut",
        "Notes",
      ],
      ...blueprint.calendarRows.map((entry) => [
        entry.timing,
        entry.category,
        entry.action,
        entry.channel,
        entry.owner,
        entry.status,
        entry.notes,
      ]),
    ],
    process: [
      [titles.process],
      [
        "Routines simplifiées issues des 74 contenus sources. Les liens apparaissent uniquement lorsqu’un support réel est validé.",
      ],
      [],
      ["Process", "Fréquence", "Lien document", "Notes"],
      ...blueprint.routineRows.map((routine) => [
        routine.title,
        routine.frequency,
        routine.support ? hyperlink(routine.support.url) : "",
        routine.bullets.join(" • "),
      ]),
    ],
  } satisfies Record<Exclude<SheetKey, "summary" | "forecast">, CellValue[][]>;
}

function buildOperationalWorkbookV2ReadabilityRequests(
  simpleValues: ReturnType<typeof buildSimpleSheetValues>,
) {
  return [
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions, 0, 1, 300),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions, 1, 2, 360),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions, 2, 3, 230),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions, 3, 4, 160),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions, 4, 5, 100),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions, 5, 7, 115),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions, 7, 8, 125),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions, 8, 9, 300),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions, 9, 10, 260),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.team, 0, 1, 180),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.team, 1, 2, 210),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.team, 2, 3, 125),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.team, 3, 4, 210),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.team, 4, 5, 160),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.team, 5, 7, 330),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.team, 7, 8, 260),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.ecosystem, 0, 1, 220),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.ecosystem, 1, 2, 230),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.ecosystem, 2, 3, 380),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.ecosystem, 3, 4, 180),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.ecosystem, 4, 5, 150),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.calendar, 0, 1, 170),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.calendar, 1, 2, 170),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.calendar, 2, 3, 340),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.calendar, 3, 4, 190),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.calendar, 4, 5, 220),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.calendar, 5, 6, 125),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.calendar, 6, 7, 300),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.process, 0, 1, 320),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.process, 1, 2, 180),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.process, 2, 3, 150),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.process, 3, 4, 600),
    ...readableDataRows(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions,
      simpleValues.actions.length,
      10,
    ),
    ...readableDataRows(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.team,
      simpleValues.team.length,
      8,
    ),
    ...readableDataRows(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.ecosystem,
      simpleValues.ecosystem.length,
      5,
    ),
    ...readableDataRows(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.calendar,
      simpleValues.calendar.length,
      7,
    ),
    ...readableDataRows(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.process,
      simpleValues.process.length,
      4,
    ),
  ];
}

export function compileOperationalWorkbookV2ApplicationPlan(
  blueprint: OperationalWorkbookV2Blueprint,
  preflight: OperationalWorkbookV2SheetPreflight,
): OperationalWorkbookV2ApplicationPlan {
  if (!hasValidPreflightFingerprint(preflight)) {
    throw new Error(
      "Préflight invalide : empreinte du classeur incohérente.",
    );
  }
  const targetIdentity = buildOperationalWorkbookV2Identity(blueprint);
  const expectedSpreadsheetTitle = operationalWorkbookTitle(blueprint);
  const guardInput: Omit<
    OperationalWorkbookV2ApplicationGuard,
    "requestsFingerprint"
  > = {
    preflightRevisionToken: preflight.revisionToken,
    preflightStateFingerprint: preflight.stateFingerprint,
    preflightSpreadsheetTitle: preflight.spreadsheetTitle,
    spreadsheetId: preflight.spreadsheetId,
    targetIdentity,
  };
  const sourceState = classifyOperationalWorkbookV2SheetState(
    preflight,
    targetIdentity,
    expectedSpreadsheetTitle,
  );
  if (sourceState === "unknown") {
    throw new Error(
      "État du classeur inconnu : reconstruction v2 refusée.",
    );
  }

  if (sourceState === "already-v2") {
    return sealOperationalWorkbookV2ApplicationPlan(
      guardInput,
      [],
      {
        action: "already-applied" as const,
        assetRevision: blueprint.assetRevision,
        rebuiltSheets: OPERATIONAL_WORKBOOK_V2_SHEET_DEFINITIONS.map(
          ([, title]) => title,
        ),
        routines: blueprint.routineRows.length,
        schemaVersion: blueprint.schemaVersion,
        sourceContents: blueprint.sourceContentCount,
        systemSlug: blueprint.systemSlug,
        variant: blueprint.variant,
        workbookVersion: blueprint.workbookVersion,
      },
    );
  }

  const simpleValues = buildSimpleSheetValues(blueprint);
  if (sourceState === "repairable-v2") {
    const repairedSheets = [
      "Actions",
      "Équipe",
      "Écosystème",
      "Calendrier marketing",
      "Process",
    ];
    const requests: unknown[] = [
      {
        updateDeveloperMetadata: {
          dataFilters: [
            {
              developerMetadataLookup: {
                locationType: "SPREADSHEET",
                metadataKey: IDENTITY_METADATA_KEYS.assetRevision,
                visibility: "DOCUMENT",
              },
            },
          ],
          developerMetadata: {
            metadataValue: blueprint.assetRevision,
          },
          fields: "metadataValue",
        },
      },
      writeValues(
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.summary,
        5,
        6,
        1,
        2,
        [[blueprint.assetRevision]],
      ),
      ...buildOperationalWorkbookV2ReadabilityRequests(simpleValues),
    ];

    return sealOperationalWorkbookV2ApplicationPlan(
      guardInput,
      requests,
      {
        action: "repaired-from-v2" as const,
        assetRevision: blueprint.assetRevision,
        rebuiltSheets: repairedSheets,
        routines: blueprint.routineRows.length,
        schemaVersion: blueprint.schemaVersion,
        sourceContents: blueprint.sourceContentCount,
        systemSlug: blueprint.systemSlug,
        variant: blueprint.variant,
        workbookVersion: blueprint.workbookVersion,
      },
    );
  }

  const workbookTitle = expectedSpreadsheetTitle;
  const assumptions = buildAssumptionRows(blueprint);
  const forecast = buildForecastRows(blueprint, assumptions.layout);
  const forecastRows = forecast.rows.map((values, rowIndex) => {
    const assumptionRow = assumptions.rows[rowIndex - 3];
    const padded = [...values];
    while (padded.length < 14) padded.push("");
    if (assumptionRow) {
      padded.push(...assumptionRow);
    }
    return padded;
  });
  const definitions = OPERATIONAL_WORKBOOK_V2_SHEET_DEFINITIONS;
  const requests: unknown[] = [
    {
      updateSpreadsheetProperties: {
        properties: {
          title: workbookTitle,
          locale: "fr_FR",
          timeZone: "Europe/Paris",
        },
        fields: "title,locale,timeZone",
      },
    },
    sheetDefinition(STAGING_SHEET_ID, "__D061_REBUILD__", 0, 1, 1, 0),
    ...Object.values(CANONICAL_OPERATIONAL_WORKBOOK_SHEET_IDS).map(
      (sheetId) => ({ deleteSheet: { sheetId } }),
    ),
    ...definitions.map(([key, title, index, rowCount, columnCount]) =>
      sheetDefinition(
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS[key],
        title,
        index,
        rowCount,
        columnCount,
      ),
    ),
    { deleteSheet: { sheetId: STAGING_SHEET_ID } },
    ...identityMetadata(targetIdentity).map((entry) => ({
      createDeveloperMetadata: {
        developerMetadata: {
          location: entry.location,
          metadataKey: entry.key,
          metadataValue: entry.value,
          visibility: entry.visibility,
        },
      },
    })),
    writeValues(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.summary,
      0,
      10,
      0,
      4,
      buildSummaryRows(blueprint, forecast.layout),
    ),
    writeValues(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
      0,
      forecastRows.length,
      0,
      17,
      forecastRows,
    ),
    ...(
      Object.entries(simpleValues) as Array<
        [Exclude<SheetKey, "summary" | "forecast">, CellValue[][]]
      >
    ).map(([key, values]) =>
      writeValues(
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS[key],
        0,
        values.length,
        0,
        definitions.find(([definitionKey]) => definitionKey === key)?.[4] ??
          1,
        values,
      ),
    ),
    ...definitions.flatMap(([key, , , , columnCount]) =>
      standardSheetRequests(
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS[key],
        columnCount,
        3,
      ),
    ),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.summary, 0, 1, 250),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.summary, 1, 4, 175),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast, 0, 1, 245),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast, 1, 13, 105),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast, 13, 14, 28),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast, 14, 15, 255),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast, 15, 16, 125),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast, 16, 17, 110),
    setColumnWidth(OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast, 17, 31, 28),
    ...buildOperationalWorkbookV2ReadabilityRequests(simpleValues),
  ];

  const variableRateRows =
    assumptions.layout.variableCostDrivers;
  const percentageAssumptionRows = [
    ...variableRateRows,
    assumptions.layout.totalVariableCostRate,
    assumptions.layout.averageVatRate,
  ];
  const nonNegativeAmountRows = [
    assumptions.layout.averageRevenuePerUnit,
    ...assumptions.layout.monthlyFixedCosts,
    assumptions.layout.openingReceivables,
    assumptions.layout.openingPayables,
    assumptions.layout.openingVatPayable,
    assumptions.layout.monthlyDebtService,
    assumptions.layout.investmentPerMonth,
  ];
  const editableAssumptionRows = [
    ...nonNegativeAmountRows,
    assumptions.layout.openingCash,
    assumptions.layout.customerCollectionDelayMonths,
    assumptions.layout.supplierPaymentDelayMonths,
    ...variableRateRows,
    assumptions.layout.averageVatRate,
  ];
  const currencyAssumptionRows = [
    assumptions.layout.averageRevenuePerUnit,
    ...assumptions.layout.monthlyFixedCosts,
    assumptions.layout.openingCash,
    assumptions.layout.openingReceivables,
    assumptions.layout.openingPayables,
    assumptions.layout.openingVatPayable,
    assumptions.layout.monthlyDebtService,
    assumptions.layout.investmentPerMonth,
  ];
  requests.push(
    formatCells(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
      forecast.layout.activity,
      forecast.layout.activity + 1,
      1,
      13,
      { backgroundColor: INPUT_BACKGROUND },
    ),
    ...editableAssumptionRows.map((rowIndex) =>
      formatCells(
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
        rowIndex,
        rowIndex + 1,
        15,
        16,
        { backgroundColor: INPUT_BACKGROUND },
      ),
    ),
    formatCells(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
      forecast.layout.operatingMargin,
      forecast.layout.operatingMargin + 1,
      1,
      13,
      { numberFormat: { type: "PERCENT", pattern: "0.0%" } },
    ),
    setValidation(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
      forecast.layout.activity,
      forecast.layout.activity + 1,
      1,
      13,
      {
        type: "NUMBER_GREATER_THAN_EQ",
        values: [{ userEnteredValue: "0" }],
      },
    ),
    ...percentageAssumptionRows.map((rowIndex) =>
      formatCells(
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
        rowIndex,
        rowIndex + 1,
        15,
        16,
        { numberFormat: { type: "PERCENT", pattern: "0.0%" } },
      ),
    ),
    setValidation(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
      variableRateRows[0],
      variableRateRows[variableRateRows.length - 1] + 1,
      15,
      16,
      {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=AND(${a1(
              variableRateRows[0],
              15,
            )}>=0;${a1(
              variableRateRows[0],
              15,
            )}<=1;SUM(${a1(
              variableRateRows[0],
              15,
              true,
            )}:${a1(
              variableRateRows[variableRateRows.length - 1],
              15,
              true,
            )})<9/10)`,
          },
        ],
      },
    ),
    setValidation(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
      assumptions.layout.averageVatRate,
      assumptions.layout.averageVatRate + 1,
      15,
      16,
      {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=AND(${a1(
              assumptions.layout.averageVatRate,
              15,
            )}>=0;${a1(
              assumptions.layout.averageVatRate,
              15,
            )}<=1/4)`,
          },
        ],
      },
    ),
    ...currencyAssumptionRows.map((rowIndex) =>
      formatCells(
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
        rowIndex,
        rowIndex + 1,
        15,
        16,
        {
          numberFormat: {
            type: "NUMBER",
            pattern: '#,##0.00 [$€-fr-FR]',
          },
        },
      ),
    ),
    ...nonNegativeAmountRows.map((rowIndex) =>
      setValidation(
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
        rowIndex,
        rowIndex + 1,
        15,
        16,
        {
          type: "NUMBER_GREATER_THAN_EQ",
          values: [{ userEnteredValue: "0" }],
        },
      ),
    ),
    setValidation(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
      assumptions.layout.openingCash,
      assumptions.layout.openingCash + 1,
      15,
      16,
      {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=OR(${a1(
              assumptions.layout.openingCash,
              15,
            )}="";ISNUMBER(${a1(
              assumptions.layout.openingCash,
              15,
            )}))`,
          },
        ],
      },
    ),
    protectWarning(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
      assumptions.layout.totalVariableCostRate,
      assumptions.layout.totalVariableCostRate + 1,
      15,
      16,
      "Total calculé - les taux variables cumulés doivent rester sous 90 %",
    ),
    setValidation(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
      assumptions.layout.customerCollectionDelayMonths,
      assumptions.layout.customerCollectionDelayMonths + 1,
      15,
      16,
      {
        type: "ONE_OF_LIST",
        values: [
          { userEnteredValue: "0" },
          { userEnteredValue: "1" },
        ],
      },
    ),
    setValidation(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
      assumptions.layout.supplierPaymentDelayMonths,
      assumptions.layout.supplierPaymentDelayMonths + 1,
      15,
      16,
      {
        type: "ONE_OF_LIST",
        values: [
          { userEnteredValue: "0" },
          { userEnteredValue: "1" },
        ],
      },
    ),
    protectWarning(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
      forecast.layout.revenue,
      forecast.layout.closingCash + 1,
      1,
      13,
      "Formules v2 - utiliser les cellules vert clair",
    ),
    setValidation(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions,
      4,
      120,
      4,
      5,
      {
        type: "ONE_OF_LIST",
        values: [
          { userEnteredValue: "P1" },
          { userEnteredValue: "P2" },
          { userEnteredValue: "P3" },
          { userEnteredValue: "À définir" },
        ],
      },
    ),
    formatCells(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions,
      4,
      120,
      5,
      7,
      { numberFormat: { type: "DATE", pattern: "dd/mm/yyyy" } },
    ),
    setValidation(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions,
      4,
      120,
      5,
      7,
      { type: "DATE_IS_VALID" },
    ),
    setValidation(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions,
      4,
      120,
      7,
      8,
      {
        type: "ONE_OF_LIST",
        values: [
          { userEnteredValue: "À planifier" },
          { userEnteredValue: "À faire" },
          { userEnteredValue: "En cours" },
          { userEnteredValue: "Terminé" },
        ],
      },
    ),
    setValidation(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.team,
      4,
      120,
      2,
      3,
      {
        type: "ONE_OF_LIST",
        values: [
          { userEnteredValue: "À définir" },
          { userEnteredValue: "En poste" },
          { userEnteredValue: "À recruter" },
          { userEnteredValue: "Externe" },
        ],
      },
    ),
    setValidation(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.calendar,
      4,
      120,
      5,
      6,
      {
        type: "ONE_OF_LIST",
        values: [
          { userEnteredValue: "À planifier" },
          { userEnteredValue: "Planifié" },
          { userEnteredValue: "Publié" },
        ],
      },
    ),
  );

  return sealOperationalWorkbookV2ApplicationPlan(
    guardInput,
    requests,
    {
      action: "rebuilt-from-v1" as const,
      assetRevision: blueprint.assetRevision,
      rebuiltSheets: definitions.map(([, title]) => title),
      routines: blueprint.routineRows.length,
      schemaVersion: blueprint.schemaVersion,
      sourceContents: blueprint.sourceContentCount,
      systemSlug: blueprint.systemSlug,
      variant: blueprint.variant,
      workbookVersion: blueprint.workbookVersion,
    },
  );
}
