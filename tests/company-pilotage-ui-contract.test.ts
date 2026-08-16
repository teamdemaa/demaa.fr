import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COMPANY_STRATEGY_PILLARS } from "@/lib/company-pilotage-contract";
const source = (file: string) => readFileSync(new URL(`../src/components/${file}`, import.meta.url), "utf8");

describe("company Pilotage UI contract", () => {
  it("owns one internal navigation without adding a fifth main destination", () => {
    const owner = source("CompanyPilotagePanel.tsx");
    const navbar = source("ActionPlanNavbar.tsx");
    expect(owner).toContain("Plan d’action");
    expect(owner).toContain("Chiffres");
    expect(owner).toContain("Stratégie");
    expect(source("SavedActionPlanDetail.tsx")).toContain("<CompanyPilotagePanel");
    expect(source("ActionPlanExperience.tsx")).toContain("<CompanyPilotagePanel");
    expect(navbar).not.toContain("Stratégie");
  });

  it("keeps explicit metric saves and serial Strategy autosaves with recovery", () => {
    const figures = source("CompanyFiguresPanel.tsx") + source("CompanyMetricEntryDialog.tsx");
    const strategy = source("CompanyStrategyPanel.tsx") + source("CompanyStrategyPillar.tsx");
    expect(figures).toContain("Mettre à jour");
    expect(figures).not.toContain("setTimeout(() =>");
    expect(strategy).toContain("}, 700)");
    expect(strategy).toContain("Réessayer");
    expect(strategy).toContain("Garder ma version");
    expect(strategy).toContain("Utiliser la version récente");
    expect(strategy).toContain('aria-live="polite"');
  });

  it("contains exactly four pillars and twelve questions in the canonical contract", () => {
    const contract = readFileSync(new URL("../src/lib/company-pilotage-contract.ts", import.meta.url), "utf8");
    for (const framing of ["Vos ambitions, vos forces et votre rôle.", "Pour qui et avec quel angle ?", "Quel résultat est vendu et comment gagne-t-on de l’argent ?", "Comment attirer, convertir et fidéliser ?"]) expect(contract).toContain(framing);
    expect(COMPANY_STRATEGY_PILLARS).toHaveLength(4);
    expect(COMPANY_STRATEGY_PILLARS.reduce((count, { questions }) => count + questions.length, 0)).toBe(12);
  });

  it("limits the global em-dash audit exception to canonical Pilotage semantics", () => {
    const audit = readFileSync(new URL("../scripts/audit-public-wording.mjs", import.meta.url), "utf8");
    expect(audit).toContain("pilotageEmDashExceptions");
    expect(audit).toContain("CompanyFiguresPanel.tsx");
    expect(audit).toContain("CompanyStrategyHistory.tsx");
    expect(audit).toContain("CompanyStrategyPanel.tsx");
    expect(audit).not.toContain("CompanyPilotagePanel.tsx");
  });
});
