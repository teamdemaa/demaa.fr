import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getActionPlanUiCopy } from "@/lib/action-plan-ui-copy";

const AUDITED_COMPONENTS = [
  "ActionPlanGenerationBar.tsx",
  "ActionPlanGenerationScreen.tsx",
  "ActionPlanResult.tsx",
  "ActionPlanSystemSelector.tsx",
  "ActionPlanUtilityActions.tsx",
  "Navbar.tsx",
  "SavedActionPlanControls.tsx",
  "SavedActionPlanDetail.tsx",
  "SavedActionPlanGenerationState.tsx",
  "ActionPlanShareControl.tsx",
  "ActionPlanSystemPanel.tsx",
  "SystemShareControl.tsx",
] as const;

describe("action plan UI copy", () => {
  it("keeps saved-plan, sharing and system labels structurally complete", () => {
    const fr = getActionPlanUiCopy("fr");
    const en = getActionPlanUiCopy("en");

    expect(Object.keys(fr.savedPlan)).toEqual(Object.keys(en.savedPlan));
    expect(Object.keys(fr.share)).toEqual(Object.keys(en.share));
    expect(Object.keys(fr.system)).toEqual(Object.keys(en.system));
    expect(Object.keys(fr.generationBar)).toEqual(Object.keys(en.generationBar));
    expect(Object.keys(fr.generationScreen)).toEqual(Object.keys(en.generationScreen));
    expect(Object.keys(fr.generationState)).toEqual(Object.keys(en.generationState));
    expect(Object.keys(fr.selector)).toEqual(Object.keys(en.selector));
    expect(Object.keys(fr.utility)).toEqual(Object.keys(en.utility));
    expect(Object.keys(fr.navbar)).toEqual(Object.keys(en.navbar));
    expect(Object.keys(fr.systemShare)).toEqual(Object.keys(en.systemShare));
    expect(Object.keys(fr.result)).toEqual(Object.keys(en.result));
    expect(Object.keys(fr.result.filters)).toEqual(Object.keys(en.result.filters));
    expect(Object.keys(fr.result.statuses)).toEqual(Object.keys(en.result.statuses));
    expect(en.savedPlan.switchPlan).toBe("Switch plan");
    expect(en.system.title).toBe("Business solutions");
    expect(en.examples).toHaveLength(fr.examples.length);
    expect(en.examples.join(" ")).toContain("restaurant");
    expect(en.examples.join(" ")).toContain("plumbing business");
    expect(en.examples.join(" ")).not.toMatch(/SaaS|web agency|online training/i);
  });

  it("keeps visible bilingual literals out of the audited shared components", () => {
    for (const fileName of AUDITED_COMPONENTS) {
      const source = fs.readFileSync(
        path.join(process.cwd(), "src", "components", fileName),
        "utf8",
      );
      const sourceWithoutAllowedLocaleBranches = source
        .replaceAll('localeCode === "en" ? "en-GB" : "fr-FR"', "")
        .replaceAll('localeCode === "en" ? "/en" : "/"', "")
        .replaceAll('localeCode === "en" ? "/en" : ""', "");
      expect(source, fileName).toContain("getActionPlanUiCopy");
      expect(sourceWithoutAllowedLocaleBranches, fileName).not.toMatch(
        /(?:interfaceLocaleCode|localeCode)\s*===\s*["']en["']\s*\?\s*["']/,
      );
    }
  });
});
