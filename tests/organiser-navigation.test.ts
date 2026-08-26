import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import { getSystemDiscoveryOptionScore } from "@/lib/system-discovery";
import {
  buildLegacySolutionsRedirect,
  buildOrganiserHref,
  buildSolutionsHref,
  parseOrganiserTab,
} from "@/lib/organiser-navigation";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("Organiser navigation", () => {
  it("keeps Organiser focused on processes and gives Solutions its own route", () => {
    expect(parseOrganiserTab(undefined)).toBe("solutions");
    expect(parseOrganiserTab("solutions")).toBe("solutions");
    expect(parseOrganiserTab("processus")).toBe("processus");
    expect(buildOrganiserHref()).toBe("/organiser");
    expect(buildOrganiserHref({ tab: "processus", systemId: "restaurant" }))
      .toBe("/organiser");
    expect(buildSolutionsHref({
      systemId: "restaurant",
      solutionResourceSlug: "lightspeed",
      solutionEntrySource: "action_recommendation",
    })).toBe(
      "/solutions/restaurant?resource=lightspeed&toolSource=action_recommendation",
    );
  });

  it("migrates every legacy Solutions entry to the Solutions directory", () => {
    for (const query of [
      "view=solutions&system=restaurant",
      "view=system&system=restaurant",
      "view=plan&planTab=solutions&system=restaurant",
      "view=plan&section=solutions&system=restaurant",
    ]) {
      expect(buildLegacySolutionsRedirect(new URLSearchParams(query)))
        .toBe("/solutions/restaurant");
    }

    expect(buildLegacySolutionsRedirect(new URLSearchParams(
      "intent=solution-referral&systemSlug=restaurant&resourceSlug=lightspeed",
    ))).toBe(
      "/solutions/restaurant?resource=lightspeed",
    );
    expect(buildLegacySolutionsRedirect(new URLSearchParams("view=plan")))
      .toBeNull();
  });

  it("renders only the process library on Organiser", () => {
    const organiserPage = source("src/app/(marketing)/organiser/page.tsx");
    const companyPilotage = source("src/components/CompanyPilotagePanel.tsx");
    const guestPlan = source("src/components/GuestActionPlanExperience.tsx");

    expect(organiserPage).toContain("<AcademyIndexClient");
    expect(organiserPage).not.toContain("<OrganiserWorkspace");
    expect(organiserPage).not.toContain("<ActionPlanSystemPanel");
    expect(companyPilotage).not.toContain('{ key: "solutions"');
    expect(guestPlan).not.toContain("<ActionPlanSystemPanel");
    expect(guestPlan).not.toContain('aria-label="Contenu du plan"');
  });

  it("finds Architecte d’intérieur in the métier selector", () => {
    const option = actionPlanSystemOptions.find(
      ({ id }) => id === "architecte-maitre-oeuvre",
    );
    expect(option).toBeDefined();
    expect(getSystemDiscoveryOptionScore(option!, "architecte d’intérieur"))
      .not.toBeNull();
  });
});
