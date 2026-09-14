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
      "Une entreprise rentable n’est pas toujours facile à transmettre.",
    );
    expect(landing).toContain("Une rentabilité plus lisible");
    expect(landing).toContain("Une équipe plus autonome");
    expect(landing).toContain("Des processus documentés et transmissibles");
    expect(landing).toContain(
      "Nous structurons ce qui dépend encore trop de vous.",
    );
    expect(landing).toContain(
      "Six mois pour rendre votre entreprise plus autonome et",
    );
    expect(landing).toContain("AUTOMATION_OFFER.price.label");
    expect(landing).toContain(
      "Un écosystème de spécialistes mobilisés au bon moment.",
    );
    expect(landing.indexOf('title: "Automatisation & IA"')).toBeLessThan(
      landing.indexOf('title: "Assistant digital"'),
    );
    expect(landing).toContain("Assistant digital");
    expect(landing).toContain("Prospection ciblée");
    expect(landing).toContain("Publicité et marketing");
    expect(landing).toContain(
      "(Ces interventions sont proposées séparément. Leur périmètre et",
    );
    expect(landing).toContain(
      "Obtenez une première estimation de votre entreprise.",
    );
    expect(landing.match(/variant="sale"/g)).toHaveLength(1);
    expect(landing).not.toContain(
      "Où en êtes-vous dans votre projet de transmission ?",
    );
    expect(landing).not.toContain("Demaa Partners");
    expect(landing).not.toContain("StudioInterestForm");
  });
});
