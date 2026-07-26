import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const rootDir = path.resolve(import.meta.dirname, "..");
const processSourcePath = path.join(
  rootDir,
  "src/lib/plumbing-process-pilot.ts",
);
const workbookSourcePath = path.join(
  rootDir,
  "src/lib/plumbing-workbook-pilot.ts",
);
const registryPath = path.join(
  rootDir,
  "src/lib/process-registry.generated.json",
);
const stepsPath = path.join(
  rootDir,
  "src/lib/process-steps.generated.json",
);

const PLUMBING_MÉTIER_ID = "metier.plomberie-chauffage";

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

function cell(value) {
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

async function buildData() {
  const [processModule, workbookModule] = await Promise.all([
    loadTypeScriptModule(processSourcePath),
    loadTypeScriptModule(workbookSourcePath),
  ]);
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const generatedSteps = JSON.parse(fs.readFileSync(stepsPath, "utf8"));
  const processById = new Map(
    registry.processes.map((process) => [process.processId, process]),
  );
  const documentByProcessId = new Map(
    registry.documents.map((document) => [document.processId, document]),
  );
  const actions = generatedSteps.steps.filter(
    (step) =>
      step["métierId"] === PLUMBING_MÉTIER_ID &&
      step.contentType === "implementation_action",
  );

  if (actions.length !== 14) {
    throw new Error(
      `Nombre d’actions de mise en place inattendu : ${actions.length}.`,
    );
  }

  const actionRows = actions.map((action, index) => {
    const process = processById.get(action.processId);
    const document = documentByProcessId.get(action.processId);
    const definition =
      processModule.plumbingPilotProcessDefinitionsById[
        action.processId
      ];

    if (!process || !document || !definition) {
      throw new Error(`Données incomplètes pour ${action.processId}.`);
    }

    return [
      `ACT-${String(index + 1).padStart(3, "0")}`,
      process.pillarLabel,
      process.process,
      action.step,
      "",
      document.name,
      "À définir",
      "",
      "",
      "À planifier",
      definition.expectedResult,
      "",
    ];
  });

  const teamRows = workbookModule.plumbingPilotTeamRoles.map((role) => [
    role.role,
    "",
    "",
    role.manager,
    role.mainResponsibility,
    role.relatedProcesses,
    "",
    "",
  ]);

  if (teamRows.length !== 9) {
    throw new Error(
      `Nombre de rôles recommandés inattendu : ${teamRows.length}.`,
    );
  }

  return { actionRows, teamRows };
}

function buildRequests(data) {
  const actionEndRowIndex = 5 + data.actionRows.length;
  const teamEndRowIndex = 5 + data.teamRows.length;

  return [
    {
      updateSpreadsheetProperties: {
        properties: {
          title:
            "Modèle vierge - Système opérationnel - Plomberie & chauffage",
        },
        fields: "title",
      },
    },
    writeValues(
      gridRange(SHEET_IDS.summary, 1, 2, 0, 1),
      [[
        "MODÈLE VIERGE - Commencez par les Actions, puis complétez les onglets avec les données de votre entreprise.",
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.actions, 1, 2, 2, 3),
      [[
        "MODÈLE VIERGE - Les 14 actions de mise en place sont préchargées. Ajoutez le responsable et les dates.",
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.process, 1, 2, 0, 1),
      [[
        "MODÈLE VIERGE - 18 process et 74 contenus concrets à adapter à votre fonctionnement.",
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.team, 1, 2, 0, 1),
      [[
        "MODÈLE VIERGE - Attribuez les rôles recommandés aux personnes de votre entreprise ; une personne peut cumuler plusieurs rôles.",
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.forecast, 1, 2, 0, 1),
      [[
        "MODÈLE VIERGE - Choisissez le premier mois dans la Synthèse, puis saisissez vos données dans les cellules bleues.",
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.calendar, 1, 2, 0, 1),
      [[
        "MODÈLE VIERGE - Planifiez vos actions commerciales avec une échéance, un responsable et un statut.",
      ]],
    ),
    writeValues(
      gridRange(SHEET_IDS.ecosystem, 1, 2, 0, 1),
      [[
        "MODÈLE VIERGE - Comparez puis renseignez les outils, professionnels, fournisseurs, assurances et financements utiles.",
      ]],
    ),
    clearValues(gridRange(SHEET_IDS.actions, 5, 498, 0, 12)),
    writeValues(
      gridRange(
        SHEET_IDS.actions,
        5,
        actionEndRowIndex,
        0,
        12,
      ),
      data.actionRows,
    ),
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId: SHEET_IDS.actions,
          dimension: "ROWS",
          startIndex: 5,
          endIndex: actionEndRowIndex,
        },
      },
    },
    clearValues(gridRange(SHEET_IDS.team, 5, 201, 0, 8)),
    writeValues(
      gridRange(SHEET_IDS.team, 5, teamEndRowIndex, 0, 8),
      data.teamRows,
    ),
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId: SHEET_IDS.team,
          dimension: "ROWS",
          startIndex: 5,
          endIndex: teamEndRowIndex,
        },
      },
    },
  ];
}

const data = await buildData();
const requests = buildRequests(data);
const args = new Set(process.argv.slice(2));

if (args.has("--sheet-batch-json")) {
  process.stdout.write(JSON.stringify({ requests }));
} else {
  console.log(
    JSON.stringify(
      {
        variant: "Modèle vierge",
        actions: data.actionRows.length,
        roles: data.teamRows.length,
        requests: requests.length,
      },
      null,
      2,
    ),
  );
}
