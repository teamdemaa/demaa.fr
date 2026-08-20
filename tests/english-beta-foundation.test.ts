import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("hidden English beta foundation", () => {
  it("keeps /en server-flagged and out of indexing before product activation", () => {
    const page = source("src/app/(english)/en/page.tsx");
    const layout = source("src/app/(english)/en/layout.tsx");
    expect(page).toContain("isEnglishBetaEnabled()");
    expect(page).toContain("notFound()");
    expect(page).toContain("robots: { follow: false, index: false }");
    expect(page).toContain('canonical: "/en"');
    expect(page).toContain('loadActionPlanHomePage({ localeCode: "en"');
    expect(layout).toContain('lang="en"');
    expect(layout).toContain("<html");
    expect(layout).not.toContain("DocumentLocale");
    expect(layout).not.toContain("document.documentElement.lang");
  });

  it("reuses the shared action-plan experience and English system projection", () => {
    const page = source("src/app/(english)/en/page.tsx");
    const sharedHome = source("src/components/ActionPlanHomeView.tsx");
    const config = source("src/lib/action-plan-page-config.ts");
    const localization = source("src/lib/action-plan-localization.ts");
    expect(page).toContain("<ActionPlanHomeView");
    expect(sharedHome).toContain("<ActionPlanExperience");
    expect(sharedHome).toContain("contentLocaleCode={config.localeCode}");
    expect(sharedHome).toContain("marketCodeAtCreation={config.marketCode}");
    expect(sharedHome).toContain("getActionPlanSystemOptionsForContext");
    expect(config).toContain('"global-en-beta": ["plan", "solutions", "academy"]');
    const projections = source("src/lib/action-plan-system-projections.ts");
    expect(localization).toContain("englishActionPlanSystemIds");
    expect(projections).toContain('"formation-en-ligne"');
    expect(sharedHome).not.toContain("generateActionPlanWithMetadata");
  });

  it("keeps English plans in the same authenticated company plan space", () => {
    const latest = source("src/app/(english)/en/plans/latest/page.tsx");
    const detail = source("src/app/(english)/en/plans/[id]/page.tsx");
    const sharedLoader = source("src/lib/action-plan-pages.server.ts");
    const sharedView = source("src/components/SavedActionPlanPageView.tsx");
    expect(latest).toContain('redirectToLatestActionPlan("en")');
    expect(detail).toContain('localeCode: "en"');
    expect(sharedLoader).toContain("getActionPlanWorkspacePageForIdentity(identity, input.id)");
    expect(sharedView).toContain("stored.contentLocaleCode");
    expect(sharedView).toContain("interfaceLocaleCode={config.localeCode}");
  });

  it("localizes the shared shell without loading French-only plan aids", () => {
    const consent = source("src/components/CookieConsentManager.tsx");
    const result = source("src/components/ActionPlanResult.tsx");
    const contextualAids = source("src/hooks/useActionPlanContextualAids.ts");
    expect(consent).toContain('pathname === "/en" || pathname.startsWith("/en/")');
    expect(consent).toContain('region: "Privacy preferences"');
    expect(consent).toContain('accept: "Accept all"');
    expect(result).toContain('enabled: localeCode === "fr"');
    expect(contextualAids).toContain("if (!enabled || !input.systemId");
  });

  it("keeps standalone authentication and Google callbacks in the return locale", () => {
    const connexion = source("src/app/(french)/(auth)/connexion/page.tsx");
    const interceptedConnexion = source(
      "src/app/(french)/@modal/(.)connexion/page.tsx",
    );
    const loginDialog = source("src/components/CustomerSpaceLoginDialog.tsx");
    const googlePage = source("src/app/(french)/(auth)/auth/google/page.tsx");
    const googleCallback = source("src/app/(french)/(auth)/auth/google/GoogleAuthCallbackClient.tsx");

    expect(connexion).toContain("getReturnToInterfaceLocale(returnTo)");
    expect(connexion).toContain('<DocumentLocale localeCode={localeCode}');
    expect(connexion).toContain('<Navbar minimal localeCode={localeCode}');
    expect(connexion).toContain('localeCode === "en" ? "Sign in" : "Connectez-vous"');
    expect(interceptedConnexion).toContain("localeCode={localeCode}");
    expect(loginDialog).toContain('localeCode === "en" ? "Close" : "Fermer"');
    expect(googlePage).toContain("getReturnToInterfaceLocale(returnTo)");
    expect(googlePage).toContain('<DocumentLocale localeCode={localeCode}');
    expect(googleCallback).toContain('localeCode === "en" ? "Signing in with Google"');
    expect(googleCallback).toContain('localeCode === "en" ? "Try again with Google"');
  });
});
