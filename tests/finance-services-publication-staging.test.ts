import { describe, expect, it } from "vitest";

import { buildFinanceServicesPublicationStaging } from "@/lib/finance-services-publication-staging";

describe("staging Process Services finance et assurance", () => {
  const entries = buildFinanceServicesPublicationStaging();

  it("reconnaît les quatre systèmes synchronisés", () => {
    expect(entries).toHaveLength(4);
    expect(entries.every((entry) => entry.synchronized)).toBe(true);
    expect(entries.every((entry) => !entry.readyForHumanApproval)).toBe(true);
  });

  it.each(entries)("$name est complet après publication", (entry) => {
    expect(entry.targetProcessCount).toBe(19);
    expect(entry.targetContentCount).toBe(74);
    expect(entry.explicitTradeDifferences).toBe(16);
    expect(entry.currentContentCount).toBe(74);
    expect(entry.currentPlaceholderCount).toBe(0);
    expect(entry.distinctiveTradeContentCount).toBeGreaterThanOrEqual(10);
    expect(entry.labelsAdded).toBe(0);
    expect(entry.labelsRemoved).toBe(0);
    expect(entry.auditErrors).toEqual([]);
    expect(entry.synchronized).toBe(true);
    expect(entry.readyForHumanApproval).toBe(false);
    expect(Object.values(entry.targetTypeCounts).every((count) => count > 0)).toBe(
      true,
    );
  });
});
