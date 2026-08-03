import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  parseSolutionPlacement,
  parseSolutionResource,
  selectPublishedSolutionPlacements,
  selectPublishedSolutionResources,
  validateSolutionPlacement,
  validateSolutionRegistries,
  validateSolutionResource,
  type SolutionPlacement,
  type SolutionResource,
} from "@/lib/solution-registry-contract";
import {
  solutionMigrationCandidatePlacements,
  solutionMigrationCandidateResources,
} from "./fixtures/solution-migration-candidates";

const now = new Date("2026-08-01T12:00:00.000Z");
const reviewed = {
  evidence: [{
    evidenceId: "fixture-review",
    sourceRef: "https://example.com/official",
    claim: "Fixture vérifiée pour le contrat de sélection.",
    evidenceType: "official_product_page" as const,
    capturedAt: "2026-07-30T10:00:00.000Z",
  }],
  reviewer: "test-reviewer",
  reviewedAt: "2026-07-30T12:00:00.000Z",
  expiresAt: "2026-10-30T12:00:00.000Z",
};

function publishedResource(): SolutionResource {
  return {
    ...structuredClone(solutionMigrationCandidateResources[0]),
    ...reviewed,
    commercialRelationship: "none",
    status: "published",
    publicationBlockers: [],
  };
}

function publishedPlacement(): SolutionPlacement {
  return {
    ...structuredClone(solutionMigrationCandidatePlacements[0]),
    ...reviewed,
    commercialRelationship: "none",
    status: "published",
    publicationBlockers: [],
  };
}

describe("Solutions registry contract", () => {
  it("keeps Qonto, La Plateforme and CAPEB as test-only migration fixtures", () => {
    expect(solutionMigrationCandidateResources.map((resource) => resource.resourceSlug)).toEqual([
      "qonto",
      "plateforme-du-batiment",
      "capeb",
    ]);
    expect(solutionMigrationCandidateResources.map((resource) => resource.resourceType)).toEqual([
      "software",
      "provider",
      "directory",
    ]);
    expect(solutionMigrationCandidateResources.map((resource) => resource.interactionMode)).toEqual([
      "external_link",
      "detail",
      "referral_form",
    ]);
    expect(validateSolutionRegistries({
      knownSystemSlugs: ["cabinet-comptable", "batiment"],
      resources: solutionMigrationCandidateResources,
      placements: solutionMigrationCandidatePlacements,
    }, now)).toEqual([]);
  });

  it.each([
    null,
    "{not-json",
    {},
    { ...solutionMigrationCandidateResources[0], resourceType: "service" },
    { ...solutionMigrationCandidateResources[0], interactionMode: "popup" },
    { ...solutionMigrationCandidateResources[0], status: "online" },
    { ...solutionMigrationCandidateResources[0], evidence: [{ ...solutionMigrationCandidateResources[0].evidence[0], evidenceType: "rumor" }] },
  ])("returns controlled errors for malformed resource input %#", (payload) => {
    expect(() => validateSolutionResource(payload, now)).not.toThrow();
    expect(validateSolutionResource(payload, now).length).toBeGreaterThan(0);
  });

  it("rejects protocol-relative links, unsafe detail links and invalid referral keys", () => {
    expect(validateSolutionResource({
      ...solutionMigrationCandidateResources[0],
      href: "//evil.example/path",
    }, now)).toContain("external_link requires a safe path or HTTPS URL");
    expect(validateSolutionResource({
      ...solutionMigrationCandidateResources[1],
      href: "https://evil.example/path",
    }, now)).toContain("detail requires a safe path or HTTPS URL");
    expect(validateSolutionResource({
      ...solutionMigrationCandidateResources[2],
      referralKey: "not valid",
    }, now)[0]).toContain("must be a lowercase slug");
  });

  it("deep-freezes resources and placements parsed from unknown values", () => {
    const resource = parseSolutionResource(solutionMigrationCandidateResources[0]);
    const placement = parseSolutionPlacement(solutionMigrationCandidatePlacements[0]);
    expect(Object.isFrozen(resource)).toBe(true);
    expect(Object.isFrozen(resource.evidence)).toBe(true);
    expect(Object.isFrozen(placement.fitConstraints)).toBe(true);
    expect(() => {
      (resource as { status: string }).status = "published";
    }).toThrow();
  });

  it("selects only an explicit, valid placement and returns no fallback", () => {
    const resource = publishedResource();
    const placement = publishedPlacement();
    const selected = selectPublishedSolutionPlacements({
      systemSlug: "cabinet-comptable",
      knownSystemSlugs: ["cabinet-comptable", "restaurant"],
      resources: [resource],
      placements: [placement],
    }, now);
    expect(selected).toHaveLength(1);
    expect(selected[0].resource.resourceSlug).toBe("qonto");
    expect(Object.isFrozen(selected[0])).toBe(true);
    expect(selectPublishedSolutionPlacements({
      systemSlug: "restaurant",
      knownSystemSlugs: ["cabinet-comptable", "restaurant"],
      resources: [resource],
      placements: [placement],
    }, now)).toEqual([]);
    expect(selectPublishedSolutionPlacements({
      systemSlug: "unknown-system",
      knownSystemSlugs: ["cabinet-comptable"],
      resources: [resource],
      placements: [placement],
    }, now)).toEqual([]);
    expect(selectPublishedSolutionPlacements({
      systemSlug: "cabinet-comptable",
      knownSystemSlugs: ["cabinet-comptable"],
      resources: [],
      placements: [placement],
    }, now)).toEqual([]);
  });

  it("publishes the canonical Levier tool interaction without a public URL", () => {
    const resource = {
      ...publishedResource(),
      resourceSlug: "levier",
      resourceType: "tool" as const,
      name: "Levier",
      description: "Tableau de pilotage opérationnel",
      interactionMode: "system_delivery" as const,
      resourceVersion: "levier.v1",
    };
    delete (resource as { href?: string }).href;
    const placement = {
      ...publishedPlacement(),
      placementId: "cabinet-comptable:levier:software:1",
      resourceSlug: "levier",
      placementVersion: "levier.v1",
    };

    expect(validateSolutionResource(resource, now)).toEqual([]);
    const selected = selectPublishedSolutionPlacements({
      systemSlug: "cabinet-comptable",
      knownSystemSlugs: ["cabinet-comptable"],
      resources: [resource],
      placements: [placement],
    }, now);
    expect(selected).toHaveLength(1);
    expect(selected[0].resource).toMatchObject({
      resourceSlug: "levier",
      resourceType: "tool",
      interaction: { interactionMode: "system_delivery" },
    });
    expect(selected[0].resource.interaction).not.toHaveProperty("href");
  });

  it("rejects invalid chronology, real injected expiry and non-semantic placements", () => {
    const resource = publishedResource();
    expect(selectPublishedSolutionPlacements({
      systemSlug: "cabinet-comptable",
      knownSystemSlugs: ["cabinet-comptable"],
      resources: [resource],
      placements: [publishedPlacement()],
    }, new Date("2026-11-01T12:00:00.000Z"))).toEqual([]);
    const placement = { ...publishedPlacement(), placementId: "opaque-id" };
    expect(validateSolutionPlacement(placement, now)).toContain(
      "solution placement ID must match its semantic fields",
    );
  });

  it("rejects malformed collection envelopes and fails closed without running accessors", () => {
    const resource = publishedResource();
    const placement = publishedPlacement();

    const sparseResources = new Array<unknown>(1);
    const resourcesWithExtra = [resource] as unknown[] & { unexpected?: boolean };
    resourcesWithExtra.unexpected = true;
    let resourceGetterCalls = 0;
    const accessorResources: unknown[] = [];
    Object.defineProperty(accessorResources, "0", {
      enumerable: true,
      get() {
        resourceGetterCalls += 1;
        throw new Error("resource getter must not run");
      },
    });
    accessorResources.length = 1;

    const sparsePlacements = new Array<unknown>(1);
    const placementsWithExtra = [placement] as unknown[] & { unexpected?: boolean };
    placementsWithExtra.unexpected = true;
    let placementGetterCalls = 0;
    const accessorPlacements: unknown[] = [];
    Object.defineProperty(accessorPlacements, "0", {
      enumerable: true,
      get() {
        placementGetterCalls += 1;
        throw new Error("placement getter must not run");
      },
    });
    accessorPlacements.length = 1;

    for (const resources of [sparseResources, resourcesWithExtra, accessorResources]) {
      expect(selectPublishedSolutionResources({ resources }, now)).toEqual([]);
      expect(validateSolutionRegistries({
        knownSystemSlugs: ["cabinet-comptable"],
        resources,
        placements: [],
      }, now).length).toBeGreaterThan(0);
    }
    for (const placements of [sparsePlacements, placementsWithExtra, accessorPlacements]) {
      expect(selectPublishedSolutionPlacements({
        systemSlug: "cabinet-comptable",
        knownSystemSlugs: ["cabinet-comptable"],
        resources: [resource],
        placements,
      }, now)).toEqual([]);
      expect(validateSolutionRegistries({
        knownSystemSlugs: ["cabinet-comptable"],
        resources: [resource],
        placements,
      }, now).length).toBeGreaterThan(0);
    }
    expect(resourceGetterCalls).toBe(0);
    expect(placementGetterCalls).toBe(0);
  });

  it("rejects extra fields and accessors inside resource and placement entries", () => {
    expect(validateSolutionResource({ ...publishedResource(), unexpected: true }, now)[0]).toContain(
      "unknown fields",
    );
    expect(validateSolutionPlacement({ ...publishedPlacement(), unexpected: true }, now)[0]).toContain(
      "unknown fields",
    );

    let resourceGetterCalls = 0;
    const resourceWithAccessor = { ...publishedResource() } as Record<string, unknown>;
    Object.defineProperty(resourceWithAccessor, "name", {
      enumerable: true,
      get() {
        resourceGetterCalls += 1;
        throw new Error("resource field getter must not run");
      },
    });
    let placementGetterCalls = 0;
    const placementWithAccessor = { ...publishedPlacement() } as Record<string, unknown>;
    Object.defineProperty(placementWithAccessor, "usage", {
      enumerable: true,
      get() {
        placementGetterCalls += 1;
        throw new Error("placement field getter must not run");
      },
    });
    expect(() => validateSolutionResource(resourceWithAccessor, now)).not.toThrow();
    expect(() => validateSolutionPlacement(placementWithAccessor, now)).not.toThrow();
    expect(validateSolutionResource(resourceWithAccessor, now)[0]).toContain("enumerable data property");
    expect(validateSolutionPlacement(placementWithAccessor, now)[0]).toContain("enumerable data property");
    expect(resourceGetterCalls).toBe(0);
    expect(placementGetterCalls).toBe(0);
  });

  it("parses systemSlug and knownSystemSlugs from unknown envelopes", () => {
    const resource = publishedResource();
    const placement = publishedPlacement();
    expect(selectPublishedSolutionPlacements(null, now)).toEqual([]);
    expect(selectPublishedSolutionResources(null, now)).toEqual([]);
    expect(validateSolutionRegistries(null, now).length).toBeGreaterThan(0);
    expect(selectPublishedSolutionPlacements({
      systemSlug: 42,
      knownSystemSlugs: ["cabinet-comptable"],
      resources: [resource],
      placements: [placement],
    }, now)).toEqual([]);
    expect(selectPublishedSolutionPlacements({
      systemSlug: "cabinet-comptable",
      knownSystemSlugs: ["cabinet-comptable"],
      resources: [resource],
      placements: [placement],
      unexpected: true,
    }, now)).toEqual([]);
    expect(validateSolutionRegistries({
      knownSystemSlugs: ["cabinet-comptable", "cabinet-comptable"],
      resources: [resource],
      placements: [placement],
    }, now)[0]).toContain("must not contain duplicates");
    expect(validateSolutionRegistries({
      knownSystemSlugs: new Array<unknown>(1),
      resources: [resource],
      placements: [placement],
    }, now)[0]).toContain("must not be sparse");
  });
});
