import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  generateMetadata,
  generateStaticParams,
} from "@/app/services/[slug]/page";
import { generateMetadata as generateServicesIndexMetadata } from "@/app/services/page";
import {
  buildServicePageJsonLd,
  buildServicesIndexJsonLd,
  serializeServicesJsonLd,
} from "@/lib/services-seo";
import { publishedServiceOffersFixture } from "./fixtures/published-service-offers";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("Services SEO and structured data", () => {
  it("keeps drafts and unknown slugs out of static params and metadata", async () => {
    expect(generateStaticParams()).toEqual([]);
    expect(() => generateServicesIndexMetadata()).toThrowError(
      expect.objectContaining({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" }),
    );
    await expect(generateMetadata({
      params: Promise.resolve({ slug: "site-vitrine-prise-contact" }),
    })).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  });

  it("builds the exact index breadcrumb from the canonical origin", () => {
    expect(buildServicesIndexJsonLd()).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Accueil",
          item: "https://demaa.fr",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Services",
          item: "https://demaa.fr/services",
        },
      ],
    });
  });

  it("emits BreadcrumbList and Service without Offer for quote pricing", () => {
    const jsonLd = buildServicePageJsonLd(publishedServiceOffersFixture[0]);

    expect(jsonLd).toHaveLength(2);
    expect(jsonLd[0]).toMatchObject({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { position: 1, name: "Accueil", item: "https://demaa.fr" },
        { position: 2, name: "Services", item: "https://demaa.fr/services" },
        {
          position: 3,
          name: "Système & automatisation commerciale",
          item: "https://demaa.fr/services/systeme-automatisation-commerciale",
        },
      ],
    });
    expect(jsonLd[1]).toEqual({
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Système & automatisation commerciale",
      description: "Structurer le suivi commercial et automatiser les tâches répétitives.",
      url: "https://demaa.fr/services/systeme-automatisation-commerciale",
      serviceType: "Structurer et digitaliser votre activité",
      provider: { "@type": "Organization", name: "Demaa" },
    });
    expect(JSON.stringify(jsonLd)).not.toContain('"@type":"Offer"');
  });

  it("emits Offer only for a complete published fixed-price DTO", () => {
    const jsonLd = buildServicePageJsonLd(publishedServiceOffersFixture[2]);

    expect(jsonLd[1]).toMatchObject({
      "@type": "Service",
      provider: { "@type": "Organization", name: "ODEMA" },
      offers: {
        "@type": "Offer",
        price: "950.00",
        priceCurrency: "EUR",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "950.00",
          priceCurrency: "EUR",
          valueAddedTaxIncluded: false,
        },
        url: "https://demaa.fr/services/site-vitrine-prise-contact",
      },
    });

    const incomplete = {
      ...publishedServiceOffersFixture[2],
      scope: { ...publishedServiceOffersFixture[2].scope, exclusions: [] },
    };
    expect(JSON.stringify(buildServicePageJsonLd(incomplete))).not.toContain(
      '"@type":"Offer"',
    );
  });

  it("escapes less-than characters before embedding JSON-LD", () => {
    expect(serializeServicesJsonLd({ value: "</script><script>" })).toBe(
      '{"value":"\\u003c/script>\\u003cscript>"}',
    );
  });

  it("keeps structured data behind published-only server selectors", async () => {
    const indexSource = await readSource("src/app/services/page.tsx");
    const detailSource = await readSource("src/app/services/[slug]/page.tsx");
    const seoSource = await readSource("src/lib/services-seo.ts");

    expect(indexSource).toContain("getPublishedServiceOffersV2");
    expect(indexSource.indexOf("if (offers.length === 0) notFound()"))
      .toBeLessThan(indexSource.indexOf("buildServicesIndexJsonLd()"));
    expect(detailSource).toContain("getPublishedServiceOfferV2BySlug");
    expect(detailSource).toContain("if (!offer) notFound()");
    expect(detailSource).toContain("export const dynamicParams = false");
    expect(detailSource).not.toMatch(/service-catalog-v2\.generated|parseServiceCatalogV2/);
    expect(seoSource).toContain('import "server-only"');
    expect(seoSource).not.toMatch(/status\s*===\s*["']draft["']/);
  });
});
