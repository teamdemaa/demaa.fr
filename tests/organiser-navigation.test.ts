import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import { getSystemDiscoveryOptionScore } from "@/lib/system-discovery";
import {
  buildLegacySolutionsRedirect,
  buildOrganiserHref,
  parseOrganiserTab,
} from "@/lib/organiser-navigation";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("Organiser navigation", () => {
  it("uses Solutions by default and keeps Processus explicit", () => {
    expect(parseOrganiserTab(undefined)).toBe("solutions");
    expect(parseOrganiserTab("solutions")).toBe("solutions");
    expect(parseOrganiserTab("processus")).toBe("processus");
    expect(buildOrganiserHref()).toBe("/organiser?tab=solutions");
    expect(buildOrganiserHref({ tab: "processus", systemId: "restaurant" }))
      .toBe("/organiser?tab=processus");
    expect(buildOrganiserHref({
      tab: "solutions",
      systemId: "restaurant",
      solutionResourceSlug: "lightspeed",
      solutionEntrySource: "action_recommendation",
    })).toBe(
      "/organiser?tab=solutions&system=restaurant&resource=lightspeed&toolSource=action_recommendation",
    );
  });

  it("migrates every legacy Solutions entry to Organiser", () => {
    for (const query of [
      "view=solutions&system=restaurant",
      "view=system&system=restaurant",
      "view=plan&planTab=solutions&system=restaurant",
      "view=plan&section=solutions&system=restaurant",
    ]) {
      expect(buildLegacySolutionsRedirect(new URLSearchParams(query)))
        .toBe("/organiser?tab=solutions&system=restaurant");
    }

    expect(buildLegacySolutionsRedirect(new URLSearchParams(
      "intent=solution-referral&systemSlug=restaurant&resourceSlug=lightspeed",
    ))).toBe(
      "/organiser?tab=solutions&system=restaurant&resource=lightspeed",
    );
    expect(buildLegacySolutionsRedirect(new URLSearchParams("view=plan")))
      .toBeNull();
  });

  it("renders the Organiser pills in the validated order and removes the Plan Solutions pill", () => {
    const organiser = source("src/components/OrganiserWorkspace.tsx");
    const organiserPage = source("src/app/(marketing)/academie/page.tsx");
    const companyPilotage = source("src/components/CompanyPilotagePanel.tsx");
    const guestPlan = source("src/components/GuestActionPlanExperience.tsx");

    expect(organiser).toContain('(["solutions", "processus"] as const)');
    expect(organiser).toContain("<ActionPlanSystemPanel");
    expect(organiser).toContain("showHeading={false}");
    expect(organiser).toContain("toolOutboundSurface={toolOutboundSurface}");
    expect(organiser).toContain("readGuestSelectedSystemId()");
    expect(organiserPage).toContain('=== "action_recommendation"');
    expect(organiser).toContain("<AcademyIndexClient");
    expect(organiserPage).toContain('key={[initialTab, initialSystemId ?? "", initialResourceSlug ?? ""].join(":")}');
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
