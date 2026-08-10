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

  it("keeps the account area focused on plans instead of a parallel member portal", () => {
    const accountPage = read("src/app/mon-espace/page.tsx");
    const accountPlans = read("src/components/MemberSpaceTabs.tsx");

    expect(accountPage).toContain("Mon espace");
    expect(accountPage).not.toContain("Espace membre");
    expect(accountPlans).toContain('title="Mes plans"');
    expect(accountPlans).not.toContain("Suivi des demandes");
  });

  it("publishes the validated coaching offer and tabs", () => {
    const coaching = read("src/components/CoachingPanel.tsx");
    expect(coaching).toContain("Sessions");
    expect(coaching).toContain("Messages");
    expect(coaching).toContain("150 € HT");
    expect(coaching).toContain("180 € TTC");
    expect(coaching).toContain("400 € HT");
    expect(coaching).toContain("480 € TTC");
    expect(coaching).toContain("15 minutes offertes");
    expect(coaching).not.toContain("disponible prochainement");
  });

  it("keeps magic-link consumption on POST", () => {
    const consumeRoute = read("src/app/api/customer-space/consume/route.ts");
    const email = read("src/lib/customer-space-email.ts");
    expect(consumeRoute).toContain("export async function POST");
    expect(email).toContain('"/connexion"');
  });
});
