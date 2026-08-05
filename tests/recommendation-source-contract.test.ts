import { describe, expect, it } from "vitest";

import {
  parseReviewMetadata,
  validateReviewMetadata,
} from "@/lib/recommendation-source-contract";

const completeReview = {
  evidence: [{
    evidenceId: "official-source",
    sourceRef: "https://example.com/source",
    claim: "La capacité a été vérifiée.",
    evidenceType: "official_product_page",
    capturedAt: "2026-07-30T10:00:00.000Z",
  }],
  reviewer: "editorial-owner",
  reviewedAt: "2026-07-30T12:00:00.000Z",
  expiresAt: "2026-10-30T12:00:00.000Z",
};

describe("recommendation source contract", () => {
  it("parses unknown input recursively and deep-freezes the result", () => {
    const parsed = parseReviewMetadata(completeReview);
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen(parsed.evidence)).toBe(true);
    expect(Object.isFrozen(parsed.evidence[0])).toBe(true);
    expect(() => {
      (parsed.evidence as unknown as { evidenceId: string }[])[0].evidenceId = "changed";
    }).toThrow();
  });

  it.each([
    null,
    "{not-json",
    {},
    { ...completeReview, evidence: "not-an-array" },
    { ...completeReview, evidence: [{ ...completeReview.evidence[0], evidenceType: "invented" }] },
    { ...completeReview, reviewedAt: "2026-07-30" },
  ])("returns a controlled error for malformed unknown payload %#", (payload) => {
    expect(() => validateReviewMetadata(payload, { requireComplete: true })).not.toThrow();
    expect(validateReviewMetadata(payload, { requireComplete: true }).length).toBeGreaterThan(0);
  });

  it("rejects future and inverted chronology", () => {
    const now = new Date("2026-08-01T12:00:00.000Z");
    const futureReview = {
      ...completeReview,
      evidence: [{ ...completeReview.evidence[0], capturedAt: "2026-08-03T10:00:00.000Z" }],
      reviewedAt: "2026-08-02T12:00:00.000Z",
      expiresAt: "2026-08-02T10:00:00.000Z",
    };
    const errors = validateReviewMetadata(futureReview, { requireComplete: true, now });
    expect(errors).toContain("official-source: capturedAt must not be in the future");
    expect(errors).toContain("official-source: capturedAt must not be after reviewedAt");
    expect(errors).toContain("reviewedAt must not be in the future");
    expect(errors).toContain("reviewedAt must be before expiresAt");
  });

  it("uses the injected real cutoff and expires drafts as well as published entries", () => {
    const expiredDraftReview = {
      ...completeReview,
      expiresAt: "2026-07-31T23:59:59.000Z",
    };
    expect(validateReviewMetadata(expiredDraftReview, {
      requireComplete: false,
      now: new Date("2026-08-01T00:00:00.000Z"),
    })).toContain("entry evidence is expired");
  });
});
