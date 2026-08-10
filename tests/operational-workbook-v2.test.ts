import { describe, expect, it } from "vitest";
import { CANONICAL_OPERATIONAL_WORKBOOK_SHEET_IDS } from "@/lib/operational-workbook-sheet-compiler";
import {
  assertOperationalWorkbookV2ApplicationPlan,
  buildOperationalWorkbookV2ExpectedAppliedPreflight,
  buildOperationalWorkbookV2ExpectedV1Preflight,
  classifyOperationalWorkbookV2SheetState,
  compileOperationalWorkbookV2ApplicationPlan,
  OPERATIONAL_WORKBOOK_V2_SHEET_IDS,
  sealOperationalWorkbookV2Preflight,
  serializeOperationalWorkbookV2ApplicationPlan,
  type OperationalWorkbookV2ApplicationPlan,
  type OperationalWorkbookV2SheetPreflight,
} from "@/lib/operational-workbook-v2-compiler";
import {
  buildOperationalWorkbookV2Blueprint,
  buildOperationalWorkbookV2Pair,
  calculateOperationalWorkbookV2Forecast,
  getOperationalWorkbookV2PilotSlugs,
} from "@/lib/operational-workbook-v2-factory";
import {
  OPERATIONAL_WORKBOOK_V2_PILOT_SLUGS,
  OPERATIONAL_WORKBOOK_V2_REPAIRABLE_ASSET_REVISIONS,
  OPERATIONAL_WORKBOOK_V2_SHEET_ORDER,
  type OperationalWorkbookV2Blueprint,
} from "@/lib/operational-workbook-v2";
import { getOperationalWorkbookV2PilotProfile } from "@/lib/operational-workbook-v2-profiles";

type BatchRequest = Record<string, Record<string, unknown>>;

function asRequests(value: ReadonlyArray<unknown>) {
  return value as ReadonlyArray<BatchRequest>;
}

function buildV1Preflight(
  blueprint: OperationalWorkbookV2Blueprint,
  input: {
    capturedAt?: string;
    revisionToken?: string;
    spreadsheetId?: string;
  } = {},
) {
  return buildOperationalWorkbookV2ExpectedV1Preflight(
    blueprint,
    input,
  );
}

function compileFromCanonicalV1(
  blueprint: OperationalWorkbookV2Blueprint,
) {
  const preflight = buildV1Preflight(blueprint);
  return {
    plan: compileOperationalWorkbookV2ApplicationPlan(
      blueprint,
      preflight,
    ),
    preflight,
  };
}

function buildAppliedPreflightFromRequests(
  requests: ReadonlyArray<BatchRequest>,
  sourcePreflight: OperationalWorkbookV2SheetPreflight,
) {
  const sheets = requests
    .filter((request) => {
      const addSheet = request.addSheet as
        | { properties?: { sheetId?: number } }
        | undefined;
      return (
        addSheet?.properties?.sheetId !== undefined &&
        addSheet.properties.sheetId !== 610619999
      );
    })
    .map((request) => {
      const properties = request.addSheet.properties as {
        gridProperties: {
          columnCount: number;
          frozenRowCount: number;
          rowCount: number;
        };
        index: number;
        sheetId: number;
        title: string;
      };
      return {
        ...properties.gridProperties,
        index: properties.index,
        sheetId: properties.sheetId,
        title: properties.title,
      };
    });
  const developerMetadata = requests.flatMap((request) => {
    const metadata = (
      request.createDeveloperMetadata as
        | {
            developerMetadata?: {
              location?: {
                dimensionRange?: unknown;
                sheetId?: number;
                spreadsheet?: boolean;
              };
              metadataKey?: string;
              metadataValue?: string;
              visibility?: string;
            };
          }
        | undefined
    )?.developerMetadata;
    return (
      metadata?.metadataKey &&
      metadata.metadataValue &&
      metadata.location &&
      metadata.visibility
    )
      ? [{
          key: metadata.metadataKey,
          location: metadata.location,
          value: metadata.metadataValue,
          visibility: metadata.visibility,
        }]
      : [];
  });
  const spreadsheetTitle =
    (
      requests.find((request) => request.updateSpreadsheetProperties)
        ?.updateSpreadsheetProperties as
        | { properties?: { title?: string } }
        | undefined
    )?.properties?.title ?? sourcePreflight.spreadsheetTitle;

  return sealOperationalWorkbookV2Preflight({
    capturedAt: "2026-07-29T00:01:00.000Z",
    developerMetadata,
    revisionToken: "fixture-v2-revision",
    sheets,
    spreadsheetId: sourcePreflight.spreadsheetId,
    spreadsheetTitle,
  });
}

describe("operational workbook v2 pilots", () => {
  it("is strictly limited to the five approved pilots", () => {
    expect(getOperationalWorkbookV2PilotSlugs()).toEqual([
      ...OPERATIONAL_WORKBOOK_V2_PILOT_SLUGS,
    ]);
    expect(() =>
      buildOperationalWorkbookV2Blueprint("plomberie-chauffage", "demo"),
    ).toThrow("limitée aux cinq pilotes");
  });

  it("keeps all 74 source contents behind 8 to 12 stable routines", () => {
    for (const slug of OPERATIONAL_WORKBOOK_V2_PILOT_SLUGS) {
      const pair = buildOperationalWorkbookV2Pair(slug);

      for (const blueprint of [pair.demo, pair.editable]) {
        expect(blueprint.sourceContentCount).toBe(74);
        expect(blueprint.routineRows.length).toBeGreaterThanOrEqual(8);
        expect(blueprint.routineRows.length).toBeLessThanOrEqual(12);
        expect(
          new Set(blueprint.routineRows.map((routine) => routine.routineId))
            .size,
        ).toBe(blueprint.routineRows.length);

        for (const routine of blueprint.routineRows) {
          expect(routine.sourceProcessIds.length).toBeGreaterThanOrEqual(1);
          expect(routine.sourceStepIds.length).toBeGreaterThanOrEqual(2);
          expect(routine.sourceStepIds.length).toBeLessThanOrEqual(4);
          expect(routine.bullets).toHaveLength(routine.sourceStepIds.length);
          expect(routine.support).toBeNull();
        }
      }
    }
  });

  it("never labels synthetic finance as real and leaves editable outputs empty", () => {
    for (const slug of OPERATIONAL_WORKBOOK_V2_PILOT_SLUGS) {
      const pair = buildOperationalWorkbookV2Pair(slug);

      expect(
        pair.demo.forecastPeriods.every(
          (period) => period.status === "Scénario démo",
        ),
      ).toBe(true);
      expect(JSON.stringify(pair.demo)).not.toContain('"Réel"');

      for (const period of pair.editable.forecastPeriods) {
        expect(period.status).toBe("À renseigner");
        expect(period.activityVolume).toBeNull();
        expect(period.revenue).toBeNull();
        expect(period.operatingResult).toBeNull();
        expect(period.operatingMarginRate).toBeNull();
        expect(period.customerReceipts).toBeNull();
        expect(period.supplierPayments).toBeNull();
        expect(period.vatSettlement).toBeNull();
        expect(period.netCashMovement).toBeNull();
        expect(period.closingCash).toBeNull();
        expect(
          period.variableCosts.every((cost) => cost.value === null),
        ).toBe(true);
        expect(period.fixedCosts.every((cost) => cost.value === null)).toBe(
          true,
        );
      }
    }
  });

  it("models variable costs, fixed costs and cash timing instead of a fixed margin", () => {
    const expectedUnits = {
      batiment: "chantiers",
      restaurant: "couverts",
      "agence-marketing": "projets",
      pharmacie: "passages",
      "assistant-administratif-externalise": "dossiers",
    } as const;

    for (const slug of OPERATIONAL_WORKBOOK_V2_PILOT_SLUGS) {
      const demo = buildOperationalWorkbookV2Blueprint(slug, "demo");
      const margins = demo.forecastPeriods.map(
        (period) => period.operatingMarginRate,
      );

      expect(demo.financialProfile.activityDriver.unit).toBe(
        expectedUnits[slug],
      );
      expect(margins.every((margin) => margin !== null)).toBe(true);
      expect(
        margins.every(
          (margin) => margin !== null && Math.abs(margin - 0.51) > 0.01,
        ),
      ).toBe(true);
      expect(
        new Set(margins.map((margin) => margin?.toFixed(4))).size,
      ).toBeGreaterThan(1);
      expect(demo.forecastPeriods[0]?.label).toBe("Août 2026");
      expect(demo.forecastPeriods.at(-1)?.label).toBe("Juillet 2027");
      expect(
        demo.forecastPeriods.every(
          (period) =>
            period.variableCosts.length > 0 && period.fixedCosts.length > 0,
        ),
      ).toBe(true);
      expect(
        demo.forecastPeriods.some(
          (period) => period.customerReceipts !== period.revenue,
        ),
      ).toBe(true);
    }
  });

  it("computes a realistic user-entered scenario without silently producing 100 percent margin", () => {
    const profile = getOperationalWorkbookV2PilotProfile("batiment");
    expect(profile).not.toBeNull();

    const forecast = calculateOperationalWorkbookV2Forecast({
      assumptions: profile?.finance.demoAssumptions ?? null,
      systemSlug: "batiment",
      volumes: [4, 5, 6, 5, 7, 6, 8, 7, 6, 8, 9, 8],
    });
    const firstMonth = forecast[0];

    expect(firstMonth.revenue).toBe(60_000);
    expect(
      firstMonth.variableCosts.reduce(
        (total, cost) => total + (cost.value ?? 0),
        0,
      ),
    ).toBe(27_600);
    expect(
      firstMonth.fixedCosts.reduce(
        (total, cost) => total + (cost.value ?? 0),
        0,
      ),
    ).toBe(22_000);
    expect(firstMonth.operatingResult).toBe(10_400);
    expect(firstMonth.operatingMarginRate).toBeCloseTo(0.1733, 3);
    expect(firstMonth.customerReceipts).toBe(54_000);
    expect(firstMonth.supplierPayments).toBe(21_000);
    expect(firstMonth.vatSettlement).toBe(4_500);
    expect(firstMonth.netCashMovement).toBe(500);
    expect(firstMonth.closingCash).toBe(42_500);
    expect(firstMonth.operatingMarginRate).not.toBe(1);
  });

  it("keeps summary indicators linked to the live forecast after assumptions change", () => {
    const blueprint = buildOperationalWorkbookV2Blueprint(
      "batiment",
      "editable",
    );
    const compiled = compileFromCanonicalV1(blueprint).plan;
    const requests = asRequests(compiled.requests);
    const summaryWrite = requests.find(
      (request) =>
        (
          request.updateCells as
            | { range?: { sheetId?: number } }
            | undefined
        )?.range?.sheetId ===
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.summary,
    )?.updateCells as {
      rows: Array<{
        values: Array<{
          userEnteredValue?: {
            formulaValue?: string;
            stringValue?: string;
          };
        }>;
      }>;
    };
    const forecastWrite = requests.find(
      (request) =>
        (
          request.updateCells as
            | { range?: { sheetId?: number } }
            | undefined
        )?.range?.sheetId ===
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
    )?.updateCells as typeof summaryWrite;
    const revenueRowIndex = forecastWrite.rows.findIndex(
      (row) =>
        row.values[0]?.userEnteredValue?.stringValue ===
        "Chiffre d’affaires HT",
    );
    const closingCashRowIndex = forecastWrite.rows.findIndex(
      (row) =>
        row.values[0]?.userEnteredValue?.stringValue ===
        "Trésorerie de clôture",
    );
    const revenueFormula =
      summaryWrite.rows[8]?.values[1]?.userEnteredValue
        ?.formulaValue;
    const closingCashFormula =
      summaryWrite.rows[9]?.values[1]?.userEnteredValue
        ?.formulaValue;

    expect(revenueFormula).toContain(
      `'Prévisionnel financier'!B${revenueRowIndex + 1}`,
    );
    expect(closingCashFormula).toContain(
      `'Prévisionnel financier'!M${closingCashRowIndex + 1}`,
    );
    expect(revenueFormula).toContain('=""');
    expect(closingCashFormula).toContain('=""');

    const profile = getOperationalWorkbookV2PilotProfile("batiment");
    const initialForecast = calculateOperationalWorkbookV2Forecast({
      assumptions: profile?.finance.demoAssumptions ?? null,
      systemSlug: "batiment",
      volumes: [4, 5, 6, 5, 7, 6, 8, 7, 6, 8, 9, 8],
    });
    const updatedForecast = calculateOperationalWorkbookV2Forecast({
      assumptions: profile?.finance.demoAssumptions ?? null,
      systemSlug: "batiment",
      volumes: [5, 5, 6, 5, 7, 6, 8, 7, 6, 8, 9, 10],
    });
    const revenueReference = `B${revenueRowIndex + 1}`;
    const closingCashReference = `M${closingCashRowIndex + 1}`;
    const resolveLinkedValue = (
      formulaValue: string | undefined,
      values: Map<string, number | null>,
    ) => {
      const reference = formulaValue?.match(
        /'Prévisionnel financier'!([A-Z]+\d+)/,
      )?.[1];
      return reference ? values.get(reference) : undefined;
    };
    const initialCells = new Map([
      [revenueReference, initialForecast[0]?.revenue ?? null],
      [
        closingCashReference,
        initialForecast.at(-1)?.closingCash ?? null,
      ],
    ]);
    const updatedCells = new Map([
      [revenueReference, updatedForecast[0]?.revenue ?? null],
      [
        closingCashReference,
        updatedForecast.at(-1)?.closingCash ?? null,
      ],
    ]);

    expect(resolveLinkedValue(revenueFormula, initialCells)).toBe(
      60_000,
    );
    expect(resolveLinkedValue(revenueFormula, updatedCells)).toBe(
      75_000,
    );
    expect(
      resolveLinkedValue(closingCashFormula, updatedCells),
    ).not.toBe(
      resolveLinkedValue(closingCashFormula, initialCells),
    );
  });

  it("never recycles clinical pharmacy content into marketing", () => {
    const pharmacy = buildOperationalWorkbookV2Blueprint(
      "pharmacie",
      "demo",
    );
    const serializedCalendar = JSON.stringify(pharmacy.calendarRows);

    expect(pharmacy.calendarRows).toEqual([]);
    expect(serializedCalendar).not.toMatch(
      /triage|clinique|ordonnance|pharmaceutique/i,
    );
  });

  it("rebuilds all seven sheets instead of inheriting v1 structure", () => {
    const blueprint = buildOperationalWorkbookV2Blueprint("batiment", "demo");
    const compiled = compileFromCanonicalV1(blueprint).plan;
    const requests = asRequests(compiled.requests);
    const serialized = JSON.stringify(requests);
    const deletedSheetIds = requests
      .filter((request) => request.deleteSheet)
      .map((request) => request.deleteSheet.sheetId);
    const addedSheets = requests
      .filter((request) => request.addSheet)
      .map((request) => request.addSheet.properties as {
        sheetId: number;
        title: string;
        gridProperties: { columnCount: number; rowCount: number };
      });

    expect(blueprint.sheetOrder).toEqual(OPERATIONAL_WORKBOOK_V2_SHEET_ORDER);
    expect(compiled.summary.sourceContents).toBe(74);
    expect(compiled.summary.routines).toBeGreaterThanOrEqual(8);
    expect(deletedSheetIds).toEqual(
      expect.arrayContaining([
        ...Object.values(CANONICAL_OPERATIONAL_WORKBOOK_SHEET_IDS),
        610619999,
      ]),
    );
    expect(addedSheets.map((sheet) => sheet.title)).toEqual([
      "__D061_REBUILD__",
      ...OPERATIONAL_WORKBOOK_V2_SHEET_ORDER,
    ]);
    expect(addedSheets[0]?.gridProperties).toMatchObject({
      columnCount: 1,
      frozenRowCount: 0,
      rowCount: 1,
    });
    expect(
      addedSheets.find((sheet) => sheet.title === "Prévisionnel financier")
        ?.gridProperties,
    ).toMatchObject({ columnCount: 31, rowCount: 179 });
    expect(serialized).not.toContain("copyPaste");
    expect(serialized).not.toContain("unmergeCells");
    expect(serialized).not.toContain("hiddenByUser");
    expect(serialized).toContain("Scénario démo");
    expect(serialized).not.toContain('"Réel"');
  });

  it("writes simplified widths and never creates unsupported links", () => {
    const blueprint = buildOperationalWorkbookV2Blueprint(
      "restaurant",
      "editable",
    );
    const compiled = compileFromCanonicalV1(blueprint).plan;
    const requests = asRequests(compiled.requests);
    const dataWriteWidth = (sheetId: number, startRowIndex: number) => {
      const request = requests.find((candidate) => {
        const updateCells = candidate.updateCells as
          | {
              range?: { sheetId?: number; startRowIndex?: number };
              rows?: Array<{ values: unknown[] }>;
            }
          | undefined;
        return (
          updateCells?.range?.sheetId === sheetId &&
          updateCells.range.startRowIndex === startRowIndex
        );
      });
      return request?.updateCells as
        | {
            range: { endColumnIndex: number };
            rows: Array<{ values: unknown[] }>;
          }
        | undefined;
    };

    const process = dataWriteWidth(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.process,
      0,
    );
    const ecosystem = dataWriteWidth(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.ecosystem,
      0,
    );
    const actions = dataWriteWidth(
      OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions,
      0,
    );

    expect(actions?.range.endColumnIndex).toBe(10);
    expect(process?.range.endColumnIndex).toBe(4);
    expect(ecosystem?.range.endColumnIndex).toBe(5);
    expect(JSON.stringify(process)).not.toContain("HYPERLINK");
  });

  it("wraps and auto-resizes every populated operational row with targeted widths", () => {
    const expectedWidths = new Map<number, number[]>([
      [
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions,
        [300, 360, 230, 160, 100, 115, 115, 125, 300, 260],
      ],
      [
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.team,
        [180, 210, 125, 210, 160, 330, 330, 260],
      ],
      [
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.ecosystem,
        [220, 230, 380, 180, 150],
      ],
      [
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.calendar,
        [170, 170, 340, 190, 220, 125, 300],
      ],
      [
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.process,
        [320, 180, 150, 600],
      ],
    ]);

    for (const slug of OPERATIONAL_WORKBOOK_V2_PILOT_SLUGS) {
      for (const variant of ["demo", "editable"] as const) {
        const blueprint = buildOperationalWorkbookV2Blueprint(
          slug,
          variant,
        );
        const requests = asRequests(
          compileFromCanonicalV1(blueprint).plan.requests,
        );
        const populatedRows = new Map<number, number>([
          [
            OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions,
            blueprint.actionRows.length,
          ],
          [
            OPERATIONAL_WORKBOOK_V2_SHEET_IDS.team,
            blueprint.teamRows.length,
          ],
          [
            OPERATIONAL_WORKBOOK_V2_SHEET_IDS.ecosystem,
            blueprint.ecosystemRows.length,
          ],
          [
            OPERATIONAL_WORKBOOK_V2_SHEET_IDS.calendar,
            blueprint.calendarRows.length,
          ],
          [
            OPERATIONAL_WORKBOOK_V2_SHEET_IDS.process,
            blueprint.routineRows.length,
          ],
        ]);

        for (const [sheetId, widths] of expectedWidths) {
          const widthRequests = requests
            .filter((request) => {
              const update = request.updateDimensionProperties as
                | {
                    range?: {
                      dimension?: string;
                      sheetId?: number;
                    };
                  }
                | undefined;
              return (
                update?.range?.sheetId === sheetId &&
                update.range.dimension === "COLUMNS"
              );
            })
            .map((request) => {
              const update = request.updateDimensionProperties as {
                range: {
                  endIndex: number;
                  startIndex: number;
                };
                properties: { pixelSize: number };
              };
              return Array.from(
                {
                  length:
                    update.range.endIndex -
                    update.range.startIndex,
                },
                () => update.properties.pixelSize,
              );
            })
            .flat();
          expect(widthRequests).toEqual(widths);

          const rowCount = populatedRows.get(sheetId) ?? 0;
          const wrapRequests = requests.filter((request) => {
            const repeatCell = request.repeatCell as
              | {
                  range?: {
                    endRowIndex?: number;
                    sheetId?: number;
                    startRowIndex?: number;
                  };
                  cell?: {
                    userEnteredFormat?: {
                      verticalAlignment?: string;
                      wrapStrategy?: string;
                    };
                  };
                }
              | undefined;
            return (
              repeatCell?.range?.sheetId === sheetId &&
              repeatCell.range.startRowIndex === 4 &&
              repeatCell.cell?.userEnteredFormat?.wrapStrategy ===
                "WRAP"
            );
          });
          const rowHeightRequests = requests.filter((request) => {
            const resize = request.updateDimensionProperties as
              | {
                  range?: {
                    dimension?: string;
                    endIndex?: number;
                    sheetId?: number;
                    startIndex?: number;
                  };
                  properties?: { pixelSize?: number };
                }
              | undefined;
            return (
              resize?.range?.sheetId === sheetId &&
              resize.range.dimension === "ROWS"
            );
          });

          if (rowCount === 0) {
            expect(wrapRequests).toHaveLength(0);
            expect(rowHeightRequests).toHaveLength(0);
            continue;
          }

          expect(wrapRequests).toHaveLength(1);
          expect(wrapRequests[0]?.repeatCell).toMatchObject({
            range: {
              endRowIndex: rowCount + 4,
              startRowIndex: 4,
            },
            cell: {
              userEnteredFormat: {
                verticalAlignment: "TOP",
                wrapStrategy: "WRAP",
              },
            },
          });
          const expectedRowHeight =
            sheetId === OPERATIONAL_WORKBOOK_V2_SHEET_IDS.actions
              ? 72
              : sheetId ===
                  OPERATIONAL_WORKBOOK_V2_SHEET_IDS.process
                ? 104
                : 44;
          expect(rowHeightRequests).toHaveLength(1);
          expect(rowHeightRequests[0]?.updateDimensionProperties).toEqual({
            range: {
              dimension: "ROWS",
              endIndex: rowCount + 4,
              sheetId,
              startIndex: 4,
            },
            properties: { pixelSize: expectedRowHeight },
            fields: "pixelSize",
          });
        }
      }
    }
  });

  it("makes cost assumptions visible and guards every editable calculation", () => {
    const blueprint = buildOperationalWorkbookV2Blueprint(
      "batiment",
      "editable",
    );
    const compiled = compileFromCanonicalV1(blueprint).plan;
    const requests = asRequests(compiled.requests);
    const forecastWrite = requests.find((candidate) => {
      const updateCells = candidate.updateCells as
        | { range?: { sheetId?: number; startRowIndex?: number } }
        | undefined;
      return (
        updateCells?.range?.sheetId ===
          OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast &&
        updateCells.range.startRowIndex === 0
      );
    });
    const serializedForecast = JSON.stringify(forecastWrite);
    const inputFormatting = requests.filter((candidate) => {
      const repeatCell = candidate.repeatCell as
        | {
          range?: {
            sheetId?: number;
            startColumnIndex?: number;
            endColumnIndex?: number;
          };
          cell?: {
            userEnteredFormat?: {
              backgroundColor?: unknown;
            };
          };
        }
        | undefined;
      return (
        repeatCell?.range?.sheetId ===
          OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast &&
        repeatCell.range.startColumnIndex === 15 &&
        repeatCell.range.endColumnIndex === 16 &&
        Boolean(
          repeatCell.cell?.userEnteredFormat?.backgroundColor,
        )
      );
    });
    const validations = requests.filter(
      (candidate) =>
        (candidate.setDataValidation as { range?: { sheetId?: number } })
          ?.range?.sheetId === OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
    );
    const protections = requests.filter(
      (candidate) =>
        (
          candidate.addProtectedRange as {
            protectedRange?: { range?: { sheetId?: number } };
          }
        )?.protectedRange?.range?.sheetId ===
        OPERATIONAL_WORKBOOK_V2_SHEET_IDS.forecast,
    );

    expect(serializedForecast).toContain("Taux variable -");
    expect(serializedForecast).toContain("Charge fixe -");
    expect(serializedForecast).toContain("Décalage d’encaissement client");
    expect(serializedForecast).toContain("TVA d’ouverture à décaisser");
    expect(serializedForecast).toContain("Pont de trésorerie simplifié");
    expect(serializedForecast).toContain(
      "TVA récupérable sur les charges fixes n’est pas modélisée",
    );
    expect(serializedForecast).toContain("formulaValue");
    expect(serializedForecast).toContain('\\"\\"');
    expect(serializedForecast).not.toContain("Impact de trésorerie");
    expect(inputFormatting.length).toBeGreaterThan(5);
    expect(validations.length).toBeGreaterThanOrEqual(4);
    expect(protections.length).toBeGreaterThanOrEqual(2);
  });

  it("applies financial validations and formats according to each assumption type", () => {
    const blueprint = buildOperationalWorkbookV2Blueprint(
      "batiment",
      "editable",
    );
    const compiled = compileFromCanonicalV1(blueprint).plan;
    const serialized = JSON.stringify(compiled.requests);

    expect(serialized).toContain(
      "Total des taux variables (strictement inférieur à 90 %)",
    );
    expect(serialized).toContain("Alerte au-delà de 90 %");
    expect(serialized).toContain('"type":"PERCENT"');
    expect(serialized).toContain('"pattern":"0.0%"');
    expect(serialized).toContain('"type":"ONE_OF_LIST"');
    expect(serialized).toContain('"type":"CUSTOM_FORMULA"');
    expect(serialized).toContain("ISNUMBER(P");
    expect(serialized).toContain('"type":"DATE_IS_VALID"');
    expect(serialized).toContain('"type":"DATE"');
    expect(serialized).toContain('"pattern":"dd/mm/yyyy"');

    const validations = asRequests(compiled.requests).filter(
      (request) => request.setDataValidation,
    );
    const vatRules = validations.filter(
      (request) => {
        const condition = (
          request.setDataValidation.rule as {
            condition?: {
              type?: string;
              values?: Array<{ userEnteredValue?: string }>;
            };
          }
        ).condition;
        return condition?.values?.some((value) =>
          value.userEnteredValue?.includes("<=1/4"),
        );
      },
    );
    expect(vatRules).toHaveLength(1);
    expect(
      (
        vatRules[0].setDataValidation.rule as {
          condition: {
            values: Array<{ userEnteredValue: string }>;
          };
        }
      ).condition.values[0].userEnteredValue,
    ).toMatch(/^=AND\(P\d+>=0;P\d+<=1\/4\)$/);
    expect(serialized).toContain("SUM($P$");
    expect(serialized).toContain("<9/10");
    expect(serialized).not.toContain("<0.9");
    expect(serialized).not.toContain('"type":"NUMBER_BETWEEN"');
    expect(serialized).toContain('"location":{"spreadsheet":true}');
  });

  it("accepts 25 percent VAT and rejects 26 percent or excessive variable costs", () => {
    const profile = getOperationalWorkbookV2PilotProfile("batiment");
    expect(profile).not.toBeNull();
    const assumptions = structuredClone(
      profile?.finance.demoAssumptions,
    );
    if (!assumptions) {
      throw new Error("Le profil financier Bâtiment est absent.");
    }

    assumptions.averageVatRate = 0.25;
    expect(() =>
      calculateOperationalWorkbookV2Forecast({
        assumptions,
        systemSlug: "batiment",
        volumes: Array.from({ length: 12 }, () => 4),
      }),
    ).not.toThrow();

    assumptions.averageVatRate = 0.26;
    expect(() =>
      calculateOperationalWorkbookV2Forecast({
        assumptions,
        systemSlug: "batiment",
        volumes: Array.from({ length: 12 }, () => 4),
      }),
    ).toThrow("Structure financière non crédible");

    assumptions.averageVatRate = 0.2;
    assumptions.variableCostDrivers =
      assumptions.variableCostDrivers.map((driver, index) => ({
        ...driver,
        rate: index === 0 ? 0.89 : 0,
      }));
    expect(() =>
      calculateOperationalWorkbookV2Forecast({
        assumptions,
        systemSlug: "batiment",
        volumes: Array.from({ length: 12 }, () => 4),
      }),
    ).not.toThrow();

    assumptions.variableCostDrivers[0].rate = 0.9;
    expect(() =>
      calculateOperationalWorkbookV2Forecast({
        assumptions,
        systemSlug: "batiment",
        volumes: Array.from({ length: 12 }, () => 4),
      }),
    ).toThrow("Structure financière non crédible");
  });

  it("refuses an unknown sheet state and no-ops after a successful v2 application", () => {
    const blueprint = buildOperationalWorkbookV2Blueprint(
      "assistant-administratif-externalise",
      "editable",
    );
    const v1Preflight = buildV1Preflight(blueprint);
    const first = compileOperationalWorkbookV2ApplicationPlan(
      blueprint,
      v1Preflight,
    );
    const expectedAppliedState =
      buildOperationalWorkbookV2ExpectedAppliedPreflight(blueprint);
    const firstRequests = asRequests(first.requests);
    const appliedState = buildAppliedPreflightFromRequests(
      firstRequests,
      v1Preflight,
    );
    const second = compileOperationalWorkbookV2ApplicationPlan(
      blueprint,
      appliedState,
    );
    const partialState = sealOperationalWorkbookV2Preflight({
      capturedAt: appliedState.capturedAt,
      developerMetadata: appliedState.developerMetadata,
      revisionToken: appliedState.revisionToken,
      sheets: appliedState.sheets.slice(0, 6),
      spreadsheetId: appliedState.spreadsheetId,
      spreadsheetTitle: appliedState.spreadsheetTitle,
    });
    const identity = {
      assetRevision: blueprint.assetRevision,
      systemSlug: blueprint.systemSlug,
      variant: blueprint.variant,
      workbookVersion: blueprint.workbookVersion,
    };

    expect(first.summary.action).toBe("rebuilt-from-v1");
    expect(first.requests.length).toBeGreaterThan(0);
    expect(appliedState).toEqual(expectedAppliedState);
    expect(
      classifyOperationalWorkbookV2SheetState(
        appliedState,
        identity,
        appliedState.spreadsheetTitle,
      ),
    ).toBe("already-v2");
    expect(second.summary.action).toBe("already-applied");
    expect(second.requests).toEqual([]);
    expect(() =>
      compileOperationalWorkbookV2ApplicationPlan(
        blueprint,
        partialState,
      ),
    ).toThrow("État du classeur inconnu");
  });

  it("seals a non-destructive readability repair for the known previous v2 revision", () => {
    for (const variant of ["demo", "editable"] as const) {
      const blueprint = buildOperationalWorkbookV2Blueprint(
        "batiment",
        variant,
      );
      const expectedApplied =
        buildOperationalWorkbookV2ExpectedAppliedPreflight(blueprint);
      for (const repairableAssetRevision of
        OPERATIONAL_WORKBOOK_V2_REPAIRABLE_ASSET_REVISIONS) {
        const previousRevision = sealOperationalWorkbookV2Preflight({
        capturedAt: expectedApplied.capturedAt,
        developerMetadata: expectedApplied.developerMetadata.map(
          (entry) =>
            entry.key === "demaa.assetRevision"
              ? {
                  ...entry,
                  value: repairableAssetRevision,
                }
              : entry,
        ),
        revisionToken: "fixture-previous-v2-revision",
        sheets: expectedApplied.sheets,
        spreadsheetId: expectedApplied.spreadsheetId,
        spreadsheetTitle: expectedApplied.spreadsheetTitle,
        });
      const identity = {
        assetRevision: blueprint.assetRevision,
        systemSlug: blueprint.systemSlug,
        variant: blueprint.variant,
        workbookVersion: blueprint.workbookVersion,
      };

        expect(
          classifyOperationalWorkbookV2SheetState(
            previousRevision,
            identity,
            previousRevision.spreadsheetTitle,
          ),
        ).toBe("repairable-v2");

        const plan = compileOperationalWorkbookV2ApplicationPlan(
          blueprint,
          previousRevision,
        );
        const serialized = JSON.stringify(plan.requests);

        expect(plan.summary).toMatchObject({
        action: "repaired-from-v2",
        assetRevision: blueprint.assetRevision,
        rebuiltSheets: [
          "Actions",
          "Équipe",
          "Écosystème",
          "Calendrier marketing",
          "Process",
        ],
        });
        expect(
          assertOperationalWorkbookV2ApplicationPlan(
            plan,
            previousRevision,
          ),
        ).toBe(true);
        expect(serialized).toContain("updateDeveloperMetadata");
        expect(serialized).toContain(blueprint.assetRevision);
        expect(serialized).toContain(
          '"dimension":"ROWS"',
        );
        expect(serialized).not.toContain("autoResizeDimensions");
        expect(serialized).not.toContain("addSheet");
        expect(serialized).not.toContain("deleteSheet");
        expect(serialized).not.toContain("__D061_REBUILD__");

        const repairedPreflight = sealOperationalWorkbookV2Preflight({
        capturedAt: "2026-07-30T13:45:00.000Z",
        developerMetadata: expectedApplied.developerMetadata,
        revisionToken: "fixture-repaired-v2-revision",
        sheets: expectedApplied.sheets,
        spreadsheetId: expectedApplied.spreadsheetId,
        spreadsheetTitle: expectedApplied.spreadsheetTitle,
        });
        const second = compileOperationalWorkbookV2ApplicationPlan(
          blueprint,
          repairedPreflight,
        );

        expect(second.summary.action).toBe("already-applied");
        expect(second.requests).toEqual([]);
      }
    }
  });

  it("binds every v1 and v2 source to the canonical system and variant title", () => {
    const buildingDemo = buildOperationalWorkbookV2Blueprint(
      "batiment",
      "demo",
    );
    const buildingEditable = buildOperationalWorkbookV2Blueprint(
      "batiment",
      "editable",
    );
    const restaurantDemo = buildOperationalWorkbookV2Blueprint(
      "restaurant",
      "demo",
    );
    const forgedBuildingName = {
      ...buildingDemo,
      systemName: "Restaurant",
    };
    const buildingDemoV1 = buildV1Preflight(buildingDemo);
    const buildingEditableV1 = buildV1Preflight(buildingEditable);
    const alteredTitle = sealOperationalWorkbookV2Preflight({
      capturedAt: buildingDemoV1.capturedAt,
      developerMetadata: buildingDemoV1.developerMetadata,
      revisionToken: buildingDemoV1.revisionToken,
      sheets: buildingDemoV1.sheets,
      spreadsheetId: buildingDemoV1.spreadsheetId,
      spreadsheetTitle: "Classeur sans identité canonique",
    });

    expect(() =>
      compileOperationalWorkbookV2ApplicationPlan(
        restaurantDemo,
        buildingDemoV1,
      ),
    ).toThrow("État du classeur inconnu");
    expect(() =>
      compileOperationalWorkbookV2ApplicationPlan(
        forgedBuildingName,
        buildV1Preflight(restaurantDemo),
      ),
    ).toThrow("Identité du blueprint incohérente");
    expect(() =>
      compileOperationalWorkbookV2ApplicationPlan(
        buildingEditable,
        buildingDemoV1,
      ),
    ).toThrow("État du classeur inconnu");
    expect(() =>
      compileOperationalWorkbookV2ApplicationPlan(
        buildingDemo,
        alteredTitle,
      ),
    ).toThrow("État du classeur inconnu");

    for (const [blueprint, preflight] of [
      [buildingDemo, buildingDemoV1],
      [buildingEditable, buildingEditableV1],
    ] as const) {
      const plan = compileOperationalWorkbookV2ApplicationPlan(
        blueprint,
        preflight,
      );
      expect(
        assertOperationalWorkbookV2ApplicationPlan(plan, preflight),
      ).toBe(true);
      expect(plan.applicationGuard.preflightSpreadsheetTitle).toBe(
        preflight.spreadsheetTitle,
      );
    }

    const buildingDemoV2 = buildAppliedPreflightFromRequests(
      asRequests(
        compileOperationalWorkbookV2ApplicationPlan(
          buildingDemo,
          buildingDemoV1,
        ).requests,
      ),
      buildingDemoV1,
    );
    const v2WrongTitle = sealOperationalWorkbookV2Preflight({
      capturedAt: buildingDemoV2.capturedAt,
      developerMetadata: buildingDemoV2.developerMetadata,
      revisionToken: buildingDemoV2.revisionToken,
      sheets: buildingDemoV2.sheets,
      spreadsheetId: buildingDemoV2.spreadsheetId,
      spreadsheetTitle:
        "Démonstration - Système métier - Restaurant",
    });
    expect(() =>
      compileOperationalWorkbookV2ApplicationPlan(
        buildingDemo,
        v2WrongTitle,
      ),
    ).toThrow("État du classeur inconnu");
  });

  it("never treats another system, variant, or revision as already applied", () => {
    const buildingDemo = buildOperationalWorkbookV2Blueprint(
      "batiment",
      "demo",
    );
    const buildingDemoV1 = buildV1Preflight(buildingDemo);
    const appliedBuildingDemo = buildAppliedPreflightFromRequests(
      asRequests(
        compileOperationalWorkbookV2ApplicationPlan(
          buildingDemo,
          buildingDemoV1,
        ).requests,
      ),
      buildingDemoV1,
    );
    const restaurantDemo = buildOperationalWorkbookV2Blueprint(
      "restaurant",
      "demo",
    );
    const buildingEditable = buildOperationalWorkbookV2Blueprint(
      "batiment",
      "editable",
    );
    const previousRevision = sealOperationalWorkbookV2Preflight({
      capturedAt: appliedBuildingDemo.capturedAt,
      developerMetadata: appliedBuildingDemo.developerMetadata.map(
        (entry) =>
          entry.key === "demaa.assetRevision"
            ? { ...entry, value: "d061-v2-pilot-previous" }
            : entry,
      ),
      revisionToken: appliedBuildingDemo.revisionToken,
      sheets: appliedBuildingDemo.sheets,
      spreadsheetId: appliedBuildingDemo.spreadsheetId,
      spreadsheetTitle: appliedBuildingDemo.spreadsheetTitle,
    });

    expect(() =>
      compileOperationalWorkbookV2ApplicationPlan(
        restaurantDemo,
        appliedBuildingDemo,
      ),
    ).toThrow("État du classeur inconnu");
    expect(() =>
      compileOperationalWorkbookV2ApplicationPlan(
        buildingEditable,
        appliedBuildingDemo,
      ),
    ).toThrow("État du classeur inconnu");
    expect(() =>
      compileOperationalWorkbookV2ApplicationPlan(
        buildingDemo,
        previousRevision,
      ),
    ).toThrow("État du classeur inconnu");
  });

  it("rejects sheet-scoped or non-document identity metadata", () => {
    const blueprint = buildOperationalWorkbookV2Blueprint(
      "batiment",
      "demo",
    );
    const blueprintV1 = buildV1Preflight(blueprint);
    const applied = buildAppliedPreflightFromRequests(
      asRequests(
        compileOperationalWorkbookV2ApplicationPlan(
          blueprint,
          blueprintV1,
        ).requests,
      ),
      blueprintV1,
    );
    const sheetScoped = sealOperationalWorkbookV2Preflight({
      capturedAt: applied.capturedAt,
      developerMetadata: applied.developerMetadata.map(
        (entry, index) =>
          index === 0
            ? {
                ...entry,
                location: {
                  sheetId: OPERATIONAL_WORKBOOK_V2_SHEET_IDS.summary,
                },
              }
            : entry,
      ),
      revisionToken: applied.revisionToken,
      sheets: applied.sheets,
      spreadsheetId: applied.spreadsheetId,
      spreadsheetTitle: applied.spreadsheetTitle,
    });
    const wrongVisibility = sealOperationalWorkbookV2Preflight({
      capturedAt: applied.capturedAt,
      developerMetadata: applied.developerMetadata.map(
        (entry, index) =>
          index === 0
            ? { ...entry, visibility: "PROJECT" }
            : entry,
      ),
      revisionToken: applied.revisionToken,
      sheets: applied.sheets,
      spreadsheetId: applied.spreadsheetId,
      spreadsheetTitle: applied.spreadsheetTitle,
    });

    expect(() =>
      compileOperationalWorkbookV2ApplicationPlan(
        blueprint,
        sheetScoped,
      ),
    ).toThrow("État du classeur inconnu");
    expect(() =>
      compileOperationalWorkbookV2ApplicationPlan(
        blueprint,
        wrongVisibility,
      ),
    ).toThrow("État du classeur inconnu");
  });

  it("binds an application plan to a fresh spreadsheet preflight", () => {
    const blueprint = buildOperationalWorkbookV2Blueprint(
      "pharmacie",
      "editable",
    );
    const sourcePreflight =
      buildOperationalWorkbookV2ExpectedV1Preflight(
        blueprint,
        {
        revisionToken: "drive-revision-41",
        spreadsheetId: "pharmacie-editable-fixture",
        },
      );
    const plan = compileOperationalWorkbookV2ApplicationPlan(
      blueprint,
      sourcePreflight,
    );
    const staleRevision = sealOperationalWorkbookV2Preflight({
      capturedAt: "2026-07-29T00:02:00.000Z",
      developerMetadata: sourcePreflight.developerMetadata,
      revisionToken: "drive-revision-42",
      sheets: sourcePreflight.sheets,
      spreadsheetId: sourcePreflight.spreadsheetId,
      spreadsheetTitle: sourcePreflight.spreadsheetTitle,
    });
    const wrongSpreadsheet = sealOperationalWorkbookV2Preflight({
      capturedAt: "2026-07-29T00:02:00.000Z",
      developerMetadata: sourcePreflight.developerMetadata,
      revisionToken: sourcePreflight.revisionToken,
      sheets: sourcePreflight.sheets,
      spreadsheetId: "another-spreadsheet",
      spreadsheetTitle: sourcePreflight.spreadsheetTitle,
    });

    expect(
      assertOperationalWorkbookV2ApplicationPlan(
        plan,
        sourcePreflight,
      ),
    ).toBe(true);
    expect(plan.applicationGuard.targetIdentity).toEqual({
      assetRevision: blueprint.assetRevision,
      systemSlug: "pharmacie",
      variant: "editable",
      workbookVersion: blueprint.workbookVersion,
    });
    expect(() =>
      assertOperationalWorkbookV2ApplicationPlan(
        plan,
        staleRevision,
      ),
    ).toThrow("Préflight obsolète");
    expect(() =>
      assertOperationalWorkbookV2ApplicationPlan(
        plan,
        wrongSpreadsheet,
      ),
    ).toThrow("Préflight obsolète");
  });

  it("rejects altered requests, a foreign batch, and an altered guard", () => {
    const buildingBlueprint = buildOperationalWorkbookV2Blueprint(
      "batiment",
      "demo",
    );
    const restaurantBlueprint = buildOperationalWorkbookV2Blueprint(
      "restaurant",
      "demo",
    );
    const buildingPreflight = buildV1Preflight(buildingBlueprint);
    const buildingPlan = compileOperationalWorkbookV2ApplicationPlan(
      buildingBlueprint,
      buildingPreflight,
    );
    const restaurantPlan = compileOperationalWorkbookV2ApplicationPlan(
      restaurantBlueprint,
      buildV1Preflight(restaurantBlueprint),
    );
    const alteredRequests = {
      ...buildingPlan,
      requests: [
        ...buildingPlan.requests,
        { deleteSheet: { sheetId: 123456789 } },
      ],
    };
    const foreignRequests = {
      ...buildingPlan,
      requests: restaurantPlan.requests,
    };
    const alteredGuard = {
      ...buildingPlan,
      applicationGuard: {
        ...buildingPlan.applicationGuard,
        targetIdentity: {
          ...buildingPlan.applicationGuard.targetIdentity,
          systemSlug: "restaurant",
        },
      },
    };

    expect(() =>
      assertOperationalWorkbookV2ApplicationPlan(
        alteredRequests,
        buildingPreflight,
      ),
    ).toThrow("Plan scellé invalide");
    expect(() =>
      assertOperationalWorkbookV2ApplicationPlan(
        foreignRequests,
        buildingPreflight,
      ),
    ).toThrow("Plan scellé invalide");
    expect(() =>
      assertOperationalWorkbookV2ApplicationPlan(
        alteredGuard,
        buildingPreflight,
      ),
    ).toThrow("Plan scellé invalide");
  });

  it("rejects every request payload that JSON would transform", () => {
    const blueprint = buildOperationalWorkbookV2Blueprint(
      "batiment",
      "demo",
    );
    const preflight = buildV1Preflight(blueprint);
    const plan = compileOperationalWorkbookV2ApplicationPlan(
      blueprint,
      preflight,
    );
    const withRequests = (requests: unknown[]) =>
      ({
        ...plan,
        requests,
      }) as OperationalWorkbookV2ApplicationPlan;
    const emptyValues = withRequests([{ values: [] }]);

    expect(
      serializeOperationalWorkbookV2ApplicationPlan(emptyValues),
    ).toContain('"values":[]');

    const undefinedValues = withRequests([
      { values: [undefined] },
    ]);
    const sparseValues: unknown[] = [];
    sparseValues.length = 1;
    const sparsePlan = withRequests([{ values: sparseValues }]);
    const protoPlan = withRequests([
      JSON.parse('{"__proto__":{"polluted":true}}') as unknown,
    ]);
    const invalidJsonValues = [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      () => "non-json",
      Symbol("non-json"),
      BigInt(1),
      new Date("2026-07-29T00:00:00.000Z"),
      new Map([["key", "value"]]),
    ];

    for (const invalidPlan of [
      undefinedValues,
      sparsePlan,
      protoPlan,
      ...invalidJsonValues.map((value) =>
        withRequests([{ values: [value] }]),
      ),
    ]) {
      expect(() =>
        serializeOperationalWorkbookV2ApplicationPlan(invalidPlan),
      ).toThrow("Payload JSON non canonique");
      expect(() =>
        assertOperationalWorkbookV2ApplicationPlan(
          invalidPlan,
          preflight,
        ),
      ).toThrow("payload JSON non canonique");
    }
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });

  it("marks the CLI output as a sealed plan that requires assertion", () => {
    const blueprint = buildOperationalWorkbookV2Blueprint(
      "batiment",
      "editable",
    );
    const plan = compileOperationalWorkbookV2ApplicationPlan(
      blueprint,
      buildV1Preflight(blueprint),
    );

    expect(plan.kind).toBe(
      "demaa.operational-workbook-v2.sealed-plan",
    );
    expect(plan.applicableOnlyAfter).toBe(
      "assertOperationalWorkbookV2ApplicationPlan",
    );
    expect(plan.applicationGuard.requestsFingerprint).toMatch(
      /^[a-f0-9]{64}$/,
    );
    expect(plan.planFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it("produces the same deterministic batch for the same v1 preflight", () => {
    const blueprint = buildOperationalWorkbookV2Blueprint(
      "assistant-administratif-externalise",
      "editable",
    );
    const v1Preflight = buildV1Preflight(blueprint);
    const first = compileOperationalWorkbookV2ApplicationPlan(
      blueprint,
      v1Preflight,
    );
    const second = compileOperationalWorkbookV2ApplicationPlan(
      blueprint,
      v1Preflight,
    );

    expect(first).toEqual(second);
  });
});
