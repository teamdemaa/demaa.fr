import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("public guest action-plan experience", () => {
  it("keeps the homepage outside customer authentication and legacy plan redirects", () => {
    const home = source("src/components/ActionPlanHomeView.tsx");
    const pages = source("src/lib/action-plan-pages.server.ts");
    const guestLoader = pages.slice(
      pages.indexOf("if (isGuestProductEnabled())"),
      pages.indexOf("const identity =", pages.indexOf("if (isGuestProductEnabled())")),
    );

    expect(home).toContain("<GuestActionPlanExperience");
    expect(home).toContain("if (!guestProductEnabled)");
    expect(home).toContain("<Navbar localeCode={config.localeCode} minimal />");
    expect(guestLoader).not.toContain("getCurrentCustomerAppIdentityFromSession");
    expect(guestLoader).not.toContain("ensureDefaultCompanyForIdentity");
    expect(guestLoader).not.toContain("paths.latest");
    expect(guestLoader).toContain("guestProductEnabled: true");
  });

  it("provides a focused Diagnostic page with an explicit close control and no public navbar", () => {
    const page = source("src/app/(application)/diagnostic-organisation/page.tsx");
    const home = source("src/components/ActionPlanHomeView.tsx");
    const experience = source("src/components/GuestActionPlanExperience.tsx");
    const hero = source("src/components/ActionPlanHeroTitle.tsx");

    expect(page).toContain("focusedDiagnostic");
    expect(page).toContain('robots: { index: false, follow: true }');
    expect(home).toContain("!focusedDiagnostic ? <Navbar");
    expect(experience).toContain("focusedDiagnostic ? (");
    expect(experience).toContain("closeFocusedDiagnostic");
    expect(experience).toContain("Fermer le diagnostic et revenir à la page précédente");
    expect(experience).toContain('variant={focusedDiagnostic ? "diagnostic" : "default"}');
    expect(hero).toContain("Identifier ce qu’il faut mettre en place pour gagner du temps.");
    expect(hero).toContain("processus, ressources et solutions adaptés");
  });

  it("removes customer entry points while keeping the rollback code behind the flag", () => {
    const pages = source("src/lib/action-plan-pages.server.ts");
    const footer = source("src/components/Footer.tsx");
    const signInPage = source("src/app/(auth)/connexion/page.tsx");
    const googlePage = source("src/app/(auth)/auth/google/page.tsx");
    const interceptedSignIn = source("src/app/@modal/(.)connexion/page.tsx");
    const sessionRoute = source("src/app/api/auth/session/route.ts");

    expect(pages.match(/redirectRetiredCustomerRoute\(/g)).toHaveLength(5);
    expect(footer).toContain("const showCustomerLogin = !isGuestProductEnabled()");
    expect(footer).toContain("{showCustomerLogin ? (");
    expect(signInPage).toContain('if (isGuestProductEnabled()) redirect("/")');
    expect(googlePage).toContain('if (isGuestProductEnabled()) redirect("/")');
    expect(interceptedSignIn).toContain('if (isGuestProductEnabled()) redirect("/")');
    expect(sessionRoute.match(/isGuestProductEnabled\(\)/g)).toHaveLength(2);
    expect(sessionRoute).toContain("retiredCustomerSessionResponse");
  });

  it("renders a read-only guest result with e-mail and Diagnostic, without chat or Pilotage", () => {
    const experience = source("src/components/GuestActionPlanExperience.tsx");
    const result = source("src/components/GuestActionPlanResult.tsx");
    const delivery = source("src/components/GuestActionPlanDelivery.tsx");
    const diagnostic = source("src/components/GuestDiagnosticControl.tsx");

    expect(experience).toContain("startGuestActionPlanGeneration");
    expect(experience).toContain("readGuestActionPlan");
    expect(experience).toContain("resumeGuestActionPlanGeneration");
    expect(experience).toContain("waitForGuestGeneration");
    expect(experience).toContain("<GuestActionPlanResult");
    expect(experience).toContain("<GuestActionPlanDelivery");
    expect(experience).toContain("<GuestDiagnosticControl");
    expect(delivery).toContain("Demander un diagnostic de mon organisation");
    expect(delivery).toContain(
      "L’équipe Demaa analyse votre situation et vous propose des pistes concrètes pour améliorer votre organisation.",
    );
    expect(diagnostic).toContain("Demander un diagnostic de mon organisation");
    expect(diagnostic).toContain(
      "L’équipe Demaa analyse votre situation et vous propose des pistes concrètes pour améliorer votre organisation.",
    );
    expect(experience).toContain('access={actionPlan ? access : null}');
    expect(experience).toContain('key={actionPlan && access ? access.generationId : "without-plan"}');
    expect(experience).toContain("situation={situation}");
    expect(experience).not.toContain("{actionPlan && access ? (\n        <GuestDiagnosticControl");
    expect(experience).toContain("onOpenDiagnostic={() => setDiagnosticOpen(true)}");
    expect(experience).not.toContain("CustomerSpaceAccessForm");
    expect(experience).not.toContain("ActionPlanCoachingControl");
    expect(experience).not.toContain("ActionPlanGenerationBar");
    expect(experience).not.toContain("CompanyPilotagePanel");
    expect(experience).not.toContain('import ActionPlanResult from');
    expect(experience).not.toContain('aria-label="Contenu du plan"');
    expect(experience).not.toContain("<ActionPlanSystemPanel");
    expect(experience).not.toContain('>Chiffres<');
    expect(experience).not.toContain('>Stratégie<');
    expect(experience).toContain('text-[0.8rem] font-light leading-relaxed text-brand-blue/28');
    expect(result).toContain("<details");
    expect(result).not.toContain("onWorkspaceChange");
    expect(result).not.toContain("Disponible pendant 24 h");
    expect(delivery).toContain('submitGuestActionPlanFollowUp("email"');
    expect(delivery).toContain("onOpenDiagnostic");
    expect(diagnostic).toContain('submitGuestActionPlanFollowUp("diagnostic"');
    expect(diagnostic).toContain("submitGuestDiagnosticWithoutPlan");
    expect(diagnostic).toContain("required={!access}");
    expect(diagnostic).toContain("contactConsent");
    expect(diagnostic).toContain("Qu’est-ce qui vous prend trop de temps aujourd’hui ?");
    expect(diagnostic).toContain('role="dialog"');
    expect(diagnostic).toContain('aria-label="Ouvrir le diagnostic de mon organisation"');
    expect(diagnostic).toContain("Diagnostic organisation");
    expect(delivery).toContain('rounded-full bg-dema-forest px-5 text-sm font-medium text-white');
    expect(diagnostic).not.toContain("Précision <span");
    expect(diagnostic).not.toContain("CoachBusinessPromo");

    const authenticatedExperience = source("src/components/ActionPlanExperience.tsx");
    expect(authenticatedExperience).toContain(
      'text-[0.8rem] font-light leading-relaxed text-brand-blue/28',
    );
  });

  it("stores only temporary access coordinates, never generated plan content", () => {
    const client = source("src/lib/guest-action-plan.client.ts");
    expect(client).toContain("window.sessionStorage.setItem");
    expect(client).not.toContain("window.localStorage");
    expect(client).not.toContain("JSON.stringify(actionPlan)");
    expect(client).toContain("Authorization: `Bearer ${access.accessKey}`");
  });
});
