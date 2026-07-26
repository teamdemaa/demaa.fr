import { describe, expect, it } from "vitest";

import demoAssets from "@/lib/operational-system-demo-assets.generated.json";
import paidAssets from "@/lib/paid-operational-system-assets.generated.server.json";

function extractSheetId(url: string) {
  return url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit$/)?.[1] ?? null;
}

describe("operational system asset manifests", () => {
  it("keeps one distinct demo and sold workbook for every published system", () => {
    const demoEntries = Object.entries(demoAssets);
    const paidEntries = Object.entries(paidAssets);

    expect(Object.keys(paidAssets).toSorted()).toEqual(
      Object.keys(demoAssets).toSorted(),
    );

    const demoIds = demoEntries.map(([, url]) => extractSheetId(url));
    const paidIds = paidEntries.map(([, url]) => extractSheetId(url));

    expect(demoIds.every(Boolean)).toBe(true);
    expect(paidIds.every(Boolean)).toBe(true);
    expect(new Set(demoIds).size).toBe(demoEntries.length);
    expect(new Set(paidIds).size).toBe(paidEntries.length);

    for (const [slug, demoUrl] of demoEntries) {
      expect(extractSheetId(demoUrl)).not.toBe(
        extractSheetId(paidAssets[slug as keyof typeof paidAssets]),
      );
    }
  });
});
