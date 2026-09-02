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

describe("Accompagnement automatisation et IA", () => {
  it("locks the Maestro offer and its deliberately bounded scope", () => {
    expect(AUTOMATION_ACCOMPANIMENT_PATH).toBe("/accompagnement");
    expect(AUTOMATION_OFFER.name).toBe("Maestro");
    expect(AUTOMATION_OFFER.serviceName).toBe("Accompagnement automatisation et IA");
    expect(mentoratAutomationContent.offer).toEqual({
      duration: "1 mois",
      price: "2 500 € HT",
    });
    expect(mentoratAutomationContent.hero.title).toBe(
      "Organisez votre entreprise pour qu’elle dépende moins de vous.",
    );
    expect(mentoratAutomationContent.examples).toContain(
      "Clarifier qui fait quoi dans votre équipe",
    );
    expect(mentoratAutomationContent.examples).toContain(
      "Automatiser les relances, les saisies et les tâches répétitives",
    );
    expect(mentoratAutomationContent.offerIncludes).toEqual([
      "Analyse de votre fonctionnement actuel",
      "Plan de mise en place validé avec vous",
      "Organisation des informations et des responsabilités",
      "Mise en place des outils et automatisations retenus",
      "Tests, ajustements et transmission à l’équipe",
    ]);
    expect(mentoratAutomationContent.faq.find(
      (item) => item.question === "Devons-nous changer nos outils ?",
    )?.answer).toContain("outils déjà utilisés");
    expect(mentoratAutomationContent.faq.find(
      (item) => item.question === "Que peut-on réellement mettre en place en un mois ?",
    )?.answer).toContain("La feuille de route est définie et validée");
    expect(mentoratAutomationContent.faq.find(
      (item) => item.question === "Combien de temps cela demande-t-il à mon équipe ?",
    )?.answer).toContain("Nous prenons en charge la conception et la mise en place");
    expect(mentoratAutomationContent.faq.map((item) => item.question)).not.toContain(
      "Faut-il savoir coder ?",
    );
    expect("tutorialTracks" in mentoratAutomationContent).toBe(false);
    expect("approachPillars" in mentoratAutomationContent).toBe(false);
  });

  it("keeps the public landing focused on outcomes and current tools", async () => {
    const [landing, callbackDialog, page, legacyPage] = await Promise.all([
      readSource("src/components/MentoratAutomationLandingPage.tsx"),
      readSource("src/components/AutomationCallbackDialog.tsx"),
      readSource("src/app/(marketing)/accompagnement/page.tsx"),
      readSource("src/app/(marketing)/automatisation/page.tsx"),
    ]);

    expect(page).toContain("MentoratAutomationLandingPage");
    expect(page).toContain("Accompagnement automatisation et IA pour entreprise");
    expect(legacyPage).toContain('permanentRedirect("/accompagnement")');
    expect(landing).toContain("Organisez votre entreprise");
    expect(landing).toContain("Comment ça se passe ?");
    expect(landing).toContain("Moins de temps consacré aux tâches chronophages.");
    expect(JSON.stringify(mentoratAutomationContent.method)).toContain("atelier de travail de deux heures");
    expect(landing).not.toContain("4 × 1 heure");
    expect(landing).not.toContain("1 à 3");
    expect(mentoratAutomationContent.tools.title).toBe("Nous partons de vos outils.");
    expect(landing).toContain("Vos outils actuels");
    expect(landing).toContain("Maestro · Accompagnement · 1 mois");
    expect(landing).toContain("Votre nouvelle organisation, mise en place en un mois.");
    expect(landing.indexOf("Maestro · Accompagnement · 1 mois")).toBeGreaterThan(
      landing.indexOf('id="tarif"'),
    );
    expect(landing).toContain('label="Être accompagné"');
    expect(landing).toContain("Vous ne savez pas encore par où commencer ?");
    expect(landing).toContain("Commencer le diagnostic");
    expect(landing).toContain('href="/diagnostic-organisation"');
    expect(landing.indexOf('href="/diagnostic-organisation"')).toBeGreaterThan(
      landing.indexOf('id="tarif"'),
    );
    expect(landing.indexOf('href="/diagnostic-organisation"')).toBeLessThan(
      landing.indexOf('id="faq"'),
    );
    expect(landing).not.toContain("Tutoriels Demaa");
    expect(JSON.stringify(mentoratAutomationContent)).not.toContain("12 mois");
    expect(JSON.stringify(mentoratAutomationContent)).not.toContain("Product Builder");
    expect(landing).not.toContain("StructureNewsletterBlock");
    for (const brand of ["ChatGPT", "Codex", "Airtable", "Fillout", "Make"]) {
      expect(JSON.stringify(mentoratAutomationContent)).not.toContain(brand);
    }
    expect(callbackDialog).toContain("Parlons de votre organisation.");
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
    expect(markup).toContain("Découvrir l’accompagnement");
    expect(markup).toContain("automatiser uniquement les étapes qui apportent un gain concret");
  });

  it("replaces promotional automation CTAs on Solutions with one Organiser bridge", async () => {
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
    expect(bridge).toContain("Des cas concrets pour organiser votre activité");
    expect(bridge).toContain("Voir les cas concrets");
    expect(bridge).toContain('href="/organiser#cas-concrets"');
    expect(sitemap).toContain("/accompagnement");
    expect(sitemap).not.toContain("`${base}/automatisation`");
    expect(nextConfig).toMatch(/source: '\/automatisation',[\s\S]*?destination: '\/accompagnement'/);
  });
});
