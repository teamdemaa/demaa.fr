import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  D091_PILOT_SYSTEM_SLUGS,
  validateCuratedEcosystemCandidateRevision,
  validateCuratedToolsCandidateRevision,
} from "@/lib/curated-tools-candidate-audit";
import {
  composeCanonicalServicesForSystem,
  composePublicSolutionSectionsForSystem,
} from "@/lib/canonical-services-system-section.server";
import {
  enterpriseCatalog,
  enterpriseCatalogBySlug,
  enterpriseToSystem,
} from "@/lib/enterprise-annuaire";
import {
  parseFirebaseSolutionRegistryRevision,
  validateFirebaseSolutionRegistryRevision,
} from "@/lib/firebase-solution-registry-contract";
import { selectRenderableSolutionSectionsFromRevision } from "@/lib/firebase-solution-registry-selection.server";
import { buildSystemPageJsonLd } from "@/lib/system-detail-page";
import { buildSystemeDetail } from "@/lib/systeme-catalog";
import {
  validateCuratedSelectionAgainstResearch,
  type SolutionCurationResearchManifest,
} from "@/lib/solution-curation-research-contract";
import { getToolDirectorySlug, toolDirectory } from "@/lib/tool-directory";

async function readJson(relativePath: string) {
  return JSON.parse(await readFile(new URL(relativePath, import.meta.url), "utf8"));
}

describe("D-091 reviewed pilot candidate", () => {
  it("keeps a complete 115-system revision while replacing only the five reviewed tool selections", async () => {
    const [candidateInput, activeInput, research] = await Promise.all([
      readJson("../docs/research/d091-tools/pilot-candidate-revision.generated.json"),
      readJson("../src/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json"),
      readJson("../docs/research/d091-tools/pilot-reviewed-selections.v2.json") as Promise<SolutionCurationResearchManifest>,
    ]);
    const candidate = parseFirebaseSolutionRegistryRevision(candidateInput);
    const active = parseFirebaseSolutionRegistryRevision(activeInput);
    const canonicalSystemSlugs = enterpriseCatalog.map(({ slug }) => slug);
    const activeToolSlugs = new Set(toolDirectory.map(getToolDirectorySlug));

    expect(candidate.knownSystemSlugs).toEqual(canonicalSystemSlugs);
    expect(candidate.revisionStatus).toBe("draft");
    expect(validateFirebaseSolutionRegistryRevision(candidate, {
      expectedSystemSlugs: canonicalSystemSlugs,
    })).toEqual([]);
    expect(validateCuratedToolsCandidateRevision(candidate, {
      activeRevision: active,
      activeToolSlugs,
      auditSystemSlugs: D091_PILOT_SYSTEM_SLUGS,
      expectedCatalogSystemSlugs: canonicalSystemSlugs,
    })).toEqual([]);
    expect(validateCuratedEcosystemCandidateRevision(candidate, {
      auditSystemSlugs: D091_PILOT_SYSTEM_SLUGS,
    })).toEqual([]);

    const selectedBySystem = new Map(
      D091_PILOT_SYSTEM_SLUGS.map((systemSlug) => [
        systemSlug,
        candidate.placements
          .filter(({ placement }) =>
            placement.systemSlug === systemSlug &&
            placement.section === "software"
          )
          .sort((left, right) => left.placement.rank - right.placement.rank)
          .map(({ placement }) => placement.resourceSlug),
      ]),
    );
    expect(validateCuratedSelectionAgainstResearch(
      research,
      selectedBySystem,
      D091_PILOT_SYSTEM_SLUGS,
    )).toEqual([]);
    expect(Object.fromEntries(
      [...selectedBySystem].map(([systemSlug, tools]) => [systemSlug, tools.length]),
    )).toEqual({
      "agence-de-recrutement": 6,
      saas: 8,
      "agence-web": 8,
      "cabinet-comptable": 7,
      batiment: 7,
    });
  });

  it("keeps providers and networks empty on pilots until they pass their own evidence review", async () => {
    const candidate = parseFirebaseSolutionRegistryRevision(await readJson(
      "../docs/research/d091-tools/pilot-candidate-revision.generated.json",
    ));
    const unreviewedPlacements = candidate.placements.filter(({ placement }) =>
      D091_PILOT_SYSTEM_SLUGS.includes(
        placement.systemSlug as (typeof D091_PILOT_SYSTEM_SLUGS)[number],
      ) && ["providers", "networks"].includes(placement.section)
    );

    expect(unreviewedPlacements).toEqual([]);
  });

  it("preserves the public rendering of all 110 non-pilot systems", async () => {
    const [candidateInput, activeInput] = await Promise.all([
      readJson("../docs/research/d091-tools/pilot-candidate-revision.generated.json"),
      readJson("../src/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json"),
    ]);
    const candidate = parseFirebaseSolutionRegistryRevision(candidateInput);
    const active = parseFirebaseSolutionRegistryRevision(activeInput);
    const now = new Date("2026-08-22T12:00:00.000Z");

    for (const systemSlug of enterpriseCatalog
      .map(({ slug }) => slug)
      .filter((slug) => !D091_PILOT_SYSTEM_SLUGS.includes(
        slug as (typeof D091_PILOT_SYSTEM_SLUGS)[number],
      ))) {
      expect(
        selectRenderableSolutionSectionsFromRevision(candidate, systemSlug, {
          now,
          publishedOnlySections: ["providers", "networks"],
        }),
        systemSlug,
      ).toEqual(selectRenderableSolutionSectionsFromRevision(active, systemSlug, {
        now,
        publishedOnlySections: ["providers", "networks"],
      }));
    }
  });

  it("keeps contextual Services independent from the reviewed Outils selection", async () => {
    const candidate = parseFirebaseSolutionRegistryRevision(await readJson(
      "../docs/research/d091-tools/pilot-candidate-revision.generated.json",
    ));
    const now = new Date("2026-08-23T12:00:00.000Z");

    for (const systemSlug of D091_PILOT_SYSTEM_SLUGS) {
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

      expect(canonicalServices?.placements.length, systemSlug).toBeGreaterThan(0);
      expect(composedServices, systemSlug).toEqual(canonicalServices);
      expect(
        registrySections.find(({ section }) => section === "software")?.placements
          .every(({ resource }) => resource.resourceType !== "provider"),
        systemSlug,
      ).toBe(true);
    }
  });

  it("exposes every pilot tool once and in reviewed order in JSON-LD", async () => {
    const candidate = parseFirebaseSolutionRegistryRevision(await readJson(
      "../docs/research/d091-tools/pilot-candidate-revision.generated.json",
    ));
    const now = new Date("2026-08-23T06:35:00.000Z");

    for (const systemSlug of D091_PILOT_SYSTEM_SLUGS) {
      const enterprise = enterpriseCatalogBySlug[systemSlug];
      const system = enterpriseToSystem(enterprise);
      const registrySections = selectRenderableSolutionSectionsFromRevision(
        candidate,
        systemSlug,
        { now, publishedOnlySections: ["software", "providers", "networks"] },
      );
      const publicSections = composePublicSolutionSectionsForSystem(
        systemSlug,
        registrySections,
      );
      const software = publicSections.find(({ section }) => section === "software");
      const jsonLd = buildSystemPageJsonLd({
        enterprise,
        system,
        detail: {
          slug: system.slug,
          sectorLabel: enterprise.sectorLabel,
          imageTitle: enterprise.imageTitle,
          imageSubtitle: enterprise.imageSubtitle,
          systeme: buildSystemeDetail(enterprise),
          businessModelId: enterprise.businessModelId,
          businessVariant: enterprise.businessVariant,
          businessBlocks: enterprise.businessBlocks ?? [],
          businessSignals: enterprise.businessSignals,
          tools: [],
        },
      }, publicSections);
      const toolList = jsonLd.find((item) =>
        item["@type"] === "ItemList" && item.name?.startsWith("Outils recommandés")
      );

      expect(toolList?.itemListElement, systemSlug).toEqual(
        software?.placements.map(({ rank, resource }) =>
          expect.objectContaining({
            name: resource.name,
            position: rank,
          })
        ),
      );
      expect(new Set(
        toolList?.itemListElement?.map(({ name }) => name),
      ).size, systemSlug).toBe(software?.placements.length);
    }
  });
});
