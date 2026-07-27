import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);

function readArg(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
}

const slug = readArg("--slug");
const demoId = readArg("--demo-id");
const editableId = readArg("--editable-id");

if (!slug || !demoId || !editableId) {
  throw new Error(
    "Utilisez --slug <métier> --demo-id <Google ID> --editable-id <Google ID>.",
  );
}

const googleSheetIdPattern = /^[a-zA-Z0-9-_]+$/;

if (!googleSheetIdPattern.test(demoId) || !googleSheetIdPattern.test(editableId)) {
  throw new Error("Un identifiant Google Sheets est invalide.");
}

if (demoId === editableId) {
  throw new Error("La démonstration et le document modifiable doivent être distincts.");
}

const root = process.cwd();
const demoPath = path.join(
  root,
  "src/lib/operational-system-demo-assets.generated.json",
);
const editablePath = path.join(
  root,
  "src/lib/editable-operational-system-assets.generated.server.json",
);

function readManifest(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeManifest(filePath, manifest) {
  const orderedManifest = Object.fromEntries(
    Object.entries(manifest).toSorted(([left], [right]) =>
      left.localeCompare(right),
    ),
  );

  fs.writeFileSync(filePath, `${JSON.stringify(orderedManifest, null, 2)}\n`);
}

const demoManifest = readManifest(demoPath);
const editableManifest = readManifest(editablePath);

demoManifest[slug] =
  `https://docs.google.com/spreadsheets/d/${demoId}/edit`;
editableManifest[slug] =
  `https://docs.google.com/spreadsheets/d/${editableId}/edit`;

writeManifest(demoPath, demoManifest);
writeManifest(editablePath, editableManifest);

process.stdout.write(
  JSON.stringify({
    slug,
    demoId,
    editableId,
    publishedSystems: Object.keys(demoManifest).length,
  }),
);
