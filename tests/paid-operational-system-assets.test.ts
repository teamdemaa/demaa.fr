import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getPaidOperationalSystemCopyUrl,
  hasPaidOperationalSystemAsset,
} from "@/lib/paid-operational-system-assets.server";

describe("paid operational system assets", () => {
  it("keeps every published sold workbook in the server-only registry", () => {
    const publishedSlugs = [
      "plomberie-chauffage",
      "agence-marketing",
      "restaurant",
      "pharmacie",
      "creche",
    ];
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
