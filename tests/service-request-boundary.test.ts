import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const backendFiles = [
  "src/app/api/service-request/route.ts",
  "src/app/api/solution-referral/route.ts",
  "src/lib/service-request-notifications.server.ts",
  "src/lib/service-request-delivery-worker.server.ts",
  "src/lib/service-request-security.server.ts",
  "src/lib/service-request-snapshots.server.ts",
  "src/lib/service-request-storage.server.ts",
  "src/lib/service-solution-request-contract.ts",
  "src/lib/solution-referral-disclosures.server.ts",
] as const;

function source(path: string) {
  return readFileSync(path, "utf8");
}

describe("service request backend boundaries", () => {
  it("keeps storage, delivery and legal disclosure modules server-only", () => {
    for (const path of [
      "src/lib/service-request-notifications.server.ts",
      "src/lib/service-request-delivery-worker.server.ts",
      "src/lib/service-request-security.server.ts",
      "src/lib/service-request-snapshots.server.ts",
      "src/lib/service-request-storage.server.ts",
      "src/lib/solution-referral-disclosures.server.ts",
    ]) {
      expect(source(path).startsWith('import "server-only";')).toBe(true);
    }
  });

  it("does not couple the new workflows to lead storage or D061 retry code", () => {
    const combined = backendFiles.map(source).join("\n");
    expect(combined).not.toMatch(/@\/lib\/lead-storage/);
    expect(combined).not.toMatch(/@\/lib\/lead-notifications/);
    expect(combined).not.toMatch(/@\/lib\/lead-retry/);
    expect(combined).not.toMatch(/systeme-kit/);
  });

  it("uses only published selectors and never imports raw registry JSON", () => {
    const routes = [
      source("src/app/api/service-request/route.ts"),
      source("src/app/api/solution-referral/route.ts"),
    ].join("\n");
    expect(routes).toContain("getPublishedServiceOfferV2BySlug");
    expect(routes).toContain("getPublishedSolutionResourceBySlug");
    expect(routes).toContain("getPublishedSolutionPlacementsForSystem");
    expect(routes).not.toMatch(/generated\.json/);
    expect(routes).not.toMatch(/getAll/);
  });

  it("does not log or return visible contact fields", () => {
    const routes = [
      source("src/app/api/service-request/route.ts"),
      source("src/app/api/solution-referral/route.ts"),
    ].join("\n");
    expect(routes).not.toMatch(/console\./);
    expect(routes).not.toMatch(
      /logOperational(?:Event|Error)\([^;]*payload\.(?:email|need|company|firstName)/,
    );
    expect(routes).not.toMatch(/leadId/);
  });

  it("registers independent three-year cleanup without touching lead storage", () => {
    const maintenance = source("src/lib/operational-maintenance.ts");
    expect(maintenance).toContain('{ collection: "service_requests", field: "retention_expires_at"');
    expect(maintenance).toContain('{ collection: "solution_referrals", field: "retention_expires_at"');
    expect(maintenance).toContain('{ collection: "service_request_rate_limits", field: "expires_at"');
  });
});
