import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  isReviewedGenericToolComparisonSystem,
  REVIEWED_GENERIC_TOOL_COMPARISON_TOOL_SLUGS,
} from "@/lib/tool-capability-comparison-data";
import {
  auditToolComparisonViewQuality,
  auditToolProcessComparisonReview,
  buildToolProcessComparisonView,
} from "@/lib/tool-process-comparison.server";
import { getToolDirectoryItemBySlug } from "@/lib/tool-directory";
import { getGenericToolComparisonFeatures } from "@/lib/tool-feature-comparison-catalog";
import { getCuratedToolRecommendationsForSystem } from "@/lib/system-tool-recommendations";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";

function getComparisonToolSlugs(systemSlug: string): string[] {
  if (isReviewedGenericToolComparisonSystem(systemSlug)) {
    return [...REVIEWED_GENERIC_TOOL_COMPARISON_TOOL_SLUGS[
      systemSlug as keyof typeof REVIEWED_GENERIC_TOOL_COMPARISON_TOOL_SLUGS
    ]];
  }

  const enterprise = enterpriseCatalog.find((item) => item.slug === systemSlug)!;
  const candidates = [
    ...(getCuratedToolRecommendationsForSystem(systemSlug) ?? []),
    ...(enterprise.toolRefs ?? []).map((reference) => reference.slug),
  ];

  return [...new Set(candidates)]
    .filter((slug) => {
      const tool = getToolDirectoryItemBySlug(slug);
      return Boolean(tool?.sources?.length && tool.lastReviewedAt);
    })
    .slice(0, Math.max(2, getCuratedToolRecommendationsForSystem(systemSlug)?.length ?? 0));
}

function buildSoftwareSection(
  systemSlug: string,
  toolSlugs: readonly string[],
): RenderableSolutionSectionDto[] {
  return [
    {
      section: "software",
      placements: toolSlugs.map((slug, index) => {
        const tool = getToolDirectoryItemBySlug(slug)!;
        return {
          placementId: `${systemSlug}:${slug}`,
          systemSlug,
          rank: index + 1,
          section: "software" as const,
          usage: tool.bestFor,
          fitRationale: tool.description,
          fitConstraints: [],
          resource: {
            resourceSlug: slug,
            resourceType: "software" as const,
            name: tool.name,
            description: tool.description,
            interaction: {
              interactionMode: "external_link" as const,
              href: tool.url,
            },
          },
        };
      }),
    },
  ];
}

const errors: string[] = [];
const warnings: string[] = [];
const requestedSystem = process.argv
  .find((argument) => argument.startsWith("--system="))
  ?.split("=", 2)[1];
const totals = {
  systems: 0,
  tools: 0,
  cells: 0,
  covered: 0,
  configurable: 0,
  not_documented: 0,
};

for (const enterprise of enterpriseCatalog) {
  if (requestedSystem && enterprise.slug !== requestedSystem) continue;
  const toolSlugs = getComparisonToolSlugs(enterprise.slug);
  const sections = buildSoftwareSection(enterprise.slug, toolSlugs);
  const issues = auditToolProcessComparisonReview({ enterprise, sections });
  if (issues.length) {
    errors.push(...issues);
    continue;
  }

  const comparison = buildToolProcessComparisonView({
    enterprise,
    systemName: enterprise.name,
    sections,
    enforceQuality: false,
  });
  if (!comparison) {
    errors.push(`${enterprise.slug}: comparaison non générée`);
    continue;
  }

  totals.systems += 1;
  totals.tools += comparison.tools.length;
  if (comparison.features.length !== 15) {
    errors.push(`${enterprise.slug}: ${comparison.features.length} fonctionnalités au lieu de 15`);
  }
  if (comparison.features.some((feature) => !feature.description?.trim())) {
    errors.push(`${enterprise.slug}: description de fonctionnalité manquante`);
  }
  warnings.push(...auditToolComparisonViewQuality(comparison));

  for (const feature of comparison.features) {
    const statuses = feature.cells.map((cell) => cell.status);
    for (const status of statuses) {
      totals.cells += 1;
      totals[status] += 1;
    }
  }

  comparison.tools.forEach((tool, index) => {
    const statuses = comparison.features.map((feature) => feature.cells[index].status);
    if (statuses.every((status) => status === "not_documented")) {
      warnings.push(`${enterprise.slug}/${tool.resourceSlug}: aucune capacité rapprochée`);
    }
  });

  if (requestedSystem) {
    console.log(
      JSON.stringify(
        getGenericToolComparisonFeatures(enterprise.slug)?.slice(0, 6),
        null,
        2,
      ),
    );
    console.table(
      comparison.features.map((feature) => ({
        feature: feature.label,
        ...Object.fromEntries(
          comparison.tools.map((tool, index) => [
            tool.name,
            feature.cells[index].status,
          ]),
        ),
      })),
    );
  }
}

console.log(JSON.stringify({ totals, warnings: warnings.slice(0, 100) }, null, 2));

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
}
