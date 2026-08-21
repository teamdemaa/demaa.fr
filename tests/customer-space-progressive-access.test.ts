import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/CustomerSpaceAccessForm.tsx", "utf8");
const experience = readFileSync("src/components/ActionPlanExperience.tsx", "utf8");
const googleButton = readFileSync("src/components/GoogleCustomerSignInButton.tsx", "utf8");
const loginDialog = readFileSync("src/components/CustomerSpaceLoginDialog.tsx", "utf8");
const loginPage = readFileSync("src/app/(french)/(auth)/connexion/page.tsx", "utf8");
const sharedLoginPage = readFileSync("src/components/CustomerConnexionPage.tsx", "utf8");
const applicationError = readFileSync("src/app/(french)/(application)/error.tsx", "utf8");
const authCopy = readFileSync("src/lib/auth-ui-copy.ts", "utf8");

describe("progressive plan authentication", () => {
  it("starts with one Google option and one email action", () => {
    expect(source).toContain('type ProgressiveAccessStep = "choice" | "email" | "password"');
    expect(source).toContain('useState<ProgressiveAccessStep>("choice")');
    expect(source).toContain("getAuthUiCopy(localeCode)");
    expect(source).toContain("choiceTitle ?? copy.access.defaultChoiceTitle");
    expect(source).toContain("<GoogleCustomerSignInButton");
    expect(source).toContain("large");
    expect(googleButton).toContain("copy.google.continue");
    expect(source).toContain("copy.access.continueWithEmail");
    expect(authCopy).toContain('continue: "Continuer avec Google"');
    expect(authCopy).toContain('continueWithEmail: "Continuer avec mon e-mail"');
    expect(experience).toContain("choiceTitle={uiCopy.savePlan}");
    expect(source).not.toContain("J’ai déjà un compte");
    expect(experience).not.toContain("Votre plan sera généré et enregistré dans votre espace.");
  });

  it("validates the email locally before revealing the password", () => {
    expect(source).toContain('progressiveStep === "email"');
    expect(source).toContain("disabled={!emailReady}");
    expect(source).toContain('setProgressiveStep("password")');
    expect(source).toContain('aria-invalid={email.length > 0 && !emailReady}');
    expect(source).not.toContain("fetchSignInMethodsForEmail");
  });

  it("keeps account creation and sign-in as an explicit reversible choice", () => {
    expect(source).toContain("copy.access.createTitle");
    expect(source).toContain("copy.access.welcomeBackTitle");
    expect(source).toContain("copy.access.signIn");
    expect(source).toContain("copy.access.createAccess");
    expect(source).toContain('mode: mode === "create" ? "signin" : "create"');
    expect(source).toContain("copy.access.edit");
    expect(source).toContain("copy.access.backToOptions");
    expect(source).toContain("copy.access.backToEmail");
    expect(source).toContain("copy.access.forgotPassword");
    expect(source).toContain("CustomerSessionExchangeError");
    expect(source).toContain("copy.errors.workspacePreparationFailed");
  });

  it("preserves the accessible bottom-sheet contract", () => {
    expect(experience).toContain('role="dialog"');
    expect(experience).toContain('aria-modal="true"');
    expect(experience).toContain('aria-labelledby="action-plan-access-title"');
    expect(experience).toContain("env(safe-area-inset-bottom)");
    expect(experience).toContain("max-w-[430px]");
    expect(experience).toContain("useAccessibleDialog({");
    expect(source).toContain("min-h-[54px]");
    expect(source).not.toContain("Annuler");
    expect(source).not.toContain("onCancel");
    expect(loginDialog).toContain("copy.page.close");
    expect(authCopy).toContain('close: "Fermer"');
    expect(authCopy).toContain('close: "Close"');
    expect(experience).toContain("aria-label={uiCopy.close}");
  });

  it("does not move generation or generated output into the access form", () => {
    expect(source).not.toContain("runAuthenticatedActionPlanGeneration");
    expect(source).not.toContain("ActionPlanGenerationScreen");
    expect(source).not.toContain("sessionStorage");
    expect(experience).toContain("createActionPlanGenerationDraft");
    expect(experience).toContain("runAuthenticatedActionPlanGeneration");
  });

  it("keeps an escape path when a valid session has no usable company", () => {
    expect(loginPage).toContain('<CustomerConnexionPage localeCode="fr"');
    expect(sharedLoginPage).toContain("ensureDefaultCompanyForIdentity(");
    expect(sharedLoginPage).toContain("getConfiguredVisitorCommercialContext(localeCode)");
    expect(sharedLoginPage).toContain("companyContextUnavailable");
    expect(sharedLoginPage).toContain("<CustomerLogoutButton localeCode={localeCode} />");
    expect(applicationError).toContain("<CustomerLogoutButton />");
  });
});
