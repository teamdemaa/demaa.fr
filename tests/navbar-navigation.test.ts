import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

describe("Demaa application navbar", () => {
  it("removes the historical centered two-column selector everywhere", async () => {
    const source = await readFile(
      new URL("../src/components/Navbar.tsx", import.meta.url),
      "utf8",
    );

    expect(source).not.toContain("data-navbar-section-selector");
    expect(source).not.toContain("Système métier</span>");
    expect(source).not.toContain("Académie</span>");
    expect(source).not.toContain("getNavbarActiveSection");
    expect(source).toContain('id="action-plan-navbar-desktop"');
    expect(source).toContain('id="action-plan-navbar-mobile"');
  });

  it("keeps the navbar on system detail and loading states", async () => {
    const [pageSource, loadingSource] = await Promise.all([
      readFile(new URL("../src/app/systemes/[slug]/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/systemes/[slug]/loading.tsx", import.meta.url), "utf8"),
    ]);

    expect(pageSource).toContain("<Navbar minimal />");
    expect(loadingSource).toContain("<Navbar minimal />");
    expect(pageSource.indexOf("<Navbar minimal />")).toBeLessThan(pageSource.indexOf("<main"));
    expect(loadingSource.indexOf("<Navbar minimal />")).toBeLessThan(loadingSource.indexOf("<main"));
  });

  it("keeps a distinct canonical homepage and one URL for each public universe", async () => {
    const [homeSource, systemsSource, nextConfigSource] = await Promise.all([
      readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/systemes/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    ]);

    expect(homeSource).not.toContain(
      'export { default, metadata } from "@/app/systemes/page"',
    );
    expect(homeSource).toContain('canonical: "/"');
    expect(homeSource).toContain("<ActionPlanExperience");
    expect(homeSource).toContain("<Navbar anonymousLanding minimal />");
    expect(systemsSource).toContain('canonical: "/systemes"');
    expect(nextConfigSource).not.toMatch(
      /source: '\/systemes',[\s\S]*?destination: '\/',/,
    );
    expect(nextConfigSource).toMatch(
      /source: '\/kits-operationnels',[\s\S]*?destination: '\/systemes',/,
    );
  });

  it("keeps the anonymous member access minimal and intercepts it over the homepage", async () => {
    const [memberSource, modalSource] = await Promise.all([
      readFile(new URL("../src/app/mon-espace/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/@modal/(.)mon-espace/page.tsx", import.meta.url), "utf8"),
    ]);

    expect(memberSource).toContain("<Navbar minimal />");
    expect(memberSource).toContain("<CustomerSpaceAccessForm returnTo=\"/mon-espace\" simple />");
    expect(memberSource).toContain("Le lien n’est plus valide.");
    expect(modalSource).toContain("<CustomerSpaceLoginDialog />");
  });

  it("centers generated-plan navigation on desktop and fixes it at the bottom on mobile", async () => {
    const [navbarSource, actionPlanNavSource, experienceSource] = await Promise.all([
      readFile(new URL("../src/components/Navbar.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/ActionPlanNavbar.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/ActionPlanExperience.tsx", import.meta.url), "utf8"),
    ]);

    expect(navbarSource).toContain('id="action-plan-navbar-desktop"');
    expect(navbarSource).toContain('id="action-plan-navbar-mobile"');
    expect(navbarSource).toContain("fixed inset-x-0 bottom-0");
    expect(navbarSource).toContain("w-[min(40vw,36rem)]");
    expect(navbarSource).toContain("empty:hidden xl:block");
    expect(navbarSource).toContain("empty:hidden xl:hidden");
    expect(actionPlanNavSource).toContain("Plan d’action");
    expect(actionPlanNavSource).toContain("Système");
    expect(actionPlanNavSource).toContain("Académie");
    expect(actionPlanNavSource).toContain("Coaching");
    expect(actionPlanNavSource).not.toContain('label: "Accompagnement"');
    expect(actionPlanNavSource).toContain('{ view: "academy"');
    expect(actionPlanNavSource).toContain("onViewChange(view)");
    expect(actionPlanNavSource).toContain("xl:min-h-11");
    expect(experienceSource).toContain("<ActionPlanNavbar");
    expect(experienceSource).toContain("<ActionPlanAcademyPanel");
    expect(experienceSource).not.toContain('aria-label="Votre résultat"');
  });
});
