import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("unified app and coaching", () => {
  it("opens saved plans on the canonical in-app route", () => {
    const experience = read("src/components/ActionPlanExperience.tsx");
    const nextConfig = read("next.config.ts");

    expect(experience).toContain("/plans/");
    expect(nextConfig).toContain("source: '/mon-espace/plans/:id'");
    expect(nextConfig).toContain("destination: '/plans/:id'");
  });

  it("does not expose the generated summary as a saved-page hero", () => {
    const canonicalPage = read("src/app/(application)/plans/[id]/page.tsx");
    expect(canonicalPage).not.toContain("stored.plan.summary");
    expect(canonicalPage).toContain("SavedActionPlanDetail");
  });

  it("returns authenticated access directly to the app instead of a parallel portal", () => {
    const nextConfig = read("next.config.ts");
    const plansPage = read("src/app/(application)/plans/page.tsx");
    const accountAccessForm = read("src/components/CustomerSpaceAccessForm.tsx");

    expect(nextConfig).toContain("source: '/mon-espace'");
    expect(nextConfig).toContain("destination: '/plans/latest'");
    expect(plansPage).toContain("getActionPlanIndexForIdentity");
    expect(nextConfig).not.toContain("Espace membre");
    expect(plansPage).toContain("Mes plans");
    expect(plansPage).not.toContain("Espace membre");
    expect(accountAccessForm).not.toContain("espace membre");
    expect(accountAccessForm).not.toContain("votre espace Demaa");
  });

  it("keeps specialist messaging simple and moves coach business to Services", () => {
    const coaching = read("src/components/CoachingPanel.tsx");
    const offers = read("src/lib/specialist-offers.ts");
    const serviceCatalog = read("src/lib/canonical-service-catalog.ts");
    const services = read("src/components/ServicesCatalog.tsx");
    const coachingControl = read("src/components/ActionPlanCoachingControl.tsx");
    const appNavigation = read("src/components/ActionPlanNavbar.tsx");
    expect(coaching).toContain("L’équipe Demaa vous aide gratuitement à identifier le blocage");
    expect(coaching).toContain("Clarifier ma situation");
    expect(coaching).toContain("Découvrir Coach business");
    expect(coaching).not.toContain("Inclut 12 % de réduction sur les accompagnements Demaa éligibles");
    expect(coaching).not.toContain("149 €");
    expect(coaching).not.toContain('role="tablist"');
    expect(serviceCatalog).toContain('slug: "coach-business"');
    expect(serviceCatalog).toContain("matching avec un coach adapté");
    expect(serviceCatalog).toContain("750 €");
    expect(serviceCatalog).toContain("Deux rendez-vous individuels de 60 minutes par mois");
    expect(serviceCatalog).toContain("suivi entre les rendez-vous");
    expect(coaching).toContain("Écrivez ou dictez votre message.");
    expect(serviceCatalog).toMatch(/slug: "coach-business"[\s\S]*?monthlyAccompanimentDiscountEligible: false/);
    expect(services).not.toContain("CoachBusinessServiceCard");
    expect(offers).toContain('title: "Coach business · accompagnement mensuel"');
    expect(offers).not.toContain("149 €");
    expect(offers).toContain('price: "750 € HT / mois"');
    expect(coaching).toContain("interimResults: true");
    expect(coaching).toContain("useSpeechDictation");
    expect(coaching).not.toContain("Dictée en cours… le texte apparaît dans le message.");
    expect(coaching).not.toContain("Vous pourrez envoyer votre message après la connexion.");
    expect(coaching).toContain('aria-expanded={open}');
    expect(coaching).toContain('inert={!open}');
    expect(coaching).toContain('access.freeStatus !== "completed"');
    expect(coaching).toContain("Deux rendez-vous individuels de 60 minutes par mois");
    expect(coaching).toContain("Un suivi entre les rendez-vous");
    expect(coaching).toContain('fetch("/api/coaching-draft"');
    expect(coaching).toContain('onRequireAccess?.({ draftToken, tab: "messages" })');
    expect(coaching).toContain("initialDraftToken");
    expect(coaching).toContain("Votre texte est conservé : réessayez.");
    expect(coaching).not.toContain("Continuer par e-mail");
    expect(coaching).not.toContain("disponible prochainement");
    expect(coachingControl).toContain("Échanger");
    expect(coachingControl).toContain("onClick={() => setOpen(true)}");
    expect(coachingControl).toContain('url.searchParams.delete("intent")');
    expect(coachingControl).toContain("window.history.replaceState");
    expect(coachingControl).toContain("onRequireAccess={isAuthenticated ? undefined");
    expect(coachingControl).toContain('"Connectez-vous pour envoyer"');
    expect(coachingControl).not.toContain("Connectez-vous pour envoyer votre message et retrouver la réponse.");
    expect(coachingControl).toContain('params.set("draftToken", accessIntent.draftToken)');
    expect(coachingControl).not.toContain("SpecialistOffer");
    expect(coachingControl).toContain("/api/action-plans");
    expect(coachingControl).not.toContain(
      "Entrez votre adresse e-mail pour recevoir un lien sécurisé et continuer dans l’application.",
    );
    expect(coachingControl).toContain('new URLSearchParams({ intent: "coaching", tab: accessIntent.tab })');
    expect(appNavigation).not.toContain("Opportunités");
    expect(appNavigation).not.toContain('label: "Coaching"');
  });

  it("exposes specialist access before and after plan generation", () => {
    const experience = read("src/components/ActionPlanExperience.tsx");
    const noPlanBranch = experience.slice(
      experience.indexOf("if (!plan)"),
      experience.indexOf("if (!workspace)"),
    );
    const planBranch = experience.slice(experience.indexOf("if (!workspace)"));

    expect(noPlanBranch).toContain("<ActionPlanCoachingControl");
    expect(planBranch).toContain("<ActionPlanCoachingControl");
    expect(planBranch).toContain("accessPlan={{");
    expect(planBranch).toContain("sourceText: situation.trim()");
    expect(planBranch).toContain("generation,");
    expect(read("src/components/ActionPlanCoachingControl.tsx")).toContain("handleAuthenticated");
  });

  it("uses one Firebase session endpoint for password and Google", () => {
    const access = read("src/components/CustomerSpaceAccessForm.tsx");
    const google = read("src/components/GoogleCustomerSignInButton.tsx");
    expect(access).toContain("exchangeFirebaseIdTokenForSession");
    expect(google).toContain("exchangeFirebaseIdTokenForSession");
    expect(access).not.toContain("/api/customer-space/firebase-session");
    expect(google).not.toContain("/api/customer-space/firebase-session");
    expect(access).not.toContain("magic-link");
  });
});
