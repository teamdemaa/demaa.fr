import { enterpriseCatalog } from "../../src/lib/enterprise-annuaire";
import { buildSystemeDetail } from "../../src/lib/systeme-catalog";

export const LEVIER_PROCESS_SHEET_TITLE = "Process";
export const LEVIER_PROCESS_REGISTRY_SHEET_TITLE = "_Référentiel Process";
export const LEVIER_PROCESS_SHEET_ID = 1_808_202_601;
export const LEVIER_PROCESS_REGISTRY_SHEET_ID = 1_808_202_602;
export const LEVIER_PROCESS_SELECTOR_CELL = "'Démarrage'!B8";
export const LEVIER_PROCESS_COLUMNS = [
  "Process",
  "Fréquence",
  "Responsable",
  "Statut",
  "Prochaine action",
  "Notes",
] as const;

export type LevierProcessProjectionRow = {
  systemSlug: string;
  systemName: string;
  routineId: string;
  process: string;
  cadence: string;
};

export type LevierProcessSystem = {
  slug: string;
  name: string;
  routines: LevierProcessProjectionRow[];
};

type SheetsRequest = Record<string, unknown>;

const COLORS = {
  forest: { red: 0.19215687, green: 0.37254903, blue: 0.27450982 },
  sage: { red: 0.8666667, green: 0.9098039, blue: 0.8745098 },
  pale: { red: 0.9647059, green: 0.9764706, blue: 0.9647059 },
  header: { red: 0.93333334, green: 0.9490196, blue: 0.92941177 },
  ink: { red: 0.09019608, green: 0.14509805, blue: 0.11372549 },
  border: { red: 0.8666667, green: 0.8901961, blue: 0.87058824 },
  white: { red: 1, green: 1, blue: 1 },
};

function cellString(value: string) {
  return { userEnteredValue: { stringValue: value } };
}

function cellFormula(value: string) {
  return { userEnteredValue: { formulaValue: value } };
}

function emptyCell() {
  return {};
}

export function buildLevierProcessProjection(): LevierProcessSystem[] {
  const systems = enterpriseCatalog.map((enterprise) => {
    const detail = buildSystemeDetail(enterprise);

    if (!detail) {
      throw new Error(`[levier-process] Système sans détail public: ${enterprise.slug}`);
    }
    if (detail.routines.length < 8 || detail.routines.length > 12) {
      throw new Error(
        `[levier-process] ${enterprise.slug} expose ${detail.routines.length} routines au lieu de 8 à 12`,
      );
    }

    return {
      slug: enterprise.slug,
      name: enterprise.name,
      routines: detail.routines.map((routine) => ({
        systemSlug: enterprise.slug,
        systemName: enterprise.name,
        routineId: routine.routineId,
        process: routine.title,
        cadence: routine.cadence,
      })),
    };
  });

  if (systems.length !== 115) {
    throw new Error(`[levier-process] ${systems.length} systèmes trouvés au lieu de 115`);
  }

  const systemNames = new Set(systems.map((system) => system.name));
  const systemSlugs = new Set(systems.map((system) => system.slug));

  if (systemNames.size !== systems.length || systemSlugs.size !== systems.length) {
    throw new Error("[levier-process] Les noms et slugs des systèmes doivent être uniques");
  }

  return systems.sort((left, right) =>
    left.name.localeCompare(right.name, "fr", { sensitivity: "base" }),
  );
}

export function buildLevierProcessWorkbookRequests(): {
  requests: SheetsRequest[];
  systems: LevierProcessSystem[];
  routineCount: number;
} {
  const systems = buildLevierProcessProjection();
  const routineRows = systems.flatMap((system) => system.routines);
  const registryRows = [
    {
      values: [
        cellString("system_slug"),
        cellString("system_name"),
        cellString("process"),
        cellString("cadence"),
        cellString("routine_id"),
        emptyCell(),
        cellString("system_slug"),
        cellString("system_name"),
      ],
    },
    ...routineRows.map((routine, index) => ({
      values: [
        cellString(routine.systemSlug),
        cellString(routine.systemName),
        cellString(routine.process),
        cellString(routine.cadence),
        cellString(routine.routineId),
        emptyCell(),
        index < systems.length ? cellString(systems[index].slug) : emptyCell(),
        index < systems.length ? cellString(systems[index].name) : emptyCell(),
      ],
    })),
  ];
  const registryRowCount = registryRows.length;
  const systemListEndRow = systems.length + 2;
  const statusValues = ["À faire", "En cours", "Terminé", "Bloqué"];

  const requests: SheetsRequest[] = [
    {
      addSheet: {
        properties: {
          sheetId: LEVIER_PROCESS_SHEET_ID,
          title: LEVIER_PROCESS_SHEET_TITLE,
          index: 4,
          gridProperties: {
            rowCount: 100,
            columnCount: 6,
            frozenRowCount: 4,
            hideGridlines: true,
          },
        },
      },
    },
    {
      addSheet: {
        properties: {
          sheetId: LEVIER_PROCESS_REGISTRY_SHEET_ID,
          title: LEVIER_PROCESS_REGISTRY_SHEET_TITLE,
          index: 5,
          hidden: true,
          gridProperties: {
            rowCount: Math.max(2_000, registryRowCount),
            columnCount: 8,
            frozenRowCount: 1,
            hideGridlines: true,
          },
        },
      },
    },
    {
      copyPaste: {
        source: {
          sheetId: 288_592_891,
          startRowIndex: 6,
          endRowIndex: 7,
          startColumnIndex: 0,
          endColumnIndex: 4,
        },
        destination: {
          sheetId: 288_592_891,
          startRowIndex: 7,
          endRowIndex: 8,
          startColumnIndex: 0,
          endColumnIndex: 4,
        },
        pasteType: "PASTE_NORMAL",
        pasteOrientation: "NORMAL",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: 288_592_891,
          startRowIndex: 7,
          endRowIndex: 8,
          startColumnIndex: 0,
          endColumnIndex: 2,
        },
        rows: [
          {
            values: [
              cellString("Choisissez votre système métier"),
              emptyCell(),
            ],
          },
        ],
        fields: "userEnteredValue",
      },
    },
    {
      setDataValidation: {
        range: {
          sheetId: 288_592_891,
          startRowIndex: 7,
          endRowIndex: 8,
          startColumnIndex: 1,
          endColumnIndex: 2,
        },
        rule: {
          condition: {
            type: "ONE_OF_RANGE",
            values: [
              {
                userEnteredValue: `='${LEVIER_PROCESS_REGISTRY_SHEET_TITLE}'!$H$2:$H$${systemListEndRow - 1}`,
              },
            ],
          },
          strict: true,
          showCustomUi: true,
        },
      },
    },
    {
      mergeCells: {
        range: {
          sheetId: 288_592_891,
          startRowIndex: 7,
          endRowIndex: 8,
          startColumnIndex: 1,
          endColumnIndex: 4,
        },
        mergeType: "MERGE_ALL",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: LEVIER_PROCESS_REGISTRY_SHEET_ID,
          startRowIndex: 0,
          endRowIndex: registryRowCount,
          startColumnIndex: 0,
          endColumnIndex: 8,
        },
        rows: registryRows,
        fields: "userEnteredValue",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: LEVIER_PROCESS_SHEET_ID,
          startRowIndex: 0,
          endRowIndex: 5,
          startColumnIndex: 0,
          endColumnIndex: 6,
        },
        rows: [
          { values: [cellString("Levier · Process"), ...Array.from({ length: 5 }, emptyCell)] },
          { values: [cellString("TABLEAU DE PILOTAGE OPÉRATIONNEL"), ...Array.from({ length: 5 }, emptyCell)] },
          {
            values: [
              cellFormula(
                `=IF('Démarrage'!B8="";"Choisissez votre système métier dans l’onglet Démarrage";'Démarrage'!B8)`,
              ),
              ...Array.from({ length: 5 }, emptyCell),
            ],
          },
          { values: LEVIER_PROCESS_COLUMNS.map((column) => cellString(column)) },
          {
            values: [
              cellFormula(
                `=IF('Démarrage'!B8="";"";IFERROR(FILTER('${LEVIER_PROCESS_REGISTRY_SHEET_TITLE}'!C2:D;'${LEVIER_PROCESS_REGISTRY_SHEET_TITLE}'!B2:B='Démarrage'!B8);""))`,
              ),
              ...Array.from({ length: 5 }, emptyCell),
            ],
          },
        ],
        fields: "userEnteredValue",
      },
    },
    ...[0, 1, 2].map((rowIndex) => ({
      mergeCells: {
        range: {
          sheetId: LEVIER_PROCESS_SHEET_ID,
          startRowIndex: rowIndex,
          endRowIndex: rowIndex + 1,
          startColumnIndex: 0,
          endColumnIndex: 6,
        },
        mergeType: "MERGE_ALL",
      },
    })),
    {
      repeatCell: {
        range: {
          sheetId: LEVIER_PROCESS_SHEET_ID,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 0,
          endColumnIndex: 6,
        },
        cell: {
          userEnteredFormat: {
            backgroundColorStyle: { rgbColor: COLORS.forest },
            horizontalAlignment: "LEFT",
            verticalAlignment: "MIDDLE",
            textFormat: {
              foregroundColorStyle: { rgbColor: COLORS.white },
              fontFamily: "Arial",
              fontSize: 20,
              bold: true,
            },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: LEVIER_PROCESS_SHEET_ID,
          startRowIndex: 1,
          endRowIndex: 2,
          startColumnIndex: 0,
          endColumnIndex: 6,
        },
        cell: {
          userEnteredFormat: {
            backgroundColorStyle: { rgbColor: COLORS.sage },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            textFormat: {
              foregroundColorStyle: { rgbColor: COLORS.forest },
              fontFamily: "Arial",
              fontSize: 9,
              bold: true,
            },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: LEVIER_PROCESS_SHEET_ID,
          startRowIndex: 2,
          endRowIndex: 3,
          startColumnIndex: 0,
          endColumnIndex: 6,
        },
        cell: {
          userEnteredFormat: {
            backgroundColorStyle: { rgbColor: COLORS.white },
            horizontalAlignment: "LEFT",
            verticalAlignment: "MIDDLE",
            textFormat: {
              foregroundColorStyle: { rgbColor: COLORS.forest },
              fontFamily: "Arial",
              fontSize: 11,
              bold: true,
            },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: LEVIER_PROCESS_SHEET_ID,
          startRowIndex: 3,
          endRowIndex: 4,
          startColumnIndex: 0,
          endColumnIndex: 6,
        },
        cell: {
          userEnteredFormat: {
            backgroundColorStyle: { rgbColor: COLORS.header },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            textFormat: {
              foregroundColorStyle: { rgbColor: COLORS.forest },
              fontFamily: "Arial",
              fontSize: 10,
              bold: true,
            },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      repeatCell: {
        range: {
          sheetId: LEVIER_PROCESS_SHEET_ID,
          startRowIndex: 4,
          endRowIndex: 16,
          startColumnIndex: 0,
          endColumnIndex: 6,
        },
        cell: {
          userEnteredFormat: {
            backgroundColorStyle: { rgbColor: COLORS.pale },
            borders: {
              top: { style: "SOLID", width: 1, colorStyle: { rgbColor: COLORS.border } },
              bottom: { style: "SOLID", width: 1, colorStyle: { rgbColor: COLORS.border } },
            },
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            textFormat: {
              foregroundColorStyle: { rgbColor: COLORS.ink },
              fontFamily: "Arial",
              fontSize: 10,
            },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      setDataValidation: {
        range: {
          sheetId: LEVIER_PROCESS_SHEET_ID,
          startRowIndex: 4,
          endRowIndex: 16,
          startColumnIndex: 3,
          endColumnIndex: 4,
        },
        rule: {
          condition: {
            type: "ONE_OF_LIST",
            values: statusValues.map((status) => ({ userEnteredValue: status })),
          },
          strict: true,
          showCustomUi: true,
        },
      },
    },
    ...statusValues.slice(1).map((status, index) => ({
      addConditionalFormatRule: {
        index,
        rule: {
          ranges: [
            {
              sheetId: LEVIER_PROCESS_SHEET_ID,
              startRowIndex: 4,
              endRowIndex: 16,
              startColumnIndex: 3,
              endColumnIndex: 4,
            },
          ],
          booleanRule: {
            condition: {
              type: "TEXT_CONTAINS",
              values: [{ userEnteredValue: status }],
            },
            format:
              status === "Bloqué"
                ? {
                    backgroundColorStyle: {
                      rgbColor: { red: 0.9843137, green: 0.8862745, blue: 0.87058824 },
                    },
                    textFormat: {
                      bold: true,
                      foregroundColorStyle: {
                        rgbColor: { red: 0.54509807, green: 0.18039216, blue: 0.13333334 },
                      },
                    },
                  }
                : {
                    backgroundColorStyle: { rgbColor: COLORS.sage },
                    textFormat: {
                      bold: true,
                      foregroundColorStyle: { rgbColor: COLORS.forest },
                    },
                  },
          },
        },
      },
    })),
    ...[300, 120, 170, 120, 260, 240].map((pixelSize, columnIndex) => ({
      updateDimensionProperties: {
        range: {
          sheetId: LEVIER_PROCESS_SHEET_ID,
          dimension: "COLUMNS",
          startIndex: columnIndex,
          endIndex: columnIndex + 1,
        },
        properties: { pixelSize },
        fields: "pixelSize",
      },
    })),
    {
      updateDimensionProperties: {
        range: {
          sheetId: LEVIER_PROCESS_SHEET_ID,
          dimension: "ROWS",
          startIndex: 4,
          endIndex: 16,
        },
        properties: { pixelSize: 48 },
        fields: "pixelSize",
      },
    },
  ];

  return { requests, systems, routineCount: routineRows.length };
}
