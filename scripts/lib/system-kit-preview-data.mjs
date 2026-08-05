import fs from "node:fs/promises";
import path from "node:path";

export async function readSystemKitPreviewData(rootDir) {
  const catalogPath = path.join(rootDir, "src/lib/enterprise-annuaire.json");
  const demoAssetsPath = path.join(
    rootDir,
    "src/lib/operational-system-demo-assets.generated.json",
  );
  const [catalogSource, demoAssetsSource] = await Promise.all([
    fs.readFile(catalogPath, "utf8"),
    fs.readFile(demoAssetsPath, "utf8"),
  ]);
  const mappings = Object.entries(JSON.parse(demoAssetsSource)).map(
    ([slug, url]) => ({ slug, url }),
  );
  const enterprises = JSON.parse(catalogSource).enterprises;
  const namesBySlug = new Map(
    enterprises.map((enterprise) => [enterprise.slug, enterprise.name]),
  );
  const mappingSlugs = new Set(mappings.map((mapping) => mapping.slug));
  const missingMappings = enterprises
    .filter((enterprise) => !mappingSlugs.has(enterprise.slug))
    .map((enterprise) => enterprise.slug);
  const duplicateSlugs = mappings
    .map((mapping) => mapping.slug)
    .filter((slug, index, slugs) => slugs.indexOf(slug) !== index);
  const duplicateUrls = mappings
    .map((mapping) => mapping.url)
    .filter((url, index, urls) => urls.indexOf(url) !== index);

  if (missingMappings.length || duplicateSlugs.length || duplicateUrls.length) {
    throw new Error(
      `Mappings invalides : ${JSON.stringify({ missingMappings, duplicateSlugs, duplicateUrls })}`,
    );
  }

  return mappings.map((mapping) => ({
    ...mapping,
    name: namesBySlug.get(mapping.slug) ?? mapping.slug,
  }));
}

export function getSheetId(url) {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

  if (!match) {
    throw new Error(`Identifiant Google Sheet introuvable dans ${url}`);
  }

  return match[1];
}
