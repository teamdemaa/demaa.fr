import { describe, expect, it } from "vitest";
import {
  constrainActionPlanView,
  getActionPlanPageConfig,
} from "@/lib/action-plan-page-config";

describe("shared action plan page configuration", () => {
  it("keeps routes localized without changing the canonical plan identity", () => {
    const french = getActionPlanPageConfig({ localeCode: "fr", marketCode: "fr-fr" });
    const english = getActionPlanPageConfig({ localeCode: "en", marketCode: "fr-fr" });

    expect(french.paths.plan("plan/unsafe")).toBe("/plans/plan%2Funsafe");
    expect(english.paths.plan("plan/unsafe")).toBe("/en/plans/plan%2Funsafe");
    expect(french.paths.latest).toBe("/plans/latest");
    expect(english.paths.latest).toBe("/en/plans/latest");
  });

  it("separates market availability from interface publication", () => {
    expect(getActionPlanPageConfig({
      localeCode: "fr",
      marketCode: "fr-fr",
    }).visibleViews).toEqual(["plan", "services", "academy", "opportunities"]);

    const englishInFrance = getActionPlanPageConfig({
      localeCode: "en",
      marketCode: "fr-fr",
    });
    expect(englishInFrance.visibleViews).toEqual(["plan"]);
    expect(englishInFrance.showCoaching).toBe(false);

    const englishBeta = getActionPlanPageConfig({
      localeCode: "en",
      marketCode: "global-en-beta",
    });
    expect(englishBeta.visibleViews).toEqual(["plan", "services", "academy"]);
    expect(englishBeta.showCoaching).toBe(true);
  });

  it("falls back to the plan view when a surface is not published", () => {
    expect(constrainActionPlanView(
      "opportunities",
      ["plan", "services", "academy"],
    )).toBe("plan");
  });
});
