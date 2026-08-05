import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/Navbar", () => ({
  default: () => createElement("nav", { "aria-label": "Navigation principale" }),
}));

vi.mock("@/components/OrganisationSessionBookingButton", () => ({
  default: (props: Record<string, unknown>) => createElement(
    "button",
    { type: "button", "data-source": props.source },
    String(props.label),
  ),
}));

import SurMesurePage, { metadata } from "@/app/sur-mesure/page";
import { surMesurePageContent as content } from "@/lib/sur-mesure-page-content";

describe("Sur mesure commercial page", () => {
  it("publishes the canonical metadata without an invented price or offer", () => {
    expect(metadata).toMatchObject({
      title: "Sur mesure pour simplifier vos processus | Demaa",
      alternates: { canonical: "/sur-mesure" },
      openGraph: { url: "/sur-mesure", type: "website" },
    });
    expect(JSON.stringify(metadata)).not.toMatch(/price|offer|€|TJM/);
  });

  it("renders a short complete journey with one accessible final booking action", () => {
    const markup = renderToStaticMarkup(createElement(SurMesurePage));

    expect(markup).toContain("<h1");
    expect(markup).toContain(content.title);
    expect(markup).toContain(content.criticalProcess.title);
    expect(content.method.steps.map(({ title }) => title)).toEqual([
      "Comprendre",
      "Simplifier",
      "Définir",
      "Préparer",
    ]);
    expect(markup).toContain(content.results.title);
    expect(markup).toContain(content.commercialModel.title);
    expect(markup).toContain(content.exclusions.title);
    expect(markup).toContain(content.audience.title);
    expect(markup).toContain(content.faq.title);
    expect(markup.match(/<details/g)).toHaveLength(4);
    expect(markup.match(/Parler de votre situation/g)).toHaveLength(1);
    expect(markup).toContain('data-source="Page sur mesure"');
    expect(markup).toContain('aria-label="Navigation principale"');
    expect(markup).not.toMatch(/deux ateliers|outil web métier|marketplace|partenariat/i);
    expect(markup).not.toMatch(/\d[\d\s]*(?:€|euros?)/i);
    expect(markup).not.toContain('type="application/ld+json"');
  });

  it("keeps attribution, the sitemap and the former permanent redirect aligned", async () => {
    const [pageSource, buttonSource, sitemapSource, nextConfigSource] = await Promise.all([
      readFile(new URL("../src/app/sur-mesure/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/OrganisationSessionBookingButton.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/sitemap.ts", import.meta.url), "utf8"),
      readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    ]);

    expect(pageSource).toContain("<OrganisationSessionBookingButton");
    expect(pageSource).toContain('source="Page sur mesure"');
    expect(pageSource).not.toContain("sourceIsAuthoritative");
    expect(buttonSource).toContain('searchParams.get("source") || source');
    expect(buttonSource).toContain("getFilloutAttributionParameters");
    expect(buttonSource).toContain('searchParams.get("systemSlug")');
    expect(sitemapSource).toContain("`${base}/sur-mesure`");
    expect(sitemapSource).not.toContain("`${base}/accompagnement`");
    expect(nextConfigSource).toContain("source: '/accompagnement'");
    expect(nextConfigSource).toContain("destination: '/sur-mesure'");
  });
});
