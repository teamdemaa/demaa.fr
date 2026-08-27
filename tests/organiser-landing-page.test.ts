import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("Organiser public journey", () => {
  const archivedLanding = read("src/components/OrganiserLandingPage.tsx");
  const organiserPage = read("src/app/(marketing)/organiser/page.tsx");
  const organiserDirectory = read("src/components/AcademyIndexClient.tsx");
  const processPage = read("src/app/(marketing)/organiser/processus/page.tsx");

  it("restores the process directory at Organiser without a commercial landing", () => {
    const navbar = read("src/components/Navbar.tsx");

    expect(organiserPage).toContain("<AcademyIndexClient");
    expect(organiserPage).toContain('<OrganiserSectionNavigation activeSection="processes" />');
    expect(organiserPage).toContain('path: "/organiser"');
    expect(organiserPage).not.toContain("academie/page");
    expect(organiserPage).not.toContain("<OrganiserLandingPage");
    expect(navbar).not.toContain("Diagnostic organisation");
    expect(organiserDirectory).toContain('href="/diagnostic-organisation"');
    expect(organiserDirectory).toContain("Diagnostic organisation");
    expect(organiserDirectory).toContain("Gratuit · Sans engagement");
    expect(organiserDirectory.indexOf('className="grid grid-cols-1')).toBeLessThan(
      organiserDirectory.indexOf('href="/diagnostic-organisation"'),
    );
  });

  it("keeps Organiser as the only physical French content route", () => {
    expect(existsSync("src/app/(marketing)/academie/page.tsx")).toBe(false);
    expect(existsSync("src/app/(marketing)/academie/[slug]/page.tsx")).toBe(false);
    expect(organiserPage).not.toContain("../academie");
  });

  it("keeps the guided setup draft warm but outside every public route", () => {
    expect(archivedLanding).toContain(
      "Conserved as an unpublished draft for a possible future accompanied setup page.",
    );
    expect(archivedLanding).toContain('href="/diagnostic-organisation"');
    expect(archivedLanding).toContain("Diagnostic organisation");
    expect(processPage).toContain('permanentRedirect("/organiser")');
    expect(processPage).not.toContain("<AcademyIndexClient");
  });

  it("preserves the unpublished scope and price bases without offering them", () => {
    expect(archivedLanding).toContain("À partir de 1 500 € HT");
    expect(archivedLanding).toContain("Base de calcul : 550 € HT / jour");
    expect(archivedLanding).toContain("4 500 € HT");
    expect(archivedLanding).toContain("700 € HT par jour");
    expect(archivedLanding).not.toContain("3 sessions");
  });

  it("keeps tools subordinate to the operating need", () => {
    expect(archivedLanding).toContain(
      "Nous choisissons les processus, les règles et les outils en fonction de votre fonctionnement.",
    );
    expect(archivedLanding).toContain("notamment Airtable, Fillout et Make");
  });

  it("keeps the draft complete if it is intentionally revived later", () => {
    const discussion = read("src/components/OrganiserProjectDiscussionButton.tsx");

    expect(archivedLanding).toContain("Quand les outils existants ne suffisent plus");
    expect(archivedLanding).toContain("Nous pouvons aussi concevoir une application métier adaptée à votre fonctionnement");
    expect(archivedLanding).toContain('href="/application-metier"');
    expect(archivedLanding).toContain("<OrganiserProjectDiscussionButton");
    expect(discussion).toContain("Discuter de votre projet");
    expect(discussion).toContain("showCallbackAvailability");
    expect(discussion).toContain("requirePhone");
  });
});
