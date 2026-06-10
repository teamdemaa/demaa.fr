import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import vm from "node:vm";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, "..");

function loadTsModule(relativePath) {
  const absolutePath = resolve(rootDir, relativePath);
  const source = fs.readFileSync(absolutePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const loadedModule = { exports: {} };
  const sandbox = {
    module: loadedModule,
    exports: loadedModule.exports,
    require(id) {
      throw new Error(`Unexpected require while auditing checklists: ${id}`);
    },
  };

  vm.runInNewContext(output, sandbox, { filename: absolutePath });

  return loadedModule.exports;
}

const businessModelsModule = loadTsModule("src/lib/business-models.ts");
const checklistModule = loadTsModule("src/lib/business-block-checklists.ts");

const fallbackSignature = [
  "Décrire le point métier à clarifier",
  "Identifier la prochaine action utile",
  "Attribuer un responsable",
  "Suivre les points ouverts",
  "Garder une trace exploitable",
].join("\n");

const systems = [
  ...businessModelsModule.businessModels.map((model) => ({
    id: model.id,
    label: model.label,
    blocks: model.blocks,
  })),
  ...Object.entries(businessModelsModule.enterpriseBusinessBlockOverrides).map(([slug, blocks]) => ({
    id: slug,
    label: slug,
    blocks,
  })),
];

const fallbackColumns = [];
const fullDuplicateColumnGroups = [];
const partialDuplicateItemGroups = [];
const signatureUsage = new Map();

for (const system of systems) {
  const signatures = new Map();
  const itemUsage = new Map();

  for (const block of system.blocks) {
    const checklist = checklistModule.buildChecklistForBusinessBlock(block, { systemId: system.id });
    const signature = checklist.join("\n");

    if (!signatures.has(signature)) {
      signatures.set(signature, []);
    }
    signatures.get(signature).push(block.title);

    if (!signatureUsage.has(signature)) {
      signatureUsage.set(signature, []);
    }
    signatureUsage.get(signature).push(`${system.id}::${block.title}`);

    if (signature === fallbackSignature) {
      fallbackColumns.push(`${system.id}::${block.title}`);
    }

    for (const item of checklist) {
      const key = item.trim().toLowerCase();

      if (!itemUsage.has(key)) {
        itemUsage.set(key, { item, columns: new Set() });
      }
      itemUsage.get(key).columns.add(block.title);
    }
  }

  for (const columns of signatures.values()) {
    if (columns.length > 1) {
      fullDuplicateColumnGroups.push({
        system: system.id,
        columns,
      });
    }
  }

  const repeatedItems = [...itemUsage.values()]
    .filter((usage) => usage.columns.size > 1)
    .map((usage) => ({
      item: usage.item,
      columns: [...usage.columns],
    }));

  if (repeatedItems.length) {
    partialDuplicateItemGroups.push({
      system: system.id,
      repeatedItems,
    });
  }
}

const topRepeatedSignatures = [...signatureUsage.entries()]
  .sort((first, second) => second[1].length - first[1].length)
  .slice(0, 20)
  .map(([signature, uses]) => ({
    uses: uses.length,
    examples: uses.slice(0, 12),
    checklist: signature.split("\n"),
  }));

const result = {
  systems: systems.length,
  blocks: systems.reduce((total, system) => total + system.blocks.length, 0),
  fallbackColumns,
  fullDuplicateColumnGroups,
  partialDuplicateItemGroups,
  topRepeatedSignatures,
  summary: {
    fallbackCount: fallbackColumns.length,
    fullDuplicateColumnGroupCount: fullDuplicateColumnGroups.length,
    systemsWithFullDuplicateColumns: new Set(fullDuplicateColumnGroups.map((group) => group.system)).size,
    systemsWithPartialDuplicateItems: partialDuplicateItemGroups.length,
  },
};

console.log(JSON.stringify(result, null, 2));

if (process.argv.includes("--strict") && fullDuplicateColumnGroups.length) {
  process.exit(1);
}
