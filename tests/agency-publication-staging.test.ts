import { describe, expect, it } from "vitest";

import { buildAgencyPublicationStaging } from "@/lib/agency-publication-staging";

describe("staging de publication des agences digitales", () => {
  const staging = buildAgencyPublicationStaging();

  it("reconnaît toute la famille comme synchronisée", () => {
    const synchronizedSlugs = staging
      .filter((entry) => entry.synchronized)
      .map((entry) => entry.slug)
      .sort();
    expect(staging).toHaveLength(8);
    expect(synchronizedSlugs).toEqual([
      "agence-acquisition-paid-ads",
      "agence-marketing",
      "agence-seo",
      "agence-web",
      "creation-de-contenu",
      "media",
      "photographe-videaste",
      "studio-branding-design",
    ]);
    expect(
      staging.filter((entry) => entry.readyForHumanApproval),
    ).toHaveLength(0);
  });

  it.each(staging)("$name possède une cible complète", (entry) => {
    expect(entry.reviewState).toBe("internal_review_complete");
    expect(entry.targetProcessCount).toBe(19);
    expect(entry.targetContentCount).toBe(74);
    expect(entry.explicitTradeDifferences).toBe(14);
    expect(entry.auditErrors).toEqual([]);

    expect(entry.synchronized).toBe(true);
    expect(entry.currentContentCount).toBe(74);
    expect(entry.currentPlaceholderCount).toBe(0);
    expect(entry.labelsAdded).toBe(0);
    expect(entry.labelsRemoved).toBe(0);
    expect(entry.readyForHumanApproval).toBe(false);
  });
});
