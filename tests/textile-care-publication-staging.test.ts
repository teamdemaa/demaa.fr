import { describe, expect, it } from "vitest";

import { buildTextileCarePublicationStaging } from "@/lib/textile-care-publication-staging";

describe("staging Process Entretien textile", () => {
  const entries = buildTextileCarePublicationStaging();

  it("prépare les deux systèmes séparément", () => {
    expect(entries).toHaveLength(2);
    expect(entries.every((entry) => entry.synchronized)).toBe(true);
    expect(entries.every((entry) => !entry.readyForHumanApproval)).toBe(true);
  });

  it.each(entries)("$name est synchronisé avec le référentiel", (entry) => {
    expect(entry.targetProcessCount).toBeGreaterThanOrEqual(11);
    expect(entry.targetContentCount).toBe(74);
    expect(entry.currentContentCount).toBe(74);
    expect(entry.currentPlaceholderCount).toBe(0);
    expect(entry.distinctiveTradeContentCount).toBeGreaterThanOrEqual(12);
    expect(entry.crossTradeDuplicateCount).toBe(0);
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
