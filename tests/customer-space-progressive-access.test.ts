import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/components/CustomerSpaceAccessForm.tsx", "utf8");
const experience = readFileSync("src/components/ActionPlanExperience.tsx", "utf8");
const googleButton = readFileSync("src/components/GoogleCustomerSignInButton.tsx", "utf8");
const loginDialog = readFileSync("src/components/CustomerSpaceLoginDialog.tsx", "utf8");

describe("progressive plan authentication", () => {
  it("starts with one Google option and one email action", () => {
    expect(source).toContain('type ProgressiveAccessStep = "choice" | "email" | "password"');
    expect(source).toContain('useState<ProgressiveAccessStep>("choice")');
    expect(source).toContain('choiceTitle = "Accédez à votre espace"');
    expect(source).toContain("<GoogleCustomerSignInButton");
    expect(source).toContain("large");
    expect(googleButton).toContain("Continuer avec Google");
    expect(source).toContain("Continuer avec mon e-mail");
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
    expect(source).toContain('"Créez votre accès"');
    expect(source).toContain('"Bon retour"');
    expect(source).toContain('"Se connecter"');
    expect(source).toContain('"Créer mon accès"');
    expect(source).toContain('mode: mode === "create" ? "signin" : "create"');
    expect(source).toContain("Modifier");
    expect(source).toContain("Retour aux options de connexion");
    expect(source).toContain("Retour à l’étape e-mail");
    expect(source).toContain("Mot de passe oublié ?");
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
    expect(loginDialog).toContain('localeCode === "en" ? "Close" : "Fermer"');
    expect(experience).toContain("aria-label={uiCopy.close}");
  });

  it("does not move generation or generated output into the access form", () => {
    expect(source).not.toContain("runAuthenticatedActionPlanGeneration");
    expect(source).not.toContain("ActionPlanGenerationScreen");
    expect(source).not.toContain("sessionStorage");
    expect(experience).toContain("createActionPlanGenerationDraft");
    expect(experience).toContain("runAuthenticatedActionPlanGeneration");
  });
});
