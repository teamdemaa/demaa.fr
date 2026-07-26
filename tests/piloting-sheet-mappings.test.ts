import { describe, expect, it } from "vitest";

import rawEnterpriseAnnuaire from "@/lib/enterprise-annuaire.json";
import {
  getOperationalSystemDemoUrl,
  getPilotingSheetCopyUrl,
  getPilotingSheetSlugs,
} from "@/lib/document-models";

type EnterpriseSummary = {
  slug: string;
};

const enterprises = (
  rawEnterpriseAnnuaire as { enterprises: EnterpriseSummary[] }
).enterprises;

function extractGoogleSheetId(url: string): string | null {
  return url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] ?? null;
}

describe("piloting sheet mappings", () => {
  it("maps every legacy free kit to one unique Google Sheet copy URL", () => {
    const paidSystemSlugs = new Set([
      "plomberie-chauffage",
      "agence-marketing",
      "restaurant",
      "pharmacie",
      "creche",
    ]);
    const enterpriseSlugs = enterprises
      .map((enterprise) => enterprise.slug)
      .filter((slug) => !paidSystemSlugs.has(slug));
    const mappedSlugs = getPilotingSheetSlugs();

    expect(enterpriseSlugs).toHaveLength(110);
    expect(new Set(enterpriseSlugs).size).toBe(enterpriseSlugs.length);
    expect(mappedSlugs.toSorted()).toEqual(enterpriseSlugs.toSorted());

    const copyUrls = enterpriseSlugs.map((slug) => {
      const copyUrl = getPilotingSheetCopyUrl(slug);

      expect(copyUrl, `${slug} doit avoir un Google Sheet`).not.toBeNull();
      expect(copyUrl, `${slug} doit ouvrir une copie`).toMatch(
        /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+\/copy$/,
      );

      return copyUrl as string;
    });
    const sheetIds = copyUrls.map(extractGoogleSheetId);

    expect(sheetIds.every(Boolean)).toBe(true);
    expect(new Set(sheetIds).size).toBe(sheetIds.length);
  });

  it("returns null for an unknown kit", () => {
    expect(getPilotingSheetCopyUrl("kit-inconnu")).toBeNull();
  });

  it("exposes one read-only demonstration for every published paid system", () => {
    const publishedSlugs = [
      "plomberie-chauffage",
      "agence-marketing",
      "restaurant",
      "pharmacie",
      "creche",
    ];
    const demoUrls = publishedSlugs.map((slug) => {
      const demoUrl = getOperationalSystemDemoUrl(slug);

      expect(demoUrl).toMatch(
        /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+\/edit\?usp=sharing$/,
      );

      return demoUrl;
    });

    expect(new Set(demoUrls).size).toBe(publishedSlugs.length);
    for (const slug of publishedSlugs) {
      expect(getPilotingSheetCopyUrl(slug)).toBeNull();
    }
  });

  it("does not claim a demonstration for an unpublished system", () => {
    expect(getOperationalSystemDemoUrl("electricite-generale")).toBeNull();
  });
});
