import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  SYSTEM_RESOURCES,
  getSystemResource,
} from "@/lib/system-resource-catalog";
import {
  getSystemResourceAssetSnapshot,
  resolveSystemResourceDelivery,
} from "@/lib/system-resource-assets.server";

describe("system Resources catalog", () => {
  it("publishes the five neutral resources in the agreed order", () => {
    expect(SYSTEM_RESOURCES.map(({ title }) => title)).toEqual([
      "Tableau de pilotage opérationnel",
      "Suivi et prévisionnel financier",
      "CRM - suivi commercial",
      "Guide de la facturation électronique",
      "Guide des obligations fiscales, sociales et comptables",
    ]);
    expect(SYSTEM_RESOURCES.map(({ rank }) => rank)).toEqual([1, 2, 3, 4, 5]);
    expect(JSON.stringify(SYSTEM_RESOURCES)).not.toMatch(
      /docs\.google\.com|airtable\.com|downloads\/guides|Levier/,
    );
  });

  it("keeps destinations server-only and ties delivery to an immutable revision", () => {
    for (const resource of SYSTEM_RESOURCES.slice(1)) {
      const snapshot = getSystemResourceAssetSnapshot(resource.resourceSlug);
      expect(snapshot).toMatchObject({
        resourceId: resource.resourceSlug,
        workbookVersion: "1.0.0",
      });
      expect(snapshot?.assetRevision).toContain(resource.resourceSlug);
      expect(resolveSystemResourceDelivery(snapshot!)).toMatchObject({
        resourceSlug: resource.resourceSlug,
      });
    }
  });

  it("rejects unknown resources and mismatched revisions", () => {
    expect(getSystemResource("unknown")).toBeNull();
    expect(getSystemResourceAssetSnapshot("unknown")).toBeNull();
    expect(resolveSystemResourceDelivery({
      assetRevision: "wrong",
      resourceId: "crm-suivi-commercial",
      workbookVersion: "1.0.0",
    })).toBeNull();
  });
});
