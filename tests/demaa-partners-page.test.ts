import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("seller and accompaniment pages", () => {
  it("keeps Vendre as the main seller destination and publishes Accompagnement separately", async () => {
    const [page, partners, accompaniment, studio, footer, navbar, sitemap] =
      await Promise.all([
        readSource("src/app/(marketing)/transmettre/page.tsx"),
        readSource("src/app/(marketing)/partners/page.tsx"),
        readSource("src/app/(marketing)/accompagnement/page.tsx"),
        readSource("src/app/(marketing)/studio/page.tsx"),
        readSource("src/components/Footer.tsx"),
        readSource("src/components/PublicActionPlanNavigation.tsx"),
        readSource("src/app/sitemap.ts"),
      ]);

    expect(page).toContain('path: "/transmettre"');
    expect(page).toContain("buildPublicPageMetadata");
    expect(page).toContain("BusinessSaleLandingPage");
    expect(partners).toContain('permanentRedirect("/accompagnement")');
    expect(accompaniment).toContain('path: "/accompagnement"');
    expect(accompaniment).toContain("TransmissionLandingPage");
    expect(studio).toContain('permanentRedirect("/accompagnement")');
    expect(footer).toContain('{ label: "Vendre", href: "/transmettre" }');
    expect(footer).toContain('{ label: "Préparer mon entreprise", href: "/accompagnement" }');
    expect(navbar).toContain('label: "Vendre", href: "/transmettre"');
    expect(navbar).not.toContain('label: "Demaa Partners"');
    expect(sitemap).toContain("`${base}/transmettre`");
    expect(sitemap).toContain("`${base}/accompagnement`");
    expect(sitemap).not.toContain("`${base}/partners`");
  });

  it("makes the free seller service explicit without requiring accompaniment", async () => {
    const landing = await readSource("src/components/BusinessSaleLandingPage.tsx");

    expect(landing).toContain(
      "Nous vous aidons à vendre votre entreprise.",
    );
    expect(landing).toContain(
      "Nous présentons gratuitement votre entreprise à des repreneurs qui",
    );
    expect(landing).toContain("Votre entreprise, présentée à sa juste valeur.");
    expect(landing).toContain("Comprendre votre entreprise");
    expect(landing).toContain("Préparer sa présentation");
    expect(landing).toContain("La présenter aux repreneurs");
    expect(landing).not.toContain("entreprise-presentee-repreneurs-v1.png");
    expect(landing).toContain('<BusinessSellerActions variant="hero" />');
    expect(landing).toContain('href="/accompagnement"');
    expect(landing).not.toContain("AUTOMATION_OFFER");
    expect(landing).not.toContain("1 500");
  });

  it("keeps the concrete six-month structuring offer on Accompagnement", async () => {
    const landing = await readSource("src/components/TransmissionLandingPage.tsx");

    expect(landing).toContain(
      "Préparez votre entreprise pour mieux la vendre.",
    );
    expect(landing).toContain(
      "Une entreprise peut être rentable et pourtant difficile à",
    );
    expect(landing).toContain(
      "Rendre votre entreprise moins dépendante de vous, plus simple à",
    );
    expect(landing).toContain("Une rentabilité plus lisible");
    expect(landing).toContain("Une équipe plus autonome");
    expect(landing).toContain("Des processus documentés et transmissibles");
    expect(landing).toContain("Prioriser");
    expect(landing).toContain("Préparer la transmission");
    expect(landing).toContain(
      "Six mois pour construire les systèmes qui libèrent le dirigeant",
    );
    expect(landing).toContain("AUTOMATION_OFFER.price.label");
    expect(landing).toContain(
      "Les bons spécialistes, lorsque le plan l’exige.",
    );
    expect(landing.indexOf('title: "Automatisation & IA"')).toBeLessThan(
      landing.indexOf('title: "Assistant digital"'),
    );
    expect(landing).toContain("Assistant digital");
    expect(landing).toContain("Prospection ciblée");
    expect(landing).toContain("Publicité & marketing");
    expect(landing).toContain(
      "(Ces interventions sont proposées séparément. Leur périmètre et",
    );
    expect(landing).toContain(
      "Obtenez une première estimation de votre entreprise.",
    );
    expect(landing).toContain("Accompagnement facultatif");
    expect(landing).toContain(
      '<AccompanimentContactControl label="Préparer mon entreprise" />',
    );
    expect(
      landing.indexOf("Je peux m’absenter sans que l’activité s’arrête."),
    ).toBeLessThan(
      landing.indexOf(
        "Six mois pour construire les systèmes qui libèrent le dirigeant",
      ),
    );
    expect(landing).not.toContain(
      "Où en êtes-vous dans votre projet de transmission ?",
    );
    expect(landing).not.toContain("Demaa Partners");
    expect(landing).not.toContain("StudioInterestForm");
  });

  it("states the free scope again inside the seller form", async () => {
    const dialog = await readSource("src/components/BusinessSaleDialog.tsx");

    expect(dialog).toContain(
      "La préparation de la présentation et les premières mises en",
    );
    expect(dialog).toContain("sans obligation de souscrire");
    expect(dialog).toContain("l’accompagnement de structuration");
    expect(dialog).toContain("Présenter mon entreprise.");
  });
});
