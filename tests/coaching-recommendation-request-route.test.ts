import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  enforceSameOrigin: vi.fn(),
  enforceServiceRequestRateLimit: vi.fn(),
  requestCoachingRecommendation: vi.fn(),
  requireCurrentCustomerIdentity: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/coaching-conversation.server", () => ({
  requestCoachingRecommendation: mocks.requestCoachingRecommendation,
}));
vi.mock("@/lib/customer-space-session.server", () => ({
  requireCurrentCustomerIdentity: mocks.requireCurrentCustomerIdentity,
}));
vi.mock("@/lib/lead-attribution-server", () => ({ resolveLeadAttribution: mocks.resolveLeadAttribution }));
vi.mock("@/lib/lead-context", () => ({ resolveLeadContext: mocks.resolveLeadContext }));
vi.mock("@/lib/lead-notifications", () => ({ submitLeadRequest: mocks.submitLeadRequest }));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: vi.fn(), logOperationalEvent: vi.fn() }));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));
vi.mock("@/lib/service-request-security.server", () => ({
  enforceServiceRequestRateLimit: mocks.enforceServiceRequestRateLimit,
}));

import { POST } from "@/app/api/coaching-recommendation-request/route";

function request(body: Record<string, unknown> = {}) {
  return new Request("https://demaa.co/api/coaching-recommendation-request", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://demaa.co" },
    body: JSON.stringify({
      company: "Atelier Martin",
      phone: "+33 6 12 34 56 78",
      recommendationId: "11111111-1111-4111-8111-111111111111",
      website: "",
      ...body,
    }),
  });
}

describe("private coaching recommendation request", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceServiceRequestRateLimit.mockResolvedValue(null);
    mocks.requireCurrentCustomerIdentity.mockResolvedValue({
      identity: { email: "owner@example.com", uid: "owner-uid" },
      response: null,
    });
    mocks.requestCoachingRecommendation.mockResolvedValue({
      available: true,
      created: true,
      recommendation: {
        id: "11111111-1111-4111-8111-111111111111",
        name: "Formalités d’entreprise",
        needLabel: "Création",
      },
    });
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({ source: "Clarification" });
    mocks.submitLeadRequest.mockResolvedValue({ leadId: "lead-1" });
  });

  it("requires the authenticated owner", async () => {
    mocks.requireCurrentCustomerIdentity.mockResolvedValue({
      identity: null,
      response: Response.json({ error: "authentication_required" }, { status: 401 }),
    });
    const response = await POST(request());
    expect(response.status).toBe(401);
    expect(mocks.requestCoachingRecommendation).not.toHaveBeenCalled();
  });

  it("uses the session UID and creates no Stripe payment", async () => {
    const source = readFileSync(
      new URL("../src/app/api/coaching-recommendation-request/route.ts", import.meta.url),
      "utf8",
    );
    expect(source).not.toMatch(/stripe|checkout|payment/i);

    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(mocks.requestCoachingRecommendation).toHaveBeenCalledWith({
      recommendationId: "11111111-1111-4111-8111-111111111111",
      uid: "owner-uid",
    });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      contact: expect.objectContaining({ email: "owner@example.com" }),
      requestType: "coaching_recommendation_introduction",
    }));
  });

  it("refuses a withdrawn recommendation", async () => {
    mocks.requestCoachingRecommendation.mockResolvedValue({ available: false });
    const response = await POST(request());
    expect(response.status).toBe(409);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });
});
