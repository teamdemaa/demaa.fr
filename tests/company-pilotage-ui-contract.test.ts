import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COMPANY_STRATEGY_PILLAR_KEYS } from "@/lib/company-pilotage-contract";
import {
  formatCompanyMetricCents,
  formatCompanyMonth,
  getCompanyPilotageUiCopy,
} from "@/lib/company-pilotage-ui-copy";
const source = (file: string) => readFileSync(new URL(`../src/components/${file}`, import.meta.url), "utf8");

describe("company Pilotage UI contract", () => {
  it("owns one internal navigation with Strategy visible", () => {
    const owner = source("CompanyPilotagePanel.tsx");
    const navbar = source("ActionPlanNavbar.tsx");
    expect(owner).toContain("getCompanyPilotageUiCopy");
    expect(owner).toContain(
      'COMPANY_STRATEGY_VISIBLE,\n  type ActionPlanSection,\n} from "@/lib/action-plan-app-context"',
    );
    expect(owner).toContain('item.key !== "strategy" || COMPANY_STRATEGY_VISIBLE');
    expect(owner).toContain('COMPANY_STRATEGY_VISIBLE && section === "strategy"');
    expect(source("SavedActionPlanDetail.tsx")).toContain("<CompanyPilotagePanel");
    expect(source("ActionPlanExperience.tsx")).toContain("<CompanyPilotagePanel");
    expect(navbar).not.toContain("Stratégie");
  });

  it("keeps explicit metric saves and serial Strategy autosaves with recovery", () => {
    const figures = source("CompanyFiguresPanel.tsx") + source("CompanyMetricEntryDialog.tsx");
    const strategy = source("CompanyStrategyPanel.tsx") + source("CompanyStrategyPillar.tsx");
    expect(figures).toContain("copy.update");
    expect(figures).not.toContain("setTimeout(() =>");
    expect(strategy).toContain("}, 700)");
    expect(strategy).toContain("copy.retry");
    expect(strategy).toContain("copy.keep");
    expect(strategy).toContain("copy.recent");
    expect(strategy).toContain('aria-live="polite"');
  });

  it("keeps chart month controls exposed to assistive technologies", () => {
    const figures = source("CompanyFiguresPanel.tsx");
    expect(figures).toContain('role="group"');
    expect(figures).toContain('aria-describedby="company-metrics-chart-instructions"');
    expect(figures).not.toContain('role="img"');
  });

  it("keeps the Figures summary compact without noisy completeness copy", () => {
    const figures = source("CompanyFiguresPanel.tsx");
    expect(figures).not.toContain(">Chiffres</h1>");
    expect(figures).not.toContain("Un suivi mensuel simple pour piloter votre entreprise.");
    expect(figures).toContain('className="flex flex-wrap items-end justify-between gap-3"');
    expect(figures).toContain('className="mt-6 grid grid-cols-2 gap-3"');
    expect(figures).not.toContain("mois renseignés sur");
    expect(figures).not.toContain("Les totaux incomplets restent affichés");
    expect(figures).not.toContain("Même période que le récapitulatif");
    expect(figures).not.toContain("Une seule valeur mensuelle");
  });

  it("loads the selected month from the parent metric map", () => {
    const dialog = source("CompanyMetricEntryDialog.tsx");
    const figures = source("CompanyFiguresPanel.tsx");
    expect(figures).toContain("metricsByPeriod={byPeriod}");
    expect(dialog).toContain("getCompanyMetricEntryDraft(nextPeriod, metricsByPeriod)");
  });

  it("contains exactly four pillars and twelve questions in the canonical contract", () => {
    const fr = getCompanyPilotageUiCopy("fr").pillars;
    const en = getCompanyPilotageUiCopy("en").pillars;
    expect(COMPANY_STRATEGY_PILLAR_KEYS).toHaveLength(4);
    expect(COMPANY_STRATEGY_PILLAR_KEYS.reduce((count, { questions }) => count + questions.length, 0)).toBe(12);
    expect(fr.map(({ key }) => key)).toEqual(COMPANY_STRATEGY_PILLAR_KEYS.map(({ key }) => key));
    expect(en.map(({ key }) => key)).toEqual(COMPANY_STRATEGY_PILLAR_KEYS.map(({ key }) => key));
    expect(fr.every(({ questions }) =>
      questions.every((question) => !("placeholder" in question))
    )).toBe(true);
    expect(en.flatMap(({ questions }) => questions.map(({ key }) => key))).toEqual(
      fr.flatMap(({ questions }) => questions.map(({ key }) => key)),
    );
  });

  it("localizes Pilotage without changing its EUR company data", () => {
    expect(formatCompanyMonth("2026-08", "fr")).toBe("Août 2026");
    expect(formatCompanyMonth("2026-08", "en")).toBe("August 2026");
    expect(formatCompanyMetricCents(150_000, "fr")).toContain("1 500");
    expect(formatCompanyMetricCents(150_000, "en")).toContain("1,500");
    expect(formatCompanyMetricCents(150_000, "fr")).toContain("€");
    expect(formatCompanyMetricCents(150_000, "en")).toContain("€");
    expect(getCompanyPilotageUiCopy("en").sections).toEqual({
      actions: "Action plan",
      figures: "Key figures",
      strategy: "Strategy",
    });
  });

  it("keeps Strategy focused on its content and makes cycle creation explicit", () => {
    const panel = source("CompanyStrategyPanel.tsx");
    const pillar = source("CompanyStrategyPillar.tsx");
    const dialog = source("CompanyStrategyCycleDialog.tsx");
    expect(panel).not.toContain("Cycle actuel ·");
    expect(panel).not.toContain('aria-expanded={historyOpen}');
    expect(panel).toContain("<CompanyStrategyHistory");
    expect(dialog).toContain("copy.nextPeriod");
    expect(pillar).not.toContain("placeholder={question.placeholder}");
    expect(pillar).toContain("window.scrollBy(0, offset)");
    expect(panel).toContain("onOpen={() => setOpenPillar(pillar.key)}");
    expect(panel).not.toContain("current === pillar.key ? null");
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
