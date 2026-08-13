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

  it("publishes the validated coaching offer and tabs", () => {
    const coaching = read("src/components/CoachingPanel.tsx");
    const offers = read("src/lib/specialist-offers.ts");
    const coachingControl = read("src/components/ActionPlanCoachingControl.tsx");
    const appNavigation = read("src/components/ActionPlanNavbar.tsx");
    expect(coaching).toContain("Formules");
    expect(coaching).toContain("Messages");
    expect(coaching).toContain("Parler à un spécialiste");
    expect(coaching).toContain("premier échange offert");
    expect(coaching).toContain('title="Clarté"');
    expect(coaching).toContain('title="Maestro"');
    expect(coaching).toContain("Clarté pour décider maintenant. Maestro pour reprendre durablement");
    expect(coaching).toContain("Clarification et ajustement de votre stratégie avec la méthode ASOP");
    expect(coaching).toContain("Choisir Clarté");
    expect(coaching).toContain("Choisir Maestro");
    expect(coaching).not.toContain("Échanges avec Demaa");
    expect(coaching).not.toContain("Pilotage mensuel");
    expect(offers).toContain('title: "Clarté"');
    expect(offers).toContain('title: "Maestro · 1 session / mois"');
    expect(offers).toContain('title: "Maestro · 2 sessions / mois"');
    expect(offers).toContain('price: "149 € HT / mois"');
    expect(offers).toContain('price: "350 € HT / mois"');
    expect(offers).toContain('price: "550 € HT / mois"');
    expect(coaching).not.toContain("150 € HT");
    expect(coaching).not.toContain("400 € HT");
    expect(coaching).not.toContain("Pilotage rapproché");
    expect(coaching).not.toContain("180 € TTC");
    expect(coaching).not.toContain("480 € TTC");
    expect(coaching).not.toContain("15 minutes offertes");
    expect(coaching).not.toContain("Échange préalable");
    expect(coaching).toContain('useState<CoachingTab>(initialTab)');
    expect(coaching).toContain('(["messages", "formules"] as const)');
    expect(coaching).toContain("interimResults: true");
    expect(coaching).toContain("useSpeechDictation");
    expect(coaching).toContain("Dictée en cours… le texte apparaît dans le message.");
    expect(coaching).toContain("Identifiez-vous pour écrire votre message, conserver la conversation");
    expect(coaching).toContain("Premier échange offert");
    expect(coaching).toContain("Continuer par e-mail");
    expect(coaching).not.toContain("disponible prochainement");
    expect(coachingControl).toContain("Parler à un spécialiste");
    expect(coachingControl).toContain("onClick={() => setOpen(true)}");
    expect(coachingControl).toContain('url.searchParams.delete("intent")');
    expect(coachingControl).toContain("window.history.replaceState");
    expect(coachingControl).toContain("onRequireAccess={initialEmail ? undefined");
    expect(coachingControl).toContain("/api/action-plans");
    expect(coachingControl).not.toContain(
      "Entrez votre adresse e-mail pour recevoir un lien sécurisé et continuer dans l’application.",
    );
    expect(coachingControl).toContain('new URLSearchParams({ intent: "coaching", tab: intent.tab })');
    expect(coachingControl).toContain('params.set("offer", intent.offer)');
    expect(appNavigation).toContain("Opportunités");
    expect(appNavigation).not.toContain('label: "Coaching"');
  });

  it("only exposes specialist access once a plan exists", () => {
    const experience = read("src/components/ActionPlanExperience.tsx");
    const noPlanBranch = experience.slice(
      experience.indexOf("if (!plan)"),
      experience.indexOf("if (!workspace)"),
    );
    const planBranch = experience.slice(experience.indexOf("if (!workspace)"));

    expect(noPlanBranch).not.toContain("<ActionPlanCoachingControl");
    expect(planBranch).toContain("<ActionPlanCoachingControl");
    expect(planBranch).toContain("accessPlan={{");
    expect(planBranch).toContain("sourceText: situation.trim()");
    expect(planBranch).toContain("generation,");
  });

  it("keeps magic-link consumption on POST", () => {
    const consumeRoute = read("src/app/api/customer-space/consume/route.ts");
    const email = read("src/lib/customer-space-email.ts");
    expect(consumeRoute).toContain("export async function POST");
    expect(email).toContain('"/connexion"');
  });
});
