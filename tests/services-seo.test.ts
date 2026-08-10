import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  generateMetadata,
  generateStaticParams,
} from "@/app/services/[slug]/page";
import { metadata as servicesIndexMetadata } from "@/app/services/page";
import { getCanonicalServiceBySlug } from "@/lib/canonical-service-catalog";
import {
  buildServicePageJsonLd,
  buildServicesIndexJsonLd,
  serializeServicesJsonLd,
} from "@/lib/services-seo";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("canonical Services SEO and redirects", () => {
  it("publishes only the four canonical detail routes", async () => {
    expect(generateStaticParams()).toEqual([
      { slug: "automatisation-processus" },
      { slug: "expert-comptable" },
      { slug: "marketing-vente" },
      { slug: "assistance-facturation" },
    ]);
    expect(servicesIndexMetadata.alternates).toEqual({ canonical: "/services" });
    await expect(generateMetadata({
      params: Promise.resolve({ slug: "ancienne-offre" }),
    })).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  });

  it("builds the canonical index breadcrumb", () => {
    expect(buildServicesIndexJsonLd()).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: "https://demaa.co" },
        { "@type": "ListItem", position: 2, name: "Services", item: "https://demaa.co/services" },
      ],
    });
  });

  it("emits direct Demaa offers without attributing third-party accounting fees to Demaa", () => {
    const automation = getCanonicalServiceBySlug("automatisation-processus");
    const marketing = getCanonicalServiceBySlug("marketing-vente");
    const billing = getCanonicalServiceBySlug("assistance-facturation");
    const expert = getCanonicalServiceBySlug("expert-comptable");
    if (!automation || !marketing || !billing || !expert) {
      throw new Error("missing canonical service fixture");
    }

    expect(buildServicePageJsonLd(automation)[1]).toMatchObject({
      offers: {
        price: "500.00",
        priceSpecification: {
          unitText: "DAY",
          valueAddedTaxIncluded: false,
        },
      },
    });

    expect(buildServicePageJsonLd(marketing)[1]).toMatchObject({
      "@type": "Service",
      name: "Marketing et prospection",
      provider: { "@type": "Organization", name: "Demaa" },
      offers: {
        "@type": "Offer",
        price: "950.00",
        priceCurrency: "EUR",
        priceSpecification: {
          valueAddedTaxIncluded: false,
          unitText: "MONTH",
        },
      },
    });
    expect(buildServicePageJsonLd(billing)[1]).toMatchObject({
      offers: {
        description: "20 heures incluses, puis 25 € HT par heure supplémentaire.",
        price: "500.00",
        priceSpecification: {
          unitText: "MONTH",
          valueAddedTaxIncluded: false,
        },
      },
    });
    expect(JSON.stringify(buildServicePageJsonLd(expert))).not.toContain('"@type":"Offer"');
  });

  it("escapes embedded JSON-LD", () => {
    expect(serializeServicesJsonLd({ value: "</script><script>" })).toBe(
      '{"value":"\\u003c/script>\\u003cscript>"}',
    );
  });

  it("owns canonical metadata and the relevant permanent redirects", async () => {
    const [detailSource, nextConfig, proxy, sitemap] = await Promise.all([
      readSource("src/app/services/[slug]/page.tsx"),
      readSource("next.config.ts"),
      readSource("src/proxy.ts"),
      readSource("src/app/sitemap.ts"),
    ]);

    expect(detailSource).toContain("alternates: { canonical }");
    expect(detailSource).toContain("url: canonical");
    expect(nextConfig).toContain("source: '/systeme-marketing'");
    expect(nextConfig).toContain("source: '/marketing-ethique'");
    expect(nextConfig).toContain("destination: '/services/marketing-vente'");
    expect(nextConfig).toContain("destination: '/services/expert-comptable'");
    expect(nextConfig).toContain("destination: '/services/assistance-facturation'");
    expect(proxy).not.toContain('"/services/"');
    expect(proxy).toContain('"/annuaire-services/"');
    expect(sitemap).toContain('`${base}/services/${service.slug}`');
    expect(sitemap).not.toContain('`${base}/annuaire-services/${service.slug}`');
  });
});
