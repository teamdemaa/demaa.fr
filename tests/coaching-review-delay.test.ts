import { describe, expect, it } from "vitest";

import {
  COACHING_REVIEW_DELAY_MS,
  isCoachingReviewOverdue,
} from "@/lib/coaching-conversation";

describe("coaching review reminder", () => {
  const now = Date.parse("2026-08-15T12:00:00.000Z");

  it("flags an open clarification only after thirty days", () => {
    expect(isCoachingReviewOverdue(
      new Date(now - COACHING_REVIEW_DELAY_MS).toISOString(),
      now,
    )).toBe(true);
    expect(isCoachingReviewOverdue(
      new Date(now - COACHING_REVIEW_DELAY_MS + 1).toISOString(),
      now,
    )).toBe(false);
  });

  it("ignores missing and malformed dates", () => {
    expect(isCoachingReviewOverdue(null, now)).toBe(false);
    expect(isCoachingReviewOverdue("not-a-date", now)).toBe(false);
  });
});
