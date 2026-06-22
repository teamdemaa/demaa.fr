import fs from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(currentDir, "..");
const toolDirectoryPath = resolve(rootDir, "src/lib/tool-directory.json");
const enterpriseAnnuairePath = resolve(rootDir, "src/lib/enterprise-annuaire.json");
const sectorTaxonomyPath = resolve(rootDir, "src/lib/sector-taxonomy.json");
const freeToolFallbacksPath = resolve(rootDir, "src/lib/free-tool-fallbacks.json");

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function resolveToolScope(tool, ref) {
  return ref?.scope ?? tool?.scope;
}

function getCoverageKind(sector, exactFallbacksByToolSector, genericFallbacksByPublicSector) {
  if (!sector) {
    return "none";
  }

  if (sector.fallbackMode === "exact") {
    const exactFallback = exactFallbacksByToolSector[sector.toolSectorLabel ?? ""];
    return Array.isArray(exactFallback) && exactFallback.length > 0 ? "exact" : "none";
  }

  const genericFallback = genericFallbacksByPublicSector[sector.publicLabel];
  return Array.isArray(genericFallback) && genericFallback.length > 0 ? "generic" : "none";
}

const toolPayload = readJson(toolDirectoryPath);
const enterprisePayload = readJson(enterpriseAnnuairePath);
const sectorTaxonomyPayload = readJson(sectorTaxonomyPath);
const freeToolFallbacksPayload = readJson(freeToolFallbacksPath);

const toolsBySlug = new Map(toolPayload.tools.map((tool) => [tool.slug, tool]));
const sectorTaxonomyByLabel = new Map(
  sectorTaxonomyPayload.sectors.map((sector) => [sector.publicLabel, sector]),
);
const exactFallbacksByToolSector =
  freeToolFallbacksPayload.exactSectorPriorityByToolSector ?? {};
const genericFallbacksByPublicSector =
  freeToolFallbacksPayload.genericFallbackPriorityByPublicSector ?? {};

const transverseOnlySystems = [];

for (const enterprise of enterprisePayload.enterprises) {
  const refs = Array.isArray(enterprise.toolRefs) ? enterprise.toolRefs : [];

  if (!refs.length) {
    continue;
  }

  let businessCount = 0;
  let transverseCount = 0;

  for (const ref of refs) {
    const tool = toolsBySlug.get(ref.slug);
    const scope = resolveToolScope(tool, ref);

    if (scope === "transverse") {
      transverseCount += 1;
    } else {
      businessCount += 1;
    }
  }

  if (businessCount > 0) {
    continue;
  }

  const sector = sectorTaxonomyByLabel.get(enterprise.sectorLabel);
  const coverageKind = getCoverageKind(
    sector,
    exactFallbacksByToolSector,
    genericFallbacksByPublicSector,
  );

  transverseOnlySystems.push({
    slug: enterprise.slug,
    name: enterprise.name,
    sectorLabel: enterprise.sectorLabel,
    fallbackMode: sector?.fallbackMode ?? null,
    fallbackCoverage: coverageKind,
    transverseToolCount: transverseCount,
    toolSlugs: refs.map((ref) => ref.slug),
  });
}

const result = {
  summary: {
    systems: enterprisePayload.enterprises.length,
    transverseOnlySystems: transverseOnlySystems.length,
    coveredByExactFallback: transverseOnlySystems.filter((item) => item.fallbackCoverage === "exact")
      .length,
    coveredByGenericFallback: transverseOnlySystems.filter((item) => item.fallbackCoverage === "generic")
      .length,
    uncovered: transverseOnlySystems.filter((item) => item.fallbackCoverage === "none").length,
  },
  sectors: Object.entries(
    transverseOnlySystems.reduce((acc, item) => {
      acc[item.sectorLabel] = (acc[item.sectorLabel] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([sectorLabel, count]) => ({ sectorLabel, count })),
  systems: transverseOnlySystems,
};

console.log(JSON.stringify(result, null, 2));

if (result.summary.uncovered > 0) {
  process.exit(1);
}
