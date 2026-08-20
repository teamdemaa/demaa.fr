import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("hidden English beta foundation", () => {
  it("keeps /en server-flagged and out of indexing before product activation", () => {
    const page = source("src/app/(english)/en/page.tsx");
    expect(page).toContain("isEnglishBetaEnabled()");
    expect(page).toContain("notFound()");
    expect(page).toContain("robots: { follow: false, index: false }");
    expect(page).toContain('canonical: "/en"');
    expect(page).toContain("commercialContext: GLOBAL_ENGLISH_BETA_COMMERCIAL_CONTEXT");
    expect(page).toContain('pathname: "/en"');
    expect(page).toContain("<DocumentLocale localeCode={context.localeCode}");
    expect(page).toContain("document.documentElement.lang=");
  });

  it("reuses the shared action-plan experience and English system projection", () => {
    const page = source("src/app/(english)/en/page.tsx");
    const localization = source("src/lib/action-plan-localization.ts");
    expect(page).toContain("<ActionPlanExperience");
    expect(page).toContain('contentLocaleCode="en"');
    expect(page).toContain('marketCodeAtCreation="global-en-beta"');
    expect(page).toContain("englishActionPlanSystemOptions");
    expect(localization).toContain("ENGLISH_ACTION_PLAN_SYSTEM_IDS");
    expect(localization).toContain('"formation-en-ligne"');
    expect(page).not.toContain("generateActionPlanWithMetadata");
  });

  it("keeps English plans in the same authenticated company plan space", () => {
    const latest = source("src/app/(english)/en/plans/latest/page.tsx");
    const detail = source("src/app/(english)/en/plans/[id]/page.tsx");
    expect(latest).toContain("getActionPlanIndexForIdentity(identity)");
    expect(detail).toContain("getActionPlanWorkspacePageForIdentity(identity, id)");
    expect(detail).toContain("stored.contentLocaleCode");
    expect(detail).toContain('interfaceLocaleCode="en"');
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
    const connexion = source("src/app/(auth)/connexion/page.tsx");
    const interceptedConnexion = source("src/app/@modal/(.)connexion/page.tsx");
    const loginDialog = source("src/components/CustomerSpaceLoginDialog.tsx");
    const googlePage = source("src/app/(auth)/auth/google/page.tsx");
    const googleCallback = source("src/app/(auth)/auth/google/GoogleAuthCallbackClient.tsx");

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
