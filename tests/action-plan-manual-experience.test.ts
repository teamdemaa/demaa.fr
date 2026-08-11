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
    expect(experience).toContain('demo === "blank"');
    expect(systemPanel).toContain("Choisissez votre système métier");
    expect(systemPanel).toContain("if (!selectedSystemId)");
  });

  it("keeps adding actions available before and after saving", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const result = source("src/components/ActionPlanResult.tsx");
    const savedDetail = source("src/components/SavedActionPlanDetail.tsx");

    expect(experience).toContain("handleAddManualAction");
    expect(result).toContain("Ajouter une action");
    expect(result).toContain("Générer un plan à partir de ma situation");
    expect(savedDetail).toContain("function addManualAction()");
    expect(savedDetail).toContain("plan: isManualActionPlan(nextSave.plan)");
    expect(savedDetail).toContain("onAddAction={isManualActionPlan(currentPlan)");
  });

  it("keeps the four strategy sections editable through workspace overrides", () => {
    const result = source("src/components/ActionPlanResult.tsx");

    expect(result).toContain('label: "Alignement"');
    expect(result).toContain('label: "Positionnement"');
    expect(result).toContain('label: "Offre"');
    expect(result).toContain('label: "Promotion"');
    expect(result).toContain("strategyOverrides");
  });
});
