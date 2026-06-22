import enterpriseAnnuaire from "../src/lib/enterprise-annuaire.json" with { type: "json" };
import freeToolFallbacks from "../src/lib/free-tool-fallbacks.json" with { type: "json" };
import sectorTaxonomyPayload from "../src/lib/sector-taxonomy.json" with { type: "json" };
import toolDirectoryPayload from "../src/lib/tool-directory.json" with { type: "json" };

const PRIORITY_SECTORS = new Set([
  "Tech & Digital",
  "Hébergement & tourisme",
  "Patrimoine",
  "Mobilité & logistique",
]);

const sectorTaxonomy = sectorTaxonomyPayload.sectors;
const genericSectors = sectorTaxonomy.filter((sector) => sector.fallbackMode === "generic");
const toolsBySlug = Object.fromEntries(
  toolDirectoryPayload.tools
    .filter((tool) => tool.status !== "hidden" && tool.status !== "deprecated")
    .map((tool) => [tool.slug ?? tool.name, tool]),
);

function classifySector({ publicLabel, enterpriseCount, toolCount, manualCoverageCount }) {
  if (manualCoverageCount >= enterpriseCount && enterpriseCount > 0) {
    return "covered-by-system-mappings";
  }

  if (PRIORITY_SECTORS.has(publicLabel)) {
    return "needs-dedicated";
  }

  if (toolCount <= 4 && enterpriseCount >= 3) {
    return "needs-dedicated";
  }

  if (toolCount <= 4) {
    return "acceptable-but-weak";
  }

  return "sufficient";
}

const rows = genericSectors
  .map((sector) => {
    const enterpriseSlugs = enterpriseAnnuaire.enterprises
      .filter((enterprise) => enterprise.sectorLabel === sector.publicLabel)
      .map((enterprise) => enterprise.slug);
    const fallbackSlugs =
      freeToolFallbacks.genericFallbackPriorityByPublicSector[sector.publicLabel] ?? [];
    const systemsWithManualFallback = enterpriseSlugs.filter(
      (slug) => (freeToolFallbacks.manualSystemPriorityBySystem[slug] ?? []).length > 0,
    );
    const tools = fallbackSlugs
      .map((slug) => toolsBySlug[slug])
      .filter(Boolean)
      .map((tool) => ({
        slug: tool.slug ?? tool.name,
        name: tool.name,
        category: tool.category,
      }));
    const classification = classifySector({
      publicLabel: sector.publicLabel,
      enterpriseCount: enterpriseSlugs.length,
      toolCount: tools.length,
      manualCoverageCount: systemsWithManualFallback.length,
    });

    return {
      sector: sector.publicLabel,
      seoSlug: sector.seoSlug,
      enterpriseCount: enterpriseSlugs.length,
      genericToolCount: tools.length,
      systemsWithManualFallbackCount: systemsWithManualFallback.length,
      classification,
      enterpriseSlugs,
      systemsWithManualFallback,
      tools,
    };
  })
  .sort((left, right) => {
    const order = {
      "covered-by-system-mappings": 0,
      "needs-dedicated": 0,
      "acceptable-but-weak": 1,
      sufficient: 2,
    };

    return (
      order[left.classification] - order[right.classification] ||
      right.enterpriseCount - left.enterpriseCount ||
      left.sector.localeCompare(right.sector, "fr")
    );
  });

const summary = {
  genericSectors: rows.length,
  coveredBySystemMappings: rows.filter((row) => row.classification === "covered-by-system-mappings")
    .length,
  needsDedicated: rows.filter((row) => row.classification === "needs-dedicated").length,
  acceptableButWeak: rows.filter((row) => row.classification === "acceptable-but-weak").length,
  sufficient: rows.filter((row) => row.classification === "sufficient").length,
};

console.log(JSON.stringify({ summary, sectors: rows }, null, 2));
