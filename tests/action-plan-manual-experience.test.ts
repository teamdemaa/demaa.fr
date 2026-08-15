import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("manual action plan experience", () => {
  it("opens a blank manual workspace without invoking the AI", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const systemPanel = source("src/components/ActionPlanSystemPanel.tsx");

    expect(experience).toContain("Commencer avec un plan vierge");
    expect(experience).toContain("createManualActionPlan()");
    expect(experience).toContain("createManualActionPlanWorkspaceState()");
    expect(experience).toContain("selectedSystemId: initialAppContext.systemId ?? null");
    expect(experience).not.toContain("selectedSystemId: initialAppContext.systemId ?? \"\"");
    expect(experience).toContain("systemId: prePlanWorkspace.selectedSystemId");
    expect(experience).toContain("setWorkspace(prePlanWorkspace)");
    expect(experience).toContain('demo === "blank"');
    expect(experience).toContain("const storedSystemId = readGuestSelectedSystemId() ?? \"\"");
    expect(experience).toContain("savedSystemIds: storedSystemId ? [storedSystemId] : []");
    expect(systemPanel).toContain("Choisissez votre système métier");
    expect(systemPanel).toContain("if (!selectedSystemId)");
  });

  it("keeps adding actions available before and after saving", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const result = source("src/components/ActionPlanResult.tsx");
    const savedDetail = source("src/components/SavedActionPlanDetail.tsx");

    expect(experience).toContain("handleAddAction");
    expect(result).toContain("Ajouter une action");
    expect(result).toContain("addAndOpenAction");
    expect(result).toContain("setSelectedActionId(actionId)");
    expect(result).not.toContain("Générer un plan à partir de ma situation");
    expect(result).not.toContain("Aucune action pour le moment");
    expect(result).toContain('mode={isBlankManualPlan ? "generate" : "edit"}');
    expect(result).toContain(
      "onGeneratePlan={isBlankManualPlan ? onGeneratePlan : undefined}",
    );
    expect(savedDetail).toContain("function addAction()");
    expect(savedDetail).toContain("async function generateBlankPlan");
    expect(savedDetail).toContain("createGeneratedActionPlanWorkspaceState");
    expect(savedDetail).toContain("plan: isManualActionPlan(nextSave.plan)");
    expect(savedDetail).toContain("onAddAction={addAction}");
  });

  it("keeps legacy strategy data isolated while hiding it from the plan UI", () => {
    const result = source("src/components/ActionPlanResult.tsx");
    const viewModel = source("src/lib/action-plan-view-model.ts");

    expect(viewModel).toContain('label: "Alignement"');
    expect(viewModel).toContain('label: "Positionnement"');
    expect(viewModel).toContain('label: "Offre"');
    expect(viewModel).toContain('label: "Promotion"');
    expect(result).not.toContain("strategyOverrides");
    expect(result).not.toContain("<StrategyPanel");
  });
});
