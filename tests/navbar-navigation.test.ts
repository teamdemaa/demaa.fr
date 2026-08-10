import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { getNavbarActiveSection } from "@/components/Navbar";

describe("conventional systems and Academy navbar", () => {
  it("marks system discovery pages as active", () => {
    expect(getNavbarActiveSection("/systemes")).toBe("systems");
    expect(getNavbarActiveSection("/kits-operationnels")).toBe("systems");
    expect(getNavbarActiveSection("/systemes/batiment")).toBe(
      "systems",
    );
  });

  it("marks Academy and legacy course pages as active", () => {
    expect(getNavbarActiveSection("/academie")).toBe("academy");
    expect(
      getNavbarActiveSection(
        "/academie/difference-chiffre-affaires-benefice",
      ),
    ).toBe("academy");
    expect(getNavbarActiveSection("/cours")).toBe("academy");
    expect(getNavbarActiveSection("/cours/gestion-tresorerie")).toBe(
      "academy",
    );
  });

  it("does not mark a section active on neutral routes", () => {
    expect(getNavbarActiveSection("/")).toBeNull();
    expect(getNavbarActiveSection("/sur-mesure")).toBeNull();
    expect(getNavbarActiveSection("/annuaire-services")).toBeNull();
    expect(getNavbarActiveSection("/annuaire-outils")).toBeNull();
  });

  it("renders the historical centered two-column selector", async () => {
    const source = await readFile(
      new URL("../src/components/Navbar.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("Workflow");
    expect(source).toContain("BookOpen");
    expect(source).not.toContain("PencilRuler");
    expect(source).toContain("Système métier");
    expect(source).toContain("Académie");
    expect(source).toContain('href="/systemes"');
    expect(source).toContain('href="/academie"');
    expect(source).toContain('aria-current={activeSection === "systems"');
    expect(source).toContain('aria-current={activeSection === "academy"');
    expect(source).not.toContain('aria-current={activeSection === "sur-mesure"');
    expect(source).toContain("data-navbar-section-selector");
    expect(source).toContain("max-w-[55.2rem] grid-cols-2");
    expect(source).toContain(
      "px-[0.84rem] pb-3 pt-3 md:px-[1.4rem] md:pb-4 md:pt-4 lg:px-[3.36rem]",
    );
    expect(source).toContain("bg-dema-sage text-dema-forest");
    expect(source.indexOf("</nav>")).toBeLessThan(
      source.indexOf("data-navbar-section-selector"),
    );
    expect(source).not.toContain("Voir les services");
    expect(source).not.toContain("Trouver mon système");
    expect(source).not.toContain("Sur mesure</span>");
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

    expect(memberSource).toContain("<Navbar hideSectionSelector minimal />");
    expect(memberSource).toContain("<CustomerSpaceAccessForm returnTo=\"/mon-espace\" simple />");
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
    expect(actionPlanNavSource).toContain("Accompagnement");
    expect(actionPlanNavSource).toContain('{ view: "academy"');
    expect(actionPlanNavSource).toContain("onViewChange(view)");
    expect(actionPlanNavSource).toContain("xl:min-h-11");
    expect(experienceSource).toContain("<ActionPlanNavbar");
    expect(experienceSource).toContain("<ActionPlanAcademyPanel");
    expect(experienceSource).not.toContain('aria-label="Votre résultat"');
  });
});
