import { describe, expect, it } from "vitest";

import rawEnterpriseAnnuaire from "@/lib/enterprise-annuaire.json";
import {
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
  it("maps every operational kit to one unique Google Sheet copy URL", () => {
    const enterpriseSlugs = enterprises.map((enterprise) => enterprise.slug);
    const mappedSlugs = getPilotingSheetSlugs();

    expect(enterpriseSlugs).toHaveLength(115);
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
});
