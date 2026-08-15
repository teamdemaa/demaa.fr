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
    expect(pageSource).toContain("buildPublicSystemAppHref");
    expect(pageSource).not.toContain("systemTab: normalizedInitialTab");
    expect(pageSource).not.toContain("/?view=system");
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
    expect(homeSource).toContain(
      "<Navbar anonymousLanding isAuthenticated={Boolean(identity)} minimal />",
    );
    expect(homeSource).toContain("getIdentityFromCustomerSessionToken(sessionToken)");
    expect(systemsSource).toContain('canonical: "/systemes"');
    expect(nextConfigSource).not.toMatch(
      /source: '\/systemes',[\s\S]*?destination: '\/',/,
    );
    expect(nextConfigSource).toMatch(
      /source: '\/kits-operationnels',[\s\S]*?destination: '\/systemes',/,
    );
  });

  it("replaces the sign-in action with account access once a session is active", async () => {
    const [navbarSource, savedPlanSource] = await Promise.all([
      readFile(new URL("../src/components/Navbar.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/plans/[id]/page.tsx", import.meta.url), "utf8"),
    ]);

    expect(navbarSource).toContain('aria-label="Ouvrir le menu du compte"');
    expect(navbarSource).not.toContain('window.location.assign("/")');
    expect(navbarSource).not.toContain("openAuthenticatedAccount");
    expect(navbarSource).not.toContain("<span>Mon espace</span>");
    expect(navbarSource).toContain('href="/plans"');
    expect(navbarSource).toContain('action="/api/customer-space/logout?returnTo=%2F"');
    expect(navbarSource).toContain("Se déconnecter");
    expect(navbarSource).toContain('href="/connexion?returnTo=%2Fplans"');
    expect(navbarSource).toContain("<span>Connexion</span>");
    expect(navbarSource).not.toContain("<LogIn");
    expect(savedPlanSource).toContain("<Navbar anonymousLanding isAuthenticated minimal />");
  });

  it("keeps sign-in minimal and intercepts it over the homepage", async () => {
    const [legacySource, loginSource, modalSource] = await Promise.all([
      readFile(new URL("../src/app/mon-espace/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/connexion/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/@modal/(.)connexion/page.tsx", import.meta.url), "utf8"),
    ]);

    expect(legacySource).toContain('redirect("/plans")');
    expect(loginSource).toContain("<Navbar minimal />");
    expect(loginSource).toContain("<CustomerSpaceAccessForm returnTo={returnTo} simple />");
    expect(loginSource).toContain("Se connecter");
    expect(loginSource).not.toContain("Mes plans");
    expect(loginSource).not.toContain("Mon espace");
    expect(modalSource).toContain("<CustomerSpaceLoginDialog />");
  });

  it("restores the latest saved plan unless a new situation is explicitly requested", async () => {
    const [homeSource, plansSource, loginDialogSource] = await Promise.all([
      readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/plans/page.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/CustomerSpaceLoginDialog.tsx", import.meta.url), "utf8"),
    ]);

    expect(homeSource).toContain('redirect("/plans")');
    expect(homeSource).toContain("shouldRedirectAuthenticatedHomeToPlans");
    expect(homeSource).toContain("planTab?: string | string[]");
    expect(plansSource).toContain('redirect(latestPlan ? `/plans/${latestPlan.id}` : "/?new=1")');
    expect(loginDialogSource).toContain('<CustomerSpaceAccessForm returnTo="/plans" simple />');
  });

  it("shows application navigation before generation and fixes it at the bottom on mobile", async () => {
    const [navbarSource, actionPlanNavSource, experienceSource, layoutSource] = await Promise.all([
      readFile(new URL("../src/components/Navbar.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/ActionPlanNavbar.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/ActionPlanExperience.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8"),
    ]);

    expect(navbarSource).toContain('id="action-plan-navbar-desktop"');
    expect(navbarSource).toContain('id="action-plan-navbar-mobile"');
    expect(navbarSource).toContain('className="sticky top-0 z-40 bg-dema-cream/92');
    expect(navbarSource).not.toContain('className="sticky top-0 z-40 border-b');
    expect(navbarSource).toContain("fixed inset-x-0 bottom-0");
    expect(navbarSource).toContain("w-[min(40vw,36rem)]");
    expect(navbarSource).toContain("empty:hidden xl:block");
    expect(navbarSource).toContain("empty:hidden xl:hidden");
    expect(actionPlanNavSource).toContain("Plan d’action");
    expect(actionPlanNavSource).toContain("Solutions");
    expect(actionPlanNavSource).toContain("Académie");
    expect(actionPlanNavSource).toContain("Opportunités");
    expect(actionPlanNavSource).not.toContain('label: "Système"');
    expect(actionPlanNavSource.indexOf('label: "Plan d’action"')).toBeLessThan(
      actionPlanNavSource.indexOf('label: "Solutions"'),
    );
    expect(actionPlanNavSource.indexOf('label: "Solutions"')).toBeLessThan(
      actionPlanNavSource.indexOf('label: "Académie"'),
    );
    expect(actionPlanNavSource.indexOf('label: "Académie"')).toBeLessThan(
      actionPlanNavSource.indexOf('label: "Opportunités"'),
    );
    expect(actionPlanNavSource).toContain("grid-cols-4");
    expect(actionPlanNavSource).toContain("h-4 w-4 shrink-0 transition");
    expect(actionPlanNavSource).toContain("rounded-[1.1rem]");
    expect(actionPlanNavSource).toContain("bg-dema-sage text-dema-forest xl:bg-transparent");
    expect(actionPlanNavSource).toContain("hidden h-0.5");
    expect(actionPlanNavSource).toContain("xl:block");
    expect(actionPlanNavSource).toContain("scale-x-100 opacity-100");
    expect(actionPlanNavSource).toContain("scale-x-0 opacity-0");
    expect(actionPlanNavSource).not.toContain("rounded-[1.45rem] border");
    expect(actionPlanNavSource).not.toContain("xl:hidden");
    expect(actionPlanNavSource).not.toContain('activeView === "system" ? "plan"');
    expect(actionPlanNavSource).not.toContain('label: "Accompagnement"');
    expect(actionPlanNavSource).not.toContain('label: "Coaching"');
    expect(actionPlanNavSource).toContain('{ view: "academy"');
    expect(actionPlanNavSource).toContain("onViewChange(view)");
    expect(actionPlanNavSource).toContain("xl:min-h-11");
    expect(navbarSource).toContain("pb-[calc(1rem+env(safe-area-inset-bottom))]");
    expect(layoutSource).toContain('viewportFit: "cover"');
    expect(experienceSource).toContain("<ActionPlanNavbar");
    expect(experienceSource).toContain("workspace={prePlanWorkspace}");
    expect(experienceSource).toContain('activeTab === "opportunities"');
    expect(experienceSource).toContain("<ActionPlanAcademyPanel");
    expect(experienceSource).toContain("<ActionPlanCoachingControl");
    expect(experienceSource).toContain("<OpportunitiesPanel");
    expect(experienceSource).not.toContain('aria-label="Votre résultat"');
  });
});
