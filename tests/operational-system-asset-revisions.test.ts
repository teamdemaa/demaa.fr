import { describe, expect, it } from "vitest";
import publicManifest from "@/lib/operational-system-asset-revisions.generated.json";
import demoAssets from "@/lib/operational-system-demo-assets.generated.json";
import previewAssets from "@/lib/system-kit-previews.generated.json";
import {
  getActiveOperationalSystemAssetSnapshot,
  LEGACY_OPERATIONAL_SYSTEM_ASSET_REVISION,
  resolveOperationalSystemAssetSnapshot,
  validateOperationalSystemAssetManifest,
  type OperationalSystemPublicAssetManifest,
} from "@/lib/operational-system-asset-revisions";
import {
  OPERATIONAL_WORKBOOK_V2_ASSET_REVISION,
  OPERATIONAL_WORKBOOK_V2_PILOT_SLUGS,
} from "@/lib/operational-workbook-v2";

function cloneManifest() {
  return structuredClone(
    publicManifest,
  ) as OperationalSystemPublicAssetManifest;
}

function activateV2(manifest: OperationalSystemPublicAssetManifest) {
  const system = manifest.systems.batiment;
  system.activeRevision = OPERATIONAL_WORKBOOK_V2_ASSET_REVISION;
  system.revisions[LEGACY_OPERATIONAL_SYSTEM_ASSET_REVISION].state =
    "retired";
  system.revisions[OPERATIONAL_WORKBOOK_V2_ASSET_REVISION] = {
    assetRevision: OPERATIONAL_WORKBOOK_V2_ASSET_REVISION,
    state: "active",
    workbookVersion: "2.0.0-pilot",
    demoUrl:
      "https://docs.google.com/spreadsheets/d/publicv2batiment000000000000/edit",
    preview: {
      src: "/images/kits/batiment/tableau-suivi-preview-v2.webp",
      alt: "Aperçu v2 du système opérationnel Bâtiment",
      width: 1400,
      height: 933,
    },
  };
}

describe("operational system public asset revisions", () => {
  it("stores one complete active demo and preview pair for all 115 systems", () => {
    expect(validateOperationalSystemAssetManifest()).toBe(true);
    expect(Object.keys(publicManifest.systems)).toHaveLength(115);
    const previewsBySlug = new Map(
      previewAssets.map((preview) => [preview.slug, preview]),
    );

    for (const [systemSlug, system] of Object.entries(
      publicManifest.systems,
    )) {
      const activeRevision =
        system.revisions[
          system.activeRevision as keyof typeof system.revisions
        ];
      const snapshot =
        getActiveOperationalSystemAssetSnapshot(systemSlug);
      const canonicalPreview = previewsBySlug.get(systemSlug);

      expect(activeRevision).toEqual(
        expect.objectContaining({
          assetRevision: system.activeRevision,
          demoUrl: expect.stringMatching(
            /^https:\/\/docs\.google\.com\/spreadsheets\//,
          ),
          preview: expect.objectContaining({
            src: expect.stringMatching(/^\/images\/kits\//),
          }),
        }),
      );
      expect(snapshot).toEqual(
        expect.objectContaining({
          assetRevision: LEGACY_OPERATIONAL_SYSTEM_ASSET_REVISION,
          demoUrl:
            demoAssets[systemSlug as keyof typeof demoAssets],
          preview: canonicalPreview
            ? {
                alt: canonicalPreview.alt,
                height: canonicalPreview.height,
                src: canonicalPreview.src,
                width: canonicalPreview.width,
              }
            : null,
          systemSlug,
          workbookVersion: "1.0.0",
        }),
      );
    }
  });

  it("keeps incomplete v2 pilot pairs in draft and refuses to activate them", () => {
    for (const systemSlug of OPERATIONAL_WORKBOOK_V2_PILOT_SLUGS) {
      const manifest = cloneManifest();
      const system = manifest.systems[systemSlug];
      system.activeRevision = OPERATIONAL_WORKBOOK_V2_ASSET_REVISION;
      system.revisions[LEGACY_OPERATIONAL_SYSTEM_ASSET_REVISION].state =
        "retired";
      system.revisions[OPERATIONAL_WORKBOOK_V2_ASSET_REVISION].state =
        "active";

      expect(
        resolveOperationalSystemAssetSnapshot(manifest, systemSlug),
      ).toBeNull();
      expect(() =>
        validateOperationalSystemAssetManifest(manifest),
      ).toThrow("ne forme pas une paire démo + aperçu atomique");
    }
  });

  it("supports an atomic v1 to v2 activation and rollback without global fallback", () => {
    const manifest = cloneManifest();
    const v1Snapshot = resolveOperationalSystemAssetSnapshot(
      manifest,
      "batiment",
    );

    activateV2(manifest);
    expect(validateOperationalSystemAssetManifest(manifest)).toBe(true);
    const v2Snapshot = resolveOperationalSystemAssetSnapshot(
      manifest,
      "batiment",
    );
    expect(v2Snapshot).toEqual(
      expect.objectContaining({
        assetRevision: OPERATIONAL_WORKBOOK_V2_ASSET_REVISION,
        workbookVersion: "2.0.0-pilot",
        demoUrl: expect.stringContaining("publicv2batiment"),
        preview: expect.objectContaining({
          src: expect.stringContaining("preview-v2"),
        }),
      }),
    );

    const system = manifest.systems.batiment;
    system.activeRevision = LEGACY_OPERATIONAL_SYSTEM_ASSET_REVISION;
    system.revisions[LEGACY_OPERATIONAL_SYSTEM_ASSET_REVISION].state =
      "active";
    system.revisions[OPERATIONAL_WORKBOOK_V2_ASSET_REVISION].state =
      "retired";

    expect(validateOperationalSystemAssetManifest(manifest)).toBe(true);
    expect(
      resolveOperationalSystemAssetSnapshot(manifest, "batiment"),
    ).toEqual(v1Snapshot);
  });

  it("refuses an absent active revision or a mismatched revision identity", () => {
    const absent = cloneManifest();
    absent.systems.batiment.activeRevision = "revision-absente";
    expect(
      resolveOperationalSystemAssetSnapshot(absent, "batiment"),
    ).toBeNull();
    expect(() => validateOperationalSystemAssetManifest(absent)).toThrow(
      "ne forme pas une paire démo + aperçu atomique",
    );

    const mismatch = cloneManifest();
    mismatch.systems.batiment.revisions[
      LEGACY_OPERATIONAL_SYSTEM_ASSET_REVISION
    ].assetRevision = "revision-incoherente";
    expect(
      resolveOperationalSystemAssetSnapshot(mismatch, "batiment"),
    ).toBeNull();
    expect(() => validateOperationalSystemAssetManifest(mismatch)).toThrow(
      "ne forme pas une paire démo + aperçu atomique",
    );
  });
});
