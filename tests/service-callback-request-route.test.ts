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
      Referer: "https://demaa.co/services/assistance-administrative",
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
    serviceSlug: "assistance-administrative",
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
      source: "Services - Assistante administrative",
      sourceUrl: "https://demaa.co/services/assistance-administrative",
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
      fields: expect.arrayContaining([
        { label: "Service", value: "Prospection ciblée" },
        { label: "Slug du service", value: "prospection-ciblee" },
        { label: "Numéro WhatsApp", value: "+33 6 12 34 56 78" },
        { label: "Locale", value: "fr" },
        { label: "Marché", value: "fr-fr" },
        { label: "Page source", value: "/services/assistance-administrative" },
      ]),
      requestType: "service_callback_request",
    }));
  });

  it("accepts the existing callback journey for the free alternance service", async () => {
    const response = await POST(request(validBody({
      serviceSlug: "recruter-un-alternant",
    })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.arrayContaining([
        { label: "Service", value: "Recruter un alternant" },
        { label: "Slug du service", value: "recruter-un-alternant" },
        { label: "Numéro WhatsApp", value: "+33 6 12 34 56 78" },
      ]),
      requestType: "service_callback_request",
    }));
  });

  it("preserves the English locale and market in the existing request pipeline", async () => {
    const response = await POST(request(validBody({
      localeCode: "en",
      marketCode: "global-en-beta",
      serviceSlug: "coach-business",
      source: "english-solutions",
      systemSlug: "saas",
    })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.arrayContaining([
        { label: "Contact number", value: "+33 6 12 34 56 78" },
        { label: "Langue", value: "en" },
        { label: "Marché", value: "global-en-beta" },
      ]),
      title: "Service request - Coach business",
    }));
  });

  it("rejects an unsupported locale and market pairing", async () => {
    const response = await POST(request(validBody({
      localeCode: "en",
      marketCode: "fr-fr",
    })));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("accepts the simple callback journey for process automation", async () => {
    const response = await POST(request(validBody({
      modelSlug: "structure-google-drive-entreprise",
      packageSlug: "automatisation-essentielle",
      serviceSlug: "automatisation-processus",
      source: "modele-detail",
      sourcePage: "/automatisation?source=modele-detail&modelSlug=structure-google-drive-entreprise",
    })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: [
        { label: "Service", value: "Accompagnement à l’automatisation" },
        { label: "Slug du service", value: "automatisation-processus" },
        { label: "Forfait", value: "Accompagnement à l’automatisation" },
        { label: "Slug du forfait", value: "automatisation-essentielle" },
        { label: "Prix de référence", value: "3 500 € HT" },
        { label: "Numéro WhatsApp", value: "+33 6 12 34 56 78" },
        { label: "Locale", value: "fr" },
        { label: "Marché", value: "fr-fr" },
        { label: "Origine interne", value: "modele-detail" },
        { label: "Modèle", value: "structure-google-drive-entreprise" },
        { label: "Page source", value: "/automatisation?source=modele-detail&modelSlug=structure-google-drive-entreprise" },
      ],
      requestType: "service_callback_request",
    }));
  });

  it("accepts the canonical Application métier package and resolves its price server-side", async () => {
    const response = await POST(request(validBody({
      packageSlug: "application-metier-essentielle",
      serviceSlug: "application-metier",
      sourcePage: "/application-metier?source=solutions-systeme",
    })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.arrayContaining([
        { label: "Service", value: "Application métier" },
        { label: "Forfait", value: "Application métier" },
        { label: "Slug du forfait", value: "application-metier-essentielle" },
        { label: "Prix de référence", value: "À partir de 4 500 € HT" },
        { label: "Page source", value: "/application-metier?source=solutions-systeme" },
      ]),
      title: "Demande de contact WhatsApp - Application métier - Application métier",
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
      fields: expect.arrayContaining([
        { label: "Service", value: "Assistante administrative" },
        { label: "Slug du service", value: "assistance-administrative" },
        { label: "Numéro WhatsApp", value: "+33 6 12 34 56 78" },
        { label: "Locale", value: "fr" },
        { label: "Marché", value: "fr-fr" },
        { label: "Page source", value: "/services/assistance-administrative" },
      ]),
      idempotencyKey: expect.stringMatching(/^[a-f0-9]{64}$/),
      requestType: "service_callback_request",
    }));
  });

  it.each([
    "formalites-juridiques",
    "sous-traitance-formalites-juridiques",
    "expert-comptable",
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
    ["automatisation-processus", "automatisation-avancee-ia"],
    ["application-metier", "application-metier-avancee"],
    ["application-metier", "forfait-inconnu"],
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

  it("preserves the originating system context without exposing another field", async () => {
    const response = await POST(request(validBody({
      source: "solutions-systeme",
      systemSlug: "cabinet-comptable",
    })));

    expect(response.status).toBe(202);
    expect(mocks.resolveLeadContext).toHaveBeenCalledWith({
      source: "Solutions - Assistante administrative",
      sourceUrl: "https://demaa.co/services/assistance-administrative",
      systemSlug: "cabinet-comptable",
    });
  });

  it("treats the honeypot as accepted without creating a lead", async () => {
    const response = await POST(request(validBody({ website: "bot.example" })));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });
});
