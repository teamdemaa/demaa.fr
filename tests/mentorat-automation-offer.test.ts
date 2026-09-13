import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MentoratAutomationCta from "@/components/MentoratAutomationCta";
import { AUTOMATION_OFFER } from "@/lib/automation-offer";
import { AUTOMATION_ACCOMPANIMENT_PATH } from "@/lib/mentorat-automation-content";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("accompagnement unifié", () => {
  it("locks a bounded one-month starting offer", () => {
    expect(AUTOMATION_ACCOMPANIMENT_PATH).toBe("/accompagnement");
    expect(AUTOMATION_OFFER).toMatchObject({
      durationLabel: "1 mois",
      name: "Système prioritaire",
      serviceName: "Structuration, automatisation & IA",
      price: { amountMinor: 300000, currency: "EUR", label: "À partir de 3 000 € HT" },
    });
  });

  it("combines daily operations, automation and transmission on one page", async () => {
    const [landing, page, legacyPage, sitemap] = await Promise.all([
      readSource("src/components/TransmissionLandingPage.tsx"),
      readSource("src/app/(marketing)/accompagnement/page.tsx"),
      readSource("src/app/(marketing)/automatisation/page.tsx"),
      readSource("src/app/sitemap.ts"),
    ]);
    expect(page).toContain("TransmissionLandingPage");
    expect(page).toContain("Structuration, automatisation & IA");
    expect(legacyPage).toContain('permanentRedirect("/accompagnement#automatisation")');
    expect(landing).toContain("Une entreprise qui fonctionne mieux");
    expect(landing).toContain("Et dépend moins de vous");
    expect(landing).toContain("automatisation et l’IA");
    expect(landing).toContain("piloter ou à transmettre");
    expect(landing).toContain("AUTOMATION_OFFER.price.label");
    expect(landing).toContain("Services terrain");
    expect(landing).toContain("Services professionnels");
    expect(landing).toContain("Suivi client");
    expect(landing).not.toContain('title: "Compte rendu"');
    expect(landing).toContain("30 %");
    expect(landing).toContain("AccompanimentContactControl");
    expect(landing).not.toContain("Application métier sur mesure");
    expect(landing).toContain("/illustrations/accompagnement/hero-entreprise-terrain-v3.png");
    expect(landing).toContain("/illustrations/accompagnement/flux-client-equipe-suivi-v4.png");
    expect(landing).toContain("/illustrations/accompagnement/services-terrain-v4.png");
    expect(landing).toContain("/illustrations/accompagnement/services-professionnels-v4.png");
    expect(landing).toContain("/illustrations/accompagnement/entreprise-transmission-v6.png");
    expect(sitemap).toContain("/accompagnement");
    expect(sitemap).not.toContain("`${base}/automatisation`");
    expect(sitemap).not.toContain("`${base}/sur-mesure`");
  });

  it("uses the canonical accompaniment route from contextual calls to action", () => {
    const modelMarkup = renderToStaticMarkup(createElement(MentoratAutomationCta, { modelSlug: "structure-google-drive-entreprise", variant: "modele" }));
    const organisationMarkup = renderToStaticMarkup(createElement(MentoratAutomationCta, { contentSlug: "preparer-devis-propositions-commerciales", variant: "organisation" }));
    expect(modelMarkup).toContain("/accompagnement?source=modele-detail&amp;modelSlug=structure-google-drive-entreprise#automatisation");
    expect(organisationMarkup).toContain("/accompagnement?source=organisation-content&amp;contentSlug=preparer-devis-propositions-commerciales#automatisation");
  });

  it("keeps the Tools bridge educational and separate from the offer", async () => {
    const [hub, systemPage, bridge] = await Promise.all([
      readSource("src/components/SystemsHubPage.tsx"),
      readSource("src/app/(marketing)/solutions/[slug]/page.tsx"),
      readSource("src/components/OrganiserDiscoveryCta.tsx"),
    ]);
    expect(hub).toContain("<OrganiserDiscoveryCta />");
    expect(hub).not.toContain("MentoratAutomationCta");
    expect(systemPage).toContain('eyebrow="Bonus"');
    expect(bridge).toContain("Des tutoriels pour mieux utiliser vos outils");
    expect(bridge).toContain('href = "/tutoriels"');
  });
});
