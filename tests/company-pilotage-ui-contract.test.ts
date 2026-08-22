import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CompanyStrategyPanel from "@/components/CompanyStrategyPanel";
import { COMPANY_STRATEGY_PILLARS } from "@/lib/company-pilotage-contract";
const source = (file: string) => readFileSync(new URL(`../src/components/${file}`, import.meta.url), "utf8");

describe("company Pilotage UI contract", () => {
  it("owns one compact internal navigation and opens Strategy from the Plan", () => {
    const owner = source("CompanyPilotagePanel.tsx");
    const navbar = source("ActionPlanNavbar.tsx");
    expect(owner).toContain('labels: { fr: "Plan", en: "Plan" }');
    expect(owner).toContain("Chiffres");
    expect(owner).toContain("Solutions");
    expect(owner).toContain("mx-auto mb-5 flex w-fit max-w-full items-center gap-1");
    expect(owner).toContain("min-h-10 shrink-0 items-center justify-center rounded-full px-4");
    expect(owner).toContain("bg-dema-sage/60 text-dema-forest");
    expect(owner).not.toContain("max-w-[29rem]");
    expect(owner).not.toContain("border border-dema-line/70 bg-dema-sage/20 p-1");
    expect(owner).not.toContain("shadow-[0_5px_16px");
    expect(owner).not.toContain('key: "strategy"');
    expect(owner).toContain('COMPANY_STRATEGY_VISIBLE && section === "strategy"');
    expect(owner).toContain("Retour au plan");
    expect(source("CompanyStrategyEntry.tsx")).toContain("Stratégie");
    expect(source("SavedActionPlanDetail.tsx")).toContain("<CompanyPilotagePanel");
    expect(source("ActionPlanExperience.tsx")).toContain("<CompanyPilotagePanel");
    expect(source("SavedActionPlanDetail.tsx")).toContain("<CompanyStrategyEntry");
    expect(source("ActionPlanExperience.tsx")).toContain("<CompanyStrategyEntry");
    expect(source("CompanyPilotagePanel.tsx")).toContain("authenticated={figuresAuthenticated}");
    expect(source("CompanyPilotagePanel.tsx")).toContain("authenticated={strategyAuthenticated}");
    expect(navbar).not.toContain("Stratégie");
  });

  it("shows the Strategy framework to guests and protects only writing", () => {
    const panel = source("CompanyStrategyPanel.tsx");
    const pillar = source("CompanyStrategyPillar.tsx");
    const experience = source("ActionPlanExperience.tsx");
    const markup = renderToStaticMarkup(createElement(CompanyStrategyPanel, {
      authenticated: false,
      onAuthenticationRequired: () => undefined,
    }));

    expect(markup).toContain("Stratégie");
    expect(markup).toContain("Qu’est-ce que vous voulez que cette entreprise vous apporte ?");
    expect(markup.match(/<textarea/g)).toHaveLength(3);
    expect(markup.match(/readonly=""/gi)).toHaveLength(3);
    expect(markup).not.toContain("Chargement de la stratégie");
    expect(markup).not.toContain("Historique des cycles");
    expect(panel).toContain("if (!authenticated) return;");
    expect(pillar).toContain("onClick={readOnly ? onWriteRequest : undefined}");
    expect(pillar).toContain('event.key !== "Enter"');
    expect(experience).toContain("strategyAuthenticated={isAuthenticated && !isDemoMode}");
    expect(experience).toContain("onStrategyAuthenticationRequired={requestStrategyAuthentication}");
    expect(experience).toContain("Connectez-vous pour renseigner votre stratégie");
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

  it("keeps Figures readable before authentication and protects only metric edits", () => {
    const figures = source("CompanyFiguresPanel.tsx");
    const experience = source("ActionPlanExperience.tsx");

    expect(figures).toContain("if (!authenticated)");
    expect(figures).toContain("onAuthenticationRequired?.(period)");
    expect(figures).toContain("openMetricEntry(currentMonth)");
    expect(figures).toContain("openMetricEntry(period)");
    expect(figures).toContain("authenticated ? <CompanyMetricEntryDialog");
    expect(experience).toContain("onFiguresAuthenticationRequired={requestFiguresAuthentication}");
    expect(experience).toContain('setPendingAccessIntent({ kind: "edit-company-metric", period })');
    expect(experience).toContain("figuresEntryRequest={figuresEntryRequest}");
    expect(source("CompanyPilotagePanel.tsx")).toContain("initialEntryPeriod={figuresEntryRequest?.period}");
    expect(source("CompanyPilotagePanel.tsx")).toContain("onEntryRequestConsumed={onFiguresEntryRequestConsumed}");
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
    const contract = readFileSync(new URL("../src/lib/company-pilotage-contract.ts", import.meta.url), "utf8");
    for (const framing of ["Vos ambitions, vos forces et vos contraintes.", "Pour qui et avec quel angle ?", "Quel résultat est vendu et comment gagne-t-on de l’argent ?", "Comment attirer, convertir et fidéliser ?"]) expect(contract).toContain(framing);
    expect(COMPANY_STRATEGY_PILLARS).toHaveLength(4);
    expect(COMPANY_STRATEGY_PILLARS.reduce((count, { questions }) => count + questions.length, 0)).toBe(12);
    expect(COMPANY_STRATEGY_PILLARS.every(({ questions }) =>
      questions.every((question) => !("placeholder" in question))
    )).toBe(true);
  });

  it("keeps Strategy focused on its content and makes cycle creation explicit", () => {
    const panel = source("CompanyStrategyPanel.tsx");
    const pillar = source("CompanyStrategyPillar.tsx");
    const dialog = source("CompanyStrategyCycleDialog.tsx");
    expect(panel).not.toContain("Cycle actuel ·");
    expect(panel).not.toContain('aria-expanded={historyOpen}');
    expect(panel).toContain("<CompanyStrategyHistory");
    expect(dialog).toContain("Prochaine période ·");
    expect(pillar).not.toContain("placeholder={question.placeholder}");
    expect(pillar).toContain("window.scrollBy(0, offset)");
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
