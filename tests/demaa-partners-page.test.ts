import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("canonical Transmission page", () => {
  it("replaces the legacy Partners and Accompagnement destinations", async () => {
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
    expect(partners).toContain('permanentRedirect("/transmettre")');
    expect(accompaniment).toContain('permanentRedirect("/transmettre")');
    expect(studio).toContain('permanentRedirect("/transmettre")');
    expect(footer).toContain('{ label: "Vendre", href: "/transmettre" }');
    expect(navbar).toContain('label: "Vendre", href: "/transmettre"');
    expect(navbar).not.toContain('label: "Demaa Partners"');
    expect(sitemap).toContain("`${base}/transmettre`");
    expect(sitemap).not.toContain("`${base}/partners`");
  });

  it("merges the strategic narrative with a concrete transmission offer", async () => {
    const landing = await readSource(
      "src/components/TransmissionLandingPage.tsx",
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
    expect(landing.match(/variant="hero"/g)).toHaveLength(1);
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
});
