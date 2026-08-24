import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  D091_PILOT_SYSTEM_SLUGS,
  D091_RESTAURATION_SYSTEM_SLUGS,
  validateCuratedEcosystemCandidateRevision,
  validateCuratedToolsCandidateRevision,
} from "@/lib/curated-tools-candidate-audit";
import { composeCanonicalServicesForSystem } from "@/lib/canonical-services-system-section.server";
import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import { selectRenderableSolutionSectionsFromRevision } from "@/lib/firebase-solution-registry-selection.server";
import {
  validateCuratedSelectionAgainstResearch,
  type SolutionCurationResearchManifest,
} from "@/lib/solution-curation-research-contract";
import {
  getToolDirectorySlug,
  toolDirectoryCandidatePool,
} from "@/lib/tool-directory";

const REVIEWED_SYSTEM_SLUGS = [
  ...D091_PILOT_SYSTEM_SLUGS,
  ...D091_RESTAURATION_SYSTEM_SLUGS,
] as const;

async function readJson(relativePath: string) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));
}

describe("D-091 pilot plus restauration candidate", () => {
  it("keeps a complete draft revision and exactly matches reviewed order", async () => {
    const [candidateInput, activeInput, research] = await Promise.all([
      readJson("../docs/research/d091-tools/lot1-restauration-candidate-revision.generated.json"),
      readJson("../src/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json"),
      readJson("../docs/research/d091-tools/lot1-restauration-plus-pilot-reviewed-selections.generated.json") as Promise<SolutionCurationResearchManifest>,
    ]);
    const candidate = parseFirebaseSolutionRegistryRevision(candidateInput);
    const active = parseFirebaseSolutionRegistryRevision(activeInput);
    const canonicalSystemSlugs = enterpriseCatalog.map(({ slug }) => slug);
    const knownToolSlugs = new Set(toolDirectoryCandidatePool.map(getToolDirectorySlug));

    expect(candidate.revisionStatus).toBe("draft");
    expect(candidate.knownSystemSlugs).toEqual(canonicalSystemSlugs);
    expect(validateFirebaseSolutionRegistryRevision(candidate, {
      expectedSystemSlugs: canonicalSystemSlugs,
    })).toEqual([]);
    expect(validateCuratedToolsCandidateRevision(candidate, {
      activeRevision: active,
      activeToolSlugs: knownToolSlugs,
      auditSystemSlugs: REVIEWED_SYSTEM_SLUGS,
      expectedCatalogSystemSlugs: canonicalSystemSlugs,
    })).toEqual([]);
    expect(validateCuratedEcosystemCandidateRevision(candidate, {
      auditSystemSlugs: REVIEWED_SYSTEM_SLUGS,
    })).toEqual([]);

    const selectedBySystem = new Map(REVIEWED_SYSTEM_SLUGS.map((systemSlug) => [
      systemSlug,
      candidate.placements
        .filter(({ placement }) =>
          placement.systemSlug === systemSlug &&
          placement.section === "software"
        )
        .sort((left, right) => left.placement.rank - right.placement.rank)
        .map(({ placement }) => placement.resourceSlug),
    ]));
    expect(validateCuratedSelectionAgainstResearch(
      research,
      selectedBySystem,
      REVIEWED_SYSTEM_SLUGS,
    )).toEqual([]);
  });

  it("preserves all 103 systems outside the pilot and restauration lot", async () => {
    const [candidateInput, activeInput] = await Promise.all([
      readJson("../docs/research/d091-tools/lot1-restauration-candidate-revision.generated.json"),
      readJson("../src/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json"),
    ]);
    const candidate = parseFirebaseSolutionRegistryRevision(candidateInput);
    const active = parseFirebaseSolutionRegistryRevision(activeInput);
    const reviewed = new Set<string>(REVIEWED_SYSTEM_SLUGS);
    const now = new Date("2026-08-24T19:46:00.000Z");

    for (const systemSlug of enterpriseCatalog
      .map(({ slug }) => slug)
      .filter((slug) => !reviewed.has(slug))) {
      expect(selectRenderableSolutionSectionsFromRevision(candidate, systemSlug, {
        now,
        publishedOnlySections: ["providers", "networks"],
      }), systemSlug).toEqual(selectRenderableSolutionSectionsFromRevision(
        active,
        systemSlug,
        { now, publishedOnlySections: ["providers", "networks"] },
      ));
    }
  });

  it("keeps unreviewed providers and networks empty while preserving Services", async () => {
    const candidate = parseFirebaseSolutionRegistryRevision(await readJson(
      "../docs/research/d091-tools/lot1-restauration-candidate-revision.generated.json",
    ));
    const now = new Date("2026-08-24T19:46:00.000Z");

    for (const systemSlug of REVIEWED_SYSTEM_SLUGS) {
      expect(candidate.placements.filter(({ placement }) =>
        placement.systemSlug === systemSlug &&
        ["providers", "networks"].includes(placement.section)
      ), systemSlug).toEqual([]);

      const registrySections = selectRenderableSolutionSectionsFromRevision(
        candidate,
        systemSlug,
        { now, publishedOnlySections: ["software", "providers", "networks"] },
      );
      const canonicalServices = composeCanonicalServicesForSystem(systemSlug, [])
        .find(({ section }) => section === "services");
      const composedServices = composeCanonicalServicesForSystem(
        systemSlug,
        registrySections,
      ).find(({ section }) => section === "services");
      expect(composedServices, systemSlug).toEqual(canonicalServices);
    }
  });
});
