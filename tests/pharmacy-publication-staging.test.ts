import { describe, expect, it } from "vitest";

import { buildPharmacyPublicationStaging } from "@/lib/pharmacy-publication-staging";

describe("staging Process Pharmacie", () => {
  const entry = buildPharmacyPublicationStaging();

  it("confirme la synchronisation du système", () => {
    expect(entry.slug).toBe("pharmacie");
    expect(entry.currentContentCount).toBe(74);
    expect(entry.currentPlaceholderCount).toBe(0);
    expect(entry.targetProcessCount).toBe(12);
    expect(entry.targetContentCount).toBe(74);
    expect(entry.distinctiveContentCount).toBeGreaterThanOrEqual(20);
    expect(entry.labelsAdded).toBe(0);
    expect(entry.labelsRemoved).toBe(0);
    expect(entry.auditErrors).toEqual([]);
    expect(entry.synchronized).toBe(true);
    expect(entry.readyForHumanApproval).toBe(false);
  });

  it("couvre les quatre types de contenu", () => {
    expect(Object.values(entry.targetTypeCounts).every((count) => count > 0)).toBe(
      true,
    );
  });
});
