import { describe, expect, it } from "vitest";

import { buildTrainingPublicationStaging } from "@/lib/training-publication-staging";

describe("staging Process Formation", () => {
  const entries = buildTrainingPublicationStaging();

  it("reconnaît les trois systèmes synchronisés", () => {
    expect(entries).toHaveLength(3);
    expect(entries.every((entry) => entry.synchronized)).toBe(true);
    expect(entries.every((entry) => !entry.readyForHumanApproval)).toBe(true);
  });

  it.each(entries)("$name est complet, spécifique et sans placeholder", (entry) => {
    expect(entry.targetContentCount).toBe(74);
    expect(entry.explicitTradeDifferences).toBe(15);
    expect(entry.currentContentCount).toBe(74);
    expect(entry.currentPlaceholderCount).toBe(0);
    expect(entry.labelsAdded).toBe(0);
    expect(entry.labelsRemoved).toBe(0);
    expect(entry.auditErrors).toEqual([]);
    expect(Object.values(entry.targetTypeCounts).every((count) => count > 0)).toBe(
      true,
    );
    expect(entry.synchronized).toBe(true);
    expect(entry.readyForHumanApproval).toBe(false);
  });
});
