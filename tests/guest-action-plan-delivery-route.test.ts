import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  deliver: vi.fn(),
  enforceRateLimit: vi.fn(),
  get: vi.fn(),
  isEnabled: vi.fn(),
  prepare: vi.fn(),
  submitDiagnostic: vi.fn(),
  DiagnosticConflict: class extends Error {},
  EmailConflict: class extends Error {},
}));

vi.mock("@/lib/action-plan-api.server", () => ({
  noStoreHeaders: () => ({ "Cache-Control": "private, no-store, max-age=0" }),
  withNoStore: (response: Response) => response,
}));
vi.mock("@/lib/guest-action-plan-generation.server", () => ({
  getGuestActionPlanGenerationForAccess: mocks.get,
}));
vi.mock("@/lib/guest-action-plan-security.server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/guest-action-plan-security.server")>()),
  isGuestProductEnabled: mocks.isEnabled,
}));
vi.mock("@/lib/guest-plan-email-delivery.server", () => ({
  deliverGuestPlanEmail: mocks.deliver,
  prepareGuestPlanEmailDelivery: mocks.prepare,
  GuestPlanEmailIdempotencyConflictError: mocks.EmailConflict,
}));
vi.mock("@/lib/guest-diagnostic-request.server", () => ({
  submitGuestDiagnosticRequest: mocks.submitDiagnostic,
  GuestDiagnosticIdempotencyConflictError: mocks.DiagnosticConflict,
}));
vi.mock("@/lib/service-request-security.server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/service-request-security.server")>()),
  enforceServiceRequestRateLimit: mocks.enforceRateLimit,
}));

import { POST as requestDiagnostic } from "@/app/api/guest/action-plans/[id]/diagnostic/route";
import { POST as requestEmail } from "@/app/api/guest/action-plans/[id]/email/route";

const accessKey = "a".repeat(43);
const generationId = `gpl_${"b".repeat(40)}`;
const activeState = {
  status: "active" as const,
  actionPlan: { id: generationId, title: "Plan test" },
};
const context = { params: Promise.resolve({ id: generationId }) };

function request(path: "diagnostic" | "email", body: Record<string, unknown>, key = accessKey) {
  return new Request(`https://demaa.co/api/guest/action-plans/${generationId}/${path}`, {
    method: "POST",
    headers: {
      Authorization: key ? `Bearer ${key}` : "",
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
    },
    body: JSON.stringify(body),
  });
}

describe("guest action plan delivery routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = "https://demaa.co";
    mocks.isEnabled.mockReturnValue(true);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.get.mockResolvedValue(activeState);
    mocks.prepare.mockResolvedValue({ created: true, id: "delivery-1", status: "pending" });
    mocks.deliver.mockResolvedValue({ status: "sent" });
    mocks.submitDiagnostic.mockResolvedValue({ duplicate: false, leadId: "lead-1" });
  });

  it("sends a plan only with the bearer secret and never returns it", async () => {
    const response = await requestEmail(request("email", {
      email: "owner@example.com",
      idempotencyKey: "email-request-123456",
      website: "",
    }), context);
    expect(response.status).toBe(200);
    expect(mocks.get).toHaveBeenCalledWith({ id: generationId, accessKey });
    expect(mocks.prepare).toHaveBeenCalledWith(expect.objectContaining({
      email: "owner@example.com",
      generationId,
    }));
    expect(JSON.stringify(await response.json())).not.toContain(accessKey);
  });

  it("rejects email delivery without a bearer secret before reading the plan", async () => {
    const response = await requestEmail(request("email", {
      email: "owner@example.com",
      idempotencyKey: "email-request-123456",
    }, ""), context);
    expect(response.status).toBe(401);
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("requires explicit diagnostic consent and accepts an optional phone", async () => {
    const rejected = await requestDiagnostic(request("diagnostic", {
      contactConsent: false,
      email: "owner@example.com",
      idempotencyKey: "diagnostic-request-123456",
    }), context);
    expect(rejected.status).toBe(400);
    expect(mocks.submitDiagnostic).not.toHaveBeenCalled();

    const accepted = await requestDiagnostic(request("diagnostic", {
      contactConsent: true,
      email: "owner@example.com",
      idempotencyKey: "diagnostic-request-123456",
      message: "J’aimerais un avis.",
    }), context);
    expect(accepted.status).toBe(201);
    expect(mocks.submitDiagnostic).toHaveBeenCalledWith(expect.objectContaining({
      email: "owner@example.com",
      phone: null,
      plan: activeState.actionPlan,
    }));
  });

  it("fails closed when the temporary plan is missing or expired", async () => {
    mocks.get.mockResolvedValue({ status: "expired" });
    const response = await requestEmail(request("email", {
      email: "owner@example.com",
      idempotencyKey: "email-request-123456",
    }), context);
    expect(response.status).toBe(404);
    expect(mocks.prepare).not.toHaveBeenCalled();
  });

  it("reports conflicting idempotency keys without retrying a mutation", async () => {
    mocks.prepare.mockRejectedValue(new mocks.EmailConflict());
    const emailResponse = await requestEmail(request("email", {
      email: "owner@example.com",
      idempotencyKey: "email-request-123456",
    }), context);
    expect(emailResponse.status).toBe(409);
    expect(mocks.deliver).not.toHaveBeenCalled();

    mocks.submitDiagnostic.mockRejectedValue(new mocks.DiagnosticConflict());
    const diagnosticResponse = await requestDiagnostic(request("diagnostic", {
      contactConsent: true,
      email: "owner@example.com",
      idempotencyKey: "diagnostic-request-123456",
    }), context);
    expect(diagnosticResponse.status).toBe(409);
  });
});
