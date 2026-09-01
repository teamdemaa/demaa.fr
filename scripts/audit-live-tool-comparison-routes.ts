import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { isReviewedGenericToolComparisonSystem } from "@/lib/tool-capability-comparison-data";
import { composePublicSolutionSectionsForSystem } from "@/lib/canonical-services-system-section.server";
import {
  selectRenderableSolutionSectionsFromRevision,
} from "@/lib/firebase-solution-registry-selection.server";
import {
  fetchActiveFirebaseSolutionRegistryRevisionFromFirestore,
} from "@/lib/firebase-solution-registry.server";
import localSnapshot from "@/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";
import { parseFirebaseSolutionRegistryRevision } from "@/lib/firebase-solution-registry-contract";
import { filterPublicSystemRecommendationSections } from "@/lib/public-solution-section-visibility";
import { buildToolProcessComparisonView } from "@/lib/tool-process-comparison.server";
import {
  auditToolComparisonViewQuality,
  auditToolProcessComparisonReview,
} from "@/lib/tool-process-comparison.server";
import { mergeRenderableSolutionSections } from "@/lib/system-solutions-ui-dto";

const errors: string[] = [];
const summaryOnly = process.argv.includes("--summary");
const useActiveRegistry = process.argv.includes("--active");
const localRevision = parseFirebaseSolutionRegistryRevision(localSnapshot);
const activeRevision = useActiveRegistry
  ? await fetchActiveFirebaseSolutionRegistryRevisionFromFirestore()
  : null;
const selectedRevision = activeRevision ?? localRevision;
const getSectionsForSystem = async (systemSlug: string) =>
  selectRenderableSolutionSectionsFromRevision(selectedRevision, systemSlug);
const unavailable: string[] = [];
const draftWarnings: string[] = [];
const registryDrift: Array<{
  systemSlug: string;
  localTools: string[];
  activeTools: string[];
}> = [];
const qualityGated: string[] = [];
const availableSystems: string[] = [];
const publishedComparisons: Array<{
  systemSlug: string;
  documentedRows: number;
  discriminatingRows: number;
  tools: Array<{ resourceSlug: string; documentedCapabilities: number }>;
}> = [];
const comparedToolSlugs = new Set<string>();
const distribution = new Map<number, number>();
let supplemented = 0;
let candidateToolOccurrences = 0;
let candidateCells = 0;
let publishedToolOccurrences = 0;
let publishedCells = 0;

for (const enterprise of enterpriseCatalog) {
  const shouldPublish =
    enterprise.slug === "cabinet-comptable" ||
    isReviewedGenericToolComparisonSystem(enterprise.slug);
  const storedSections = await getSectionsForSystem(
    enterprise.slug,
  );
  const sections = filterPublicSystemRecommendationSections(
    composePublicSolutionSectionsForSystem(
      enterprise.slug,
      mergeRenderableSolutionSections(storedSections),
    ),
  );
  if (useActiveRegistry && shouldPublish) {
    const localStoredSections = selectRenderableSolutionSectionsFromRevision(
      localRevision,
      enterprise.slug,
    );
    const localSections = filterPublicSystemRecommendationSections(
      composePublicSolutionSectionsForSystem(
        enterprise.slug,
        mergeRenderableSolutionSections(localStoredSections),
      ),
    );
    const localTools =
      localSections
        .find((section) => section.section === "software")
        ?.placements.map((placement) => placement.resource.resourceSlug) ?? [];
    const activeTools =
      sections
        .find((section) => section.section === "software")
        ?.placements.map((placement) => placement.resource.resourceSlug) ?? [];
    if (localTools.join("|") !== activeTools.join("|")) {
      registryDrift.push({
        systemSlug: enterprise.slug,
        localTools: [...localTools],
        activeTools: [...activeTools],
      });
    }
  }
  const software = sections.find((section) => section.section === "software");
  const toolCount = software?.placements.length ?? 0;
  distribution.set(toolCount, (distribution.get(toolCount) ?? 0) + 1);

  const comparisonCandidate = buildToolProcessComparisonView({
    enterprise,
    systemName: enterprise.name,
    sections,
    enforceQuality: false,
  });
  if (!comparisonCandidate) {
    const issues = auditToolProcessComparisonReview({ enterprise, sections });
    const message =
      `${enterprise.slug} (${toolCount} outil${toolCount > 1 ? "s" : ""}): ${issues.join(" ; ")}`;
    (shouldPublish ? unavailable : draftWarnings).push(message);
    continue;
  }
  candidateToolOccurrences += comparisonCandidate.tools.length;
  candidateCells +=
    comparisonCandidate.tools.length * comparisonCandidate.features.length;
  comparisonCandidate.tools.forEach((tool) =>
    comparedToolSlugs.add(tool.resourceSlug),
  );
  const publishedComparison = buildToolProcessComparisonView({
    enterprise,
    systemName: enterprise.name,
    sections,
  });
  const qualityIssues = auditToolComparisonViewQuality(comparisonCandidate);
  const expectedToolCount = Math.max(2, toolCount);
  if (comparisonCandidate.tools.length !== expectedToolCount) {
    (shouldPublish ? errors : draftWarnings).push(
      `${enterprise.slug}: ${comparisonCandidate.tools.length} outils comparés pour ${toolCount} outils visibles`,
    );
  }
  if (comparisonCandidate.tools.length > toolCount) supplemented += 1;
  if (comparisonCandidate.features.length !== 15) {
    errors.push(
      `${enterprise.slug}: ${comparisonCandidate.features.length} fonctionnalités au lieu de 15`,
    );
  }
  if (!publishedComparison) {
    const message = qualityIssues.length
      ? qualityIssues.join(" ; ")
      : `${enterprise.slug}: revue explicite non validée pour publication`;
    if (shouldPublish) errors.push(message);
    else qualityGated.push(message);
    continue;
  }
  availableSystems.push(enterprise.slug);
  publishedComparisons.push({
    systemSlug: enterprise.slug,
    documentedRows: publishedComparison.features.filter((feature) =>
      feature.cells.some((cell) => cell.status !== "not_documented"),
    ).length,
    discriminatingRows: publishedComparison.features.filter(
      (feature) => new Set(feature.cells.map((cell) => cell.status)).size > 1,
    ).length,
    tools: publishedComparison.tools.map((tool, toolIndex) => ({
      resourceSlug: tool.resourceSlug,
      documentedCapabilities: publishedComparison.features.filter(
        (feature) =>
          feature.cells[toolIndex]?.status !== "not_documented",
      ).length,
    })),
  });
  publishedToolOccurrences += publishedComparison.tools.length;
  publishedCells +=
    publishedComparison.tools.length * publishedComparison.features.length;
}

console.log(
  JSON.stringify(
    {
      systems: enterpriseCatalog.length,
      dataSource: useActiveRegistry ? "firebase-active" : "generated-local",
      registryRevision: {
        revisionId: selectedRevision.revisionId,
        sourceFingerprint: selectedRevision.sourceFingerprint,
      },
      ...(useActiveRegistry
        ? {
            localRegistryRevision: {
              revisionId: localRevision.revisionId,
              sourceFingerprint: localRevision.sourceFingerprint,
            },
          }
        : {}),
      available: availableSystems.length,
      supplemented,
      unavailable,
      draftWarningCount: draftWarnings.length,
      ...(summaryOnly ? {} : { draftWarnings }),
      registryDrift,
      qualityGatedCount: qualityGated.length,
      ...(summaryOnly ? {} : { qualityGated }),
      availableSystems,
      publishedComparisons,
      actualMatrixScope: {
        uniqueComparedTools: comparedToolSlugs.size,
        candidateToolOccurrences,
        candidateCells,
        publishedToolOccurrences,
        publishedCells,
      },
      visibleToolCountDistribution: Object.fromEntries(
        [...distribution.entries()].toSorted(([left], [right]) => left - right),
      ),
      errors,
    },
    null,
    2,
  ),
);

if (errors.length || unavailable.length || registryDrift.length) {
  process.exitCode = 1;
}
