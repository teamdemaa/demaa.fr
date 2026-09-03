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

describe("Mise en place de systèmes opérationnels", () => {
  it("locks the Maestro offer and its deliberately bounded scope", () => {
    expect(AUTOMATION_ACCOMPANIMENT_PATH).toBe("/accompagnement");
    expect(AUTOMATION_OFFER.name).toBe("Maestro");
    expect(AUTOMATION_OFFER.serviceName).toBe("Mise en place de systèmes opérationnels");
    expect(mentoratAutomationContent.offer).toEqual({
      duration: "1 mois",
      price: "3 500 € HT",
    });
    expect(mentoratAutomationContent.hero.title).toBe(
      "Mettez de l’ordre dans votre entreprise. Et des systèmes pour que ça dure.",
    );
    expect(mentoratAutomationContent.examples.map(({ title }) => title)).toEqual([
      "Gestion structurée des emails",
      "Suivi des demandes clients",
      "Devis et grille tarifaire",
      "Facturation et règlements",
      "Réunions et comptes rendus",
      "Drive et documents structurés",
      "Planning opérationnel partagé",
      "Prospection commerciale organisée",
    ]);
    expect(mentoratAutomationContent.operationalBrain.levels.map(({ title }) => title)).toEqual([
      "Ce que votre entreprise sait",
      "Comment le travail avance",
      "Les outils qui le font fonctionner",
    ]);
    expect(mentoratAutomationContent.offerIncludes).toEqual([
      "Analyse de votre fonctionnement actuel",
      "Identification des blocages et dépendances au dirigeant",
      "Définition d’un périmètre prioritaire validé avec vous",
      "Conception et mise en place de ces systèmes",
      "Configuration des outils et automatisations nécessaires",
      "Tests, documentation et formation de l’équipe",
    ]);
    expect(mentoratAutomationContent.faq.find(
      (item) => item.question === "Devons-nous changer nos outils ?",
    )?.answer).toContain("outils déjà utilisés");
    expect(mentoratAutomationContent.faq.find(
      (item) => item.question === "Que peut-on réellement mettre en place en un mois ?",
    )?.answer).toContain("Le périmètre, les livrables et le résultat attendu sont écrits et validés");
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
    expect(page).toContain("Mise en place de systèmes opérationnels pour TPE");
    expect(legacyPage).toContain('permanentRedirect("/accompagnement")');
    expect(landing).toContain("Mettez de l’ordre dans votre entreprise");
    expect(landing).toContain("Comment ça se passe ?");
    expect(landing).toContain("Aujourd’hui, trop de choses reposent sur vous.");
    expect(JSON.stringify(mentoratAutomationContent.method)).toContain("atelier de travail de deux heures");
    expect(landing).not.toContain("4 × 1 heure");
    expect(landing).not.toContain("1 à 3");
    expect(mentoratAutomationContent.tools.title).toBe("Nous travaillons dans vos outils actuels.");
    expect(mentoratAutomationContent.tools.examples).toContain("Gmail ou Outlook");
    expect(mentoratAutomationContent.tools.access).toContain("uniquement les accès nécessaires");
    expect(mentoratAutomationContent.tools.access).not.toContain("codes");
    expect(landing).toContain("/images/accompagnement/outils-organises.png");
    expect(landing).toContain("Nous mettons en place le classement");
    expect(landing).not.toContain("Votre fonctionnement réel");
    expect(landing).not.toContain("Un système clair");
    expect(landing).not.toContain("Vos outils configurés");
    expect(landing).toContain("Maestro · Mise en place de systèmes · 1 mois");
    expect(landing).toContain("Vos premiers systèmes opérationnels, mis en place en un mois.");
    expect(landing.indexOf("Maestro · Mise en place de systèmes · 1 mois")).toBeGreaterThan(
      landing.indexOf('id="tarif"'),
    );
    expect(landing).toContain('label="Faire le point sur mon organisation"');
    expect(landing).toContain('id="suivi"');
    expect(mentoratAutomationContent.ongoing.title).toBe("Après le premier mois, vous choisissez.");
    expect("price" in mentoratAutomationContent.ongoing).toBe(false);
    expect(JSON.stringify(mentoratAutomationContent.ongoing)).not.toContain("1 500 €");
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
    expect(JSON.stringify(mentoratAutomationContent)).not.toContain("trois à quatre");
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
    expect(markup).toContain("Découvrir la mise en place");
    expect(markup).toContain("l’intégrons dans un système que votre équipe peut réellement utiliser");
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
