import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type CatalogEnrichmentModule = typeof import(
  "@/lib/firebase-solution-registry-catalog-enrichment.server"
);

let buildRevision: CatalogEnrichmentModule["buildPublishedCatalogEnrichmentRevision"];
let revision: ReturnType<CatalogEnrichmentModule["buildPublishedCatalogEnrichmentRevision"]>;

beforeAll(async () => {
  ({ buildPublishedCatalogEnrichmentRevision: buildRevision } = await import(
    "@/lib/firebase-solution-registry-catalog-enrichment.server"
  ));
  revision = buildRevision();
});

describe("Firebase Solutions catalog enrichment", () => {
  it("publishes the complete enriched catalog as one immutable revision", () => {
    expect(revision).toMatchObject({
      revisionId: "solutions-2026-08-12-catalog-enrichment-published-v1",
      revisionStatus: "published",
      createdBy: "release://catalog-enrichment-france-2026-08-12",
    });
    expect(revision.knownSystemSlugs).toHaveLength(115);
    expect(revision.resources).toHaveLength(267);
    expect(revision.placements).toHaveLength(722);
  });

  it("keeps Restaurant suppliers and expands its audited tools", () => {
    const placements = revision.placements.filter(
      ({ placement }) => placement.systemSlug === "restaurant",
    );
    const slugs = (section: string) => placements
      .filter(({ placement }) => placement.section === section)
      .map(({ placement }) => placement.resourceSlug);

    expect(slugs("software")).toEqual([
      "lightspeed",
      "zenchef",
      "deliverect",
      "l-addition",
      "revya",
      "uber-eats",
    ]);
    expect(slugs("providers")).toEqual([
      "transgourmet",
      "metro-france",
      "france-boissons",
      "firplast",
    ]);
    expect(slugs("networks")).toEqual(["umih"]);
  });
});
