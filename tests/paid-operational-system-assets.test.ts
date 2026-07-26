import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getPaidOperationalSystemCopyUrl,
  hasPaidOperationalSystemAsset,
} from "@/lib/paid-operational-system-assets.server";

describe("paid operational system assets", () => {
  it("keeps the sold Plomberie workbook in the server-only registry", () => {
    expect(hasPaidOperationalSystemAsset("plomberie-chauffage")).toBe(true);
    expect(getPaidOperationalSystemCopyUrl("plomberie-chauffage")).toMatch(
      /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+\/copy$/,
    );
  });

  it("does not resolve an unknown system", () => {
    expect(hasPaidOperationalSystemAsset("inconnu")).toBe(false);
    expect(getPaidOperationalSystemCopyUrl("inconnu")).toBeNull();
  });
});
