import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type Candidate = ReturnType<
  typeof import("@/lib/firebase-solution-registry-supplier-expansion.server")["buildPublishedSupplierExpansionRevision"]
>;

let candidate: Candidate;

beforeAll(async () => {
  const { buildPublishedSupplierExpansionRevision } = await import(
    "@/lib/firebase-solution-registry-supplier-expansion.server"
  );
  candidate = buildPublishedSupplierExpansionRevision();
});

const expectedPlacements = {
  "commerce-de-detail": ["sumup", "raja"],
  "e-commerce": ["raja"],
  "commerce-alimentaire": ["transgourmet", "metro-france", "sumup", "raja"],
  "boutique-specialisee": ["sumup", "raja"],
  "hotel-hebergement-independant": ["metro-france", "france-boissons", "sumup"],
  "production-industrie": ["wurth", "kiloutou"],
  "auto-ecole": ["codes-rousseau-pro"],
  evenementiel: ["kiloutou", "france-boissons", "sumup"],
  "nettoyage-professionnel": ["bernard"],
} as const;

describe("supplier expansion revision", () => {
  it("adds only the selected specialty supplier systems in the intended order", () => {
    for (const [systemSlug, expected] of Object.entries(expectedPlacements)) {
      const actual = candidate.placements
        .filter(({ placement }) =>
          placement.systemSlug === systemSlug && placement.section === "providers"
        )
        .map(({ placement }) => placement.resourceSlug);
      expect(actual).toEqual(expected);
    }
  });

  it("keeps the expansion draft, unknown and free of partnership claims", () => {
    const placements = candidate.placements.filter(
      ({ placement }) => placement.placementVersion === "supplier-expansion.v1",
    );
    const resources = candidate.resources.filter(
      ({ resource }) => resource.resourceVersion === "supplier-expansion.v1",
    );

    expect(placements).toHaveLength(19);
    expect(resources).toHaveLength(4);
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

  it("does not manufacture universal provider coverage", () => {
    const systemsWithProviders = new Set(
      candidate.placements
        .filter(({ placement }) => placement.section === "providers")
        .map(({ placement }) => placement.systemSlug),
    );

    expect(systemsWithProviders.size).toBe(50);
    expect(systemsWithProviders.has("psychologue")).toBe(false);
    expect(systemsWithProviders.has("consultant-data-bi")).toBe(false);
    expect(systemsWithProviders.has("investissement-financier")).toBe(false);
  });
});
