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
});
