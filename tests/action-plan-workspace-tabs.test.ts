import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ActionPlanWorkspaceTabs, {
  getNextActionPlanWorkspaceTab,
} from "@/components/ActionPlanWorkspaceTabs";

describe("action plan workspace tabs", () => {
  it("renders the Actions and Solutions tabs with linked tab semantics", () => {
    const markup = renderToStaticMarkup(createElement(ActionPlanWorkspaceTabs, {
      idPrefix: "test-plan",
      onChange: () => undefined,
      value: "actions",
    }));

    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-label="Contenu du plan"');
    expect(markup).toContain('id="test-plan-actions-tab"');
    expect(markup).toContain('aria-controls="test-plan-actions-panel"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain("Actions");
    expect(markup).toContain("Solutions");
  });

  it("supports wrapped arrow navigation plus Home and End", () => {
    expect(getNextActionPlanWorkspaceTab({
      currentTab: "actions",
      key: "ArrowRight",
    })).toBe("solutions");
    expect(getNextActionPlanWorkspaceTab({
      currentTab: "solutions",
      key: "ArrowRight",
    })).toBe("actions");
    expect(getNextActionPlanWorkspaceTab({
      currentTab: "actions",
      key: "ArrowLeft",
    })).toBe("solutions");
    expect(getNextActionPlanWorkspaceTab({
      currentTab: "solutions",
      key: "Home",
    })).toBe("actions");
    expect(getNextActionPlanWorkspaceTab({
      currentTab: "actions",
      key: "End",
    })).toBe("solutions");
    expect(getNextActionPlanWorkspaceTab({
      currentTab: "actions",
      key: "Escape",
    })).toBeNull();
  });

  it("focuses the selected tab and links all three plan states to their panels", () => {
    const tabs = readFileSync("src/components/ActionPlanWorkspaceTabs.tsx", "utf8");
    const guest = readFileSync("src/components/ActionPlanExperience.tsx", "utf8");
    const saved = readFileSync("src/components/SavedActionPlanDetail.tsx", "utf8");

    expect(tabs).toContain(".focus()");
    expect(tabs).toContain('input.key === "ArrowRight"');
    expect(tabs).toContain('input.key === "ArrowLeft"');
    expect(tabs).toContain('input.key === "Home"');
    expect(tabs).toContain('input.key === "End"');

    for (const prefix of ["guest-plan", "current-plan"]) {
      expect(guest).toContain(`idPrefix="${prefix}"`);
      expect(guest).toContain(`id="${prefix}-actions-panel"`);
      expect(guest).toContain(`aria-labelledby="${prefix}-actions-tab"`);
      expect(guest).toContain(`id="${prefix}-solutions-panel"`);
      expect(guest).toContain(`aria-labelledby="${prefix}-solutions-tab"`);
    }

    expect(saved).toContain('idPrefix="saved-plan"');
    expect(saved).toContain('id="saved-plan-actions-panel"');
    expect(saved).toContain('aria-labelledby="saved-plan-actions-tab"');
    expect(saved).toContain('id="saved-plan-solutions-panel"');
    expect(saved).toContain('aria-labelledby="saved-plan-solutions-tab"');
  });

  it("embeds only the existing Solutions catalogue in the Solutions panels", () => {
    const guest = readFileSync("src/components/ActionPlanExperience.tsx", "utf8");
    const saved = readFileSync("src/components/SavedActionPlanDetail.tsx", "utf8");
    const systemPanel = readFileSync("src/components/ActionPlanSystemPanel.tsx", "utf8");
    const result = readFileSync("src/components/ActionPlanResult.tsx", "utf8");

    expect(guest.match(/<ActionPlanSystemPanel/g)).toHaveLength(2);
    expect(saved.match(/<ActionPlanSystemPanel/g)).toHaveLength(1);
    expect(systemPanel).toContain("<SystemSolutionsTab");
    expect(systemPanel).not.toContain("<SystemDetailContent");
    expect(systemPanel).not.toContain("Organisation");
    expect(systemPanel).not.toContain("Ressources");
    expect(result).toContain("contextualAid?.organisation");
    expect(result).toContain("contextualAid?.model");
    expect(result).not.toContain("contextualAid?.solutions");
  });
});
