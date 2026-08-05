import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const privateLoaderPath =
  "src/lib/editable-operational-system-assets.server.ts";
const historicalHashPath =
  "scripts/private-operational-system-sheet-id-hashes.json";
const forbiddenTrackedPaths = new Set([
  "src/lib/editable-operational-system-assets.generated.server.json",
  "src/lib/paid-operational-system-assets.generated.server.json",
]);
const allowedStaticCopyUrlPaths = new Set([
  "src/lib/process-registry.generated.json",
]);

function listTrackedFiles() {
  return execFileSync("git", ["ls-files", "-z"], {
    cwd: rootDir,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean)
    .filter((file) => fs.existsSync(path.join(rootDir, file)));
}

function readTextFile(file) {
  const absolutePath = path.join(rootDir, file);
  const stat = fs.statSync(absolutePath);

  if (!stat.isFile() || stat.size > 12_000_000) {
    return null;
  }

  const buffer = fs.readFileSync(absolutePath);
  if (buffer.includes(0)) {
    return null;
  }

  return buffer.toString("utf8");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const trackedFiles = listTrackedFiles();
const failures = [];
const historicalHashes = new Set(
  JSON.parse(fs.readFileSync(path.join(rootDir, historicalHashPath), "utf8"))
    .hashes,
);

for (const file of trackedFiles) {
  if (forbiddenTrackedPaths.has(file)) {
    failures.push(`${file}: registre privé suivi par Git`);
  }

  if (
    /(?:private|editable|paid).*(?:operational-system|system).*(?:assets?|registry).*\.(?:json|ya?ml)$/i.test(
      file,
    )
  ) {
    failures.push(`${file}: registre de livraison suspect suivi par Git`);
  }

  const source = readTextFile(file);
  if (source === null) {
    continue;
  }

  const candidateTokens = source.match(/[A-Za-z0-9_-]{20,160}/g) ?? [];
  if (candidateTokens.some((candidate) => historicalHashes.has(sha256(candidate)))) {
    failures.push(`${file}: identifiant privé historique détecté`);
  }

  if (
    !allowedStaticCopyUrlPaths.has(file) &&
    /https:\/\/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]{20,160}\/copy(?:[?"'\s]|$)/.test(
      source,
    )
  ) {
    failures.push(`${file}: URL Google Sheets de copie statique détectée`);
  }

  if (
    /OPERATIONAL_SYSTEM_COPY_SHEET_IDS_JSON\s*=\s*(?:"[^"]+"|'[^']+'|[^\s#]+)/.test(
      source,
    )
  ) {
    failures.push(`${file}: valeur du secret serveur suivie par Git`);
  }
}

const privateLoaderSource = fs.readFileSync(
  path.join(rootDir, privateLoaderPath),
  "utf8",
);

if (/generated\.server\.json/.test(privateLoaderSource)) {
  failures.push(`${privateLoaderPath}: import d’un registre généré suivi`);
}

if (/NEXT_PUBLIC_/.test(privateLoaderSource)) {
  failures.push(`${privateLoaderPath}: secret exposé au navigateur`);
}

const processSteps = JSON.parse(
  fs.readFileSync(
    path.join(rootDir, "src/lib/process-steps.generated.json"),
    "utf8",
  ),
);
const plumbingAudit = processSteps.sheetAudit?.find(
  (entry) => entry.slug === "plomberie-chauffage",
);

if (plumbingAudit?.sourceUrl) {
  failures.push(
    "src/lib/process-steps.generated.json: source privée Plomberie présente",
  );
}

if (failures.length > 0) {
  console.error(
    `Audit privé des systèmes opérationnels échoué (${failures.length}).`,
  );
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Audit privé des systèmes opérationnels validé (${trackedFiles.length} fichiers, ${historicalHashes.size} identifiants historiques bloqués).`,
);
