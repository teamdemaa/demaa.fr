import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getActiveOperationalSystemDeliverySnapshot,
  getEditableOperationalSystemCopyUrl,
  hasEditableOperationalSystemAsset,
  resolveOperationalSystemDeliverySnapshot,
} from "@/lib/editable-operational-system-assets.server";
import type { OperationalSystemAssetSnapshot } from "@/lib/operational-system-asset-revisions";
import demoAssets from "@/lib/operational-system-demo-assets.generated.json";

const PRIVATE_REGISTRY_ENV_NAME =
  "OPERATIONAL_SYSTEM_COPY_SHEET_IDS_JSON";
const knownSystemSlug = "plomberie-chauffage";

function buildPrivateRegistry() {
  return Object.fromEntries(
    Object.keys(demoAssets).map((slug, index) => [
      slug,
      `private${index.toString(36).padStart(24, "0")}`,
    ]),
  );
}

function buildVersionedPrivateRegistry(activeRevision: string) {
  return {
    schemaVersion: "operational-system-private-assets-v2",
    systems: Object.fromEntries(
      Object.keys(demoAssets).map((slug, index) => [
        slug,
        {
          activeRevision,
          revisions: {
            [activeRevision]: `privatev2${index
              .toString(36)
              .padStart(24, "0")}`,
          },
        },
      ]),
    ),
  };
}

describe("editable operational system assets", () => {
  afterEach(() => {
    delete process.env[PRIVATE_REGISTRY_ENV_NAME];
  });

  it("recognizes published systems without exposing or requiring the private registry", () => {
    expect(hasEditableOperationalSystemAsset(knownSystemSlug)).toBe(true);
    expect(
      getEditableOperationalSystemCopyUrl(
        knownSystemSlug,
        "d032-v1-2026-07-28",
      ),
    ).toBeNull();
    expect(hasEditableOperationalSystemAsset("inconnu")).toBe(false);
    expect(
      getEditableOperationalSystemCopyUrl(
        "inconnu",
        "d032-v1-2026-07-28",
      ),
    ).toBeNull();
  });

  it("resolves a copy URL from a validated server-only sheet identifier", () => {
    const privateRegistry = buildPrivateRegistry();
    process.env[PRIVATE_REGISTRY_ENV_NAME] = JSON.stringify(privateRegistry);

    expect(
      getEditableOperationalSystemCopyUrl(
        knownSystemSlug,
        "d032-v1-2026-07-28",
      ),
    ).toBe(
      `https://docs.google.com/spreadsheets/d/${privateRegistry[knownSystemSlug]}/copy`,
    );
    expect(
      getActiveOperationalSystemDeliverySnapshot(knownSystemSlug),
    ).toEqual({
      assetRevision: "d032-v1-2026-07-28",
      workbookVersion: "1.0.0",
    });
  });

  it("rejects malformed or unpublished entries without echoing their value", () => {
    process.env[PRIVATE_REGISTRY_ENV_NAME] = JSON.stringify({
      inconnu: "b".repeat(24),
    });

    expect(() =>
      getEditableOperationalSystemCopyUrl(
        knownSystemSlug,
        "d032-v1-2026-07-28",
      ),
    ).toThrow("Le registre privé des copies est invalide.");
  });

  it("resolves an explicitly persisted revision from the versioned registry", () => {
    const assetRevision = "d061-v2-pilot-2026-07-29-01";
    const privateRegistry = buildVersionedPrivateRegistry(assetRevision);
    process.env[PRIVATE_REGISTRY_ENV_NAME] = JSON.stringify(privateRegistry);

    const expectedSheetId =
      privateRegistry.systems[knownSystemSlug].revisions[assetRevision];
    expect(
      getEditableOperationalSystemCopyUrl(
        knownSystemSlug,
        assetRevision,
      ),
    ).toBe(
      `https://docs.google.com/spreadsheets/d/${expectedSheetId}/copy`,
    );
    expect(
      getEditableOperationalSystemCopyUrl(
        knownSystemSlug,
        "revision-absente",
      ),
    ).toBeNull();
    expect(
      getActiveOperationalSystemDeliverySnapshot(knownSystemSlug),
    ).toBeNull();
  });

  it("allows an atomic rollback to the public active revision", () => {
    const activeRevision = "d032-v1-2026-07-28";
    const privateRegistry = buildVersionedPrivateRegistry(activeRevision);
    process.env[PRIVATE_REGISTRY_ENV_NAME] = JSON.stringify(privateRegistry);

    expect(
      getActiveOperationalSystemDeliverySnapshot(knownSystemSlug),
    ).toEqual({
      assetRevision: activeRevision,
      workbookVersion: "1.0.0",
    });
  });

  it("activates only when public demo, preview and private editable share the exact revision", () => {
    const publicV2Snapshot: OperationalSystemAssetSnapshot = {
      assetRevision: "d061-v2-pilot-2026-07-29-01",
      workbookVersion: "2.0.0-pilot",
      systemSlug: "batiment",
      demoUrl:
        "https://docs.google.com/spreadsheets/d/publicv2batiment000000000000/edit",
      preview: {
        src: "/images/kits/batiment/tableau-suivi-preview-v2.webp",
        alt: "Aperçu v2 Bâtiment",
        width: 1400,
        height: 933,
      },
    };
    const privateV2 = {
      activeRevision: "d061-v2-pilot-2026-07-29-01",
      revisions: {
        "d032-v1-2026-07-28": "privatev1batiment000000000000",
        "d061-v2-pilot-2026-07-29-01":
          "privatev2batiment000000000000",
      },
    };

    expect(
      resolveOperationalSystemDeliverySnapshot(
        publicV2Snapshot,
        privateV2,
      ),
    ).toEqual({
      assetRevision: "d061-v2-pilot-2026-07-29-01",
      workbookVersion: "2.0.0-pilot",
    });
    expect(
      resolveOperationalSystemDeliverySnapshot(publicV2Snapshot, {
        ...privateV2,
        activeRevision: "d032-v1-2026-07-28",
      }),
    ).toBeNull();
    expect(
      resolveOperationalSystemDeliverySnapshot(publicV2Snapshot, {
        activeRevision: "d061-v2-pilot-2026-07-29-01",
        revisions: {
          "d032-v1-2026-07-28": "privatev1batiment000000000000",
        },
      }),
    ).toBeNull();
  });
});
