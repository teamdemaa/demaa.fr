import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import SpecialistsCatalog from "@/components/SpecialistsCatalog";
import { getSpecialistSections } from "@/lib/specialist-catalog";

describe("Specialists public index", () => {
  it("renders the eight published offers in the approved three sections", () => {
    const sections = getSpecialistSections();
    const markup = renderToStaticMarkup(
      createElement(SpecialistsCatalog, { sections }),
    );

    expect(sections.map((section) => section.title)).toEqual([
      "Digitaliser et automatiser",
      "Structurer et piloter",
      "Développer l’activité",
    ]);
    expect(sections.flatMap((section) => section.services)).toHaveLength(8);
    expect(sections[0]?.services.map((service) => service.name)).toEqual([
      "Automatisation & IA",
      "Logiciel métier sur mesure",
      "Assistant digital",
    ]);
    expect(markup.match(/<article/g)).toHaveLength(8);
    expect(markup).toContain("Automatisation &amp; IA");
    expect(markup).toContain("Logiciel métier sur mesure");
    expect(markup).toContain("Système commercial et client");
    expect(markup).toContain("Assistant digital");
    expect(markup).not.toContain("Expert-comptable");
    expect(markup).toContain("3 500 € HT");
    expect(markup).not.toContain("Sur devis");
    expect(markup).toContain("550 € HT / jour");
    expect(markup).toContain("À partir de 650 € HT / mois");
    expect(markup).toContain("900 € HT / mois");
    expect(markup).toContain("1 200 € HT / mois");
    expect(markup).toContain("Diagnostic des besoins");
    expect(markup).not.toContain("Rechercher une expertise…");
    expect(markup).not.toContain("Afficher les catégories");
    expect(markup).not.toContain("Filtrer les spécialistes par besoin");
    expect(markup).not.toContain(">Tous</button>");
    expect(markup).not.toContain("Découvrir");
    expect(markup).not.toContain("Réalisé par");
    expect(markup).not.toContain("Partenaire");
  });

  it("uses the Specialists navigation and metadata route", async () => {
    const pageSource = await readFile(
      new URL("../src/app/(marketing)/specialistes/page.tsx", import.meta.url),
      "utf8",
    );
    const cardsSource = await readFile(
      new URL("../src/components/SpecialistsCatalog.tsx", import.meta.url),
      "utf8",
    );

    expect(pageSource).toContain('path: "/specialistes"');
    expect(pageSource).toContain('publicNavigationActiveView="services"');
    expect(pageSource).toContain("Faites avancer votre entreprise");
    expect(pageSource).toContain("avec le bon spécialiste");
    expect(pageSource).not.toContain("Choisissez le sujet que vous souhaitez mettre en place ou déléguer.");
    expect(pageSource).toContain("demaa-hero-title block text-dema-forest");
    expect(cardsSource).toContain("href={service.detailHref}");
    expect(cardsSource).not.toContain("onServiceSelect");
    expect(cardsSource).not.toContain("service.delivery");
  });
});
