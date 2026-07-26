import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const rootDir = path.resolve(import.meta.dirname, "..");
const supportSourcePath = path.join(
  rootDir,
  "src/lib/plumbing-support-pilot.ts",
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
const SUPPORT_VERSION = "1.0.0-plomberie-pilot";
const PRODUCED_SUPPORT_VERSION =
  "2.0.0-plomberie-complete-produced";
const REGISTRY_VERSION = "2.0.0-plomberie-complete-supports";

const MASTER_DOCUMENTS_SHEET_ID = 446973769;
const PLUMBING_WORKBOOK_PROCESS_SHEET_ID = 271828182;
const FIRST_MASTER_ROW_INDEX = 1;
const FIRST_WORKBOOK_ROW_INDEX = 7;

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
  return { userEnteredValue: { stringValue: value } };
}

function formulaCell(value) {
  return { userEnteredValue: { formulaValue: value } };
}

function row(values) {
  return { values: values.map(cell) };
}

function googleCopyUrl(url) {
  return url ? url.replace(/\/edit(?:\?.*)?$/, "/copy") : "";
}

function buildData(supportModule) {
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
  const generatedSteps = JSON.parse(fs.readFileSync(stepsPath, "utf8"));
  const definitions =
    supportModule.plumbingPilotSupportDefinitionsByProcessId;
  const processIds = Object.keys(definitions);
  const documentByProcessId = new Map(
    registry.documents.map((document) => [document.processId, document]),
  );
  const missingDocuments = processIds.filter(
    (processId) => !documentByProcessId.has(processId),
  );

  if (processIds.length !== 18 || missingDocuments.length) {
    throw new Error(
      `Audit support invalide : ${processIds.length} process, documents manquants : ${
        missingDocuments.join(", ") || "aucun"
      }.`,
    );
  }

  const masterRows = processIds.map((processId) => {
    const definition = definitions[processId];
    const sourceUrl = definition.demoUrl ?? "";
    const copyUrl = googleCopyUrl(definition.blankUrl ?? "");
    const produced = Boolean(sourceUrl && copyUrl);

    return {
      processId,
      name: definition.name,
      format: definition.format,
      sourceUrl,
      copyUrl,
      status: produced ? "Produit" : "Validé à produire",
      version: produced ? PRODUCED_SUPPORT_VERSION : SUPPORT_VERSION,
    };
  });

  const plumbingSteps = generatedSteps.steps.filter(
    (step) => step["métierId"] === PLUMBING_MÉTIER_ID,
  );

  if (plumbingSteps.length !== 74) {
    throw new Error(
      `Nombre de contenus Plomberie inattendu : ${plumbingSteps.length}.`,
    );
  }

  const workbookSupportRows = plumbingSteps.map((step) => {
    const definition = definitions[step.processId];

    if (!definition) {
      throw new Error(`Support absent pour ${step.processId}.`);
    }

    return {
      name: definition.name,
      demoUrl: definition.demoUrl ?? "",
      blankUrl: definition.blankUrl ?? "",
    };
  });

  return {
    registry,
    definitions,
    masterRows,
    workbookSupportRows,
  };
}

function buildMasterRequests(data) {
  const endRowIndex = FIRST_MASTER_ROW_INDEX + data.masterRows.length;

  return [
    {
      updateCells: {
        range: {
          sheetId: MASTER_DOCUMENTS_SHEET_ID,
          startRowIndex: FIRST_MASTER_ROW_INDEX,
          endRowIndex,
          startColumnIndex: 2,
          endColumnIndex: 8,
        },
        rows: data.masterRows.map((entry) =>
          row([
            entry.name,
            entry.format,
            entry.sourceUrl,
            entry.copyUrl,
            entry.status,
            entry.version,
          ]),
        ),
        fields: "userEnteredValue",
      },
    },
  ];
}

function buildWorkbookRequests(data, variant) {
  return [
    {
      updateCells: {
        range: {
          sheetId: PLUMBING_WORKBOOK_PROCESS_SHEET_ID,
          startRowIndex: FIRST_WORKBOOK_ROW_INDEX,
          endRowIndex:
            FIRST_WORKBOOK_ROW_INDEX +
            data.workbookSupportRows.length,
          startColumnIndex: 6,
          endColumnIndex: 7,
        },
        rows: data.workbookSupportRows.map((entry) => {
          const url = variant === "blank" ? entry.blankUrl : entry.demoUrl;

          return {
            values: [
              url
                ? formulaCell(
                    `=HYPERLINK("${url.replaceAll('"', '""')}";"${entry.name.replaceAll('"', '""')}")`,
                  )
                : cell(entry.name),
            ],
          };
        }),
        fields: "userEnteredValue",
      },
    },
  ];
}

function writeLocalMirror(data) {
  const auditedProcessIds = new Set(
    data.masterRows.map((entry) => entry.processId),
  );

  data.registry.documents = data.registry.documents.map((document) => {
    if (!auditedProcessIds.has(document.processId)) {
      return document;
    }

    const definition = data.definitions[document.processId];
    const masterEntry = data.masterRows.find(
      (entry) => entry.processId === document.processId,
    );
    return {
      ...document,
      name: definition.name,
      intendedFormat: definition.format,
      sourceUrl: masterEntry?.sourceUrl ?? "",
      copyUrl: masterEntry?.copyUrl ?? "",
      status: masterEntry?.status ?? "Validé à produire",
      version: masterEntry?.version ?? SUPPORT_VERSION,
    };
  });
  data.registry.metadata = {
    ...data.registry.metadata,
    version: REGISTRY_VERSION,
    createdAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    registryPath,
    `${JSON.stringify(data.registry, null, 2)}\n`,
  );
}

const supportModule = await loadTypeScriptModule(supportSourcePath);
const data = buildData(supportModule);
const args = new Set(process.argv.slice(2));
const workbookVariant = [...args]
  .find((arg) => arg.startsWith("--workbook-variant="))
  ?.split("=")[1];

if (
  workbookVariant &&
  workbookVariant !== "demo" &&
  workbookVariant !== "blank"
) {
  throw new Error(`Variante de workbook inconnue : ${workbookVariant}.`);
}

if (args.has("--write-local")) {
  writeLocalMirror(data);
}

if (args.has("--master-batch-json")) {
  process.stdout.write(
    JSON.stringify({ requests: buildMasterRequests(data) }),
  );
} else if (args.has("--workbook-batch-json")) {
  process.stdout.write(
    JSON.stringify({
      requests: buildWorkbookRequests(data, workbookVariant ?? "demo"),
    }),
  );
} else {
  const formatCounts = data.masterRows.reduce((counts, entry) => {
    counts[entry.format] = (counts[entry.format] ?? 0) + 1;
    return counts;
  }, {});

  console.log(
    JSON.stringify(
      {
        supports: data.masterRows.length,
        formatCounts,
        producedSupports: data.masterRows.filter(
          (entry) => entry.status === "Produit",
        ).length,
        remainingSupports: data.masterRows.filter(
          (entry) => entry.status !== "Produit",
        ).length,
        demoAndBlankRequired: data.masterRows.every(
          (entry) =>
            data.definitions[entry.processId].demoAndBlankRequired,
        ),
      },
      null,
      2,
    ),
  );
}
