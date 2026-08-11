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
    const coachingControl = read("src/components/ActionPlanCoachingControl.tsx");
    const appNavigation = read("src/components/ActionPlanNavbar.tsx");
    expect(coaching).toContain("Sessions");
    expect(coaching).toContain("Messages");
    expect(coaching).toContain("Parler à un spécialiste");
    expect(coaching).toContain("l’expérience du terrain");
    expect(coaching).toContain("150 € HT");
    expect(coaching).toContain("400 € HT");
    expect(coaching).not.toContain("180 € TTC");
    expect(coaching).not.toContain("480 € TTC");
    expect(coaching).toContain("15 minutes offertes");
    expect(coaching).not.toContain("disponible prochainement");
    expect(coachingControl).toContain("Parler à un spécialiste");
    expect(coachingControl).toContain("onClick={() => setOpen(true)}");
    expect(coachingControl).toContain("onRequireAccess={initialEmail ? undefined");
    expect(appNavigation).toContain("Opportunités");
    expect(appNavigation).not.toContain('label: "Coaching"');
  });

  it("keeps magic-link consumption on POST", () => {
    const consumeRoute = read("src/app/api/customer-space/consume/route.ts");
    const email = read("src/lib/customer-space-email.ts");
    expect(consumeRoute).toContain("export async function POST");
    expect(email).toContain('"/connexion"');
  });
});
