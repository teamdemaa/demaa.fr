import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const rootDir = path.resolve(import.meta.dirname, "..");
const ecosystemSourcePath = path.join(
  rootDir,
  "src/lib/plumbing-ecosystem-pilot.ts",
);
const demoSourcePath = path.join(
  rootDir,
  "src/lib/plumbing-demo-pilot.ts",
);

const ECOSYSTEM_SHEET_ID = 1876543210;

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

function hyperlink(url) {
  return formula(`=HYPERLINK("${url}";"Ouvrir")`);
}

function dateFormula(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return formula(`=DATE(${year};${month};${day})`);
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

  return { userEnteredValue: { stringValue: value } };
}

function row(values) {
  return { values: values.map(cell) };
}

function gridRange(
  startRowIndex,
  endRowIndex,
  startColumnIndex,
  endColumnIndex,
) {
  return {
    sheetId: ECOSYSTEM_SHEET_ID,
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

function writeHeader() {
  return writeValues(
    gridRange(4, 5, 0, 9),
    [[
      "Catégorie",
      "Besoin",
      "Solution recommandée",
      "Solution retenue",
      "Statut",
      "Coût",
      "Échéance",
      "Lien",
      "Notes",
    ]],
  );
}

function buildBlankRequests(recommendations) {
  const rows = recommendations.map((recommendation) => [
    recommendation.category,
    recommendation.need,
    recommendation.name,
    "",
    recommendation.initialStatus,
    recommendation.cost,
    "",
    hyperlink(recommendation.url),
    recommendation.recommendation,
  ]);

  return [
    writeHeader(),
    clearValues(gridRange(5, 120, 0, 9)),
    writeValues(gridRange(5, 5 + rows.length, 0, 9), rows),
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId: ECOSYSTEM_SHEET_ID,
          dimension: "ROWS",
          startIndex: 5,
          endIndex: 5 + rows.length,
        },
      },
    },
  ];
}

function buildDemoRequests(demoRows) {
  const rows = demoRows.map(
    ([category, need, recommendation, chosen, status, cost, date, url, note]) => [
      category,
      need,
      recommendation,
      chosen,
      status,
      cost,
      dateFormula(date),
      hyperlink(url),
      note,
    ],
  );

  return [
    writeHeader(),
    clearValues(gridRange(5, 120, 0, 9)),
    writeValues(gridRange(5, 5 + rows.length, 0, 9), rows),
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId: ECOSYSTEM_SHEET_ID,
          dimension: "ROWS",
          startIndex: 5,
          endIndex: 5 + rows.length,
        },
      },
    },
  ];
}

const [ecosystemModule, demoModule] = await Promise.all([
  loadTypeScriptModule(ecosystemSourcePath),
  loadTypeScriptModule(demoSourcePath),
]);
const recommendations =
  ecosystemModule.plumbingPilotEcosystemRecommendations;
const demoRows = demoModule.plumbingDemoEcosystem;
const args = new Set(process.argv.slice(2));

if (args.has("--blank-batch-json")) {
  process.stdout.write(
    JSON.stringify({ requests: buildBlankRequests(recommendations) }),
  );
} else if (args.has("--demo-batch-json")) {
  process.stdout.write(
    JSON.stringify({ requests: buildDemoRequests(demoRows) }),
  );
} else {
  console.log(
    JSON.stringify(
      {
        blankRecommendations: recommendations.length,
        demoRecommendations: demoRows.length,
        blankRequests: buildBlankRequests(recommendations).length,
        demoRequests: buildDemoRequests(demoRows).length,
      },
      null,
      2,
    ),
  );
}
