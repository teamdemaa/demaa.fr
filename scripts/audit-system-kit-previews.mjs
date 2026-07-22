import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { readSystemKitPreviewData } from "./lib/system-kit-preview-data.mjs";

const rootDir = path.resolve(import.meta.dirname, "..");
const runtimeNodeModules = process.env.CODEX_WORKSPACE_NODE_MODULES;
const manifestPath = path.join(rootDir, "src/lib/generated/system-kit-previews.json");
const mappings = await readSystemKitPreviewData(rootDir);
const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const manifestBySlug = new Map(manifest.map((entry) => [entry.slug, entry]));
const errors = [];
let sharp = null;

if (runtimeNodeModules) {
  const runtimeRequire = createRequire(path.join(runtimeNodeModules, "resolver.cjs"));
  sharp = (await import(pathToFileURL(runtimeRequire.resolve("sharp")).href)).default;
}

for (const mapping of mappings) {
  const entry = manifestBySlug.get(mapping.slug);

  if (!entry) {
    errors.push(`${mapping.slug}: manifeste manquant`);
    continue;
  }

  const filePath = path.join(rootDir, "public", entry.src);
  const stats = await fs.stat(filePath).catch(() => null);

  if (!stats) {
    errors.push(`${mapping.slug}: fichier manquant`);
    continue;
  }
  if (stats.size < 20_000 || stats.size > 500_000) {
    errors.push(`${mapping.slug}: poids inattendu (${stats.size} octets)`);
  }
  if (!entry.alt.includes(mapping.name)) {
    errors.push(`${mapping.slug}: texte alternatif incorrect`);
  }

  if (sharp) {
    const metadata = await sharp(filePath).metadata();
    if (metadata.width !== 1400 || metadata.height !== 933 || metadata.format !== "webp") {
      errors.push(
        `${mapping.slug}: format inattendu (${metadata.format}, ${metadata.width}x${metadata.height})`,
      );
    }
  }
}

for (const entry of manifest) {
  if (!mappings.some((mapping) => mapping.slug === entry.slug)) {
    errors.push(`${entry.slug}: entrée orpheline dans le manifeste`);
  }
}

console.log(
  JSON.stringify(
    {
      expected: mappings.length,
      manifestEntries: manifest.length,
      checkedDimensions: Boolean(sharp),
      errors,
    },
    null,
    2,
  ),
);

if (errors.length) process.exitCode = 1;
