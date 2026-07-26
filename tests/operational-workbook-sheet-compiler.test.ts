import { describe, expect, it } from "vitest";
import {
  buildOperationalWorkbookBlueprint,
  getOperationalWorkbookFactorySlugs,
} from "@/lib/operational-workbook-factory";
import { compileOperationalWorkbookSheetRequests } from "@/lib/operational-workbook-sheet-compiler";

describe("operational workbook Google Sheets compiler", () => {
  it("compiles both variants for every system", () => {
    for (const slug of getOperationalWorkbookFactorySlugs()) {
      for (const variant of ["demo", "editable"] as const) {
        const result = compileOperationalWorkbookSheetRequests(
          buildOperationalWorkbookBlueprint(slug, variant),
        );
        const serialized = JSON.stringify(result.requests);

        expect(result.summary.processContents).toBe(74);
        expect(result.requests.length).toBeGreaterThan(20);
        expect(serialized).toContain("ÉCOSYSTÈME");
        expect(serialized).toContain("EM2A Expertise");
      }
    }
  });

  it("writes fictitious data only in the demonstration", () => {
    const demo = compileOperationalWorkbookSheetRequests(
      buildOperationalWorkbookBlueprint("agence-marketing", "demo"),
    );
    const editable = compileOperationalWorkbookSheetRequests(
      buildOperationalWorkbookBlueprint("agence-marketing", "editable"),
    );
    const demoJson = JSON.stringify(demo.requests);
    const editableJson = JSON.stringify(editable.requests);

    expect(demoJson).toContain("DÉMONSTRATION");
    expect(demoJson).toContain("Camille Martin");
    expect(editableJson).toContain("VERSION MODIFIABLE");
    expect(editableJson).not.toContain("DÉMONSTRATION");
    expect(editableJson).not.toContain("Camille Martin");
  });

  it("uses only values accepted by the Actions dropdowns", () => {
    for (const slug of getOperationalWorkbookFactorySlugs()) {
      for (const variant of ["demo", "editable"] as const) {
        const blueprint = buildOperationalWorkbookBlueprint(slug, variant);

        for (const action of blueprint.actionRows) {
          expect(["P1", "P2", "P3", "À définir"]).toContain(
            action.priority,
          );
          expect([
            "À planifier",
            "À faire",
            "En cours",
            "Terminée",
            "Reportée",
          ]).toContain(action.status);
        }
      }
    }
  });

  it("keeps the seven canonical sheet ids and process data in the payload", () => {
    const result = compileOperationalWorkbookSheetRequests(
      buildOperationalWorkbookBlueprint("pharmacie", "editable"),
    );
    const serialized = JSON.stringify(result.requests);

    expect(serialized).toContain('"sheetId":739734511');
    expect(serialized).toContain('"sheetId":271828182');
    expect(serialized).toContain(
      "Ne jamais laisser un objectif commercial influencer l’analyse pharmaceutique",
    );
  });

  it("removes template footer merges before writing variable-length tables", () => {
    const result = compileOperationalWorkbookSheetRequests(
      buildOperationalWorkbookBlueprint("restaurant", "editable"),
    );
    const unmergeRequests = result.requests.filter(
      (request) =>
        typeof request === "object" &&
        request !== null &&
        "unmergeCells" in request,
    );
    const formatCopies = result.requests.filter(
      (request) =>
        typeof request === "object" &&
        request !== null &&
        "copyPaste" in request,
    );

    expect(unmergeRequests).toHaveLength(5);
    expect(formatCopies).toHaveLength(5);
  });

  it("writes the Actions table strictly in its twelve canonical columns", () => {
    const result = compileOperationalWorkbookSheetRequests(
      buildOperationalWorkbookBlueprint("transport-de-marchandise", "demo"),
    );
    const actionWrites = result.requests.filter((request) => {
      if (
        typeof request !== "object" ||
        request === null ||
        !("updateCells" in request)
      ) {
        return false;
      }

      const updateCells = request.updateCells as {
        range?: {
          sheetId?: number;
          startRowIndex?: number;
          startColumnIndex?: number;
          endColumnIndex?: number;
        };
        rows?: Array<{ values?: unknown[] }>;
      };

      return (
        updateCells.range?.sheetId === 593863816 &&
        updateCells.range.startRowIndex === 5
      );
    });

    expect(actionWrites).toHaveLength(1);

    const updateCells = (
      actionWrites[0] as {
        updateCells: {
          range: {
            startColumnIndex: number;
            endColumnIndex: number;
          };
          rows: Array<{ values: unknown[] }>;
        };
      }
    ).updateCells;

    expect(updateCells.range.startColumnIndex).toBe(0);
    expect(updateCells.range.endColumnIndex).toBe(12);
    expect(updateCells.rows.length).toBeGreaterThan(0);
    expect(
      updateCells.rows.every((row) => row.values.length === 12),
    ).toBe(true);
  });
});
