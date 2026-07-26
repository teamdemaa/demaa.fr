import { describe, expect, it } from "vitest";

import { buildFastFoodPublicationStaging } from "@/lib/fast-food-publication-staging";

describe("staging Process Fast Food", () => {
  const entries = buildFastFoodPublicationStaging();

  it("reconnaît les sept systèmes synchronisés", () => {
    expect(entries).toHaveLength(7);
    expect(entries.every((entry) => entry.synchronized)).toBe(true);
    expect(entries.every((entry) => !entry.readyForHumanApproval)).toBe(true);
  });

  it.each(entries)("$name est complet avant publication", (entry) => {
    expect(entry.targetProcessCount).toBe(20);
    expect(entry.targetContentCount).toBe(74);
    expect(entry.explicitTradeDifferences).toBe(14);
    expect(entry.currentContentCount).toBe(74);
    expect(entry.currentPlaceholderCount).toBe(0);
    expect(entry.labelsAdded).toBe(0);
    expect(entry.labelsRemoved).toBe(0);
    expect(entry.auditErrors).toEqual([]);
    expect(entry.synchronized).toBe(true);
    expect(entry.readyForHumanApproval).toBe(false);
  });
});
