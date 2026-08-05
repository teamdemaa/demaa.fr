import { describe, expect, it } from "vitest";

import rawEnterpriseAnnuaire from "@/lib/enterprise-annuaire.json";
import demoAssets from "@/lib/operational-system-demo-assets.generated.json";

function extractSheetId(url: string) {
  return url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit/)?.[1] ?? null;
}

describe("operational system asset manifests", () => {
  it("keeps one unique read-only demonstration for every published system", () => {
    const enterpriseSlugs = (
      rawEnterpriseAnnuaire as { enterprises: Array<{ slug: string }> }
    ).enterprises.map((enterprise) => enterprise.slug);
    const demoEntries = Object.entries(demoAssets);
    const demoIds = demoEntries.map(([, url]) => extractSheetId(url));

    expect(Object.keys(demoAssets).toSorted()).toEqual(
      enterpriseSlugs.toSorted(),
    );
    expect(demoIds.every(Boolean)).toBe(true);
    expect(new Set(demoIds).size).toBe(demoEntries.length);
  });
});
