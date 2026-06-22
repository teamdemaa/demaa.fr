import fs from "node:fs";
import path from "node:path";
import sectorTaxonomyPayload from "../src/lib/sector-taxonomy.json" with { type: "json" };

const ROUTE_FILES = {
  toolDirectoryIndex: "src/app/annuaire-outils/page.tsx",
  toolSectorPage: "src/app/annuaire-outils/secteur/[slug]/page.tsx",
  sectorHubPage: "src/app/secteurs/[slug]/page.tsx",
  documentModelsIndex: "src/app/modeles-de-documents/page.tsx",
  legacyResourcesIndex: "src/app/ressources/page.tsx",
  legacyResourcesDetail: "src/app/ressources/[slug]/page.tsx",
  sitemap: "src/app/sitemap.ts",
  sectorPages: "src/lib/sector-pages.ts",
};

const SOURCE_DIRECTORIES = [
  "src/app",
  "src/components",
  "src/lib",
];

const sectorTaxonomy = sectorTaxonomyPayload.sectors;
const errors = [];
const warnings = [];

function addUnique(list, value) {
  if (!list.includes(value)) {
    list.push(value);
  }
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(process.cwd(), relativePath));
}

function walkFiles(relativeDir) {
  const absoluteDir = path.join(process.cwd(), relativeDir);
  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativeEntryPath = path.join(relativeDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(relativeEntryPath));
      continue;
    }

    if (/\.(ts|tsx|js|jsx|mjs|json)$/.test(entry.name)) {
      files.push(relativeEntryPath);
    }
  }

  return files;
}

function collectLegacyMatches(pattern, { allowlist = [] } = {}) {
  const matches = [];

  for (const relativeDir of SOURCE_DIRECTORIES) {
    for (const relativePath of walkFiles(relativeDir)) {
      if (allowlist.includes(relativePath)) {
        continue;
      }

      const source = readFile(relativePath);

      if (pattern.test(source)) {
        matches.push(relativePath);
      }
    }
  }

  return matches;
}

for (const [key, relativePath] of Object.entries(ROUTE_FILES)) {
  if (key === "legacyResourcesDetail") {
    continue;
  }

  if (!fileExists(relativePath)) {
    addUnique(errors, `Missing expected route or config file: ${relativePath}`);
  }
}

if (fileExists(ROUTE_FILES.legacyResourcesDetail)) {
  addUnique(
    errors,
    `Legacy resources detail route should be deleted: ${ROUTE_FILES.legacyResourcesDetail}`,
  );
}

const resourcesIndexSource = readFile(ROUTE_FILES.legacyResourcesIndex);
if (!resourcesIndexSource.includes('permanentRedirect("/modeles-de-documents")')) {
  addUnique(
    errors,
    'Legacy resources index must redirect to "/modeles-de-documents".',
  );
}

const toolDirectoryIndexSource = readFile(ROUTE_FILES.toolDirectoryIndex);
if (!toolDirectoryIndexSource.includes("getToolDirectorySectorSeoPath(rawSector)")) {
  addUnique(
    errors,
    "Tool directory index no longer appears to resolve sector redirects through taxonomy.",
  );
}
if (!toolDirectoryIndexSource.includes("permanentRedirect(")) {
  addUnique(errors, "Tool directory index is missing the sector redirect guard.");
}

const sectorPagesSource = readFile(ROUTE_FILES.sectorPages);
if (sectorPagesSource.includes("/annuaire-outils?secteur=")) {
  addUnique(
    errors,
    "Sector page definitions still contain legacy query-string links to annuaire outils.",
  );
}
if (!sectorPagesSource.includes("createSectorPageDefinition(")) {
  addUnique(
    errors,
    "Sector pages no longer appear to be derived from the centralized sector page factory.",
  );
}
if (!sectorPagesSource.includes("getSectorTaxonomyByPublicLabel")) {
  addUnique(
    errors,
    "Sector pages no longer appear to resolve their slug from sector taxonomy.",
  );
}
if (/slug:\s*"[^"]+"/.test(sectorPagesSource)) {
  addUnique(
    errors,
    'Sector pages should not hardcode hub slugs anymore; derive them from sector taxonomy.',
  );
}

const sitemapSource = readFile(ROUTE_FILES.sitemap);
if (!sitemapSource.includes("sectorPageDefinitions.map")) {
  addUnique(
    errors,
    "Sitemap no longer appears to derive sector hub entries from sectorPageDefinitions.",
  );
}
if (!sitemapSource.includes("sectorTaxonomy.map")) {
  addUnique(
    errors,
    "Sitemap no longer appears to derive tool-sector entries from sectorTaxonomy.",
  );
}
if (sitemapSource.includes("/ressources")) {
  addUnique(errors, 'Sitemap should not expose legacy "/ressources" URLs.');
}

for (const sector of sectorTaxonomy) {
  const expectedHubPath = `/secteurs/${sector.publicSlug}`;

  if (!expectedHubPath.startsWith("/secteurs/")) {
    addUnique(errors, `Invalid sector hub path generated for "${sector.publicLabel}".`);
  }
}

const legacyToolQueryMatches = collectLegacyMatches(/\/annuaire-outils\?secteur=/, {
  allowlist: [ROUTE_FILES.toolDirectoryIndex],
});
for (const relativePath of legacyToolQueryMatches) {
  addUnique(
    errors,
    `Legacy query-string sector link found in ${relativePath}.`,
  );
}

const legacyResourcesDetailMatches = collectLegacyMatches(/\/ressources\/[A-Za-z0-9_-]+/);
for (const relativePath of legacyResourcesDetailMatches) {
  addUnique(
    errors,
    `Legacy resources detail link found in ${relativePath}.`,
  );
}

const legacyResourcesIndexMatches = collectLegacyMatches(/href:\s*["']\/ressources["']|href=\{["']\/ressources["']\}|["']\/ressources["']/, {
  allowlist: [ROUTE_FILES.legacyResourcesIndex],
});
for (const relativePath of legacyResourcesIndexMatches) {
  addUnique(
    warnings,
    `Legacy "/ressources" reference still present in ${relativePath}.`,
  );
}

const result = {
  sectorCount: sectorTaxonomy.length,
  checkedFiles: Object.values(ROUTE_FILES).length,
  errors,
  warnings,
};

console.log(JSON.stringify(result, null, 2));

if (errors.length) {
  process.exit(1);
}
