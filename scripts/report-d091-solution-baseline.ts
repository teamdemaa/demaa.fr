import activeSnapshot from "@/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";
import { resolveAidRecommendationsForSystem } from "@/lib/aid-recommendations";
import { D091_PILOT_SYSTEM_SLUGS } from "@/lib/curated-tools-candidate-audit";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import { resolveFinanceRecommendationsForSystem } from "@/lib/finance-recommendations";
import type { SolutionSection } from "@/lib/solution-registry-contract";

type SystemSelection = Readonly<{
  systemSlug: string;
  resourceSlugs: readonly string[];
}>;

function summarizeSelections(selections: readonly SystemSelection[]) {
  const counts = selections.map(({ resourceSlugs }) => resourceSlugs.length);
  const signatures = new Map<string, string[]>();
  for (const { systemSlug, resourceSlugs } of selections) {
    const signature = resourceSlugs.join("|") || "(empty)";
    signatures.set(signature, [...(signatures.get(signature) ?? []), systemSlug]);
  }
  return {
    systems: selections.length,
    minimum: Math.min(...counts),
    maximum: Math.max(...counts),
    average: Number((counts.reduce((total, count) => total + count, 0) / counts.length).toFixed(2)),
    emptySystems: selections.filter(({ resourceSlugs }) => resourceSlugs.length === 0)
      .map(({ systemSlug }) => systemSlug),
    repeatedSelections: Array.from(signatures.entries())
      .map(([signature, systemSlugs]) => ({ signature, occurrences: systemSlugs.length, systemSlugs }))
      .filter(({ occurrences }) => occurrences > 1)
      .sort((left, right) => right.occurrences - left.occurrences)
      .slice(0, 10),
  };
}

function firebaseSelections(
  section: SolutionSection,
  options: Readonly<{ publishedOnly?: boolean }> = {},
): SystemSelection[] {
  return enterpriseCatalog.map(({ slug: systemSlug }) => ({
    systemSlug,
    resourceSlugs: activeSnapshot.placements
      .filter(({ placement }) =>
        placement.systemSlug === systemSlug &&
        placement.section === section &&
        placement.editorialStatus === "selected" &&
        (!options.publishedOnly || (
          placement.status === "published" &&
          placement.publicationBlockers.length === 0
        ))
      )
      .sort((left, right) => left.placement.rank - right.placement.rank)
      .map(({ placement }) => placement.resourceSlug),
  }));
}

const financeResolutions = enterpriseCatalog.map(({ slug: systemSlug }) => ({
  systemSlug,
  ...resolveFinanceRecommendationsForSystem(systemSlug),
}));
const financeSelections = financeResolutions.map(({ systemSlug, items }) => ({
  systemSlug,
  resourceSlugs: items.map(({ slug }) => slug),
}));
const aidResolutions = enterpriseCatalog.map(({ slug: systemSlug, sectorLabel }) => ({
  systemSlug,
  ...resolveAidRecommendationsForSystem(systemSlug, sectorLabel),
}));
const aidSelections = aidResolutions.map(({ systemSlug, items }) => ({
  systemSlug,
  resourceSlugs: items.map(({ slug }) => slug),
}));
const softwareSelections = firebaseSelections("software");
const providerSelections = firebaseSelections("providers", { publishedOnly: true });
const networkSelections = firebaseSelections("networks", { publishedOnly: true });

function pilotRows(selections: readonly SystemSelection[]) {
  const bySystem = new Map(selections.map((selection) => [selection.systemSlug, selection]));
  return D091_PILOT_SYSTEM_SLUGS.map((systemSlug) =>
    bySystem.get(systemSlug) ?? { systemSlug, resourceSlugs: [] }
  );
}

console.log(JSON.stringify({
  decisionId: "D-091",
  generatedFromRevision: activeSnapshot.revisionId,
  mutatesRuntime: false,
  policy: "Counts reveal coverage and repetition; they are never publication targets.",
  sections: {
    software: summarizeSelections(softwareSelections),
    providersPublished: summarizeSelections(providerSelections),
    financing: summarizeSelections(financeSelections),
    aids: summarizeSelections(aidSelections),
    networksPublished: summarizeSelections(networkSelections),
  },
  provenance: {
    financing: Object.fromEntries(["system", "default"].map((source) => [
      source,
      financeResolutions.filter((selection) => selection.source === source).length,
    ])),
    aids: Object.fromEntries(["system", "sector", "default"].map((source) => [
      source,
      aidResolutions.filter((selection) => selection.source === source).length,
    ])),
  },
  pilots: {
    software: pilotRows(softwareSelections),
    providersPublished: pilotRows(providerSelections),
    financing: pilotRows(financeSelections),
    aids: pilotRows(aidSelections),
    networksPublished: pilotRows(networkSelections),
  },
}, null, 2));
