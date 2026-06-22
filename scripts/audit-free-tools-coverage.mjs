import enterpriseAnnuaire from "../src/lib/enterprise-annuaire.json" with { type: "json" };
import freeToolFallbacks from "../src/lib/free-tool-fallbacks.json" with { type: "json" };
import sectorTaxonomyPayload from "../src/lib/sector-taxonomy.json" with { type: "json" };
import toolDirectoryPayload from "../src/lib/tool-directory.json" with { type: "json" };
const sectorTaxonomy = sectorTaxonomyPayload.sectors;
const sectorTaxonomyByPublicLabel = Object.fromEntries(
  sectorTaxonomy.map((sector) => [sector.publicLabel, sector]),
);

const EXACT_SECTOR_PRIORITY_BY_TOOL_SECTOR = freeToolFallbacks.exactSectorPriorityByToolSector;
const GENERIC_FALLBACK_PRIORITY_BY_PUBLIC_SECTOR = freeToolFallbacks.genericFallbackPriorityByPublicSector;
const MANUAL_SYSTEM_PRIORITY_BY_SYSTEM = freeToolFallbacks.manualSystemPriorityBySystem;

function getSectorTaxonomy(sectorLabel) {
  return sectorTaxonomyByPublicLabel[sectorLabel] ?? null;
}

function getToolDirectorySectorLabel(sectorLabel) {
  return getSectorTaxonomy(sectorLabel)?.toolSectorLabel ?? sectorLabel;
}

const freeTools = toolDirectoryPayload.tools.filter(
  (tool) =>
    tool.status !== "hidden" &&
    tool.status !== "deprecated" &&
    tool.pricingHint === "Gratuit" &&
    tool.url.startsWith("/") &&
    !tool.url.startsWith("/annuaire-outils/"),
);

const freeToolsBySlug = Object.fromEntries(
  freeTools.map((tool) => [tool.slug ?? tool.name, tool]),
);

function resolveUniqueToolCount(slugs) {
  const seen = new Set();

  for (const slug of slugs) {
    const tool = freeToolsBySlug[slug];

    if (tool) {
      seen.add(tool.slug ?? tool.name);
    }
  }

  return seen.size;
}

const coverageRows = enterpriseAnnuaire.enterprises.map((enterprise) => {
  const manualPriority = MANUAL_SYSTEM_PRIORITY_BY_SYSTEM[enterprise.slug] ?? [];
  const usesManualFallback = manualPriority.length > 0;
  const taxonomy = getSectorTaxonomy(enterprise.sectorLabel);
  const effectiveSectorLabel = getToolDirectorySectorLabel(enterprise.sectorLabel);
  const exactPriority = EXACT_SECTOR_PRIORITY_BY_TOOL_SECTOR[effectiveSectorLabel] ?? [];
  const genericPriority = GENERIC_FALLBACK_PRIORITY_BY_PUBLIC_SECTOR[enterprise.sectorLabel] ?? [];
  const matchingSectorSlugs = freeTools
    .filter((tool) => tool.sectors.includes(effectiveSectorLabel))
    .map((tool) => tool.slug ?? tool.name);
  const manualCount = resolveUniqueToolCount(manualPriority);
  const exactCount = resolveUniqueToolCount([...exactPriority, ...matchingSectorSlugs]);
  const genericCount = resolveUniqueToolCount(genericPriority);
  const freeToolCount = usesManualFallback
    ? manualCount
    : exactCount > 0
      ? exactCount
      : genericCount;
  const coverageMode = usesManualFallback
    ? "manual"
    : exactCount > 0
      ? "exact"
      : genericCount > 0
        ? "generic"
        : "empty";

  return {
    slug: enterprise.slug,
    sectorLabel: enterprise.sectorLabel,
    fallbackMode: taxonomy?.fallbackMode ?? "generic",
    effectiveSectorLabel,
    usesManualFallback,
    manualCount,
    exactCount,
    genericCount,
    coverageMode,
    freeToolCount,
  };
});

const manualRows = coverageRows.filter((row) => row.coverageMode === "manual");
const exactRows = coverageRows.filter((row) => row.coverageMode === "exact");
const genericRows = coverageRows.filter((row) => row.coverageMode === "generic");
const emptyRows = coverageRows.filter((row) => row.coverageMode === "empty");

console.log(`Manual system coverage: ${manualRows.length}`);
console.log(`Exact sector coverage: ${exactRows.length}`);
console.log(`Generic public fallback coverage: ${genericRows.length}`);
console.log(`Still uncovered: ${emptyRows.length}`);
console.log("");

for (const row of genericRows) {
  console.log(
    `GENERIC | ${row.slug} | ${row.sectorLabel} -> ${row.effectiveSectorLabel} | generic=${row.genericCount}`,
  );
}

for (const row of emptyRows) {
  console.log(
    `EMPTY | ${row.slug} | ${row.sectorLabel} -> ${row.effectiveSectorLabel}`,
  );
}
