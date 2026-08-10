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

    expect(experience).toContain("useState<ActionPlan | null>(null)");
    expect(experience).not.toMatch(/localStorage|sessionStorage/);
    expect(saveControl).not.toMatch(/localStorage|sessionStorage/);
    expect(saveControl).toContain('fetch("/api/action-plans"');
  });

  it("changes the selected system deterministically without another AI call", () => {
    const experience = source("src/components/ActionPlanExperience.tsx");
    const systemPanel = source("src/components/ActionPlanSystemPanel.tsx");

    expect(experience).toContain('fetch("/api/action-plan/generate"');
    expect(systemPanel).toContain("/api/action-plan/system/");
    expect(systemPanel).not.toContain("/api/action-plan/generate");
    expect(systemPanel).toContain("onSystemChange(event.target.value)");
    expect(systemPanel).toContain("<SystemDetailContent");
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
