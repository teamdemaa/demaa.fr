import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  enforceSameOrigin: vi.fn(),
  enforceServiceRequestRateLimit: vi.fn(),
  requireCurrentCustomerEmail: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  normalizeIdempotencyKey: (value: unknown) =>
    typeof value === "string" && value.length >= 8 ? value : null,
  normalizeText: (value: unknown, maxLength: number) =>
    typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, maxLength) : "",
  readJsonBody: async <T,>(request: Request) => ({
    data: await request.json() as T,
    response: null,
  }),
}));
vi.mock("@/lib/customer-space-session.server", () => ({
  requireCurrentCustomerEmail: mocks.requireCurrentCustomerEmail,
}));
vi.mock("@/lib/lead-attribution-server", () => ({
  resolveLeadAttribution: mocks.resolveLeadAttribution,
}));
vi.mock("@/lib/lead-context", () => ({ resolveLeadContext: mocks.resolveLeadContext }));
vi.mock("@/lib/lead-notifications", () => ({ submitLeadRequest: mocks.submitLeadRequest }));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: vi.fn() }));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));
vi.mock("@/lib/service-request-security.server", () => ({
  enforceServiceRequestRateLimit: mocks.enforceServiceRequestRateLimit,
}));

import { POST } from "@/app/api/coaching-request/route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.co/api/coaching-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
      Referer: "https://demaa.co/",
    },
    body: JSON.stringify({
      attribution: {},
      email: "spoofed@example.net",
      idempotencyKey: "coaching:12345678",
      message: "Je souhaite clarifier ma prochaine décision opérationnelle.",
      requestKind: "message",
      website: "",
      ...overrides,
    }),
  });
}

describe("coaching request route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceServiceRequestRateLimit.mockResolvedValue(null);
    mocks.requireCurrentCustomerEmail.mockResolvedValue({
      email: "owner@example.com",
      response: null,
    });
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({
      source: "Coaching - Messages",
      sourceUrl: "https://demaa.co/",
    });
    mocks.submitLeadRequest.mockResolvedValue({ duplicate: false, leadId: "lead-1" });
  });

  it("uses the authenticated session email and ignores a body email", async () => {
    const response = await POST(request());

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      contact: expect.objectContaining({ email: "owner@example.com" }),
      requestType: "coaching_message",
    }));
  });

  it("refuses a coaching request without an authenticated session", async () => {
    mocks.requireCurrentCustomerEmail.mockResolvedValue({
      email: null,
      response: Response.json({ error: "authentication_required" }, { status: 401 }),
    });

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });
});
