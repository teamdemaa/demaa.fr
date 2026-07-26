import { describe, expect, it } from "vitest";

import { buildCommercePublicationStaging } from "@/lib/commerce-publication-staging";

describe("staging Process Commerce", () => {
  const entries = buildCommercePublicationStaging();

  it("reconnaît les sept systèmes synchronisés", () => {
    expect(entries).toHaveLength(7);
    expect(entries.every((entry) => entry.synchronized)).toBe(true);
    expect(entries.every((entry) => !entry.readyForHumanApproval)).toBe(true);
  });

  it.each(entries)("$name est complet avant publication", (entry) => {
    expect(entry.targetProcessCount).toBe(17);
    expect(entry.targetContentCount).toBe(74);
    expect(entry.explicitTradeDifferences).toBe(12);
    expect(entry.currentContentCount).toBe(74);
    expect(entry.currentPlaceholderCount).toBe(0);
    expect(entry.labelsAdded).toBe(0);
    expect(entry.labelsRemoved).toBe(0);
    expect(entry.auditErrors).toEqual([]);
    expect(entry.synchronized).toBe(true);
  });
});
