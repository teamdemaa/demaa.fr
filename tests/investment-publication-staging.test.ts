import { describe, expect, it } from "vitest";

import { buildInvestmentPublicationStaging } from "@/lib/investment-publication-staging";

describe("staging Process Investissement", () => {
  const entries = buildInvestmentPublicationStaging();

  it("reconnaît les deux systèmes synchronisés sans les confondre", () => {
    expect(entries).toHaveLength(2);
    expect(entries.every((entry) => entry.synchronized)).toBe(true);
    expect(entries.every((entry) => !entry.readyForHumanApproval)).toBe(true);
  });

  it.each(entries)("$name est complet après publication", (entry) => {
    expect(entry.targetProcessCount).toBe(12);
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
