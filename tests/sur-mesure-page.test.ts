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
  it("publishes canonical metadata for the application offer", () => {
    expect(metadata).toMatchObject({
      title: "Application métier sur mesure | Demaa",
      alternates: { canonical: "/sur-mesure" },
      openGraph: { url: "/sur-mesure", type: "website" },
    });
  });

  it("renders the concise eight-section journey and both booking actions", () => {
    const markup = renderToStaticMarkup(createElement(SurMesurePage));

    expect(markup).toContain("<h1");
    expect(markup).toContain("Votre application métier, conçue autour de votre");
    expect(markup).toContain("façon de travailler.");
    expect(markup).toContain(content.hero.introduction);
    expect(markup).toContain(content.startingPoint.title);
    expect(markup).toContain(content.benefits.title);
    expect(markup).toContain(content.examples.title);
    expect(content.method.steps.map(({ title }) => title)).toEqual([
      "Vous nous montrez comment vous travaillez",
      "Nous dessinons une solution plus simple",
      "Vous validez la maquette",
      "Nous développons votre application",
    ]);
    expect(markup).toContain(content.commercialFrame.title);
    expect(markup).toContain(content.faq.title);
    expect(markup.match(/<section/g)).toHaveLength(9);
    expect(markup.match(/<details/g)).toHaveLength(4);
    expect(markup.match(/>Discutons de votre projet</g)).toHaveLength(2);
    expect(markup).toContain('data-source="Page sur mesure : Hero"');
    expect(markup).toContain('data-source="Page sur mesure : Final"');
    expect(markup).toContain('aria-label="Navigation principale"');
    expect(markup).not.toContain("Exemple d’interface");
    expect(markup).not.toMatch(/marketplace|partenariat|200 dirigeants|30 000 €|1 500 €/i);
    expect(markup).not.toContain('type="application/ld+json"');
  });

  it("contains only the explicitly approved price, support and guarantee copy", () => {
    expect(content.commercialFrame.pricing).toEqual({
      label: "Votre application métier",
      value: "2 500 €",
      tax: "HT",
      prefix: "À partir de",
      notes: ["Paiement unique", "Aucun abonnement obligatoire"],
    });
    expect(content.commercialFrame.included.items).toEqual([
      "Analyse de vos besoins",
      "Prototype fonctionnel",
      "Votre identité visuelle",
      "Vos fonctionnalités métier",
      "Automatisations essentielles",
      "Mise en ligne et formation",
      "30 jours de corrections après livraison",
    ]);
    expect(content.commercialFrame.support.map(({ price }) => price)).toEqual([
      "110 €/heure",
      "99 €/mois",
    ]);
    expect(content.commercialFrame.guarantees.map(({ title }) => title)).toEqual([
      "Hébergement sécurisé",
      "Conformité RGPD",
      "Application 100 % à vous",
      "Support réactif",
    ]);
  });

  it("keeps attribution, the sitemap and legacy redirects aligned", async () => {
    const [pageSource, buttonSource, sitemapSource, nextConfigSource] = await Promise.all([
      readFile(new URL("../src/app/sur-mesure/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/OrganisationSessionBookingButton.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/sitemap.ts", import.meta.url), "utf8"),
      readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    ]);

    expect(pageSource).toContain("<OrganisationSessionBookingButton");
    expect(pageSource).toContain('source="Page sur mesure : Hero"');
    expect(pageSource).toContain('source="Page sur mesure : Final"');
    expect(pageSource).not.toContain("sourceIsAuthoritative");
    expect(buttonSource).toContain('searchParams.get("source") || source');
    expect(buttonSource).toContain("getFilloutAttributionParameters");
    expect(buttonSource).toContain('searchParams.get("systemSlug")');
    expect(sitemapSource).toContain("`${base}/sur-mesure`");
    expect(sitemapSource).toContain("`${base}/systemes`");
    expect(nextConfigSource).toMatch(
      /source: '\/accompagnement',[\s\S]*?destination: '\/services',/,
    );
    expect(nextConfigSource).not.toMatch(/source: '\/sur-mesure',/);
  });
});
