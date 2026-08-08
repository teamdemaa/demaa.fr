import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  getPublishedB2BOpportunity: vi.fn(),
  logOperationalError: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  normalizeIdempotencyKey: (value: unknown) => typeof value === "string" && value.length >= 8 ? value : null,
  normalizeText: (value: unknown, maxLength: number) => typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "",
  readJsonBody: async <T,>(request: Request) => ({ data: await request.json() as T, response: null }),
}));
vi.mock("@/lib/b2b-opportunities.server", () => ({ getPublishedB2BOpportunity: mocks.getPublishedB2BOpportunity }));
vi.mock("@/lib/lead-attribution-server", () => ({ resolveLeadAttribution: mocks.resolveLeadAttribution }));
vi.mock("@/lib/lead-context", () => ({ resolveLeadContext: mocks.resolveLeadContext }));
vi.mock("@/lib/lead-notifications", () => ({ submitLeadRequest: mocks.submitLeadRequest }));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: mocks.logOperationalError }));
vi.mock("@/lib/request-guard", () => ({ enforceAllowedHost: vi.fn().mockReturnValue(null), enforceSameOrigin: vi.fn().mockReturnValue(null) }));

import { POST } from "@/app/api/opportunites-b2b/interest/route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.fr/api/opportunites-b2b/interest", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://demaa.fr", Referer: "https://demaa.fr/opportunites-b2b" }, body: JSON.stringify({ email: "MAYA@EXAMPLE.COM", fullName: "Maya Martin", idempotencyKey: "interest:12345678", opportunitySlug: "prestataire-appel-offres-btp", website: "", ...overrides }) });
}

describe("B2B opportunity interest route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.getPublishedB2BOpportunity.mockResolvedValue({ category: "BTP", description: "Accompagnement appels d’offres.", slug: "prestataire-appel-offres-btp", title: "Recherche prestataire spécialisé appels d’offres BTP" });
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({ source: "Opportunité B2B - Recherche prestataire spécialisé appels d’offres BTP", sourceUrl: "https://demaa.fr/opportunites-b2b" });
    mocks.submitLeadRequest.mockResolvedValue({ duplicate: false, leadId: "lead-1" });
  });

  it("only records interest for a published Firebase opportunity", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({ channels: { email: false, resend: false, slack: true }, contact: { email: "maya@example.com", name: "Maya Martin" }, requestType: "b2b_opportunity_interest" }));
  });

  it("does not record an interest for a missing or unpublished opportunity", async () => {
    mocks.getPublishedB2BOpportunity.mockResolvedValue(null);
    const response = await POST(request());
    expect(response.status).toBe(404);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("silently accepts a honeypot without storage", async () => {
    const response = await POST(request({ website: "robot" }));
    expect(response.status).toBe(200);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("stops before reading Firebase when rate limited", async () => {
    mocks.enforceRateLimit.mockResolvedValueOnce(Response.json({ error: "rate" }, { status: 429 }));
    const response = await POST(request());
    expect(response.status).toBe(429);
    expect(mocks.getPublishedB2BOpportunity).not.toHaveBeenCalled();
  });
});
