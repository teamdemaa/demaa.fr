import { describe, expect, it } from "vitest";
import { buildRealEstateExpertisePublicationStaging } from "@/lib/real-estate-expertise-publication-staging";
describe("staging Process Immobilier expertise", () => {
  const entries = buildRealEstateExpertisePublicationStaging();
  it("reconnaît trois systèmes synchronisés", () => {
    expect(entries).toHaveLength(3);
    expect(entries.every((x) => x.synchronized && !x.readyForHumanApproval)).toBe(true);
  });
  it.each(entries)("$name est complet", (entry) => {
    expect(entry.targetProcessCount).toBe(14);
    expect(entry.targetContentCount).toBe(74);
    expect(entry.explicitTradeDifferences).toBe(16);
    expect(entry.currentContentCount).toBe(74);
    expect(entry.currentPlaceholderCount).toBe(0);
    expect(entry.distinctiveTradeContentCount).toBeGreaterThanOrEqual(10);
    expect(entry.auditErrors).toEqual([]);
    expect(entry.labelsAdded).toBe(0);
    expect(entry.labelsRemoved).toBe(0);
    expect(Object.values(entry.targetTypeCounts).every((n) => n > 0)).toBe(true);
  });
});
