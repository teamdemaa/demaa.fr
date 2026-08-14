import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("unified app and coaching", () => {
  it("opens saved plans on the canonical in-app route", () => {
    const email = read("src/lib/customer-space-email.ts");
    const saveControl = read("src/components/ActionPlanSaveControl.tsx");
    const legacyPage = read("src/app/mon-espace/plans/[id]/page.tsx");

    expect(email).toContain("Ouvrir mon plan");
    expect(email).not.toContain("Accéder à mon espace Demaa");
    expect(saveControl).toContain("/plans/");
    expect(legacyPage).toContain("redirect(`/plans/");
  });

  it("does not expose the generated summary as a saved-page hero", () => {
    const canonicalPage = read("src/app/plans/[id]/page.tsx");
    expect(canonicalPage).not.toContain("stored.plan.summary");
    expect(canonicalPage).toContain("SavedActionPlanDetail");
  });

  it("returns authenticated access directly to the app instead of a parallel portal", () => {
    const legacyAccountPage = read("src/app/mon-espace/page.tsx");
    const plansPage = read("src/app/plans/page.tsx");
    const accountAccessForm = read("src/components/CustomerSpaceAccessForm.tsx");

    expect(legacyAccountPage).toContain('redirect("/plans")');
    expect(plansPage).toContain('redirect(latestPlan ? `/plans/${latestPlan.id}` : "/?new=1")');
    expect(legacyAccountPage).not.toContain("Mon espace");
    expect(plansPage).not.toContain("Mes plans");
    expect(plansPage).not.toContain("Espace membre");
    expect(accountAccessForm).not.toContain("espace membre");
    expect(accountAccessForm).not.toContain("votre espace Demaa");
  });

  it("keeps specialist messaging simple and moves coach business to Services", () => {
    const coaching = read("src/components/CoachingPanel.tsx");
    const offers = read("src/lib/specialist-offers.ts");
    const coachBusiness = read("src/components/CoachBusinessServiceCard.tsx");
    const services = read("src/components/ServicesCatalog.tsx");
    const coachingControl = read("src/components/ActionPlanCoachingControl.tsx");
    const appNavigation = read("src/components/ActionPlanNavbar.tsx");
    expect(coaching).toContain("Échanger avec un spécialiste");
    expect(coaching).toContain("Clarté · 149 € HT / mois");
    expect(coaching).toContain('aria-haspopup="dialog"');
    expect(coaching).toContain("L’équipe Demaa mobilisable selon le besoin");
    expect(coaching).toContain("Mises en relation facilitées");
    expect(coaching).toContain("15 % de réduction sur les autres offres Demaa");
    expect(coaching).toContain(
      "Mise en avant prioritaire de votre profil pour les opportunités correspondant à votre expertise",
    );
    expect(coaching).not.toContain('role="tablist"');
    expect(coaching).not.toContain("Choisir Clarté");
    expect(coaching).not.toContain("Choisir Maestro");
    expect(coaching).not.toContain("premier échange offert");
    expect(coachBusiness).toContain("Coach business");
    expect(coachBusiness).toContain("Matching guidé avec le bon coach");
    expect(coachBusiness).toContain("Être rappelé(e)");
    expect(coachBusiness).toContain("350 €");
    expect(coachBusiness).toContain("550 €");
    expect(coachBusiness).toContain("15 % de réduction pour les abonnés Clarté");
    expect(services).toContain("<CoachBusinessServiceCard />");
    expect(offers).toContain('title: "Clarté"');
    expect(offers).toContain('title: "Coach business · 1 session / mois"');
    expect(offers).toContain('title: "Coach business · 2 sessions / mois"');
    expect(offers).toContain('price: "149 € HT / mois"');
    expect(offers).toContain('price: "350 € HT / mois"');
    expect(offers).toContain('price: "550 € HT / mois"');
    expect(coachBusiness).not.toContain("150 € HT");
    expect(coachBusiness).not.toContain("400 € HT");
    expect(coachBusiness).not.toContain("Pilotage rapproché");
    expect(coaching).toContain("interimResults: true");
    expect(coaching).toContain("useSpeechDictation");
    expect(coaching).toContain("Dictée en cours… le texte apparaît dans le message.");
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
    expect(coachingControl).toContain("onRequireAccess={initialEmail ? undefined");
    expect(coachingControl).toContain("Connectez-vous pour envoyer votre message et retrouver la réponse.");
    expect(coachingControl).toContain('params.set("draftToken", accessIntent.draftToken)');
    expect(coachingControl).toContain("/api/action-plans");
    expect(coachingControl).not.toContain(
      "Entrez votre adresse e-mail pour recevoir un lien sécurisé et continuer dans l’application.",
    );
    expect(coachingControl).toContain('new URLSearchParams({ intent: "coaching", tab: intent.tab })');
    expect(appNavigation).toContain("Opportunités");
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
    expect(read("src/components/ActionPlanCoachingControl.tsx")).toContain(
      "if (!accessPlan)",
    );
  });

  it("keeps magic-link consumption on POST", () => {
    const consumeRoute = read("src/app/api/customer-space/consume/route.ts");
    const email = read("src/lib/customer-space-email.ts");
    expect(consumeRoute).toContain("export async function POST");
    expect(email).toContain('"/connexion"');
  });
});
