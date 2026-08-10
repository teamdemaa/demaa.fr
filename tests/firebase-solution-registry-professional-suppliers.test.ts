import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type Candidate = ReturnType<
  typeof import("@/lib/firebase-solution-registry-professional-suppliers.server")["buildPublishedProfessionalSuppliersRevision"]
>;

let candidate: Candidate;

beforeAll(async () => {
  const { buildPublishedProfessionalSuppliersRevision } = await import(
    "@/lib/firebase-solution-registry-professional-suppliers.server"
  );
  candidate = buildPublishedProfessionalSuppliersRevision();
});

describe("professional-services supplier revision", () => {
  it("adds four ordered suppliers to accounting and consulting only", () => {
    for (const systemSlug of ["cabinet-comptable", "cabinet-de-conseil"]) {
      expect(candidate.placements.filter(
        ({ placement }) =>
          placement.systemSlug === systemSlug && placement.section === "providers",
      ).map(({ placement }) => [placement.resourceSlug, placement.rank])).toEqual([
        ["orus", 1],
        ["alan", 2],
        ["swile", 3],
        ["amazon-business", 4],
      ]);
    }
  });

  it("keeps every added supplier draft, unknown and free of partnership claims", () => {
    const addedSlugs = new Set(["orus", "alan", "swile", "amazon-business"]);
    const resources = candidate.resources.filter(
      ({ resource }) => addedSlugs.has(resource.resourceSlug),
    );
    const placements = candidate.placements.filter(
      ({ placement }) => addedSlugs.has(placement.resourceSlug),
    );

    expect(resources).toHaveLength(4);
    expect(placements).toHaveLength(8);
    expect(resources.every(({ resource }) =>
      resource.status === "draft" &&
      resource.commercialRelationship === "unknown" &&
      resource.publicationBlockers.includes("commercial-relationship-unconfirmed")
    )).toBe(true);
    expect(placements.every(({ placement }) =>
      placement.status === "draft" &&
      placement.editorialStatus === "selected" &&
      placement.commercialRelationship === "unknown"
    )).toBe(true);
    expect(JSON.stringify({ resources, placements })).not.toMatch(
      /\b(?:partenaire|affili[ée]?|odema)\b/i,
    );
  });

  it("states the employee condition for Alan and Swile", () => {
    const conditionalPlacements = candidate.placements.filter(
      ({ placement }) => ["alan", "swile"].includes(placement.resourceSlug),
    );
    expect(conditionalPlacements).toHaveLength(4);
    for (const { placement } of conditionalPlacements) {
      expect([
        placement.usage,
        placement.fitRationale,
        ...placement.fitConstraints,
      ].join(" ")).toMatch(/équipe|salarié/i);
    }
  });

  it("keeps the accountant professional networks and does not invent a consulting network", () => {
    expect(candidate.placements.filter(
      ({ placement }) =>
        placement.systemSlug === "cabinet-comptable" && placement.section === "networks",
    ).map(({ placement }) => placement.resourceSlug)).toEqual([
      "ordre-experts-comptables",
      "croec-regional",
    ]);
    expect(candidate.placements.filter(
      ({ placement }) =>
        placement.systemSlug === "cabinet-de-conseil" && placement.section === "networks",
    )).toHaveLength(0);
  });
});
