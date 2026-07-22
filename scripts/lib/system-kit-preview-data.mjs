import fs from "node:fs/promises";
import path from "node:path";

const SHEET_MAPPING_PATTERN =
  /(?:^|\n)\s*(?:"([^"]+)"|([A-Za-z0-9_-]+)):\s*(?:\n\s*)?"(https:\/\/docs\.google\.com\/spreadsheets[^"]+)"/g;

export async function readSystemKitPreviewData(rootDir) {
  const sourcePath = path.join(rootDir, "src/lib/document-models.ts");
  const catalogPath = path.join(rootDir, "src/lib/enterprise-annuaire.json");
  const [source, catalogSource] = await Promise.all([
    fs.readFile(sourcePath, "utf8"),
    fs.readFile(catalogPath, "utf8"),
  ]);
  const mappingStart = source.indexOf("const PILOTING_SHEET_URLS");
  const mappingEnd = source.indexOf("export function getPilotingSheetSlugs");

  if (mappingStart < 0 || mappingEnd < 0 || mappingEnd <= mappingStart) {
    throw new Error("Impossible de trouver PILOTING_SHEET_URLS dans document-models.ts.");
  }

  const mappingBlock = source.slice(mappingStart, mappingEnd);
  const mappings = [...mappingBlock.matchAll(SHEET_MAPPING_PATTERN)].map((match) => ({
    slug: match[1] || match[2],
    url: match[3],
  }));
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
