import { describe, expect, it } from "vitest";

import { buildAutoSchoolPublicationStaging } from "@/lib/auto-school-publication-staging";

describe("staging Process Auto-école", () => {
  const entry = buildAutoSchoolPublicationStaging();

  it("reconnaît le système synchronisé", () => {
    expect(entry.slug).toBe("auto-ecole");
    expect(entry.synchronized).toBe(true);
    expect(entry.readyForHumanApproval).toBe(false);
  });

  it("est complet, spécifique et sans placeholder", () => {
    expect(entry.targetProcessCount).toBe(17);
    expect(entry.targetContentCount).toBe(74);
    expect(entry.currentContentCount).toBe(74);
    expect(entry.currentPlaceholderCount).toBe(0);
    expect(entry.distinctiveTradeContentCount).toBeGreaterThanOrEqual(15);
    expect(entry.labelsAdded).toBe(0);
    expect(entry.labelsRemoved).toBe(0);
    expect(entry.auditErrors).toEqual([]);
    expect(Object.values(entry.targetTypeCounts).every((count) => count > 0)).toBe(
      true,
    );
  });
});
