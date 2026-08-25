import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/Navbar", () => ({
  default: () => createElement("nav", { "aria-label": "Navigation principale" }),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/components/ServiceCallbackForm", () => ({
  default: (props: { packages?: readonly { slug: string }[]; serviceSlug: string }) => createElement(
    "form",
    { "data-service": props.serviceSlug },
    props.packages && props.packages.length > 1
      ? props.packages.map(({ slug }) => createElement("input", {
      key: slug,
      name: "packageSlug",
      type: "radio",
      value: slug,
      }))
      : null,
  ),
}));

import SurMesurePage, { metadata } from "@/app/(marketing)/sur-mesure/page";
import { surMesurePageContent as content } from "@/lib/sur-mesure-page-content";

describe("Sur mesure commercial page", () => {
  it("publishes canonical metadata for the application offer", () => {
    expect(metadata).toMatchObject({
      title: "Application métier sur mesure | Demaa",
      alternates: { canonical: "/sur-mesure" },
      openGraph: { url: "/sur-mesure", type: "website" },
    });
  });

  it("renders the concise journey, package request and canonical structured data", () => {
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
    expect(markup).toContain(">Voir le tarif<");
    expect(markup).toContain(">Envoyer ma demande<");
    expect(markup).toContain('data-service="application-metier"');
    expect(markup).not.toContain('type="radio"');
    expect(markup).toContain('aria-label="Navigation principale"');
    expect(markup).not.toContain("Exemple d’interface");
    expect(markup).not.toMatch(/marketplace|partenariat|200 dirigeants|30 000 €|1 500 €/i);
    expect(markup).toContain('type="application/ld+json"');
  });

  it("publishes one quoted starting point and removes obsolete promises", () => {
    const markup = renderToStaticMarkup(createElement(SurMesurePage));

    expect(markup).toContain("4 500 € HT");
    expect(markup).toContain("700 € HT par jour");
    expect(markup).not.toContain("7 500 € HT");
    expect(markup).not.toMatch(/2 500 €|110 €\/heure|99 €\/mois/);
    expect(markup).not.toMatch(/Conformité RGPD|Application 100 % à vous|confidentialité garantie/);
    expect(content.commercialFrame.title).toBe("Un budget clair, confirmé avant de commencer.");
  });

  it("keeps attribution, the sitemap and legacy redirects aligned", async () => {
    const [pageSource, sitemapSource, nextConfigSource] = await Promise.all([
      readFile(new URL("../src/app/(marketing)/sur-mesure/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/sitemap.ts", import.meta.url), "utf8"),
      readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    ]);

    expect(pageSource).toContain("<ServiceCallbackForm");
    expect(pageSource).toContain('href="#demande-application"');
    expect(pageSource).not.toContain("OrganisationSessionBookingButton");
    expect(sitemapSource).toContain("`${base}/application-metier`");
    expect(sitemapSource).not.toContain("`${base}/sur-mesure`");
    expect(sitemapSource).toContain("`${base}/solutions`");
    expect(nextConfigSource).toMatch(
      /source: '\/accompagnement',[\s\S]*?destination: '\/application-metier',/,
    );
    expect(nextConfigSource).toMatch(
      /source: '\/services',[\s\S]*?destination: '\/application-metier',/,
    );
    expect(nextConfigSource).toMatch(
      /source: '\/sur-mesure',[\s\S]*?destination: '\/application-metier',/,
    );
  });
});
