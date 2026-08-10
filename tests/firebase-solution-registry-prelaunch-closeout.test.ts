import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type Candidate = ReturnType<
  typeof import("@/lib/firebase-solution-registry-prelaunch-closeout.server")["buildPublishedPrelaunchCloseoutRevision"]
>;

let candidate: Candidate;

beforeAll(async () => {
  const { buildPublishedPrelaunchCloseoutRevision } = await import(
    "@/lib/firebase-solution-registry-prelaunch-closeout.server"
  );
  candidate = buildPublishedPrelaunchCloseoutRevision();
});

describe("prelaunch solution registry closeout", () => {
  it("gives every system at least one software placement", () => {
    const systemsWithSoftware = new Set(candidate.placements.filter(
      ({ placement }) => placement.section === "software",
    ).map(({ placement }) => placement.systemSlug));

    expect(candidate.knownSystemSlugs).toHaveLength(115);
    expect(systemsWithSoftware.size).toBe(115);
  });

  it("adds Edda first for investment businesses", () => {
    expect(candidate.placements.filter(
      ({ placement }) =>
        placement.systemSlug === "investissement-entreprise" &&
        placement.section === "software",
    ).map(({ placement }) => [placement.resourceSlug, placement.rank])).toEqual([
      ["edda", 1],
    ]);
  });

  it("keeps Edda draft, unknown and free of partnership claims", () => {
    const resource = candidate.resources.find(
      ({ resource: entry }) => entry.resourceSlug === "edda",
    )?.resource;
    const placement = candidate.placements.find(
      ({ placement: entry }) =>
        entry.systemSlug === "investissement-entreprise" &&
        entry.resourceSlug === "edda",
    )?.placement;

    expect(resource).toMatchObject({
      status: "draft",
      commercialRelationship: "unknown",
      publicationBlockers: ["commercial-relationship-unconfirmed"],
    });
    expect(placement).toMatchObject({
      status: "draft",
      editorialStatus: "selected",
      commercialRelationship: "unknown",
    });
    expect(JSON.stringify({ resource, placement })).not.toMatch(
      /\b(?:partenaire|affili[ée]?|odema)\b/i,
    );
  });
});
