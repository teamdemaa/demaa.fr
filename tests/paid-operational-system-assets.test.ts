import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getPaidOperationalSystemCopyUrl,
  hasPaidOperationalSystemAsset,
} from "@/lib/paid-operational-system-assets.server";
import paidAssets from "@/lib/paid-operational-system-assets.generated.server.json";

describe("paid operational system assets", () => {
  it("keeps every published sold workbook in the server-only registry", () => {
    const publishedSlugs = Object.keys(paidAssets);
    const copyUrls = publishedSlugs.map((slug) => {
      expect(hasPaidOperationalSystemAsset(slug)).toBe(true);
      const copyUrl = getPaidOperationalSystemCopyUrl(slug);

      expect(copyUrl).toMatch(
        /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+\/copy$/,
      );

      return copyUrl;
    });

    expect(new Set(copyUrls).size).toBe(publishedSlugs.length);
  });

  it("does not resolve an unknown system", () => {
    expect(hasPaidOperationalSystemAsset("inconnu")).toBe(false);
    expect(getPaidOperationalSystemCopyUrl("inconnu")).toBeNull();
  });
});
