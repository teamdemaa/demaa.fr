import { describe, expect, it } from "vitest";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { buildSystemeDetail } from "@/lib/systeme-catalog";
import {
  buildLevierProcessProjection,
  buildLevierProcessWorkbookRequests,
  LEVIER_PROCESS_COLUMNS,
  LEVIER_PROCESS_REGISTRY_SHEET_ID,
  LEVIER_PROCESS_SHEET_ID,
} from "../scripts/lib/levier-process-projection";

describe("Levier Process projection", () => {
  it("projects exactly the 8–12 public routines of all 115 systems", () => {
    const systems = buildLevierProcessProjection();

    expect(systems).toHaveLength(115);
    expect(new Set(systems.map((system) => system.slug))).toHaveLength(115);
    expect(new Set(systems.map((system) => system.name))).toHaveLength(115);

    for (const system of systems) {
      const enterprise = enterpriseCatalog.find(
        (candidate) => candidate.slug === system.slug,
      );
      expect(enterprise, system.slug).toBeDefined();

      const publicRoutines = buildSystemeDetail(enterprise!)?.routines ?? [];
      expect(system.routines, system.slug).toEqual(
        publicRoutines.map((routine) => ({
          systemSlug: system.slug,
          systemName: system.name,
          routineId: routine.routineId,
          process: routine.title,
          cadence: routine.cadence,
        })),
      );
      expect(system.routines.length, system.slug).toBeGreaterThanOrEqual(8);
      expect(system.routines.length, system.slug).toBeLessThanOrEqual(12);
    }
  });

  it("adds a simple Process view without changing Actions or the existing charts", () => {
    const { requests } = buildLevierProcessWorkbookRequests();
    const serialized = JSON.stringify(requests);
    const selectorValidation = requests.find((request) => {
      const validation = request.setDataValidation as
        | {
            range?: { sheetId?: number; startRowIndex?: number };
            rule?: {
              condition?: { values?: Array<{ userEnteredValue?: string }> };
            };
          }
        | undefined;
      return (
        validation?.range?.sheetId === 288_592_891 &&
        validation.range.startRowIndex === 7
      );
    })?.setDataValidation as
      | {
          rule?: {
            condition?: { values?: Array<{ userEnteredValue?: string }> };
          };
        }
      | undefined;
    const selectorMerge = requests.find((request) => {
      const merge = request.mergeCells as
        | {
            range?: {
              sheetId?: number;
              startRowIndex?: number;
              startColumnIndex?: number;
              endColumnIndex?: number;
            };
          }
        | undefined;
      return (
        merge?.range?.sheetId === 288_592_891 &&
        merge.range.startRowIndex === 7
      );
    })?.mergeCells as
      | { range?: { startColumnIndex?: number; endColumnIndex?: number } }
      | undefined;

    expect(LEVIER_PROCESS_COLUMNS).toEqual([
      "Process",
      "Fréquence",
      "Responsable",
      "Statut",
      "Prochaine action",
      "Notes",
    ]);
    expect(serialized).not.toContain("Process lié");
    expect(serialized).not.toMatch(
      /insertDimension|deleteDimension|updateChartSpec|deleteEmbeddedObject/,
    );
    expect(serialized).toContain("'Démarrage'!B8");
    expect(serialized).toContain("ONE_OF_RANGE");
    expect(serialized).toContain("ONE_OF_LIST");
    expect(serialized).toContain(String(LEVIER_PROCESS_SHEET_ID));
    expect(serialized).toContain(String(LEVIER_PROCESS_REGISTRY_SHEET_ID));
    expect(
      selectorValidation?.rule?.condition?.values?.[0]?.userEnteredValue,
    ).toBe("='_Référentiel Process'!$H$2:$H$116");
    expect(selectorMerge?.range).toMatchObject({
      startColumnIndex: 1,
      endColumnIndex: 4,
    });
  });

  it("writes every projected routine once in the hidden registry", () => {
    const { requests, routineCount } = buildLevierProcessWorkbookRequests();
    const registryWrite = requests.find((request) => {
      const update = request.updateCells as
        | { range?: { sheetId?: number }; rows?: unknown[] }
        | undefined;
      return update?.range?.sheetId === LEVIER_PROCESS_REGISTRY_SHEET_ID;
    });
    const rows = (
      registryWrite?.updateCells as { rows?: unknown[] } | undefined
    )?.rows;

    expect(rows).toHaveLength(routineCount + 1);
  });
});
