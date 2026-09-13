import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function readSource(path: string) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("Demaa Partners page", () => {
  it("is a footer-only marketing destination with canonical metadata and a legacy redirect", async () => {
    const [page, legacyPage, footer, navbar, sitemap] = await Promise.all([
      readSource("src/app/(marketing)/partners/page.tsx"),
      readSource("src/app/(marketing)/studio/page.tsx"),
      readSource("src/components/Footer.tsx"),
      readSource("src/components/ActionPlanNavbar.tsx"),
      readSource("src/app/sitemap.ts"),
    ]);

    expect(page).toContain('path: "/partners"');
    expect(page).toContain("buildPublicPageMetadata");
    expect(legacyPage).toContain('permanentRedirect("/partners")');
    expect(footer).toContain('{ label: "Demaa Partners", href: "/partners" }');
    expect(navbar).not.toContain('labels: { fr: "Demaa Partners"');
    expect(sitemap).toContain("`${base}/partners`");
  });

  it("speaks to service company leaders about an operating partnership and keeps public terms out", async () => {
    const [landing, form] = await Promise.all([
      readSource("src/components/DemaaPartnersLandingPage.tsx"),
      readSource("src/components/StudioInterestForm.tsx"),
    ]);

    expect(landing).toContain("Demaa Partners");
    expect(landing).toContain("Faites grandir la valeur de votre entreprise");
    expect(landing).toContain("Pas votre charge de travail");
    expect(landing).toContain("Une activité rentable n’est pas encore un actif autonome");
    expect(landing).toContain("Le partenaire de l’ombre");
    expect(landing).toContain("Demaa structure en coulisses");
    expect(landing).toContain("Automatiser un bon processus, pas un désordre");
    expect(landing).toContain("Services terrain ou services professionnels");
    expect(landing).toContain("Faire le point sur votre entreprise");
    expect(landing).toContain("<StudioInterestForm />");
    expect(form).toContain('fetch("/api/studio-interest"');
    expect(form).toContain("Votre entreprise et ses priorités opérationnelles");
    expect(form).toContain("Prénom et nom");
    expect(form).toContain("Téléphone");
    expect(landing).not.toContain("Rejoindre Team Demaa");
    expect(landing).not.toContain("pas notre secteur");
    expect(landing).not.toContain("Pas notre secteur");
    expect(landing).not.toContain("30 %");
    expect(landing).not.toContain("25 %");
    expect(landing).not.toContain("20 %");
    expect(landing).not.toContain("15 %");
    expect(landing).not.toContain("2 500");
    expect(landing).not.toContain("3 000");
    expect(landing).not.toContain("mailto:");
    expect(landing).not.toContain("Partenaire opérationnel");
  });
});
