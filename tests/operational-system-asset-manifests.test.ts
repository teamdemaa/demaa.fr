import { describe, expect, it } from "vitest";

import demoAssets from "@/lib/operational-system-demo-assets.generated.json";
import editableAssets from "@/lib/editable-operational-system-assets.generated.server.json";

function extractSheetId(url: string) {
  return url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/edit$/)?.[1] ?? null;
}

describe("operational system asset manifests", () => {
  it("keeps one distinct demo and editable workbook for every published system", () => {
    const demoEntries = Object.entries(demoAssets);
    const editableEntries = Object.entries(editableAssets);

    expect(Object.keys(editableAssets).toSorted()).toEqual(
      Object.keys(demoAssets).toSorted(),
    );

    const demoIds = demoEntries.map(([, url]) => extractSheetId(url));
    const editableIds = editableEntries.map(([, url]) => extractSheetId(url));

    expect(demoIds.every(Boolean)).toBe(true);
    expect(editableIds.every(Boolean)).toBe(true);
    expect(new Set(demoIds).size).toBe(demoEntries.length);
    expect(new Set(editableIds).size).toBe(editableEntries.length);

    for (const [slug, demoUrl] of demoEntries) {
      expect(extractSheetId(demoUrl)).not.toBe(
        extractSheetId(editableAssets[slug as keyof typeof editableAssets]),
      );
    }
  });
});
