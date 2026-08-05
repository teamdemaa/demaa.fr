import { describe, expect, it } from "vitest";

import rawEnterpriseAnnuaire from "@/lib/enterprise-annuaire.json";
import demoAssets from "@/lib/operational-system-demo-assets.generated.json";
import { getOperationalSystemDemoUrl } from "@/lib/document-models";

const enterprises = (
  rawEnterpriseAnnuaire as { enterprises: Array<{ slug: string }> }
).enterprises;

describe("operational system demonstration mappings", () => {
  it("exposes one unique read-only demonstration for every system", () => {
    const publishedSlugs = Object.keys(demoAssets);
    const demoUrls = publishedSlugs.map((slug) => {
      const demoUrl = getOperationalSystemDemoUrl(slug);

      expect(demoUrl).toMatch(
        /^https:\/\/docs\.google\.com\/spreadsheets\/d\/[a-zA-Z0-9-_]+\/edit\?usp=sharing$/,
      );

      return demoUrl;
    });

    expect(publishedSlugs.toSorted()).toEqual(
      enterprises.map((enterprise) => enterprise.slug).toSorted(),
    );
    expect(new Set(demoUrls).size).toBe(publishedSlugs.length);
    expect(getOperationalSystemDemoUrl("systeme-inconnu")).toBeNull();
  });
});
