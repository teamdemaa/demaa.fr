import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/action-plan-api.server", () => ({
    getCurrentCustomerIdentity: async () => null,
    noStoreHeaders: () => ({ "Cache-Control": "private, no-store" }),
    withNoStore: (response: Response) => response,
}));
vi.mock("@/lib/api-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-security")>("@/lib/api-security");
  return { ...actual, enforceRateLimit: async () => null };
});
vi.mock("@/lib/request-guard", () => ({ enforceAllowedHost: () => null, enforceSameOrigin: () => null }));

import { requireCompanyPilotageIdentity } from "@/lib/company-pilotage-api.server";
import { GET as getMetrics } from "@/app/api/company/pilotage/metrics/route";
import { PUT as putMetric } from "@/app/api/company/pilotage/metrics/[period]/route";
import { POST as initializeStrategy } from "@/app/api/company/pilotage/strategy/initialize/route";

describe("company Pilotage routes", () => {
  it("returns 401 without a Demaa session", async () => {
    const access = await requireCompanyPilotageIdentity();
    expect(access.response?.status).toBe(401);
  });

  it("rejects every browser-provided company identifier", async () => {
    const read = await getMetrics(new Request("https://demaa.fr/api/company/pilotage/metrics?from=2026-08&to=2026-08&company_id=cmp_other"));
    expect(read.status).toBe(400);
    const write = await putMetric(new Request("https://demaa.fr/api/company/pilotage/metrics/2026-08", { method: "PUT", body: JSON.stringify({ expectedRevision: 0, revenueCents: 1, expensesCents: 1, cashBalanceCents: 1, company_id: "cmp_other" }) }), { params: Promise.resolve({ period: "2026-08" }) });
    expect(write.status).toBe(400);
    const strategy = await initializeStrategy(new Request("https://demaa.fr/api/company/pilotage/strategy/initialize", { method: "POST", body: JSON.stringify({ companyId: "cmp_other" }) }));
    expect(strategy.status).toBe(400);
  });
});
