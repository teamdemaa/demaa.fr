import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getActionPlanUiCopy } from "@/lib/action-plan-ui-copy";

const AUDITED_COMPONENTS = [
  "SavedActionPlanControls.tsx",
  "SavedActionPlanDetail.tsx",
  "ActionPlanShareControl.tsx",
  "ActionPlanSystemPanel.tsx",
] as const;

describe("action plan UI copy", () => {
  it("keeps saved-plan, sharing and system labels structurally complete", () => {
    const fr = getActionPlanUiCopy("fr");
    const en = getActionPlanUiCopy("en");

    expect(Object.keys(fr.savedPlan)).toEqual(Object.keys(en.savedPlan));
    expect(Object.keys(fr.share)).toEqual(Object.keys(en.share));
    expect(Object.keys(fr.system)).toEqual(Object.keys(en.system));
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
      const sourceWithoutIntlFormat = source.replace(
        'localeCode === "en" ? "en-GB" : "fr-FR"',
        "",
      );
      expect(source, fileName).toContain("getActionPlanUiCopy");
      expect(sourceWithoutIntlFormat, fileName).not.toMatch(
        /(?:interfaceLocaleCode|localeCode)\s*===\s*["']en["']\s*\?\s*["']/,
      );
    }
  });
});
