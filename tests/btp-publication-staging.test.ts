import { describe, expect, it } from "vitest";

import { buildBtpPublicationStaging } from "@/lib/btp-publication-staging";
import { operationalContentTypes } from "@/lib/process-industrialization";

describe("BTP publication staging", () => {
  const staging = buildBtpPublicationStaging();

  it("prépare exactement les douze métiers BTP hors pilote", () => {
    expect(staging).toHaveLength(12);
    expect(new Set(staging.map((entry) => entry.slug)).size).toBe(12);
  });

  it.each(staging)(
    "classe correctement l’état de publication de $name",
    (entry) => {
      expect(entry.reviewState).toBe("internal_review_complete");
      expect(entry.targetProcessCount).toBe(18);
      expect(entry.targetContentCount).toBe(74);
      expect(entry.explicitTradeDifferences).toBeGreaterThanOrEqual(19);
      expect(entry.auditErrors).toEqual([]);
      expect(entry.currentContentCount).toBeGreaterThan(0);
      expect(
        entry.synchronized || entry.readyForHumanApproval,
      ).toBe(true);
      expect(Object.keys(entry.targetTypeCounts).sort()).toEqual(
        [...operationalContentTypes].sort(),
      );
    },
  );

  it("reconnaît toute la famille BTP déjà synchronisée", () => {
    const synchronizedSlugs = staging
      .filter((entry) => entry.synchronized)
      .map((entry) => entry.slug)
      .sort();

    expect(synchronizedSlugs).toEqual([
      "batiment",
      "carreleur",
      "climatisation",
      "couvreur",
      "electricite-generale",
      "maconnerie-gros-oeuvre",
      "menuiserie-agencement",
      "paysagiste",
      "peintre-en-batiment",
      "pisciniste",
      "renovation-interieur",
      "serrurier",
    ]);

    for (const entry of staging.filter((item) => item.synchronized)) {
      expect(entry.currentContentCount).toBe(74);
      expect(entry.currentPlaceholderCount).toBe(0);
      expect(entry.labelsAdded).toBe(0);
      expect(entry.labelsRemoved).toBe(0);
      expect(entry.readyForHumanApproval).toBe(false);
    }
  });
});
