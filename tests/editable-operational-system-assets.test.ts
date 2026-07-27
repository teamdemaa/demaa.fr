import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getEditableOperationalSystemCopyUrl,
  hasEditableOperationalSystemAsset,
} from "@/lib/editable-operational-system-assets.server";
import editableAssets from "@/lib/editable-operational-system-assets.generated.server.json";

describe("editable operational system assets", () => {
  it("keeps every published editable workbook in the server-only registry", () => {
    const publishedSlugs = Object.keys(editableAssets);
    const copyUrls = publishedSlugs.map((slug) => {
      expect(hasEditableOperationalSystemAsset(slug)).toBe(true);
      const copyUrl = getEditableOperationalSystemCopyUrl(slug);

      expect(copyUrl).toMatch(
        /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+\/copy$/,
      );

      return copyUrl;
    });

    expect(new Set(copyUrls).size).toBe(publishedSlugs.length);
  });

  it("does not resolve an unknown system", () => {
    expect(hasEditableOperationalSystemAsset("inconnu")).toBe(false);
    expect(getEditableOperationalSystemCopyUrl("inconnu")).toBeNull();
  });
});
