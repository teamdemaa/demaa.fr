import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  logOperationalError: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/lead-attribution-server", () => ({
  resolveLeadAttribution: mocks.resolveLeadAttribution,
}));
vi.mock("@/lib/lead-context", () => ({
  resolveLeadContext: mocks.resolveLeadContext,
}));
vi.mock("@/lib/lead-notifications", () => ({
  submitLeadRequest: mocks.submitLeadRequest,
}));
vi.mock("@/lib/operational-log", () => ({
  logOperationalError: mocks.logOperationalError,
}));
vi.mock("@/lib/service-request-security.server", () => ({
  enforceServiceRequestRateLimit: mocks.enforceRateLimit,
}));

import { POST } from "@/app/api/service-callback-request/route";

function request(
  body: Record<string, unknown>,
  origin = "https://demaa.co",
) {
  return new Request("https://demaa.co/api/service-callback-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Referer: "https://demaa.co/services/expert-comptable",
    },
    body: JSON.stringify(body),
  });
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    attribution: { version: 1 },
    company: "Atelier Martin",
    idempotencyKey: "service:callback:12345678",
    phone: "+33 6 12 34 56 78",
    serviceSlug: "expert-comptable",
    website: "",
    ...overrides,
  };
}

describe("service callback request route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = "https://demaa.co";
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({
      sectorLabel: null,
      sectorSlug: null,
      source: "Services - Expert-comptable",
      sourceUrl: "https://demaa.co/services/expert-comptable",
      systemName: null,
      systemSlug: null,
    });
    mocks.submitLeadRequest.mockResolvedValue({ leadId: "lead-123" });
  });

  it("rejects cross-origin requests before rate limiting or storage", async () => {
    const response = await POST(request(validBody(), "https://evil.example"));

    expect(response.status).toBe(403);
    expect(mocks.enforceRateLimit).not.toHaveBeenCalled();
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it.each([
    { company: "" },
    { phone: "123" },
    { idempotencyKey: "bad" },
  ])("rejects missing or invalid strict callback fields %#", async (overrides) => {
    const response = await POST(request(validBody(overrides)));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("rejects browser-supplied fields outside the allowlist", async () => {
    const response = await POST(request(validBody({
      email: "private@example.test",
      price: "1 €",
    })));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("accepts the same callback journey for marketing and prospecting", async () => {
    const response = await POST(request(validBody({ serviceSlug: "marketing-vente" })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: [
        { label: "Service", value: "Plan marketing et prospection" },
        { label: "Slug du service", value: "marketing-vente" },
        { label: "Numéro WhatsApp", value: "+33 6 12 34 56 78" },
      ],
      requestType: "service_callback_request",
    }));
  });

  it("accepts the simple callback journey for process automation", async () => {
    const response = await POST(request(validBody({
      serviceSlug: "automatisation-processus",
    })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: [
        { label: "Service", value: "Automatisation des processus" },
        { label: "Slug du service", value: "automatisation-processus" },
        { label: "Numéro WhatsApp", value: "+33 6 12 34 56 78" },
      ],
      requestType: "service_callback_request",
    }));
  });

  it("stores company and phone in Firebase before delivering to Slack", async () => {
    const response = await POST(request(validBody()));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.enforceRateLimit).toHaveBeenNthCalledWith(1, expect.any(Request), {
      limit: 8,
      scope: "ip",
      windowMs: 10 * 60 * 1000,
    });
    expect(mocks.enforceRateLimit).toHaveBeenNthCalledWith(2, expect.any(Request), {
      identity: "+33 6 12 34 56 78",
      limit: 4,
      scope: "phone",
      windowMs: 60 * 60 * 1000,
    });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      channels: { email: false, resend: false, slack: true },
      contact: {
        company: "Atelier Martin",
        phone: "+33 6 12 34 56 78",
      },
      fields: [
        { label: "Service", value: "Expert-comptable" },
        { label: "Slug du service", value: "expert-comptable" },
        { label: "Numéro WhatsApp", value: "+33 6 12 34 56 78" },
      ],
      idempotencyKey: "service:callback:12345678",
      requestType: "service_callback_request",
    }));
  });

  it.each([
    "formalites-juridiques",
    "sous-traitance-formalites-juridiques",
  ])("accepts the WhatsApp callback journey for %s", async (serviceSlug) => {
    const response = await POST(request(validBody({ serviceSlug })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.arrayContaining([
        { label: "Slug du service", value: serviceSlug },
        { label: "Numéro WhatsApp", value: "+33 6 12 34 56 78" },
      ]),
      requestType: "service_callback_request",
    }));
  });

  it("preserves the originating system context without exposing another field", async () => {
    const response = await POST(request(validBody({
      source: "solutions-systeme",
      systemSlug: "cabinet-comptable",
    })));

    expect(response.status).toBe(202);
    expect(mocks.resolveLeadContext).toHaveBeenCalledWith({
      source: "Solutions - Expert-comptable",
      sourceUrl: "https://demaa.co/services/expert-comptable",
      systemSlug: "cabinet-comptable",
    });
  });

  it("treats the honeypot as accepted without creating a lead", async () => {
    const response = await POST(request(validBody({ website: "bot.example" })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });
});
