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

describe("Mise en place d’un système commercial et client", () => {
  it("locks the Maestro offer and its deliberately bounded scope", () => {
    expect(AUTOMATION_ACCOMPANIMENT_PATH).toBe("/accompagnement");
    expect(AUTOMATION_OFFER.name).toBe("Maestro");
    expect(AUTOMATION_OFFER.serviceName).toBe("Système commercial et client");
    expect(AUTOMATION_OFFER.price).toEqual({
      amountMinor: 350000,
      currency: "EUR",
      label: "3 500 € HT",
    });
    expect(mentoratAutomationContent.offer).toMatchObject({
      duration: "1 mois",
      price: "3 500 € HT",
      title: "Votre système commercial et client, prêt à être utilisé.",
    });
    expect(mentoratAutomationContent.hero.lead).toBe(
      "On met en place votre système commercial et client.",
    );
    expect(mentoratAutomationContent.hero.description).toContain("au suivi après la livraison");
    expect(mentoratAutomationContent.journey.map(({ title }) => title)).toEqual([
      "Prospecter et vendre",
      "Accueillir et cadrer",
      "Réaliser et livrer",
      "Suivre et fidéliser",
    ]);
    expect(mentoratAutomationContent.foundations.items.map(({ title }) => title)).toEqual([
      "Les étapes",
      "Les responsabilités",
      "Les outils",
      "Les modèles",
      "Les routines",
    ]);
    expect(mentoratAutomationContent.cockpit.items.map(({ title }) => title)).toEqual([
      "À contacter",
      "À préparer",
      "À valider",
      "À relancer",
    ]);
    expect(mentoratAutomationContent.impacts.items.map(({ title }) => title)).toEqual([
      "Pour le dirigeant",
      "Pour l’équipe",
      "Pour les clients",
      "Pour l’entreprise",
    ]);
    expect(mentoratAutomationContent.offerIncludes).toEqual([
      "Votre parcours commercial et client structuré",
      "Votre outil de suivi configuré",
      "Vos étapes et responsabilités définies",
      "Vos emails et séquences de relance prioritaires",
      "Vos documents et modèles prioritaires",
      "Vos trames de rapports et de livrables",
      "Vos routines de suivi",
      "Votre équipe accompagnée dans la prise en main",
    ]);
    expect(mentoratAutomationContent.faq.find(
      (item) => item.question === "Devons-nous utiliser un CRM ?",
    )?.answer).toContain("Pas nécessairement");
    expect(mentoratAutomationContent.faq.find(
      (item) => item.question === "Que peut-on mettre en place en un mois ?",
    )?.answer).toContain("Ce périmètre, les livrables et le résultat attendu sont validés");
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

    expect(page).toContain("MentoratAutomationLandingPage");
    expect(page).toContain("Mise en place d’un système commercial et client pour TPE");
    expect(legacyPage).toContain('permanentRedirect("/accompagnement")');
    expect(landing).toContain("content.hero.lead");
    expect(landing).not.toContain("content.hero.emphasis");
    expect(landing).toContain("content.journey.map");
    expect(landing).toContain("content.foundations.items.map");
    expect(landing).toContain("content.impacts.items.map");
    expect(landing).toContain("/images/accompagnement/outils-organises-transparent.png");
    expect(landing).toContain("/images/accompagnement/organisation-claire.png");
    expect(landing).toContain("/images/accompagnement/atelier-organisation.png");
    expect(landing).toContain('label="Faire le point ensemble"');
    expect(landing).toContain('id="suivi"');
    expect(landing).toContain("Un problème de votre métier mérite peut-être son propre logiciel");
    expect(landing).toContain('href="/studio"');
    expect(landing).toContain("Découvrir Demaa Studio");
    expect(mentoratAutomationContent.ongoing.title).toBe("Vous et votre équipe êtes autonomes.");
    expect("priceNote" in mentoratAutomationContent.ongoing).toBe(false);
    expect("options" in mentoratAutomationContent.ongoing).toBe(false);
    expect(landing).not.toContain("content.ongoing.options.map");
    expect(landing).not.toContain('href="/diagnostic-organisation"');
    expect(mentoratAutomationContent.testimonials).toHaveLength(2);
    expect(JSON.stringify(mentoratAutomationContent.testimonials)).not.toContain("Product Builder");
    expect(landing).not.toContain("StructureNewsletterBlock");
    for (const brand of ["Codex", "Airtable", "Fillout", "Make"]) {
      expect(JSON.stringify(mentoratAutomationContent)).not.toContain(brand);
    }
    expect(callbackDialog).toContain("Faisons le point ensemble.");
    expect(callbackDialog).toContain("Système commercial et client");
    expect(callbackDialog).toContain('submitLabel="Envoyer ma demande"');
  });

  it("uses the canonical accompaniment route from contextual model calls to action", () => {
    const markup = renderToStaticMarkup(
      createElement(MentoratAutomationCta, {
        modelSlug: "structure-google-drive-entreprise",
        variant: "modele",
      }),
    );

    expect(markup).toContain("/accompagnement?source=modele-detail");
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
      "/accompagnement?source=organisation-content&amp;contentSlug=preparer-devis-propositions-commerciales",
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
    expect(systemPage).toContain("<OrganiserDiscoveryCta />");
    expect(systemPage).not.toContain("MentoratAutomationCta");
    expect(bridge).toContain("Des tutoriels pour passer à l’action");
    expect(bridge).toContain("Voir les tutoriels");
    expect(bridge).toContain('href="/tutoriels"');
    expect(sitemap).toContain("/accompagnement");
    expect(sitemap).not.toContain("`${base}/automatisation`");
    expect(nextConfig).toMatch(/source: '\/automatisation',[\s\S]*?destination: '\/accompagnement'/);
  });
});
