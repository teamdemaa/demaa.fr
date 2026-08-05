import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({
  unstable_cache: (callback: () => unknown) => callback,
}));

type Modules = Readonly<{
  loadRevision: typeof import("@/lib/firebase-solution-registry.server").loadFirebaseSolutionRegistryRevision;
  selectSections: typeof import("@/lib/firebase-solution-registry-selection.server").selectRenderableSolutionSectionsFromRevision;
  fingerprint: typeof import("@/lib/firebase-solution-registry-contract").fingerprintFirebaseSolutionRegistryRevision;
}>;

let modules: Modules;

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
  it("uses the generated 115-system fallback without remote access", async () => {
    const fetchRemote = vi.fn();
    const revision = await modules.loadRevision({
      forceLocal: true,
      now: new Date("2026-08-05T12:00:00.000Z"),
      fetchRemote,
    });

    expect(fetchRemote).not.toHaveBeenCalled();
    expect(revision.knownSystemSlugs).toHaveLength(115);
    expect(revision.placements).toHaveLength(600);
    expect(
      revision.knownSystemSlugs.flatMap((systemSlug) =>
        modules.selectSections(revision, systemSlug)
          .flatMap(({ placements }) => placements),
      ),
    ).toHaveLength(600);
    expect(
      revision.knownSystemSlugs.flatMap((systemSlug) =>
        modules.selectSections(revision, systemSlug, { publishedOnly: true })
          .flatMap(({ placements }) => placements),
      ),
    ).toHaveLength(115);
  });

  it("accepts a complete published remote revision", async () => {
    const fallback = await modules.loadRevision({
      forceLocal: true,
      now: new Date("2026-08-05T12:00:00.000Z"),
    });
    const published = publishLevierOnly(fallback);
    const warn = vi.fn();
    const revision = await modules.loadRevision({
      forceLocal: false,
      now: new Date("2026-08-05T12:00:00.000Z"),
      fetchRemote: async () => published,
      warn,
    });

    expect(revision.revisionId).toBe("solutions-levier-only-v1");
    expect(revision.revisionStatus).toBe("published");
    expect(revision.placements).toHaveLength(115);
    expect(warn).not.toHaveBeenCalled();
  });

  it("falls back when the remote revision is draft or corrupted", async () => {
    const fallback = await modules.loadRevision({
      forceLocal: true,
      now: new Date("2026-08-05T12:00:00.000Z"),
    });
    const warn = vi.fn();
    const revision = await modules.loadRevision({
      forceLocal: false,
      now: new Date("2026-08-05T12:00:00.000Z"),
      fetchRemote: async () => fallback,
      warn,
    });

    expect(revision.sourceFingerprint).toBe(fallback.sourceFingerprint);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain("active revision must be published");
  });
});
