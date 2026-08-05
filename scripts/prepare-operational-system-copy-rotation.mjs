import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);

function readArg(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
}

function sheetIdFromValue(value) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  const urlMatch = trimmedValue.match(
    /^https:\/\/docs\.google\.com\/spreadsheets\/d\/([A-Za-z0-9_-]{20,160})(?:\/(?:edit|copy))?(?:\?.*)?$/,
  );
  const sheetId = urlMatch?.[1] ?? trimmedValue;

  return /^[A-Za-z0-9_-]{20,160}$/.test(sheetId) ? sheetId : null;
}

function assertPrivateOutputPath(rootDir, outputPath) {
  const absoluteOutputPath = path.resolve(rootDir, outputPath);
  const relativeOutputPath = path.relative(rootDir, absoluteOutputPath);

  if (
    !relativeOutputPath.startsWith("..") &&
    relativeOutputPath !== "private" &&
    !relativeOutputPath.startsWith(`private${path.sep}`)
  ) {
    throw new Error(
      "La sortie contenant les identifiants doit rester dans /private/ (ignoré par Git) ou hors du dépôt.",
    );
  }

  return absoluteOutputPath;
}

const rootDir = process.cwd();
const inputArg = readArg("--input");
const outputArg = readArg("--output");
const hashOutputArg = readArg("--hash-output");

if (!inputArg) {
  throw new Error(
    "Utilisez --input <registre-prive.json> [--output <registre-normalise.json>] [--hash-output <empreintes.json>].",
  );
}

const inputPath = path.resolve(rootDir, inputArg);
const inputRegistry = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const demoAssets = JSON.parse(
  fs.readFileSync(
    path.join(
      rootDir,
      "src/lib/operational-system-demo-assets.generated.json",
    ),
    "utf8",
  ),
);
const expectedSlugs = Object.keys(demoAssets).toSorted();
const receivedSlugs = Object.keys(inputRegistry).toSorted();

if (JSON.stringify(receivedSlugs) !== JSON.stringify(expectedSlugs)) {
  throw new Error(
    "Le registre de rotation doit contenir exactement tous les systèmes publiés.",
  );
}

const normalizedRegistry = {};
for (const slug of expectedSlugs) {
  const sheetId = sheetIdFromValue(inputRegistry[slug]);

  if (!sheetId) {
    throw new Error("Le registre de rotation contient une entrée invalide.");
  }

  normalizedRegistry[slug] = sheetId;
}

const normalizedIds = Object.values(normalizedRegistry);
if (new Set(normalizedIds).size !== normalizedIds.length) {
  throw new Error(
    "Chaque système doit utiliser une copie Google Sheets distincte.",
  );
}

const currentRegistryRaw =
  process.env.OPERATIONAL_SYSTEM_COPY_SHEET_IDS_JSON?.trim();
if (currentRegistryRaw) {
  const currentIds = new Set(
    Object.values(JSON.parse(currentRegistryRaw))
      .map(sheetIdFromValue)
      .filter(Boolean),
  );

  if (normalizedIds.some((sheetId) => currentIds.has(sheetId))) {
    throw new Error(
      "La rotation contient au moins un identifiant déjà utilisé.",
    );
  }
}

if (outputArg) {
  const outputPath = assertPrivateOutputPath(rootDir, outputArg);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(normalizedRegistry)}\n`,
    { mode: 0o600 },
  );
  fs.chmodSync(outputPath, 0o600);
}

if (hashOutputArg) {
  const hashOutputPath = path.resolve(rootDir, hashOutputArg);
  const hashes = normalizedIds
    .map((sheetId) => createHash("sha256").update(sheetId).digest("hex"))
    .toSorted();

  fs.mkdirSync(path.dirname(hashOutputPath), { recursive: true });
  fs.writeFileSync(
    hashOutputPath,
    `${JSON.stringify({ version: 1, algorithm: "sha256", hashes }, null, 2)}\n`,
    { mode: 0o600 },
  );
  fs.chmodSync(hashOutputPath, 0o600);
}

console.log(
  `Registre de rotation validé (${expectedSlugs.length} systèmes, identifiants uniques).`,
);
