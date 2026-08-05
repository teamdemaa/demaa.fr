import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);

function readArg(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
}

if (args.includes("--editable-id")) {
  throw new Error(
    "Les copies modifiables ne sont jamais enregistrées dans le dépôt. Utilisez la procédure privée de rotation.",
  );
}

const slug = readArg("--slug");
const demoId = readArg("--demo-id");

if (!slug || !demoId) {
  throw new Error("Utilisez --slug <métier> --demo-id <Google ID>.");
}

if (!/^[a-z0-9-]{2,120}$/.test(slug)) {
  throw new Error("Le slug du système est invalide.");
}

if (!/^[a-zA-Z0-9-_]{20,160}$/.test(demoId)) {
  throw new Error("L’identifiant de démonstration Google Sheets est invalide.");
}

const root = process.cwd();
const demoPath = path.join(
  root,
  "src/lib/operational-system-demo-assets.generated.json",
);
const demoManifest = JSON.parse(fs.readFileSync(demoPath, "utf8"));

demoManifest[slug] =
  `https://docs.google.com/spreadsheets/d/${demoId}/edit?usp=sharing`;

const orderedManifest = Object.fromEntries(
  Object.entries(demoManifest).toSorted(([left], [right]) =>
    left.localeCompare(right),
  ),
);

fs.writeFileSync(demoPath, `${JSON.stringify(orderedManifest, null, 2)}\n`);
process.stdout.write(
  `${JSON.stringify({ slug, publishedSystems: Object.keys(demoManifest).length })}\n`,
);
