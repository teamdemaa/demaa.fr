import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  generateMetadata,
  generateStaticParams,
} from "@/app/(marketing)/services/[slug]/page";
import { metadata as servicesIndexMetadata } from "@/app/(marketing)/services/page";
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
  it("publishes eight generic detail routes and keeps Application on /sur-mesure", async () => {
    expect(generateStaticParams()).toEqual([
      { slug: "automatisation-processus" },
      { slug: "coach-business" },
      { slug: "expert-comptable" },
      { slug: "assistance-administrative" },
      { slug: "formalites-entreprise" },
      { slug: "gestion-reseaux-sociaux" },
      { slug: "publicite-en-ligne" },
      { slug: "prospection-ciblee" },
    ]);
    expect(servicesIndexMetadata.alternates).toEqual({ canonical: "/services" });
    await expect(generateMetadata({
      params: Promise.resolve({ slug: "ancienne-offre" }),
    })).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
    await expect(generateMetadata({
      params: Promise.resolve({ slug: "application-metier" }),
    })).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  });

  it("builds the canonical index breadcrumb", () => {
    expect(buildServicesIndexJsonLd()).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: "https://demaa.co" },
        { "@type": "ListItem", position: 2, name: "Accompagnement", item: "https://demaa.co/services" },
      ],
    });
  });

  it("emits direct Demaa offers without attributing third-party accounting fees to Demaa", () => {
    const automation = getCanonicalServiceBySlug("automatisation-processus");
    const advertising = getCanonicalServiceBySlug("publicite-en-ligne");
    const expert = getCanonicalServiceBySlug("expert-comptable");
    const formalities = getCanonicalServiceBySlug("formalites-entreprise");
    const application = getCanonicalServiceBySlug("application-metier");
    if (!automation || !advertising || !expert || !formalities || !application) {
      throw new Error("missing canonical service fixture");
    }

    expect(buildServicePageJsonLd(automation)[1]).toMatchObject({
      offers: [
        {
          name: "Automatisation essentielle",
          price: "1500.00",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "1500.00",
            priceCurrency: "EUR",
            valueAddedTaxIncluded: false,
          },
        },
        {
          name: "Automatisation avancée + IA",
          price: "3000.00",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: "3000.00",
            priceCurrency: "EUR",
            valueAddedTaxIncluded: false,
          },
        },
      ],
    });

    expect(buildServicePageJsonLd(application)[1]).toMatchObject({
      name: "Application métier",
      url: "https://demaa.co/sur-mesure",
      offers: [
        { name: "Application métier essentielle", price: "4500.00" },
        { name: "Application métier avancée", price: "7500.00" },
      ],
    });

    expect(buildServicePageJsonLd(advertising)[1]).toMatchObject({
      "@type": "Service",
      name: "Publicité en ligne",
      provider: { "@type": "Organization", name: "Demaa" },
      offers: {
        "@type": "Offer",
        price: "750.00",
        priceCurrency: "EUR",
      },
    });
    expect(JSON.stringify(buildServicePageJsonLd(expert))).not.toContain('"@type":"Offer"');
    expect(JSON.stringify(buildServicePageJsonLd(expert))).not.toContain('"provider":{"@type":"Organization","name":"Demaa"}');
    expect(JSON.stringify(buildServicePageJsonLd(formalities))).not.toContain('"@type":"Offer"');
    expect(JSON.stringify(buildServicePageJsonLd(formalities))).not.toContain('"provider":{"@type":"Organization","name":"Demaa"}');
  });

  it("escapes embedded JSON-LD", () => {
    expect(serializeServicesJsonLd({ value: "</script><script>" })).toBe(
      '{"value":"\\u003c/script>\\u003cscript>"}',
    );
  });

  it("owns canonical metadata and the relevant permanent redirects", async () => {
    const [detailSource, nextConfig, proxy, sitemap] = await Promise.all([
      readSource("src/app/(marketing)/services/[slug]/page.tsx"),
      readSource("next.config.ts"),
      readSource("src/proxy.ts"),
      readSource("src/app/sitemap.ts"),
    ]);

    expect(detailSource).toContain("alternates: { canonical }");
    expect(detailSource).toContain("url: canonical");
    expect(detailSource).toContain("if (!service || service.detailHref");
    expect(detailSource).not.toContain("dynamicParams = false");
    expect(nextConfig).toContain("source: '/systeme-marketing'");
    expect(nextConfig).toContain("source: '/marketing-ethique'");
    expect(nextConfig).toContain("destination: '/services/coach-business'");
    expect(nextConfig).toContain("destination: '/services/expert-comptable'");
    expect(getCanonicalServiceBySlug("assistance-administrative")?.detailHref).toBe("/services/assistance-administrative");
    expect(proxy).not.toContain('"/services/"');
    expect(proxy).toContain('"/annuaire-services/"');
    expect(sitemap).toContain('`${base}${service.detailHref}`');
    expect(sitemap).toContain('service.detailHref.startsWith("/services/")');
    expect(sitemap).not.toContain('`${base}/annuaire-services/${service.slug}`');
  });
});
