import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  buildOpportunitiesJsonLd,
  serializeOpportunitiesJsonLd,
} from "@/lib/opportunities-seo";
import type { PublicOpportunity } from "@/lib/opportunity-contract";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

const opportunity: PublicOpportunity = {
  cadence: null,
  category: "Beauté et coiffure",
  companyName: null,
  compensation: null,
  createdAt: "2026-08-23T00:00:00.000Z",
  domainLabel: "Fonds de commerce",
  expertiseId: null,
  expiresAt: "2026-09-16T23:59:59.999Z",
  expectations: [],
  geography: "Le Teich (33470)",
  ingestionMode: "external_discovery",
  opportunityId: "salon-de-beaute-a-reprendre-au-teich-20dfcd",
  opportunityType: "reprise-transmission",
  publishedAt: "2026-08-23T00:00:00.000Z",
  sourceKind: "administrateur judiciaire",
  sourceName: "Actify — SELARL EKIP’",
  sourcePublishedAt: "2026-08-21T00:00:00.000Z",
  sourceRemovedAt: null,
  sourceUrl: "https://actify.fr/entreprises-liquidation-judiciaire/50784_fonds-de-commerce/",
  startTiming: null,
  status: "open",
  summary: "Fonds de commerce d’un salon de beauté à reprendre au Teich, en Gironde.",
  title: "Salon de beauté à reprendre au Teich",
  verifiedAt: "2026-08-23T00:00:00.000Z",
  workMode: null,
};

describe("Annonces SEO structured data", () => {
  it("builds a collection page, item list and breadcrumb for the index", () => {
    const jsonLd = buildOpportunitiesJsonLd([opportunity]);
    expect(jsonLd).toEqual([
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Annonces | Demaa",
        description: "Découvrez les annonces actuellement disponibles.",
        url: "https://demaa.fr/opportunites",
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Annonces",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Salon de beauté à reprendre au Teich",
            url: "https://demaa.fr/opportunites?opportunity=salon-de-beaute-a-reprendre-au-teich-20dfcd",
          },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://demaa.fr" },
          { "@type": "ListItem", position: 2, name: "Annonces", item: "https://demaa.fr/opportunites" },
        ],
      },
    ]);
  });

  it("produces an empty item list without publishing anything when there are no open announcements", () => {
    const jsonLd = buildOpportunitiesJsonLd([]);
    expect(jsonLd[1]).toMatchObject({ "@type": "ItemList", itemListElement: [] });
  });

  it("escapes embedded JSON-LD", () => {
    expect(serializeOpportunitiesJsonLd({ value: "</script><script>" })).toBe(
      '{"value":"\\u003c/script>\\u003cscript>"}',
    );
  });

  it("wires the structured data into the public Annonces page", async () => {
    const source = await readSource("src/app/(marketing)/opportunites/page.tsx");
    expect(source).toContain("application/ld+json");
    expect(source).toContain("buildOpportunitiesJsonLd(opportunities)");
  });
});
