import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/lead-context", () => ({ resolveLeadContext: mocks.resolveLeadContext }));
vi.mock("@/lib/lead-notifications", () => ({ submitLeadRequest: mocks.submitLeadRequest }));
vi.mock("@/lib/operational-log", () => ({
  logOperationalError: vi.fn(),
  logOperationalEvent: vi.fn(),
}));

import { POST } from "../src/app/api/fillout-webhook/route";

const webhookPayload = {
  formId: "sWP6PSPRVLus",
  submissionId: "sub_route_12345",
  submissionTime: "2026-07-20T20:00:00.000Z",
  questions: [
    { id: "email", name: "E-mail", type: "EmailInput", value: "lead@example.com" },
  ],
  urlParameters: [
    { id: "slug", name: "systemSlug", value: "freelance" },
    { id: "source", name: "source", value: "Kit opérationnel" },
    { id: "first", name: "dem_first_source", value: "linkedin" },
    { id: "medium", name: "dem_first_medium", value: "social" },
  ],
};

describe("Fillout webhook route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FILLOUT_WEBHOOK_SECRET = "route-secret";
    mocks.resolveLeadContext.mockResolvedValue({
      sectorLabel: "Conseil & services aux entreprises",
      sectorSlug: "conseil-services",
      source: "Kit opérationnel",
      sourceUrl: null,
      systemName: "Freelance B2B",
      systemSlug: "freelance",
    });
    mocks.submitLeadRequest.mockResolvedValue({
      duplicate: false,
      leadId: "lead_123",
    });
  });

  it("rejects requests without the webhook secret", async () => {
    const response = await POST(new Request("https://demaa.fr/api/fillout-webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    }));

    expect(response.status).toBe(401);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("stores an authenticated submission with its deterministic key", async () => {
    const response = await POST(new Request("https://demaa.fr/api/fillout-webhook", {
      method: "POST",
      headers: {
        Authorization: "Bearer route-secret",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, leadId: "lead_123", duplicate: false });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      idempotencyKey: "fillout:sub_route_12345",
      requestType: "organisation_session_booking",
      title: "Session d’organisation — formulaire envoyé",
      fields: expect.arrayContaining([
        expect.objectContaining({
          label: "Formulaire",
          value: "Session d’organisation (Fillout)",
        }),
      ]),
      contact: expect.objectContaining({ email: "lead@example.com" }),
      context: expect.objectContaining({ systemSlug: "freelance" }),
    }));
  });
});
