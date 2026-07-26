import type {
  OperationalWorkbookBlueprint,
  OperationalWorkbookEcosystemRow,
} from "@/lib/operational-workbook-factory";

export type OperationalWorkbookSheetIds = {
  actions: number;
  calendar: number;
  ecosystem: number;
  forecast: number;
  process: number;
  summary: number;
  team: number;
};

export const CANONICAL_OPERATIONAL_WORKBOOK_SHEET_IDS: OperationalWorkbookSheetIds =
  {
    summary: 739734511,
    forecast: 1209445802,
    actions: 593863816,
    team: 2022689011,
    ecosystem: 1876543210,
    calendar: 314159265,
    process: 271828182,
  };

type Formula = { formulaValue: string };
type CellValue = Formula | number | string;

function formula(formulaValue: string): Formula {
  return { formulaValue };
}

function dateFormula(isoDate: string): Formula {
  const [year, month, day] = isoDate.split("-").map(Number);
  return formula(`=DATE(${year};${month};${day})`);
}

function hyperlink(url: string): Formula {
  return formula(`=HYPERLINK("${url}";"Ouvrir")`);
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

function gridRange(
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

function clearValues(range: ReturnType<typeof gridRange>) {
  return {
    repeatCell: {
      range,
      cell: {},
      fields: "userEnteredValue",
    },
  };
}

function writeValues(
  range: ReturnType<typeof gridRange>,
  rows: CellValue[][],
) {
  return {
    updateCells: {
      range,
      rows: rows.map(row),
      fields: "userEnteredValue",
    },
  };
}

function buildFinancialSeries(
  blueprint: OperationalWorkbookBlueprint,
) {
  const monthlyRevenue = blueprint.financialProfile.monthlyRevenue;
  const history = Array.from({ length: 15 }, (_, index) =>
    Math.round(monthlyRevenue * (0.82 + index * 0.015)),
  );
  const projection = Array.from({ length: 12 }, (_, index) =>
    Math.round(monthlyRevenue * (1.06 + index * 0.015)),
  );
  const activityHistory = history.map((value) =>
    Math.max(1, Math.round(value / 1_500)),
  );
  const activityProjection = projection.map((value) =>
    Math.max(1, Math.round(value / 1_500)),
  );
  const percentageSeries = (values: number[], percentage: number) =>
    values.map((value) => Math.round(value * percentage));

  return [
    [6, history, projection],
    [7, activityHistory, activityProjection],
    [13, percentageSeries(history, 0.25), percentageSeries(projection, 0.25)],
    [17, percentageSeries(history, 0.22), percentageSeries(projection, 0.22)],
    [24, percentageSeries(history, 0.02), percentageSeries(projection, 0.02)],
  ] as const;
}

function buildEcosystemValues(
  ecosystemRows: OperationalWorkbookEcosystemRow[],
): CellValue[][] {
  return ecosystemRows.map((entry) => [
    entry.category,
    entry.need,
    entry.name,
    entry.chosenSolution,
    entry.status,
    entry.cost,
    entry.targetDate ? dateFormula(entry.targetDate) : "",
    hyperlink(entry.url),
    entry.notes,
  ]);
}

export function compileOperationalWorkbookSheetRequests(
  blueprint: OperationalWorkbookBlueprint,
  sheetIds: OperationalWorkbookSheetIds =
    CANONICAL_OPERATIONAL_WORKBOOK_SHEET_IDS,
) {
  const isDemo = blueprint.variant === "demo";
  const processCount = new Set(
    blueprint.processRows.map((entry) => entry.process),
  ).size;
  const actionEnd = 5 + blueprint.actionRows.length;
  const processEnd = 7 + blueprint.processRows.length;
  const teamEnd = 5 + blueprint.teamRows.length;
  const calendarEnd = 5 + blueprint.calendarRows.length;
  const ecosystemEnd = 5 + blueprint.ecosystemRows.length;
  const workbookTitle = isDemo
    ? `Démonstration - Système opérationnel - ${blueprint.systemName}`
    : `Système opérationnel modifiable - ${blueprint.systemName}`;
  const requests: unknown[] = [
    {
      updateSpreadsheetProperties: {
        properties: { title: workbookTitle },
        fields: "title",
      },
    },
    ...([
      [sheetIds.actions, 1],
      [sheetIds.process, 2],
      [sheetIds.team, 3],
      [sheetIds.forecast, 4],
      [sheetIds.calendar, 5],
      [sheetIds.ecosystem, 6],
    ] as const).map(([sheetId, index]) => ({
      updateSheetProperties: {
        properties: { sheetId, index },
        fields: "index",
      },
    })),
    writeValues(gridRange(sheetIds.summary, 0, 2, 0, 1), [
      [`${blueprint.systemName.toUpperCase()} - SYSTÈME OPÉRATIONNEL`],
      [blueprint.notices.Synthèse],
    ]),
    writeValues(gridRange(sheetIds.actions, 0, 2, 2, 3), [
      [`ACTIONS - ${blueprint.systemName.toUpperCase()}`],
      [blueprint.notices.Actions],
    ]),
    writeValues(gridRange(sheetIds.process, 0, 2, 0, 1), [
      [`PROCESS - ${blueprint.systemName.toUpperCase()}`],
      [blueprint.notices.Process],
    ]),
    writeValues(gridRange(sheetIds.team, 0, 2, 0, 1), [
      [`ÉQUIPE - ${blueprint.systemName.toUpperCase()}`],
      [blueprint.notices.Équipe],
    ]),
    writeValues(gridRange(sheetIds.forecast, 0, 2, 0, 1), [
      [`${blueprint.systemName.toUpperCase()} - PRÉVISIONNEL FINANCIER`],
      [blueprint.notices["Prévisionnel financier"]],
    ]),
    writeValues(gridRange(sheetIds.calendar, 0, 2, 0, 1), [
      [`CALENDRIER MARKETING - ${blueprint.systemName.toUpperCase()}`],
      [blueprint.notices["Calendrier marketing"]],
    ]),
    writeValues(gridRange(sheetIds.ecosystem, 0, 2, 0, 1), [
      [`ÉCOSYSTÈME - ${blueprint.systemName.toUpperCase()}`],
      [blueprint.notices.Écosystème],
    ]),
    clearValues(gridRange(sheetIds.actions, 5, 498, 0, 12)),
    writeValues(
      gridRange(sheetIds.actions, 5, actionEnd, 0, 12),
      blueprint.actionRows.map((entry) => [
        entry.id,
        entry.pillar,
        entry.process,
        entry.action,
        entry.owner,
        entry.support,
        entry.priority,
        entry.start ? dateFormula(entry.start) : "",
        entry.due ? dateFormula(entry.due) : "",
        entry.status,
        entry.expectedResult,
        entry.notes,
      ]),
    ),
    clearValues(gridRange(sheetIds.process, 7, 200, 0, 7)),
    writeValues(gridRange(sheetIds.process, 3, 5, 0, 6), [
      [
        "Process",
        "Contenus",
        "À mettre en place",
        "Étapes",
        "Règles",
        "Contrôles",
      ],
      [
        processCount,
        blueprint.processRows.length,
        blueprint.processRows.filter(
          (entry) => entry.contentType === "Action de mise en place",
        ).length,
        blueprint.processRows.filter(
          (entry) => entry.contentType === "Étape opérationnelle",
        ).length,
        blueprint.processRows.filter((entry) => entry.contentType === "Règle")
          .length,
        blueprint.processRows.filter(
          (entry) => entry.contentType === "Contrôle récurrent",
        ).length,
      ],
    ]),
    writeValues(
      gridRange(sheetIds.process, 7, processEnd, 0, 7),
      blueprint.processRows.map((entry) => [
        entry.pillar,
        entry.process,
        entry.contentType,
        entry.content,
        entry.recommendedOwner,
        entry.recurrence,
        entry.support,
      ]),
    ),
    clearValues(gridRange(sheetIds.team, 5, 201, 0, 8)),
    writeValues(
      gridRange(sheetIds.team, 5, teamEnd, 0, 8),
      blueprint.teamRows.map((entry) => [
        entry.role,
        entry.person,
        entry.situation,
        entry.manager,
        entry.mainResponsibility,
        entry.relatedProcesses,
        entry.targetDate ? dateFormula(entry.targetDate) : "",
        entry.notes,
      ]),
    ),
    clearValues(gridRange(sheetIds.calendar, 5, 200, 0, 7)),
    clearValues(gridRange(sheetIds.ecosystem, 5, 120, 0, 9)),
    writeValues(
      gridRange(sheetIds.ecosystem, 5, ecosystemEnd, 0, 9),
      buildEcosystemValues(blueprint.ecosystemRows),
    ),
  ];

  if (isDemo) {
    requests.push(
      writeValues(gridRange(sheetIds.summary, 15, 16, 3, 4), [
        [dateFormula("2026-08-01")],
      ]),
      writeValues(gridRange(sheetIds.summary, 15, 16, 8, 9), [
        [blueprint.financialProfile.activityUnit],
      ]),
      writeValues(gridRange(sheetIds.summary, 17, 20, 3, 4), [
        [dateFormula("2026-12-31")],
        [blueprint.financialProfile.monthlyRevenue],
        [blueprint.financialProfile.operatingMarginRate],
      ]),
      writeValues(gridRange(sheetIds.summary, 17, 20, 8, 9), [
        [dateFormula("2027-06-30")],
        [Math.round(blueprint.financialProfile.monthlyRevenue * 1.18)],
        [Math.min(0.3, blueprint.financialProfile.operatingMarginRate + 0.02)],
      ]),
      writeValues(
        gridRange(sheetIds.calendar, 5, calendarEnd, 0, 7),
        blueprint.calendarRows.map((entry) => [
          dateFormula(entry.due),
          entry.phase,
          entry.action,
          entry.channel,
          entry.owner,
          entry.status,
          entry.notes,
        ]),
      ),
    );

    for (const [rowIndex, history, projection] of buildFinancialSeries(
      blueprint,
    )) {
      requests.push(
        writeValues(
          gridRange(sheetIds.forecast, rowIndex, rowIndex + 1, 1, 16),
          [[...history]],
        ),
        writeValues(
          gridRange(sheetIds.forecast, rowIndex, rowIndex + 1, 17, 29),
          [[...projection]],
        ),
      );
    }
  } else {
    requests.push(
      clearValues(gridRange(sheetIds.summary, 15, 20, 3, 4)),
      clearValues(gridRange(sheetIds.summary, 15, 20, 8, 9)),
      clearValues(gridRange(sheetIds.forecast, 6, 42, 1, 16)),
      clearValues(gridRange(sheetIds.forecast, 6, 42, 17, 29)),
    );
  }

  return {
    requests,
    summary: {
      actions: blueprint.actionRows.length,
      ecosystemRows: blueprint.ecosystemRows.length,
      processContents: blueprint.processRows.length,
      processes: processCount,
      teamRoles: blueprint.teamRows.length,
      variant: blueprint.variant,
    },
  };
}
