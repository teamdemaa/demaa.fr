import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const rootDir = path.resolve(import.meta.dirname, "..");
const pilotSourcePath = path.join(
  rootDir,
  "src/lib/plumbing-process-pilot.ts",
);
const stepsPath = path.join(
  rootDir,
  "src/lib/process-steps.generated.json",
);

const MASTER_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1Y_FqDpG9AshpS-gS46MpDZaPG-2lktfOsVYp3miB75c/edit";
const PLUMBING_MÉTIER_ID = "metier.plomberie-chauffage";
const PLUMBING_SLUG = "plomberie-chauffage";
const PILOT_VERSION = "1.1.0-plomberie-pilot";
const OLD_STEP_COUNT = 39;
const NEW_STEP_COUNT = 74;
const TOTAL_STEP_COUNT = 4548;

const SHEET_IDS = {
  readme: 1867492054,
  steps: 1458659633,
  audit: 690717538,
  pilot: 321107194,
  quality: 162025384,
};

const FIRST_PLUMBING_ROW = 3680;
const LAST_PLUMBING_ROW = 3718;
const AUDIT_PLUMBING_ROW = 95;

const contentTypeLabels = {
  implementation_action: "Action de mise en place",
  operational_step: "Étape opérationnelle",
  operating_rule: "Règle",
  recurring_control: "Contrôle récurrent",
};

function loadPilotModule() {
  const source = fs.readFileSync(pilotSourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: pilotSourcePath,
  });
  const encoded = Buffer.from(transpiled.outputText, "utf8").toString(
    "base64",
  );

  return import(`data:text/javascript;base64,${encoded}`);
}

function stableStepId(processId, type, label) {
  const digest = crypto
    .createHash("sha256")
    .update(`${processId}|${type}|${label}`)
    .digest("hex")
    .slice(0, 10);

  return `etape.${PLUMBING_SLUG}.${digest}`;
}

function recurrenceFor(item, definition) {
  const label = item.label.toLowerCase();

  if (item.type === "implementation_action") {
    return "Une fois, puis à revoir si besoin";
  }

  if (item.type === "operating_rule") {
    return "Permanente";
  }

  if (item.type === "operational_step") {
    if (/après chaque|chaque demande|chaque facture|chaque livraison/.test(label)) {
      return "À chaque occurrence";
    }

    return "À chaque dossier concerné";
  }

  if (/chaque matin|quotidien/.test(label)) {
    return "Quotidienne";
  }

  if (/chaque semaine|hebdomadaire/.test(label)) {
    return "Hebdomadaire";
  }

  if (/chaque mois|mensuel/.test(label)) {
    return "Mensuelle";
  }

  if (/trimestr/.test(definition.cadence.toLowerCase())) {
    return "Trimestrielle";
  }

  if (/échéance|entretien|garantie/.test(label)) {
    return "Selon échéance";
  }

  return definition.cadence;
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

function groupPilotContent(items) {
  const sections = [
    ["À mettre en place", "implementation_action"],
    ["Comment fonctionner", "operational_step"],
    ["Règles", "operating_rule"],
    ["Contrôles", "recurring_control"],
  ];

  return sections
    .map(([heading, type]) => {
      const labels = items
        .filter((item) => item.type === type)
        .map((item) => `• ${item.label}`);

      return labels.length ? `${heading}\n${labels.join("\n")}` : "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function buildPilotData(pilotModule) {
  const processEntries = Object.entries(
    pilotModule.plumbingPilotContentByProcessId,
  );
  const steps = [];
  const pilotRows = [];

  processEntries.forEach(([processId, items], processIndex) => {
    const definition =
      pilotModule.plumbingPilotProcessDefinitionsById[processId];

    if (!definition) {
      throw new Error(`Définition manquante pour ${processId}.`);
    }

    items.forEach((item, itemIndex) => {
      steps.push({
        stepId: stableStepId(processId, item.type, item.label),
        "métierId": PLUMBING_MÉTIER_ID,
        processId,
        order: itemIndex + 1,
        step: item.label,
        defaultOwner: definition.defaultOwner,
        recurrence: recurrenceFor(item, definition),
        sourceUrl: MASTER_SHEET_URL,
        sourceRow: processIndex + 2,
        status: "Actif",
        contentType: item.type,
      });
    });

    pilotRows.push({
      processId,
      groupedContent: groupPilotContent(items),
      definition,
    });
  });

  if (processEntries.length !== 18 || steps.length !== NEW_STEP_COUNT) {
    throw new Error(
      `Pilote invalide : ${processEntries.length} processus et ${steps.length} contenus.`,
    );
  }

  return { steps, pilotRows };
}

function buildSheetRequests(data) {
  const extraRows = NEW_STEP_COUNT - OLD_STEP_COUNT;
  const firstRowIndex = FIRST_PLUMBING_ROW - 1;
  const insertRowIndex = LAST_PLUMBING_ROW;
  const endRowIndex = firstRowIndex + NEW_STEP_COUNT;
  const stepRows = data.steps.map((step) =>
    row([
      step.stepId,
      step["métierId"],
      step.processId,
      step.order,
      step.step,
      step.defaultOwner,
      step.recurrence,
      step.sourceUrl,
      step.sourceRow,
      step.status,
      contentTypeLabels[step.contentType],
    ]),
  );

  const pilotContentRows = data.pilotRows.map((entry) =>
    row([entry.groupedContent]),
  );
  const pilotDefinitionRows = [
    row([
      "Objectif",
      "Déclencheur",
      "Résultat attendu",
      "Responsable recommandé",
      "Cadence",
    ]),
    ...data.pilotRows.map((entry) =>
      row([
        entry.definition.objective,
        entry.definition.trigger,
        entry.definition.expectedResult,
        entry.definition.defaultOwner,
        entry.definition.cadence,
      ]),
    ),
  ];

  return [
    {
      appendDimension: {
        sheetId: SHEET_IDS.steps,
        dimension: "COLUMNS",
        length: 1,
      },
    },
    {
      insertDimension: {
        range: {
          sheetId: SHEET_IDS.steps,
          dimension: "ROWS",
          startIndex: insertRowIndex,
          endIndex: insertRowIndex + extraRows,
        },
        inheritFromBefore: true,
      },
    },
    {
      copyPaste: {
        source: {
          sheetId: SHEET_IDS.steps,
          startRowIndex: firstRowIndex,
          endRowIndex: firstRowIndex + 1,
          startColumnIndex: 0,
          endColumnIndex: 11,
        },
        destination: {
          sheetId: SHEET_IDS.steps,
          startRowIndex: firstRowIndex,
          endRowIndex,
          startColumnIndex: 0,
          endColumnIndex: 11,
        },
        pasteType: "PASTE_FORMAT",
        pasteOrientation: "NORMAL",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: SHEET_IDS.steps,
          startRowIndex: 0,
          endRowIndex: 1,
          startColumnIndex: 10,
          endColumnIndex: 11,
        },
        rows: [row(["Type de contenu"])],
        fields: "userEnteredValue",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: SHEET_IDS.steps,
          startRowIndex: firstRowIndex,
          endRowIndex,
          startColumnIndex: 0,
          endColumnIndex: 11,
        },
        rows: stepRows,
        fields: "userEnteredValue",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: SHEET_IDS.pilot,
          startRowIndex: 1,
          endRowIndex: 19,
          startColumnIndex: 2,
          endColumnIndex: 3,
        },
        rows: pilotContentRows,
        fields: "userEnteredValue",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: SHEET_IDS.pilot,
          startRowIndex: 0,
          endRowIndex: 19,
          startColumnIndex: 6,
          endColumnIndex: 11,
        },
        rows: pilotDefinitionRows,
        fields: "userEnteredValue",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: SHEET_IDS.audit,
          startRowIndex: AUDIT_PLUMBING_ROW - 1,
          endRowIndex: AUDIT_PLUMBING_ROW,
          startColumnIndex: 3,
          endColumnIndex: 7,
        },
        rows: [row([18, NEW_STEP_COUNT, NEW_STEP_COUNT, 0])],
        fields: "userEnteredValue",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: SHEET_IDS.quality,
          startRowIndex: 5,
          endRowIndex: 6,
          startColumnIndex: 1,
          endColumnIndex: 2,
        },
        rows: [row([TOTAL_STEP_COUNT])],
        fields: "userEnteredValue",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: SHEET_IDS.readme,
          startRowIndex: 3,
          endRowIndex: 5,
          startColumnIndex: 1,
          endColumnIndex: 2,
        },
        rows: [
          row([
            "115 métiers • 37 familles • 526 process • 4 548 contenus opérationnels.",
          ]),
          row([
            "Pilote Plomberie : classification des actions, étapes, règles et contrôles.",
          ]),
        ],
        fields: "userEnteredValue",
      },
    },
    {
      updateCells: {
        range: {
          sheetId: SHEET_IDS.readme,
          startRowIndex: 9,
          endRowIndex: 10,
          startColumnIndex: 1,
          endColumnIndex: 2,
        },
        rows: [row([PILOT_VERSION])],
        fields: "userEnteredValue",
      },
    },
  ];
}

function writeLocalMirror(data) {
  const payload = JSON.parse(fs.readFileSync(stepsPath, "utf8"));
  const currentSteps = payload.steps ?? [];
  const firstIndex = currentSteps.findIndex(
    (step) => step["métierId"] === PLUMBING_MÉTIER_ID,
  );
  const existingPlumbingSteps = currentSteps.filter(
    (step) => step["métierId"] === PLUMBING_MÉTIER_ID,
  );

  if (
    firstIndex === -1 ||
    existingPlumbingSteps.length !== OLD_STEP_COUNT
  ) {
    throw new Error(
      `Miroir local inattendu : ${existingPlumbingSteps.length} étapes Plomberie.`,
    );
  }

  payload.steps = [
    ...currentSteps.slice(0, firstIndex),
    ...data.steps,
    ...currentSteps
      .slice(firstIndex)
      .filter((step) => step["métierId"] !== PLUMBING_MÉTIER_ID),
  ];
  payload.metadata = {
    ...payload.metadata,
    version: PILOT_VERSION,
    createdAt: new Date().toISOString(),
  };
  payload.sheetAudit = payload.sheetAudit.map((audit) =>
    audit.slug === PLUMBING_SLUG
      ? {
          ...audit,
          stepCount: NEW_STEP_COUNT,
          matchedStepCount: NEW_STEP_COUNT,
          unmatchedCount: 0,
          sourceUrl: "",
        }
      : audit,
  );

  if (payload.steps.length !== TOTAL_STEP_COUNT) {
    throw new Error(
      `Total local invalide : ${payload.steps.length}, attendu ${TOTAL_STEP_COUNT}.`,
    );
  }

  fs.writeFileSync(stepsPath, `${JSON.stringify(payload, null, 2)}\n`);
}

const pilotModule = await loadPilotModule();
const data = buildPilotData(pilotModule);
const args = new Set(process.argv.slice(2));

if (args.has("--write-local")) {
  writeLocalMirror(data);
}

if (args.has("--sheet-batch-json")) {
  process.stdout.write(
    JSON.stringify({ requests: buildSheetRequests(data) }),
  );
} else {
  const countsByType = Object.fromEntries(
    Object.keys(contentTypeLabels).map((type) => [
      type,
      data.steps.filter((step) => step.contentType === type).length,
    ]),
  );

  console.log(
    JSON.stringify(
      {
        version: PILOT_VERSION,
        processes: data.pilotRows.length,
        steps: data.steps.length,
        totalAfterSync: TOTAL_STEP_COUNT,
        countsByType,
        targetRows: `${FIRST_PLUMBING_ROW}:${FIRST_PLUMBING_ROW + NEW_STEP_COUNT - 1}`,
      },
      null,
      2,
    ),
  );
}
