import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  getCurrentCustomerIdentityFromSession: vi.fn(),
  logOperationalError: vi.fn(),
  resolveMonthlyAccompanimentDiscount: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/monthly-accompaniment-benefit.server", () => ({
  isMonthlyAccompanimentDiscountEligible: (service: { monthlyAccompanimentDiscountEligible: boolean; delivery: string; slug: string }) =>
    service.monthlyAccompanimentDiscountEligible && service.delivery === "demaa" && service.slug !== "coach-business",
  resolveMonthlyAccompanimentDiscount: mocks.resolveMonthlyAccompanimentDiscount,
}));
vi.mock("@/lib/customer-space-session.server", () => ({
  getCurrentCustomerIdentityFromSession: mocks.getCurrentCustomerIdentityFromSession,
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
    mocks.getCurrentCustomerIdentityFromSession.mockResolvedValue(null);
    mocks.resolveMonthlyAccompanimentDiscount.mockResolvedValue({
      apply: false,
      eligible: false,
      percent: 0,
      source: null,
      validUntil: null,
    });
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
      monthlyAccompanimentDiscount: 12,
      price: "1 €",
    })));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("accepts the same callback journey for targeted prospecting", async () => {
    const response = await POST(request(validBody({ serviceSlug: "prospection-ciblee" })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: [
        { label: "Service", value: "Prospection ciblée" },
        { label: "Slug du service", value: "prospection-ciblee" },
        { label: "Numéro WhatsApp", value: "+33 6 12 34 56 78" },
        { label: "Locale", value: "fr" },
        { label: "Marché", value: "fr-fr" },
        { label: "Page source", value: "/services/expert-comptable" },
      ],
      requestType: "service_callback_request",
    }));
  });

  it("accepts the simple callback journey for process automation", async () => {
    mocks.getCurrentCustomerIdentityFromSession.mockResolvedValue({
      email: "owner@example.com",
      provider: "password",
      uid: "owner-uid",
    });
    mocks.resolveMonthlyAccompanimentDiscount.mockResolvedValue({
      apply: true,
      eligible: true,
      percent: 12,
      source: "coach_business",
      validUntil: "2027-08-14T00:00:00.000Z",
    });
    const response = await POST(request(validBody({
      packageSlug: "automatisation-avancee-ia",
      serviceSlug: "automatisation-processus",
    })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: [
        { label: "Service", value: "Automatisation des processus et IA" },
        { label: "Slug du service", value: "automatisation-processus" },
        { label: "Forfait", value: "Automatisation avancée + IA" },
        { label: "Slug du forfait", value: "automatisation-avancee-ia" },
        { label: "Prix de référence", value: "3 000 € HT" },
        { label: "Numéro WhatsApp", value: "+33 6 12 34 56 78" },
        { label: "Locale", value: "fr" },
        { label: "Marché", value: "fr-fr" },
        { label: "Page source", value: "/services/expert-comptable" },
        {
          label: "Avantage accompagnement mensuel",
          value: "−12 % confirmé côté serveur sur les honoraires Demaa",
        },
      ],
      requestType: "service_callback_request",
    }));
    expect(mocks.resolveMonthlyAccompanimentDiscount).toHaveBeenCalledWith(expect.objectContaining({
      uid: "owner-uid",
    }));
  });

  it("fails closed on the discount without losing the callback when entitlement storage is unavailable", async () => {
    mocks.getCurrentCustomerIdentityFromSession.mockResolvedValue({
      email: "owner@example.com",
      provider: "password",
      uid: "owner-uid",
    });
    mocks.resolveMonthlyAccompanimentDiscount.mockRejectedValue(new Error("firestore_unavailable"));

    const response = await POST(request(validBody({
      packageSlug: "automatisation-essentielle",
      serviceSlug: "automatisation-processus",
    })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.arrayContaining([{
        label: "Avantage accompagnement mensuel",
        value: "Prestation éligible, accompagnement mensuel actif non confirmé",
      }]),
    }));
    expect(mocks.logOperationalError).toHaveBeenCalledWith(
      "service_callback_request.monthly_discount_verification_failed",
      expect.any(Error),
      { serviceSlug: "automatisation-processus" },
    );
  });

  it("accepts the canonical Application métier package and resolves its price server-side", async () => {
    mocks.resolveMonthlyAccompanimentDiscount.mockResolvedValue({
      apply: false,
      eligible: true,
      percent: 0,
      source: null,
      validUntil: null,
    });
    const response = await POST(request(validBody({
      packageSlug: "application-metier-essentielle",
      serviceSlug: "application-metier",
      sourcePage: "/sur-mesure?source=solutions-systeme",
    })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.arrayContaining([
        { label: "Service", value: "Application métier" },
        { label: "Forfait", value: "Application métier essentielle" },
        { label: "Slug du forfait", value: "application-metier-essentielle" },
        { label: "Prix de référence", value: "4 500 € HT" },
        { label: "Page source", value: "/sur-mesure?source=solutions-systeme" },
      ]),
      title: "Demande de contact WhatsApp - Application métier - Application métier essentielle",
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
        { label: "Locale", value: "fr" },
        { label: "Marché", value: "fr-fr" },
        { label: "Page source", value: "/services/expert-comptable" },
      ],
      idempotencyKey: expect.stringMatching(/^[a-f0-9]{64}$/),
      requestType: "service_callback_request",
    }));
  });

  it.each([
    "formalites-juridiques",
    "sous-traitance-formalites-juridiques",
  ])("rejects a direct public callback for private recommendation %s", async (serviceSlug) => {
    const response = await POST(request(validBody({ serviceSlug })));

    expect(response.status).toBe(404);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("accepts a callback request for the public administrative assistant", async () => {
    const response = await POST(request(validBody({ serviceSlug: "assistance-administrative" })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.arrayContaining([
        { label: "Service", value: "Assistante administrative" },
        { label: "Slug du service", value: "assistance-administrative" },
      ]),
    }));
  });

  it.each([
    ["automatisation-processus", undefined],
    ["automatisation-processus", "application-metier-essentielle"],
    ["application-metier", "forfait-inconnu"],
    ["expert-comptable", "automatisation-essentielle"],
  ])("rejects a missing or cross-service package for %s", async (serviceSlug, packageSlug) => {
    const response = await POST(request(validBody({ packageSlug, serviceSlug })));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("rejects an external source page", async () => {
    const response = await POST(request(validBody({
      sourcePage: "https://evil.example/services/expert-comptable",
    })));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("rejects a locale and market not yet published by this French route", async () => {
    const response = await POST(request(validBody({
      localeCode: "en",
      marketCode: "global-en-beta",
    })));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
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
