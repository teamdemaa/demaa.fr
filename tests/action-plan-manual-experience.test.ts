import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("manual action plan experience", () => {
  it("opens a blank manual workspace without invoking the AI", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const systemPanel = source("src/components/ActionPlanSystemPanel.tsx");
    const uiCopy = source("src/lib/action-plan-ui-copy.ts");

    expect(uiCopy).toContain("Commencer avec un plan vierge");
    expect(experience).toContain("{uiCopy.blankPlan}");
    expect(experience).toContain("createManualActionPlan()");
    expect(experience).toContain("createManualActionPlanWorkspaceState()");
    expect(experience).toContain("selectedSystemId: input.appContext.systemId ?? null");
    expect(experience).not.toContain("selectedSystemId: input.appContext.systemId ?? \"\"");
    expect(experience).toContain("systemId: prePlanWorkspace.selectedSystemId");
    expect(experience).toContain("setWorkspace(prePlanWorkspace)");
    expect(experience).toContain("<CompanyPilotagePanel");
    expect(experience).toContain("available\n");
    expect(experience).toContain("onSectionChange={selectPlanSection}");
    expect(experience).toContain("figuresAuthenticated={isAuthenticated && !isDemoMode}");
    expect(experience).toContain("onFiguresAuthenticationRequired={requestFiguresAuthentication}");
    expect(experience).toContain("strategyAuthenticated={isAuthenticated && !isDemoMode}");
    expect(experience).toContain("onStrategyAuthenticationRequired={requestStrategyAuthentication}");
    expect(experience).not.toContain("<CompanyStrategyEntry");
    expect(experience).toContain('setPendingAccessIntent({ kind: "open-company-strategy" })');
    expect(experience).toContain('planSection: "strategy"');
    expect(experience).toContain("Connectez-vous pour renseigner votre stratégie");
    expect(experience).not.toContain('planSection === "figures" && !isAuthenticated');
    expect(experience).toContain('demo === "blank"');
    expect(experience).toContain("const storedSystemId = readGuestSelectedSystemId() ?? \"\"");
    expect(experience).toContain("savedSystemIds: storedSystemId ? [storedSystemId] : []");
    expect(systemPanel).toContain("Choisissez votre activité");
    expect(systemPanel).toContain("if (!selectedSystemId)");
  });

  it("keeps adding actions available before and after saving", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const result = source("src/components/ActionPlanResult.tsx");
    const savedDetail = source("src/components/SavedActionPlanDetail.tsx");

    expect(experience).toContain("handleAddAction");
    expect(experience).toContain('setPendingAccessIntent({ kind: "add-manual-action" })');
    expect(experience).toContain("buildActionPlanAccessReturnTo");
    expect(experience).toContain("initialSelectedActionId={actionOpenRequest?.actionId}");
    expect(result).toContain("Ajouter une action");
    expect(result).toContain("addAndOpenAction");
    expect(result).toContain("setSelectedActionId(actionId)");
    expect(result).not.toContain("Générer un plan à partir de ma situation");
    expect(result).not.toContain("Aucune action pour le moment");
    expect(result).toContain("isBlankManualPlan && onGeneratePlan");
    expect(result).toContain("<ActionPlanGenerationBar");
    expect(result).toContain("onGeneratePlan={onGeneratePlan}");
    expect(result).toContain("localeCode={localeCode}");
    expect(result).toContain("contentLocaleCode={contentLocaleCode}");
    expect(result).not.toContain('mode="edit"');
    expect(savedDetail).toContain("function addAction()");
    expect(savedDetail).toContain("async function generateBlankPlan");
    expect(savedDetail).toContain("runExistingBlankActionPlanGeneration");
    expect(savedDetail).toContain("<ActionPlanGenerationScreen localeCode={interfaceLocaleCode} />");
    expect(savedDetail).not.toContain('fetch("/api/action-plan/generate"');
    expect(savedDetail).toContain("plan: isManualActionPlan(nextSave.plan)");
    expect(savedDetail).toContain("onAddAction={addAction}");
  });

  it("keeps legacy strategy data isolated while hiding it from the plan UI", () => {
    const result = source("src/components/ActionPlanResult.tsx");
    const viewModel = source("src/lib/action-plan-view-model.ts");
    const contract = source("src/lib/action-plan-contract.ts");
    const storage = source("src/lib/action-plan-storage.server.ts");

    expect(contract).toContain("legacyStrategySchema");
    expect(viewModel).not.toContain("getActionPlanStrategyFields");
    expect(storage).toContain("preserveRetiredManualStrategyFields");
    expect(storage).toContain("preserveRetiredWorkspaceStrategyFields");
    expect(result).not.toContain("strategyOverrides");
    expect(result).not.toContain("<StrategyPanel");
  });
});
