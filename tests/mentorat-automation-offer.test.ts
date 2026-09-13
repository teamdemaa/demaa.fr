import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MentoratAutomationCta from "@/components/MentoratAutomationCta";
import { AUTOMATION_OFFER } from "@/lib/automation-offer";
import {
  AUTOMATION_ACCOMPANIMENT_PATH,
  mentoratAutomationContent,
} from "@/lib/mentorat-automation-content";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("Mise en place d’une automatisation terrain", () => {
  it("locks the one-month offer and its deliberately bounded scope", () => {
    expect(AUTOMATION_ACCOMPANIMENT_PATH).toBe("/automatisation");
    expect(AUTOMATION_OFFER.name).toBe("Automatisation terrain");
    expect(AUTOMATION_OFFER.serviceName).toBe("Automatisation des opérations terrain");
    expect(AUTOMATION_OFFER.price).toEqual({
      amountMinor: 250000,
      currency: "EUR",
      label: "2 500 € HT",
    });
    expect(mentoratAutomationContent.offer).toMatchObject({
      duration: "1 mois",
      price: "2 500 € HT",
      title: "Un mois pour automatiser ce qui vous fait perdre du temps.",
    });
    expect(mentoratAutomationContent.hero.lead).toBe(
      "De la demande client à la facture,",
    );
    expect(mentoratAutomationContent.hero.emphasis).toBe(
      "sans ressaisir les mêmes informations.",
    );
    expect(mentoratAutomationContent.hero.description).toContain("interventions ou chantiers");
    expect(mentoratAutomationContent.hero.description).toContain(
      "Nous mettons en place les automatisations & l’IA",
    );
    expect(mentoratAutomationContent.hero.ctaLabel).toBe(
      "Faire mon diagnostic Automatisation & IA",
    );
    expect(mentoratAutomationContent.sectors.items).toEqual([
      "Maintenance",
      "Installation",
      "Dépannage",
      "BTP",
      "Entretien",
      "Propreté",
    ]);
    expect(mentoratAutomationContent.journey.map(({ title }) => title)).toEqual([
      "La demande devient une intervention ou un chantier",
      "Le terrain alimente le suivi",
      "La fin du travail déclenche la suite",
    ]);
    expect(mentoratAutomationContent.impacts.map(({ title }) => title)).toEqual([
      "Sur le terrain",
      "Au bureau",
      "Pour le dirigeant",
      "Pour les clients",
    ]);
    expect(mentoratAutomationContent.offerIncludes).toEqual([
      "Analyse de votre fonctionnement",
      "Liste des automatisations possibles",
      "Choix de ce qui sera réalisé",
      "Construction et connexion avec vos outils",
      "Tests et ajustements",
      "Documentation et prise en main",
    ]);
    expect(mentoratAutomationContent.faq.find(
      (item) => item.question === "Faut-il changer nos outils ?",
    )?.answer).toContain("Pas nécessairement");
    expect(mentoratAutomationContent.faq.find(
      (item) => item.question === "Que peut-on automatiser en un mois ?",
    )?.answer).toContain("choisissons avec vous");
    expect(mentoratAutomationContent.faq.find(
      (item) => item.question === "Combien de temps cela demande-t-il à notre équipe ?",
    )?.answer).toContain("Nous prenons en charge la conception et la mise en place");
  });

  it("keeps the public landing focused on outcomes and current tools", async () => {
    const [landing, callbackDialog, page, legacyPage] = await Promise.all([
      readSource("src/components/MentoratAutomationLandingPage.tsx"),
      readSource("src/components/AutomationCallbackDialog.tsx"),
      readSource("src/app/(marketing)/accompagnement/page.tsx"),
      readSource("src/app/(marketing)/automatisation/page.tsx"),
    ]);

    expect(page).toContain("TransmissionLandingPage");
    expect(page).toContain("Préparer son entreprise à la vente");
    expect(legacyPage).toContain("MentoratAutomationLandingPage");
    expect(landing).toContain("content.hero.lead");
    expect(landing).toContain("content.hero.emphasis");
    expect(landing).toContain("content.sectors.items.map");
    expect(landing).toContain("content.journey.map");
    expect(landing).toContain("content.impacts.map");
    expect(landing).toContain("content.fieldExamples.items.map");
    expect(landing).toContain('from "next/image"');
    expect(landing).toContain("/illustrations/accompagnement/hero-entreprise-terrain-v3.png");
    expect(landing).toContain("/illustrations/accompagnement/flux-client-bureau-terrain-v3.png");
    expect(landing).toContain("/illustrations/accompagnement/metiers-terrain-v3.png");
    expect(landing.match(/alt=""/g)).toHaveLength(3);
    expect(landing).toContain("fieldExampleImagePositions[index]");
    expect(landing).toContain("<FlowIllustration />");
    expect(landing).toContain("<AppIllustration />");
    expect(landing).toContain("content.applicationBridge.href");
    expect(landing.indexOf("content.finalCta.title")).toBeLessThan(
      landing.indexOf("content.applicationBridge.title"),
    );
    expect(mentoratAutomationContent.applicationBridge.href).toBe("/sur-mesure");
    expect(landing).not.toContain('href="/diagnostic-organisation"');
    expect(mentoratAutomationContent.fieldExamples.items).toHaveLength(3);
    expect(JSON.stringify(mentoratAutomationContent)).not.toContain("témoignage proposé");
    expect(landing).not.toContain("StructureNewsletterBlock");
    for (const brand of ["Codex", "Airtable", "Fillout", "Make"]) {
      expect(JSON.stringify(mentoratAutomationContent)).not.toContain(brand);
    }
    expect(callbackDialog).toContain("Faisons le point ensemble.");
    expect(callbackDialog).toContain("Diagnostic Automatisation &amp; IA");
    expect(callbackDialog).toContain('submitLabel="Envoyer ma demande"');
  });

  it("uses the canonical accompaniment route from contextual model calls to action", () => {
    const markup = renderToStaticMarkup(
      createElement(MentoratAutomationCta, {
        modelSlug: "structure-google-drive-entreprise",
        variant: "modele",
      }),
    );

    expect(markup).toContain("/automatisation?source=modele-detail");
    expect(markup).toContain("Découvrir la mise en place");
    expect(markup).toContain("l’intégrons dans un système que votre équipe peut réellement utiliser");
  });

  it("links Organisation articles to the implementation offer", () => {
    const markup = renderToStaticMarkup(
      createElement(MentoratAutomationCta, {
        contentSlug: "preparer-devis-propositions-commerciales",
        variant: "organisation",
      }),
    );

    expect(markup).toContain(
      "/automatisation?source=organisation-content&amp;contentSlug=preparer-devis-propositions-commerciales",
    );
    expect(markup).toContain("Vous préférez que nous le mettions en place pour vous ?");
  });

  it("replaces promotional automation CTAs on Outils with one Tutoriels bridge", async () => {
    const [hub, systemPage, bridge, sitemap, nextConfig] = await Promise.all([
      readSource("src/components/SystemsHubPage.tsx"),
      readSource("src/app/(marketing)/solutions/[slug]/page.tsx"),
      readSource("src/components/OrganiserDiscoveryCta.tsx"),
      readSource("src/app/sitemap.ts"),
      readSource("next.config.ts"),
    ]);

    expect(hub).toContain("<OrganiserDiscoveryCta />");
    expect(hub).not.toContain("MentoratAutomationCta");
    expect(hub).toContain("<StructureNewsletterBlock />");
    expect(systemPage).toContain("<OrganiserDiscoveryCta");
    expect(systemPage).toContain('eyebrow="Bonus"');
    expect(systemPage).toContain('title="Les processus de votre métier"');
    expect(systemPage).toContain('ctaLabel="Voir les processus du métier"');
    expect(systemPage).toContain('href={`/systemes/${data.system.slug}/processus`}');
    expect(systemPage).not.toContain("MentoratAutomationCta");
    expect(bridge).toContain("Des tutoriels pour mieux utiliser vos outils");
    expect(bridge).toContain(
      "Des pas-à-pas concrets pour prendre en main, configurer et utiliser vos outils au quotidien.",
    );
    expect(bridge).toContain("Voir les tutoriels");
    expect(bridge).toContain('href = "/tutoriels"');
    expect(bridge).toContain("href={href}");
    expect(sitemap).toContain("/accompagnement");
    expect(sitemap).toContain("`${base}/automatisation`");
    expect(nextConfig).not.toMatch(/source: '\/automatisation',[\s\S]*?destination: '\/accompagnement'/);
  });
});
