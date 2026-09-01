import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: (callback: () => unknown) => callback,
}));

import snapshot from "@/lib/firebase-solution-registry.catalog-enrichment.snapshot.generated.json";

type Modules = Readonly<{
  loadRevision: typeof import("@/lib/firebase-solution-registry.server").loadFirebaseSolutionRegistryRevision;
  selectSections: typeof import("@/lib/firebase-solution-registry-selection.server").selectRenderableSolutionSectionsFromRevision;
  fingerprint: typeof import("@/lib/firebase-solution-registry-contract").fingerprintFirebaseSolutionRegistryRevision;
  parse: typeof import("@/lib/firebase-solution-registry-contract").parseFirebaseSolutionRegistryRevision;
}>;

let modules: Modules;
const TEST_NOW = new Date("2026-08-12T12:01:00.000Z");

beforeAll(async () => {
  const [reader, selection, contract] = await Promise.all([
    import("@/lib/firebase-solution-registry.server"),
    import("@/lib/firebase-solution-registry-selection.server"),
    import("@/lib/firebase-solution-registry-contract"),
  ]);
  modules = {
    loadRevision: reader.loadFirebaseSolutionRegistryRevision,
    selectSections: selection.selectRenderableSolutionSectionsFromRevision,
    fingerprint: contract.fingerprintFirebaseSolutionRegistryRevision,
    parse: contract.parseFirebaseSolutionRegistryRevision,
  };
});

function publishLevierOnly(
  revision: Awaited<ReturnType<Modules["loadRevision"]>>,
) {
  const base = {
    ...revision,
    revisionId: "solutions-levier-only-v1",
    revisionStatus: "published" as const,
    sourceFingerprint: "0".repeat(64),
    resources: revision.resources.filter(
      ({ resource }) => resource.resourceSlug === "levier",
    ),
    placements: revision.placements.filter(
      ({ placement }) => placement.resourceSlug === "levier",
    ),
  };
  return { ...base, sourceFingerprint: modules.fingerprint(base) };
}

describe("Firebase Solutions reader", () => {
  it("keeps the generated snapshot usable as an explicit test fixture only", async () => {
    const fetchRemote = vi.fn();
    const revision = modules.parse(snapshot);

    expect(fetchRemote).not.toHaveBeenCalled();
    expect(revision.knownSystemSlugs).toHaveLength(115);
    expect(revision.placements).toHaveLength(720);
    expect(
      revision.knownSystemSlugs.flatMap((systemSlug) =>
        modules.selectSections(revision, systemSlug)
          .flatMap(({ placements }) => placements),
      ),
    ).toHaveLength(720);
    expect(
      revision.knownSystemSlugs.flatMap((systemSlug) =>
        modules.selectSections(revision, systemSlug, { publishedOnly: true })
          .flatMap(({ placements }) => placements),
      ),
    ).toHaveLength(118);
    const publicEcosystem = revision.knownSystemSlugs.flatMap((systemSlug) =>
      modules.selectSections(revision, systemSlug, {
        publishedOnlySections: ["providers", "networks"],
      }).flatMap(({ placements }) => placements),
    );
    expect(publicEcosystem).toHaveLength(508);
    expect(publicEcosystem.filter(({ section }) => section === "providers"))
      .toHaveLength(3);
    expect(publicEcosystem.filter(({ section }) => section === "networks"))
      .toHaveLength(0);
  });

  it("accepts a complete published remote revision", async () => {
    const published = publishLevierOnly(modules.parse(snapshot));
    const revision = await modules.loadRevision({
      now: TEST_NOW,
      fetchRemote: async () => published,
    });

    expect(revision.revisionId).toBe("solutions-levier-only-v1");
    expect(revision.revisionStatus).toBe("published");
    expect(revision.placements).toHaveLength(115);
  });

  it("normalizes Firestore collection order before validating the fingerprint", async () => {
    const fallback = modules.parse(snapshot);
    const revision = await modules.loadRevision({
      now: TEST_NOW,
      fetchRemote: async () => ({
        ...fallback,
        resources: [...fallback.resources].reverse(),
        placements: [...fallback.placements].reverse(),
      }),
    });

    expect(revision.sourceFingerprint).toBe(fallback.sourceFingerprint);
    expect(revision.resources).toEqual(fallback.resources);
    expect(revision.placements).toEqual(fallback.placements);
  });

  it("fails closed when the remote revision is not active or is corrupted", async () => {
    const fallback = modules.parse(snapshot);
    const inactiveBase = {
      ...fallback,
      revisionStatus: "draft" as const,
      sourceFingerprint: "0".repeat(64),
    };
    const inactive = {
      ...inactiveBase,
      sourceFingerprint: modules.fingerprint(inactiveBase),
    };
    await expect(modules.loadRevision({
      now: TEST_NOW,
      fetchRemote: async () => inactive,
    })).rejects.toThrow("active revision must be published");
  });
});
