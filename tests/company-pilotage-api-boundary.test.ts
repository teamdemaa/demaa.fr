import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("company Pilotage API boundary", () => {
  it("uses only authenticated company-scoped endpoints and rejects browser company IDs", () => {
    const files = [
      "src/app/api/company/pilotage/metrics/route.ts",
      "src/app/api/company/pilotage/metrics/[period]/route.ts",
      "src/app/api/company/pilotage/strategy/route.ts",
      "src/app/api/company/pilotage/strategy/initialize/route.ts",
      "src/app/api/company/pilotage/strategy/cycles/route.ts",
      "src/app/api/company/pilotage/strategy/cycles/[cycleId]/route.ts",
      "src/app/api/company/pilotage/strategy/history/route.ts",
    ].map(source).join("\n");
    expect(files).toContain("requireCompanyPilotageIdentity");
    expect(files).toContain("CompanyPilotageAccessError");
    expect(files).toContain("company_id");
    expect(files).not.toContain("body.companyId");
    expect(files).not.toContain("body.company_id");
    expect(files).toContain("expectedRevision");
    expect(files).toContain("revision_conflict");
    expect(files).toContain("archived_cycle");
  });

  it("keeps Pilotage outside all AI request contracts", () => {
    const aiSources = [
      "src/lib/action-plan-command-contract.ts",
      "src/lib/action-plan-command.server.ts",
      "src/lib/action-plan-generation.server.ts",
    ].map(source).join("\n");
    expect(aiSources).not.toMatch(/company_monthly_metrics|company_strategies|CompanyFigures|CompanyStrategy/);
  });
});
