import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const rootDir = path.resolve(import.meta.dirname, "..");
const demoSourcePath = path.join(
  rootDir,
  "src/lib/plumbing-demo-pilot.ts",
);

const SHEET_IDS = {
  summary: 739734511,
  forecast: 1209445802,
  actions: 593863816,
  team: 2022689011,
  ecosystem: 1876543210,
  calendar: 314159265,
  process: 271828182,
};

function loadTypeScriptModule(sourcePath) {
  const source = fs.readFileSync(sourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: sourcePath,
  });
  const encoded = Buffer.from(transpiled.outputText, "utf8").toString(
    "base64",
  );

  return import(`data:text/javascript;base64,${encoded}`);
}

function formula(value) {
  return { formulaValue: value };
}

function dateFormula(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return formula(`=DATE(${year};${month};${day})`);
}

function hyperlink(url) {
  return formula(`=HYPERLINK("${url}";"Ouvrir")`);
}

function cell(value) {
  if (
    typeof value === "object" &&
    value !== null &&
    "formulaValue" in value
  ) {
    return {
      userEnteredValue: { formulaValue: value.formulaValue },
    };
  }

  if (typeof value === "number") {
    return { userEnteredValue: { numberValue: value } };
  }

  return { userEnteredValue: { stringValue: value } };
}

function row(values) {
  return { values: values.map(cell) };
}

function gridRange(
  sheetId,
  startRowIndex,
  endRowIndex,
  startColumnIndex,
  endColumnIndex,
) {
  return {
    sheetId,
    startRowIndex,
    endRowIndex,
    startColumnIndex,
    endColumnIndex,
  };
}

function clearValues(range) {
  return {
    repeatCell: {
      range,
      cell: {},
      fields: "userEnteredValue",
    },
  };
}

function writeValues(range, rows) {
  return {
    updateCells: {
      range,
      rows: rows.map(row),
      fields: "userEnteredValue",
    },
  };
}

function roundSeries(values, factor) {
  return values.map((value) => Math.round(value * factor));
}

function repeat(value, length) {
  return Array.from({ length }, () => value);
}

function writeFinancialSeries(rowIndex, historyAndForecast, projection) {
  return [
    writeValues(
      gridRange(SHEET_IDS.forecast, rowIndex, rowIndex + 1, 1, 16),
      [historyAndForecast],
    ),
    writeValues(
      gridRange(SHEET_IDS.forecast, rowIndex, rowIndex + 1, 17, 29),
      [projection],
    ),
  ];
}

function buildFinancialRequests(demo) {
  const revenue = demo.plumbingDemoRevenue;
  const volume = demo.plumbingDemoActivityVolume;
  const historyLength = revenue.historyAndForecast.length;
  const projectionLength = revenue.projection.length;
  const salaryHistory = [
    ...repeat(8_200, 3),
    ...repeat(8_600, 9),
    ...repeat(9_300, 3),
  ];
  const salaryProjection = [
    ...repeat(9_800, 6),
    ...repeat(10_600, 6),
  ];
  const managerHistory = [
    ...repeat(3_800, 3),
    ...repeat(4_000, 12),
  ];
  const managerProjection = repeat(4_200, projectionLength);
  const marketingHistory = [
    ...repeat(750, 3),
    ...repeat(900, 12),
  ];
  const marketingProjection = repeat(1_100, projectionLength);
  const investmentsHistory = [
    0, 2_500, 0, 0, 0, 6_500, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];
  const investmentsProjection = [
    0, 0, 0, 0, 0, 12_000, 0, 0, 0, 0, 0, 0,
  ];

  const series = [
    [6, revenue.historyAndForecast, revenue.projection],
    [7, volume.historyAndForecast, volume.projection],
    [
      13,
      roundSeries(revenue.historyAndForecast, 0.25),
      roundSeries(revenue.projection, 0.25),
    ],
    [
      14,
      roundSeries(revenue.historyAndForecast, 0.04),
      roundSeries(revenue.projection, 0.04),
    ],
    [
      15,
      roundSeries(revenue.historyAndForecast, 0.007),
      roundSeries(revenue.projection, 0.007),
    ],
    [17, salaryHistory, salaryProjection],
    [18, managerHistory, managerProjection],
    [19, repeat(500, historyLength), repeat(650, projectionLength)],
    [21, repeat(1_200, historyLength), repeat(1_300, projectionLength)],
    [22, repeat(450, historyLength), repeat(520, projectionLength)],
    [23, repeat(600, historyLength), repeat(680, projectionLength)],
    [24, marketingHistory, marketingProjection],
    [25, repeat(600, historyLength), repeat(700, projectionLength)],
    [26, repeat(450, historyLength), repeat(520, projectionLength)],
    [31, repeat(1_400, historyLength), repeat(1_700, projectionLength)],
    [32, repeat(0, historyLength), repeat(0, projectionLength)],
    [38, investmentsHistory, investmentsProjection],
    [39, repeat(800, historyLength), repeat(800, projectionLength)],
    [40, repeat(0, historyLength), repeat(0, projectionLength)],
    [41, repeat(0, historyLength), repeat(0, projectionLength)],
  ];

  return series.flatMap(([rowIndex, history, projected]) =>
    writeFinancialSeries(rowIndex, history, projected),
  );
}

function buildRequests(demo) {
  const company = demo.plumbingDemoCompany;
  const actionPlanning = demo.plumbingDemoActionPlanning;
  const teamAssignments = demo.plumbingDemoTeamAssignments;
  const calendarRows = demo.plumbingDemoMarketingCalendar.map(
    ([date, ...values]) => [dateFormula(date), ...values],
  );
  const ecosystemRows = demo.plumbingDemoEcosystem.map(
    ([category, need, recommendation, chosen, status, cost, date, link, note]) => [
      category,
      need,
      recommendation,
      chosen,
      status,
      cost,
      dateFormula(date),
      hyperlink(link),
      note,
    ],
  );

  if (
    !company.fictional ||
    actionPlanning.length !== 14 ||
    teamAssignments.length !== 9
  ) {
    throw new Error("Jeu de démonstration incomplet ou non fictif.");
  }

  const actionOwnerRows = actionPlanning.map((action) => [action.owner]);
  const actionPlanRows = actionPlanning.map((action) => [
    action.priority,
    dateFormula(action.start),
    dateFormula(action.due),
    action.status,
  ]);
  const actionNoteRows = actionPlanning.map((action) => [action.note]);
  const teamPersonRows = teamAssignments.map((assignment) => [
    assignment.person,
    assignment.situation,
  ]);
  const teamNoteRows = teamAssignments.map((assignment) => [
    assignment.note,
  ]);

  return [
    {
      updateSpreadsheetProperties: {
        properties: {
          title:
            "Démonstration - Système métier - Plomberie & chauffage",
        },
        fields: "title",
      },
    },
    writeValues(
      gridRange(SHEET_IDS.summary, 1, 2, 0, 1),
      [[
        `DÉMONSTRATION - Données fictives de ${company.name}. Ce fichier montre le résultat attendu ; il ne s’agit pas du modèle gratuit.`,
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.actions, 1, 2, 2, 3),
      [[
        `DÉMONSTRATION - Plan de mise en place fictif de ${company.name}, avec responsables, dates et statuts.`,
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.process, 1, 2, 0, 1),
      [[
        `DÉMONSTRATION - Les 18 process de ${company.name}, société fictive, sont illustrés par 74 contenus concrets.`,
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.team, 1, 2, 0, 1),
      [[
        `DÉMONSTRATION - Répartition fictive des rôles chez ${company.name} ; plusieurs rôles peuvent appartenir à la même personne.`,
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.forecast, 1, 2, 0, 1),
      [[
        `DÉMONSTRATION - Prévisionnel fictif de ${company.name}. Les montants servent uniquement à montrer le fonctionnement.`,
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.calendar, 1, 2, 0, 1),
      [[
        `DÉMONSTRATION - Calendrier commercial fictif de ${company.name}.`,
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.ecosystem, 1, 2, 0, 1),
      [[
        `DÉMONSTRATION - Exemple fictif de ${company.name}. Les liens ouvrent les outils, professionnels et fournisseurs présentés dans cet exemple.`,
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.summary, 15, 16, 3, 4),
      [[dateFormula(company.firstForecastMonth)]],
    ),
    writeValues(
      gridRange(SHEET_IDS.summary, 15, 16, 8, 9),
      [[company.activityUnit]],
    ),
    writeValues(
      gridRange(SHEET_IDS.summary, 17, 20, 3, 4),
      [[dateFormula(company.objectives[0].targetDate)], [
        company.objectives[0].monthlyRevenue,
      ], [company.objectives[0].operatingMargin]],
    ),
    writeValues(
      gridRange(SHEET_IDS.summary, 17, 20, 8, 9),
      [[dateFormula(company.objectives[1].targetDate)], [
        company.objectives[1].monthlyRevenue,
      ], [company.objectives[1].operatingMargin]],
    ),
    writeValues(
      gridRange(SHEET_IDS.actions, 5, 19, 4, 5),
      actionOwnerRows,
    ),
    writeValues(
      gridRange(SHEET_IDS.actions, 5, 19, 6, 10),
      actionPlanRows,
    ),
    writeValues(
      gridRange(SHEET_IDS.actions, 5, 19, 11, 12),
      actionNoteRows,
    ),
    writeValues(
      gridRange(SHEET_IDS.team, 5, 14, 1, 3),
      teamPersonRows,
    ),
    writeValues(
      gridRange(SHEET_IDS.team, 5, 14, 7, 8),
      teamNoteRows,
    ),
    clearValues(
      gridRange(SHEET_IDS.calendar, 5, 200, 0, 7),
    ),
    writeValues(
      gridRange(
        SHEET_IDS.calendar,
        5,
        5 + calendarRows.length,
        0,
        7,
      ),
      calendarRows,
    ),
    clearValues(
      gridRange(SHEET_IDS.ecosystem, 5, 120, 0, 9),
    ),
    writeValues(
      gridRange(
        SHEET_IDS.ecosystem,
        5,
        5 + ecosystemRows.length,
        0,
        9,
      ),
      ecosystemRows,
    ),
    ...buildFinancialRequests(demo),
    writeValues(
      gridRange(SHEET_IDS.forecast, 44, 45, 1, 4),
      [[18_500, 20_200, 21_600]],
    ),
  ];
}

const demoModule = await loadTypeScriptModule(demoSourcePath);
const requests = buildRequests(demoModule);
const args = new Set(process.argv.slice(2));

if (args.has("--sheet-batch-json")) {
  process.stdout.write(JSON.stringify({ requests }));
} else {
  console.log(
    JSON.stringify(
      {
        company: demoModule.plumbingDemoCompany.name,
        fictional: demoModule.plumbingDemoCompany.fictional,
        actions: demoModule.plumbingDemoActionPlanning.length,
        teamRoles: demoModule.plumbingDemoTeamAssignments.length,
        calendarRows: demoModule.plumbingDemoMarketingCalendar.length,
        ecosystemRows: demoModule.plumbingDemoEcosystem.length,
        requests: requests.length,
      },
      null,
      2,
    ),
  );
}
