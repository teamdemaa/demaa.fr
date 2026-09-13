import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  buildRepriseMarketplaceJsonLd,
  buildRepriseOpportunityJsonLd,
  getRepriseOpportunityDescription,
  getRepriseOpportunityPath,
  serializeRepriseJsonLd,
} from "@/lib/reprise-opportunity-seo";
import { repriseOpportunities } from "@/lib/reprise-opportunities";

describe("SEO des entreprises à reprendre", () => {
  it("gives every opportunity a stable page URL", () => {
    const paths = repriseOpportunities.map(getRepriseOpportunityPath);

    expect(paths).toHaveLength(38);
    expect(new Set(paths).size).toBe(38);
    expect(paths[0]).toBe(`/a-reprendre/${repriseOpportunities[0].id}`);
  });

  it("describes the marketplace as a collection of crawlable pages", () => {
    const jsonLd = buildRepriseMarketplaceJsonLd(repriseOpportunities);
    const itemList = jsonLd.find((item) => item["@type"] === "ItemList");

    expect(itemList).toMatchObject({
      numberOfItems: 38,
      itemListElement: expect.arrayContaining([
        expect.objectContaining({
          name: repriseOpportunities[0].activity,
          url: `https://demaa.fr/a-reprendre/${repriseOpportunities[0].id}`,
        }),
      ]),
    });
  });

  it("creates accurate metadata and structured data for a detail page", () => {
    const opportunity = repriseOpportunities[0];
    const description = getRepriseOpportunityDescription(opportunity);
    const jsonLd = buildRepriseOpportunityJsonLd(opportunity);
    const page = jsonLd.find((item) => item["@type"] === "WebPage");

    expect(description).toContain(opportunity.activity);
    expect(description).toContain(opportunity.location);
    expect(page).toMatchObject({
      datePublished: opportunity.publishedAt,
      url: `https://demaa.fr/a-reprendre/${opportunity.id}`,
    });
    expect(serializeRepriseJsonLd({ value: "</script>" })).not.toContain("</script>");
  });

  it("pre-renders detail pages and publishes them in the sitemap", async () => {
    const [detailPage, marketplacePage, sitemap] = await Promise.all([
      readFile(new URL("../src/app/(marketing)/a-reprendre/[slug]/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/(marketing)/a-reprendre/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/sitemap.ts", import.meta.url), "utf8"),
    ]);

    expect(detailPage).toContain("generateStaticParams");
    expect(detailPage).toContain("dynamicParams = false");
    expect(detailPage).toContain('headingLevel="h1"');
    expect(marketplacePage).toContain("buildRepriseMarketplaceJsonLd");
    expect(sitemap).toContain("repriseOpportunityEntries");
    expect(sitemap).toContain("getRepriseOpportunityPath(opportunity)");
  });
});
