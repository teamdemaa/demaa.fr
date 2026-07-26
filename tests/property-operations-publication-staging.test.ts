import { describe, expect, it } from "vitest";

import { buildPropertyOperationsPublicationStaging } from "@/lib/property-operations-publication-staging";

describe("staging Process Immobilier", () => {
  const entries = buildPropertyOperationsPublicationStaging();

  it("reconnaît les trois systèmes synchronisés", () => {
    expect(entries).toHaveLength(3);
    expect(entries.every((entry) => entry.synchronized)).toBe(true);
    expect(entries.every((entry) => !entry.readyForHumanApproval)).toBe(true);
  });

  it.each(entries)("$name est complet avant publication", (entry) => {
    expect(entry.targetProcessCount).toBe(12);
    expect(entry.targetContentCount).toBe(74);
    expect(entry.explicitTradeDifferences).toBe(15);
    expect(entry.currentContentCount).toBe(74);
    expect(entry.currentPlaceholderCount).toBe(0);
    expect(entry.labelsAdded).toBe(0);
    expect(entry.labelsRemoved).toBe(0);
    expect(entry.auditErrors).toEqual([]);
    expect(entry.synchronized).toBe(true);
    expect(entry.readyForHumanApproval).toBe(false);
  });
});
