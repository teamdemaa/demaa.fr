import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("public guest action-plan experience", () => {
  it("keeps the homepage outside customer authentication and legacy plan redirects", () => {
    const home = source("src/components/ActionPlanHomeView.tsx");
    const pages = source("src/lib/action-plan-pages.server.ts");
    const guestLoader = pages.slice(
      pages.indexOf("if (isGuestProductEnabled())"),
      pages.indexOf("const identity =", pages.indexOf("if (isGuestProductEnabled())")),
    );

    expect(home).toContain("<GuestActionPlanExperience");
    expect(home).toContain("if (!guestProductEnabled)");
    expect(home).toContain("<Navbar localeCode={config.localeCode} minimal />");
    expect(guestLoader).not.toContain("getCurrentCustomerAppIdentityFromSession");
    expect(guestLoader).not.toContain("ensureDefaultCompanyForIdentity");
    expect(guestLoader).not.toContain("paths.latest");
    expect(guestLoader).toContain("guestProductEnabled: true");
  });

  it("renders a read-only guest result with e-mail and Diagnostic, without chat or Pilotage", () => {
    const experience = source("src/components/GuestActionPlanExperience.tsx");
    const result = source("src/components/GuestActionPlanResult.tsx");
    const delivery = source("src/components/GuestActionPlanDelivery.tsx");

    expect(experience).toContain("startGuestActionPlanGeneration");
    expect(experience).toContain("readGuestActionPlan");
    expect(experience).toContain("resumeGuestActionPlanGeneration");
    expect(experience).toContain("waitForGuestGeneration");
    expect(experience).toContain("<GuestActionPlanResult");
    expect(experience).toContain("<GuestActionPlanDelivery");
    expect(experience).not.toContain("CustomerSpaceAccessForm");
    expect(experience).not.toContain("ActionPlanCoachingControl");
    expect(experience).not.toContain("CompanyPilotagePanel");
    expect(experience).not.toContain('import ActionPlanResult from');
    expect(experience).toContain('aria-label="Contenu du plan"');
    expect(experience).toContain("aria-current={appContext.planSection");
    expect(experience).toContain('>\n              Plan\n');
    expect(experience).toContain('>\n              Solutions\n');
    expect(experience).not.toContain('>Chiffres<');
    expect(experience).not.toContain('>Stratégie<');
    expect(result).toContain("<details");
    expect(result).not.toContain("onWorkspaceChange");
    expect(result).not.toContain("Disponible pendant 24 h");
    expect(delivery).toContain('submit("email"');
    expect(delivery).toContain('submit("diagnostic"');
    expect(delivery).toContain("contactConsent");
    expect(delivery).not.toContain("CoachBusinessPromo");
  });

  it("stores only temporary access coordinates, never generated plan content", () => {
    const client = source("src/lib/guest-action-plan.client.ts");
    expect(client).toContain("window.sessionStorage.setItem");
    expect(client).not.toContain("window.localStorage");
    expect(client).not.toContain("JSON.stringify(actionPlan)");
    expect(client).toContain("Authorization: `Bearer ${access.accessKey}`");
  });
});
