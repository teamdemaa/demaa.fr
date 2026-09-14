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

describe("transmission unifiée", () => {
  it("locks a six-month accompaniment", () => {
    expect(AUTOMATION_ACCOMPANIMENT_PATH).toBe("/transmettre");
    expect(AUTOMATION_OFFER).toMatchObject({
      durationLabel: "6 mois",
      name: "Accompagnement sur 6 mois",
      serviceName: "Structuration, automatisation & IA",
      price: {
        amountMinor: 150000,
        currency: "EUR",
        label: "1 500 € HT / mois",
      },
      commitmentLabel: "Engagement initial de 6 mois, soit 9 000 € HT.",
    });
  });

  it("combines transmission preparation and concrete structuring on one page", async () => {
    const [landing, page, accompaniment, automation, sitemap] =
      await Promise.all([
        readSource("src/components/TransmissionLandingPage.tsx"),
        readSource("src/app/(marketing)/transmettre/page.tsx"),
        readSource("src/app/(marketing)/accompagnement/page.tsx"),
        readSource("src/app/(marketing)/automatisation/page.tsx"),
        readSource("src/app/sitemap.ts"),
      ]);

    expect(page).toContain("TransmissionLandingPage");
    expect(page).toContain('path: "/transmettre"');
    expect(accompaniment).toContain('permanentRedirect("/transmettre")');
    expect(automation).toContain(
      'permanentRedirect("/transmettre#structuration")',
    );
    expect(landing).toContain(
      "Préparez votre entreprise pour mieux la vendre.",
    );
    expect(landing).toContain(
      "Une entreprise peut être rentable et pourtant difficile à",
    );
    expect(landing).toContain(
      "Rendre votre entreprise moins dépendante de vous, plus simple à",
    );
    expect(landing).toContain("Prioriser");
    expect(landing).toContain("Préparer la transmission");
    expect(landing).toContain("Les systèmes que nous mettons réellement en place.");
    expect(landing).toContain("Pilotage commercial & clients");
    expect(landing).toContain("Opérations & qualité");
    expect(landing).toContain("Pilotage de gestion");
    expect(landing).toContain("Équipe & transmission");
    expect(landing).toContain("Pipeline et étapes de vente configurés");
    expect(landing).toContain("Tableau de bord adapté à l’activité");
    expect(landing).toContain("Dossier de fonctionnement utilisable par un repreneur");
    expect(landing).toContain("Rôles, responsabilités et règles de décision");
    expect(landing).toContain(
      "/illustrations/accompagnement/hero-preparer-vente-v2.png",
    );
    expect(landing).toContain("/illustrations/accompagnement/equipe-autonome-v1.png");
    expect(landing).toContain(
      "/illustrations/accompagnement/pilotage-transmissible-v1.png",
    );
    expect(landing).toContain('id="structuration"');
    expect(landing).toContain("AUTOMATION_OFFER.price.label");
    expect(landing).toContain(
      "Je peux m’absenter sans que l’activité s’arrête.",
    );
    expect(landing).toContain("Dirigeant, EM2A Expertise");
    expect(landing).toContain("un véritable");
    expect(landing).toContain("actif qu’un");
    expect(landing).toContain("acheteur peut comprendre, reprendre et valoriser");
    expect(landing).not.toContain("30 %");
    expect(landing).not.toContain("Chef de mission comptable");
    expect(landing).toContain("AccompanimentContactControl");
    expect(landing).toContain('<BusinessSellerActions variant="hero" />');
    expect(landing).toContain('<BusinessSellerActions variant="estimate" />');
    expect(sitemap).toContain("/transmettre");
    expect(sitemap).not.toContain("`${base}/accompagnement`");
    expect(sitemap).not.toContain("`${base}/automatisation`");
  });

  it("uses the transmission route from contextual calls to action", () => {
    const modelMarkup = renderToStaticMarkup(
      createElement(MentoratAutomationCta, {
        modelSlug: "structure-google-drive-entreprise",
        variant: "modele",
      }),
    );
    const organisationMarkup = renderToStaticMarkup(
      createElement(MentoratAutomationCta, {
        contentSlug: "preparer-devis-propositions-commerciales",
        variant: "organisation",
      }),
    );

    expect(modelMarkup).toContain(
      "/transmettre?source=modele-detail&amp;modelSlug=structure-google-drive-entreprise#structuration",
    );
    expect(organisationMarkup).toContain(
      "/transmettre?source=organisation-content&amp;contentSlug=preparer-devis-propositions-commerciales#structuration",
    );
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
