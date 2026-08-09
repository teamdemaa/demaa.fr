import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type Modules = Readonly<{
  enterpriseCatalog: typeof import("@/lib/enterprise-annuaire").enterpriseCatalog;
  buildCandidate: typeof import("@/lib/firebase-solution-registry-france-cleanup.server").buildFranceSolutionsCleanupRevision;
  destinations: typeof import("@/lib/firebase-solution-registry-france-cleanup.server").FRANCE_SOLUTIONS_OFFICIAL_DESTINATIONS;
  timestamp: typeof import("@/lib/firebase-solution-registry-france-cleanup.server").FRANCE_SOLUTIONS_CLEANUP_TIMESTAMP;
  validate: typeof import("@/lib/firebase-solution-registry-contract").validateFirebaseSolutionRegistryRevision;
  buildPlan: typeof import("@/lib/firebase-solution-registry-firestore-plan").buildFirestoreSolutionRegistryImportPlan;
  buildRollback: typeof import("@/lib/firebase-solution-registry-firestore-plan").buildFirestoreSolutionRegistryRollbackPointer;
  parseRevision: typeof import("@/lib/firebase-solution-registry-contract").parseFirebaseSolutionRegistryRevision;
  selectSections: typeof import("@/lib/firebase-solution-registry-selection.server").selectRenderableSolutionSectionsFromRevision;
  visibility: typeof import("@/lib/public-solution-section-visibility").PUBLIC_SOLUTION_SECTION_VISIBILITY;
  snapshot: unknown;
}>;

let modules: Modules;
let candidate: ReturnType<Modules["buildCandidate"]>;

beforeAll(async () => {
  const [catalog, cleanup, contract, firestorePlan, selection, visibility, snapshot] =
    await Promise.all([
      import("@/lib/enterprise-annuaire"),
      import("@/lib/firebase-solution-registry-france-cleanup.server"),
      import("@/lib/firebase-solution-registry-contract"),
      import("@/lib/firebase-solution-registry-firestore-plan"),
      import("@/lib/firebase-solution-registry-selection.server"),
      import("@/lib/public-solution-section-visibility"),
      import("@/lib/firebase-solution-registry.snapshot.generated.json"),
    ]);
  modules = {
    enterpriseCatalog: catalog.enterpriseCatalog,
    buildCandidate: cleanup.buildFranceSolutionsCleanupRevision,
    destinations: cleanup.FRANCE_SOLUTIONS_OFFICIAL_DESTINATIONS,
    timestamp: cleanup.FRANCE_SOLUTIONS_CLEANUP_TIMESTAMP,
    validate: contract.validateFirebaseSolutionRegistryRevision,
    buildPlan: firestorePlan.buildFirestoreSolutionRegistryImportPlan,
    buildRollback: firestorePlan.buildFirestoreSolutionRegistryRollbackPointer,
    parseRevision: contract.parseFirebaseSolutionRegistryRevision,
    selectSections: selection.selectRenderableSolutionSectionsFromRevision,
    visibility: visibility.PUBLIC_SOLUTION_SECTION_VISIBILITY,
    snapshot: snapshot.default,
  };
  candidate = modules.buildCandidate();
});

describe("Firebase Solutions France cleanup candidate", () => {
  it("keeps the exact 115-system contract and a non-activating draft", () => {
    const slugs = modules.enterpriseCatalog.map(({ slug }) => slug);
    expect(candidate.revisionStatus).toBe("draft");
    expect(candidate.knownSystemSlugs).toEqual(slugs);
    expect(candidate.knownSystemSlugs).toHaveLength(115);
    expect(candidate.resources).toHaveLength(247);
    expect(candidate.placements).toHaveLength(599);
    expect(modules.validate(candidate, {
      expectedSystemSlugs: slugs,
      now: new Date(modules.timestamp),
    })).toEqual([]);
  });

  it("uses every verified official destination in the resource and its presentations", () => {
    for (const [resourceSlug, officialUrl] of Object.entries(modules.destinations)) {
      const resource = candidate.resources.find(
        ({ resource }) => resource.resourceSlug === resourceSlug,
      )?.resource;
      expect(resource?.interactionMode, resourceSlug).toBe("external_link");
      if (resource?.interactionMode === "external_link") {
        expect(resource.href, resourceSlug).toBe(officialUrl);
      }
      expect(resource?.evidence[0], resourceSlug).toMatchObject({
        sourceRef: officialUrl,
        evidenceType: "official_product_page",
        capturedAt: modules.timestamp,
      });
      const placements = candidate.placements.filter(
        ({ placement }) => placement.resourceSlug === resourceSlug,
      );
      expect(placements.length, resourceSlug).toBeGreaterThan(0);
      for (const entry of placements) {
        expect(entry.presentation.hrefOverride, entry.placement.placementId)
          .toBe(officialUrl);
        expect(entry.placement.evidence[0], entry.placement.placementId)
          .toMatchObject({ sourceRef: officialUrl, capturedAt: modules.timestamp });
      }
    }
    const tiimora = candidate.resources.find(
      ({ resource }) => resource.resourceSlug === "tiimora",
    )?.resource;
    expect(tiimora?.description).toContain("relation client pour cabinets comptables");
  });

  it("removes the obsolete Regate placement without inventing a replacement", () => {
    expect(candidate.resources.some(
      ({ resource }) => resource.resourceSlug === "regate",
    )).toBe(false);
    expect(candidate.placements.some(
      ({ placement }) => placement.resourceSlug === "regate",
    )).toBe(false);
    const dafSoftware = candidate.placements
      .filter(({ placement }) =>
        placement.systemSlug === "daf-externalise" &&
        placement.section === "software"
      )
      .map(({ placement }) => ({
        resourceSlug: placement.resourceSlug,
        rank: placement.rank,
        placementId: placement.placementId,
        fitRationale: placement.fitRationale,
      }));
    expect(dafSoftware).toEqual([
      expect.objectContaining({
        resourceSlug: "pennylane",
        rank: 1,
        placementId: "daf-externalise:pennylane:software:1",
      }),
      expect.objectContaining({
        resourceSlug: "power-bi",
        rank: 2,
        placementId: "daf-externalise:power-bi:software:2",
      }),
    ]);
    expect(JSON.stringify(dafSoftware)).not.toMatch(/Regate/i);
  });

  it("keeps all third parties draft and commercially unknown", () => {
    expect(
      candidate.resources
        .filter(({ resource }) => resource.resourceSlug !== "levier")
        .every(({ resource }) =>
          resource.status === "draft" &&
          resource.commercialRelationship === "unknown" &&
          resource.publicationBlockers.includes(
            "commercial-relationship-unconfirmed",
          )
        ),
    ).toBe(true);
    expect(
      candidate.placements
        .filter(({ placement }) => placement.resourceSlug !== "levier")
        .every(({ placement }) =>
          placement.status === "draft" &&
          placement.commercialRelationship === "unknown" &&
          placement.publicationBlockers.includes(
            "commercial-relationship-unconfirmed",
          )
        ),
    ).toBe(true);
    expect(
      candidate.resources
        .filter(({ resource }) => resource.status === "published")
        .map(({ resource }) => [
          resource.resourceSlug,
          resource.commercialRelationship,
        ]),
    ).toEqual([["levier", "owned"]]);
  });

  it("contains no duplicate placement, rank, resource, or public partnership claim", () => {
    const resourceSlugs = candidate.resources.map(
      ({ resource }) => resource.resourceSlug,
    );
    const resourceNames = candidate.resources.map(({ resource }) =>
      resource.name.toLocaleLowerCase("fr")
    );
    const hrefs = candidate.resources.flatMap(({ resource }) =>
      resource.interactionMode === "external_link" ? [resource.href] : []
    );
    const placementIds = candidate.placements.map(
      ({ placement }) => placement.placementId,
    );
    expect(new Set(resourceSlugs).size).toBe(resourceSlugs.length);
    expect(new Set(resourceNames).size).toBe(resourceNames.length);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(new Set(placementIds).size).toBe(placementIds.length);

    const ranks = new Set<string>();
    for (const { placement } of candidate.placements) {
      const key = `${placement.systemSlug}:${placement.section}:${placement.rank}`;
      expect(ranks.has(key), key).toBe(false);
      ranks.add(key);
    }

    const publicCopy = [
      ...candidate.resources.flatMap(({ resource }) => [
        resource.name,
        resource.description,
      ]),
      ...candidate.placements.flatMap(({ placement, presentation }) => [
        placement.usage,
        placement.fitRationale,
        ...placement.fitConstraints,
        presentation.nameOverride ?? "",
        presentation.descriptionOverride ?? "",
      ]),
    ].join("\n");
    expect(publicCopy).not.toMatch(/\b(?:partenaire|affili[ée]?|odema)\b/i);
  });

  it("excludes Africa-specific additions from the France candidate", () => {
    const slugs = candidate.resources.map(({ resource }) => resource.resourceSlug);
    expect(slugs).not.toContain("sira");
    expect(slugs).not.toContain("getsira");
    expect(candidate.knownSystemSlugs).not.toContain("restaurant-africain");
    expect(candidate.knownSystemSlugs).not.toContain("commercant-africain");
    expect(slugs).toContain("ivoirnet");
  });

  it("shows canonical Services and produces a reversible dry-run plan", () => {
    expect(modules.visibility.services).toBe(true);
    const plan = modules.buildPlan(candidate);
    expect(plan.writes).toHaveLength(847);
    expect(plan.writeBatches.map((batch) => batch.length)).toEqual([400, 400, 47]);
    expect(plan.activation).toBeNull();
    expect(plan.planFingerprint).toMatch(/^[a-f0-9]{64}$/);

    const active = modules.parseRevision(modules.snapshot);
    expect(modules.buildRollback(active)).toEqual({
      path: "solution_registry_config/active",
      data: {
        revisionId: active.revisionId,
        sourceFingerprint: active.sourceFingerprint,
      },
    });
  });

  it("renders a coherent local Solutions payload for all 115 systems", () => {
    for (const systemSlug of candidate.knownSystemSlugs) {
      const sections = modules.selectSections(candidate, systemSlug, {
        now: new Date(modules.timestamp),
      });
      const placements = sections.flatMap(({ placements }) => placements);
      expect(placements.length, systemSlug).toBeGreaterThan(0);
      expect(
        placements.filter(({ resource }) => resource.resourceSlug === "levier"),
        systemSlug,
      ).toHaveLength(1);
      expect(
        sections.some(({ section }) => section === "services"),
        systemSlug,
      ).toBe(false);
    }

    const cabinet = modules.selectSections(candidate, "cabinet-comptable", {
      now: new Date(modules.timestamp),
    });
    const tiimora = cabinet
      .flatMap(({ placements }) => placements)
      .find(({ resource }) => resource.resourceSlug === "tiimora");
    expect(tiimora?.resource.interaction).toEqual({
      interactionMode: "external_link",
      href: "https://www.tiimora.com/",
    });
  });
});
