import { describe, expect, it } from "vitest";

import { getFreshToolPricingNote, getToolDirectoryItemBySlug } from "@/lib/tool-directory";

describe("tool pricing freshness", () => {
  it("keeps the verified Mailchimp claim only inside its freshness window", () => {
    const mailchimp = getToolDirectoryItemBySlug("mailchimp");
    expect(mailchimp).not.toBeNull();
    expect(getFreshToolPricingNote(
      mailchimp!,
      new Date("2026-08-05T12:00:00.000Z"),
    )).toContain("250 contacts");
    expect(getFreshToolPricingNote(
      mailchimp!,
      new Date("2026-09-05T00:00:00.000Z"),
    )).toBeNull();
  });

  it("fails closed for incomplete, future or invalid price metadata", () => {
    expect(getFreshToolPricingNote({ pricingNoteVerified: "19 €" })).toBeNull();
    expect(getFreshToolPricingNote({
      pricingNoteVerified: "19 €",
      pricingCapturedAt: "2026-09-06T00:00:00.000Z",
      pricingExpiresAt: "2026-10-06T00:00:00.000Z",
    }, new Date("2026-09-05T00:00:00.000Z"))).toBeNull();
    expect(getFreshToolPricingNote({
      pricingNoteVerified: "19 €",
      pricingCapturedAt: "invalid",
      pricingExpiresAt: "2026-10-06T00:00:00.000Z",
    })).toBeNull();
  });
});
