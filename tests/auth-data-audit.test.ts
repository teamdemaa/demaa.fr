import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("../scripts/audit-auth-data.mjs", import.meta.url),
  "utf8",
);

describe("authentication and customer-data audit", () => {
  it.each([
    "customer_coaching_access",
    "customer_accompaniment_benefits",
    "companies",
    "company_memberships",
    "opportunity_submission_drafts",
    "service_solution_requests",
  ])("counts the current business collection %s", (collection) => {
    expect(source).toContain(`"${collection}"`);
  });

  it("audits generation states and company membership integrity", () => {
    for (const status of ["active", "generating", "failed", "deleted"]) {
      expect(source).toContain(`"${status}"`);
    }
    expect(source).toContain("unexpected:");
    expect(source).toContain("activeMembershipWithoutActiveCompany");
    expect(source).toContain("planWithMissingActiveCompany");
    expect(source).toContain("planWithoutActiveOwnerMembership");
    expect(source).toContain("effectiveMinLength");
    expect(source).toContain("passwordPolicyEnforcementState");
    expect(source).toContain("passwordPolicyVersions");
    expect(source).toContain("minPasswordLength");
    expect(source).toContain("googleClientConfigured");
    expect(source).toContain("googleEnabled");
    expect(source).toContain('"firebase_default"');
    expect(source).not.toContain("pendingActionPlans");
  });
});
