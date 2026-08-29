import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("Organiser public journey", () => {
  const organiserPage = read("src/app/(marketing)/organiser/page.tsx");
  const organiserHub = read("src/components/OrganiserHub.tsx");
  const organiserDirectory = read("src/components/AcademyIndexClient.tsx");
  const processPage = read("src/app/(marketing)/organiser/processus/page.tsx");

  it("publishes one Organiser hub for models, cases and automation", () => {
    const navbar = read("src/components/Navbar.tsx");

    expect(organiserPage).toContain("<OrganiserHub />");
    expect(organiserPage).not.toContain("OrganiserSectionNavigation");
    expect(organiserPage).toContain('path: "/organiser"');
    expect(organiserHub).toContain("Des modèles et des cas concrets");
    expect(organiserHub).toContain('href="/modeles"');
    expect(organiserHub).toContain("Voir tous les modèles");
    expect(organiserHub).toContain("<ModelProcessesBridge />");
    expect(organiserHub).toContain("<MentoratAutomationCta");
    expect(organiserHub).toContain("<StructureNewsletterBlock />");
    expect(navbar).not.toContain("Diagnostic organisation");
  });

  it("publishes the complete case directory below the Organiser hub", () => {
    expect(processPage).toContain("<AcademyIndexClient");
    expect(processPage).toContain('path: "/organiser/processus"');
    expect(processPage).toContain(
      'backLink={{ href: "/organiser", label: "← Retour à Organiser" }}',
    );
    expect(organiserDirectory).toContain('href="/diagnostic-organisation"');
    expect(organiserDirectory).toContain("Diagnostic organisation");
    expect(organiserDirectory).toContain("Gratuit · Sans engagement");
    expect(organiserDirectory.indexOf('className="grid grid-cols-1')).toBeLessThan(
      organiserDirectory.indexOf('href="/diagnostic-organisation"'),
    );
  });

  it("keeps the French Organiser routes explicit and free of retired workspaces", () => {
    expect(existsSync("src/app/(marketing)/academie/page.tsx")).toBe(false);
    expect(existsSync("src/app/(marketing)/academie/[slug]/page.tsx")).toBe(false);
    expect(existsSync("src/components/OrganiserLandingPage.tsx")).toBe(false);
    expect(existsSync("src/components/OrganiserWorkspace.tsx")).toBe(false);
    expect(processPage).not.toContain("permanentRedirect");
  });
});
