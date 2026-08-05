import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type RegistryModules = Readonly<{
  enterpriseCatalog: typeof import("@/lib/enterprise-annuaire").enterpriseCatalog;
  buildRevision: typeof import("@/lib/firebase-solution-registry-migration.server").buildFirebaseSolutionRegistryMigrationRevision;
  fingerprint: typeof import("@/lib/firebase-solution-registry-contract").fingerprintFirebaseSolutionRegistryRevision;
  validate: typeof import("@/lib/firebase-solution-registry-contract").validateFirebaseSolutionRegistryRevision;
  buildImportPlan: typeof import("@/lib/firebase-solution-registry-firestore-plan").buildFirestoreSolutionRegistryImportPlan;
  buildRollback: typeof import("@/lib/firebase-solution-registry-firestore-plan").buildFirestoreSolutionRegistryRollbackPointer;
  selectSections: typeof import("@/lib/firebase-solution-registry-selection.server").selectRenderableSolutionSectionsFromRevision;
  getLegacySections: typeof import("@/lib/system-solutions-ui.server").getRenderableSolutionSectionsForSystem;
}>;

let modules: RegistryModules;
let migrationRevision: ReturnType<RegistryModules["buildRevision"]>;

beforeAll(async () => {
  const [catalog, migration, contract, firestorePlan, selection, legacy] = await Promise.all([
    import("@/lib/enterprise-annuaire"),
    import("@/lib/firebase-solution-registry-migration.server"),
    import("@/lib/firebase-solution-registry-contract"),
    import("@/lib/firebase-solution-registry-firestore-plan"),
    import("@/lib/firebase-solution-registry-selection.server"),
    import("@/lib/system-solutions-ui.server"),
  ]);
  modules = {
    enterpriseCatalog: catalog.enterpriseCatalog,
    buildRevision: migration.buildFirebaseSolutionRegistryMigrationRevision,
    fingerprint: contract.fingerprintFirebaseSolutionRegistryRevision,
    validate: contract.validateFirebaseSolutionRegistryRevision,
    buildImportPlan: firestorePlan.buildFirestoreSolutionRegistryImportPlan,
    buildRollback: firestorePlan.buildFirestoreSolutionRegistryRollbackPointer,
    selectSections: selection.selectRenderableSolutionSectionsFromRevision,
    getLegacySections: legacy.getRenderableSolutionSectionsForSystem,
  };
  migrationRevision = modules.buildRevision(
    new Date("2026-08-05T12:00:00.000Z"),
  );
});

describe("Firebase Solutions revision contract", () => {
  it("migrates the current 115-system UI without promoting third parties", () => {
    const now = new Date("2026-08-05T12:00:00.000Z");
    const revision = migrationRevision;
    const expectedSystemSlugs = modules.enterpriseCatalog.map(({ slug }) => slug);
    const sectionCounts = Object.fromEntries(
      ["software", "providers", "models", "networks"].map((section) => [
        section,
        revision.placements.filter(({ placement }) => placement.section === section).length,
      ]),
    );

    expect(revision.revisionStatus).toBe("draft");
    expect(revision.knownSystemSlugs).toEqual(expectedSystemSlugs);
    expect(revision.placements).toHaveLength(600);
    expect(sectionCounts).toEqual({
      software: 313,
      providers: 82,
      models: 115,
      networks: 90,
    });
    expect(
      revision.placements.filter(({ placement }) => placement.resourceSlug === "levier"),
    ).toHaveLength(115);
    expect(
      revision.resources
        .filter(({ resource }) => resource.resourceSlug !== "levier")
        .every(({ resource }) =>
          resource.status === "draft" &&
          resource.commercialRelationship === "unknown" &&
          resource.publicationBlockers.includes("commercial-relationship-unconfirmed"),
        ),
    ).toBe(true);
    expect(
      revision.placements
        .filter(({ placement }) => placement.resourceSlug !== "levier")
        .every(({ placement }) =>
          placement.status === "draft" &&
          placement.commercialRelationship === "unknown" &&
          placement.publicationBlockers.includes("commercial-relationship-unconfirmed"),
        ),
    ).toBe(true);
    expect(
      modules.validate(revision, { expectedSystemSlugs, now }),
    ).toEqual([]);
  });

  it("detects content tampering and refuses a draft active revision", () => {
    const now = new Date("2026-08-05T12:00:00.000Z");
    const revision = migrationRevision;
    const expectedSystemSlugs = modules.enterpriseCatalog.map(({ slug }) => slug);
    const tampered = structuredClone(revision);
    (tampered.placements[0].presentation as { displayCategory: string })
      .displayCategory = "Altéré";

    expect(
      modules.validate(tampered, { expectedSystemSlugs, now }),
    ).toContain("revision sourceFingerprint does not match its content");
    expect(
      modules.validate(revision, {
        expectedSystemSlugs,
        now,
        requirePublishedRevision: true,
      }),
    ).toContain("active revision must be published");
  });

  it("rejects partial pricing metadata", () => {
    const now = new Date("2026-08-05T12:00:00.000Z");
    const revision = migrationRevision;
    const expectedSystemSlugs = modules.enterpriseCatalog.map(({ slug }) => slug);
    const invalid = structuredClone(revision);
    (invalid.placements[0].presentation as { indicativePricing?: string })
      .indicativePricing = "10 €";
    expect(
      modules.validate(invalid, { expectedSystemSlugs, now })[0],
    ).toContain("pricing fields must be complete");
  });

  it("rejects an unsafe contextual destination", () => {
    const now = new Date("2026-08-05T12:00:00.000Z");
    const expectedSystemSlugs = modules.enterpriseCatalog.map(({ slug }) => slug);
    const invalid = structuredClone(migrationRevision);
    (invalid.placements[0].presentation as { hrefOverride?: string })
      .hrefOverride = "javascript:alert(1)";
    (invalid as { sourceFingerprint: string }).sourceFingerprint =
      modules.fingerprint(invalid);

    expect(
      modules.validate(invalid, { expectedSystemSlugs, now }),
    ).toContain(`${invalid.placements[0].placement.placementId}: presentation href override is unsafe`);
  });

  it("plans a draft import without an activation pointer", () => {
    const revision = migrationRevision;
    const plan = modules.buildImportPlan(revision);

    expect(plan.writes).toHaveLength(849);
    expect(plan.writeBatches.map((batch) => batch.length)).toEqual([400, 400, 49]);
    expect(plan.activation).toBeNull();
    expect(plan.planFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(() => modules.buildRollback(revision)).toThrow(
      "A rollback target must be a published revision",
    );
  });

  it("preserves the visible card contract for every system", () => {
    const now = new Date("2026-08-05T12:00:00.000Z");
    const revision = migrationRevision;
    const comparable = (sections: ReturnType<RegistryModules["getLegacySections"]>) =>
      JSON.parse(JSON.stringify(sections.map(({ section, placements }) => ({
        section,
        placements: placements.map(({ placementId, rank, ...placement }) => {
          void placementId;
          void rank;
          return placement;
        }),
      }))));

    for (const { slug } of modules.enterpriseCatalog) {
      expect(
        comparable(modules.selectSections(revision, slug, { now })),
        slug,
      ).toEqual(comparable(modules.getLegacySections(slug, now)));
    }
  });
});
