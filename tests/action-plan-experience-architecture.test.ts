import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { getSafeCustomerReturnTo } from "@/lib/customer-space-redirect";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("action plan experience architecture", () => {
  it("keeps the guest result in page memory until the user explicitly saves", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const saveControl = source("src/components/ActionPlanSaveControl.tsx");
    const shareControl = source("src/components/ActionPlanShareControl.tsx");
    const result = source("src/components/ActionPlanResult.tsx");

    expect(experience).toContain("useState<ActionPlan | null>(null)");
    expect(experience).not.toMatch(/localStorage|sessionStorage/);
    expect(saveControl).not.toMatch(/localStorage|sessionStorage/);
    expect(saveControl).toContain('fetch("/api/action-plans"');
    expect(saveControl).toContain('"Sauvegarder"');
    expect(saveControl).toContain("if (demoMode)");
    expect(shareControl).toContain("navigator.share");
    expect(shareControl).toContain("navigator.clipboard.writeText");
    expect(experience).toContain('get("demo") !== "plan"');
    expect(experience).toContain("ACTION_PLAN_DEMO");
    expect(result).toContain('type PlanSection = "tasks" | "strategy"');
    expect(result).toContain('type TaskView = "list" | "kanban"');
    expect(result).toContain("Notes personnelles");
    expect(result).not.toContain("demaa-accordion");
  });

  it("changes the selected system deterministically without another AI call", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const systemPanel = source("src/components/ActionPlanSystemPanel.tsx");
    const systemSelector = source("src/components/ActionPlanSystemSelector.tsx");

    expect(experience).toContain('fetch("/api/action-plan/generate"');
    expect(systemPanel).toContain("/api/action-plan/system/");
    expect(systemPanel).not.toContain("/api/action-plan/generate");
    expect(systemPanel).toContain("<ActionPlanSystemSelector");
    expect(systemPanel).toContain("onChange={onSystemChange}");
    expect(systemSelector).toContain('role="listbox"');
    expect(systemSelector).toContain('role="combobox"');
    expect(systemPanel).toContain("<SystemDetailContent");
    expect(systemPanel).toContain("checkableProcess");
    expect(systemPanel).toContain("checkedProcessStepIdsBySystem");
    expect(systemPanel).toContain("selectedSolutionPlacementIdsBySystem");
    expect(source("src/components/SystemeTabContent.tsx")).toContain(
      'type="checkbox"',
    );
  });

  it("embeds the Academy without nesting a second main landmark", () => {
    const academyPanel = source("src/components/ActionPlanAcademyPanel.tsx");
    const academyIndex = source("src/components/AcademyIndexClient.tsx");
    const experience = source("src/components/ActionPlanExperience.tsx");

    expect(academyPanel).toContain("embedded");
    expect(experience).toContain("<ActionPlanUtilityActions");
    expect(academyIndex).toContain("embedded || isSearching || showAllFundamentals");
    expect(academyIndex).toContain('embedded ? "max-w-md"');
    expect(academyIndex).toContain('const ContentContainer = embedded ? "div" : "main"');
    expect(academyIndex).toContain("<ContentContainer");
  });

  it("allows a saved plan return path without opening external redirects", () => {
    expect(getSafeCustomerReturnTo("/mon-espace/plans/abc_123")).toBe(
      "/mon-espace/plans/abc_123",
    );
    expect(getSafeCustomerReturnTo("//example.com/mon-espace")).toBe(
      "/mon-espace",
    );
    expect(getSafeCustomerReturnTo("https://example.com/mon-espace")).toBe(
      "/mon-espace",
    );
  });
});
