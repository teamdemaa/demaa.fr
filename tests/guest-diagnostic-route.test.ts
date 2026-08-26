import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  isEnabled: vi.fn(),
  submitDiagnostic: vi.fn(),
  DiagnosticConflict: class extends Error {},
}));

vi.mock("@/lib/action-plan-api.server", () => ({
  noStoreHeaders: () => ({ "Cache-Control": "private, no-store, max-age=0" }),
  withNoStore: (response: Response) => response,
}));
vi.mock("@/lib/guest-action-plan-api.server", () => ({
  guestProductUnavailableResponse: () => Response.json({ error: "Indisponible" }, { status: 503 }),
}));
vi.mock("@/lib/guest-action-plan-security.server", () => ({
  isGuestProductEnabled: mocks.isEnabled,
}));
vi.mock("@/lib/guest-diagnostic-request.server", () => ({
  submitGuestDiagnosticRequest: mocks.submitDiagnostic,
  GuestDiagnosticIdempotencyConflictError: mocks.DiagnosticConflict,
}));
vi.mock("@/lib/service-request-security.server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/service-request-security.server")>()),
  enforceServiceRequestRateLimit: mocks.enforceRateLimit,
}));

import { POST } from "@/app/api/guest/diagnostic/route";

function request(body: Record<string, unknown>) {
  return new Request("https://demaa.co/api/guest/diagnostic", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
    },
    body: JSON.stringify(body),
  });
}

describe("guest diagnostic without a generated plan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = "https://demaa.co";
    mocks.isEnabled.mockReturnValue(true);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.submitDiagnostic.mockResolvedValue({ duplicate: false, leadId: "lead-1" });
  });

  it("submits the current situation without creating or requiring a plan", async () => {
    const response = await POST(request({
      contactConsent: true,
      callbackAvailability: "Mardi entre 9 h et 11 h",
      email: "owner@example.com",
      idempotencyKey: "diagnostic-request-123456",
      message: "J’aimerais comprendre comment mieux organiser mon activité.",
      phone: "06 12 34 56 78",
      situation: "Je perds du temps dans le suivi des demandes.",
      website: "",
    }));

    expect(response.status).toBe(201);
    expect(mocks.submitDiagnostic).toHaveBeenCalledWith(expect.objectContaining({
      callbackAvailability: "Mardi entre 9 h et 11 h",
      email: "owner@example.com",
      phone: "06 12 34 56 78",
      plan: null,
      situation: "Je perds du temps dans le suivi des demandes.",
    }));
  });

  it("requires consent, a valid contact and a meaningful message", async () => {
    const missingMessage = await POST(request({
      contactConsent: true,
      email: "owner@example.com",
      idempotencyKey: "diagnostic-request-123456",
    }));
    expect(missingMessage.status).toBe(400);

    const missingConsent = await POST(request({
      contactConsent: false,
      email: "owner@example.com",
      idempotencyKey: "diagnostic-request-123456",
      message: "J’ai besoin d’aide pour structurer mon activité.",
    }));
    expect(missingConsent.status).toBe(400);
    expect(mocks.submitDiagnostic).not.toHaveBeenCalled();
  });

  it("silently accepts the honeypot without storing a request", async () => {
    const response = await POST(request({
      contactConsent: true,
      email: "owner@example.com",
      idempotencyKey: "diagnostic-request-123456",
      website: "https://spam.example",
    }));
    expect(response.status).toBe(202);
    expect(mocks.enforceRateLimit).not.toHaveBeenCalled();
    expect(mocks.submitDiagnostic).not.toHaveBeenCalled();
  });

  it("keeps idempotency conflicts explicit", async () => {
    mocks.submitDiagnostic.mockRejectedValue(new mocks.DiagnosticConflict());
    const response = await POST(request({
      contactConsent: true,
      email: "owner@example.com",
      idempotencyKey: "diagnostic-request-123456",
      message: "J’ai besoin d’aide pour structurer mon activité.",
    }));
    expect(response.status).toBe(409);
  });
});
