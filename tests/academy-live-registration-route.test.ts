import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  getPublicLiveSessionSlot: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  normalizeIdempotencyKey: (value: unknown) => typeof value === "string" ? value : null,
  normalizeText: (value: unknown, maxLength: number) => typeof value === "string" ? value.trim().slice(0, maxLength) : "",
  readJsonBody: async <T,>(request: Request) => ({ data: await request.json() as T, response: null }),
}));
vi.mock("@/lib/lead-attribution-server", () => ({ resolveLeadAttribution: mocks.resolveLeadAttribution }));
vi.mock("@/lib/lead-context", () => ({ resolveLeadContext: mocks.resolveLeadContext }));
vi.mock("@/lib/lead-notifications", () => ({ submitLeadRequest: mocks.submitLeadRequest }));
vi.mock("@/lib/live-session-catalog", () => ({
  getPublicLiveSessionSlot: mocks.getPublicLiveSessionSlot,
}));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: vi.fn() }));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));

import { POST } from "@/app/api/academy-live-registration/route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.co/api/academy-live-registration", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
      Referer: "https://demaa.co/academie",
    },
    body: JSON.stringify({
      company: "Atelier Acme",
      email: "maya@atelier-acme.fr",
      fullName: "Maya Martin",
      idempotencyKey: "academy:12345678",
      slotId: "validated-slot-1",
      trainingSlug: "etre-visible-sur-google",
      website: "",
      ...overrides,
    }),
  });
}

describe("Academy live registration route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.getPublicLiveSessionSlot.mockImplementation((trainingSlug, slotId) =>
      trainingSlug === "etre-visible-sur-google" && slotId === "validated-slot-1"
        ? {
            training: {
              catalogVersion: "academy-live-catalog-test-v1",
              duration: "2 h",
              slug: trainingSlug,
              title: "Être visible sur Google",
            },
            slot: { id: slotId, startsAt: "2030-01-10T10:00:00+01:00" },
          }
        : null,
    );
    mocks.resolveLeadContext.mockResolvedValue({
      sectorLabel: null,
      source: "Académie - Formation en direct - Être visible sur Google",
      sourceUrl: "https://demaa.co/academie",
      systemName: null,
      systemSlug: null,
    });
    mocks.submitLeadRequest.mockResolvedValue({ duplicate: false, leadId: "live-1" });
  });

  it("stores the minimal registration and alerts Demaa without Stripe", async () => {
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(mocks.resolveLeadContext).toHaveBeenCalledWith({
      source: "Académie - Formation en direct - Être visible sur Google",
      sourceUrl: "https://demaa.co/academie",
    });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      channels: { email: true, resend: false, slack: true },
      contact: { company: "Atelier Acme", email: "maya@atelier-acme.fr", name: "Maya Martin" },
      requestType: "academy_live_registration",
    }));
  });

  it("rejects personal email domains and unknown slots", async () => {
    expect((await POST(request({ email: "maya@gmail.com" }))).status).toBe(400);
    expect((await POST(request({ slotId: "generated-slot" }))).status).toBe(404);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });
});
