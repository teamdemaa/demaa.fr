import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  getEnterpriseBySlug: vi.fn(),
  logOperationalError: vi.fn(),
  logOperationalEvent: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/api-security", async () => {
  const crypto = await import("node:crypto");
  return {
    enforceRateLimit: mocks.enforceRateLimit,
    normalizeIdempotencyKey: (value: unknown) =>
      typeof value === "string" && value.length >= 8 ? value : null,
    normalizeText: (
      value: unknown,
      maxLength: number,
      options: { multiline?: boolean } = {},
    ) => {
      if (typeof value !== "string") return "";
      const normalized = options.multiline
        ? value.replace(/\r\n?/g, "\n").trim()
        : value.replace(/\s+/g, " ").trim();
      return normalized.slice(0, maxLength);
    },
    readJsonBody: async <T,>(request: Request) => ({
      data: (await request.json()) as T,
      response: null,
    }),
    createHash: crypto.createHash,
  };
});

vi.mock("@/lib/enterprise-annuaire-server", () => ({
  getEnterpriseBySlug: mocks.getEnterpriseBySlug,
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
  logOperationalEvent: mocks.logOperationalEvent,
}));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: vi.fn().mockReturnValue(null),
  enforceSameOrigin: vi.fn().mockReturnValue(null),
}));

import { POST } from "@/app/api/partner-submission/route";

function buildBody(overrides: Record<string, unknown> = {}) {
  return {
    attribution: { version: 1 },
    company: "Solutions Calmes",
    consent: true,
    description:
      "Un logiciel de pilotage qui centralise les échéances et les responsabilités.",
    email: "PARTENAIRE@EXAMPLE.COM ",
    fax: "",
    fullName: "Maya Martin",
    idempotencyKey: "web:partner:12345678",
    selectedSystemSlugs: ["cabinet-comptable", "agence-marketing"],
    solutionName: "Pilotage Zen",
    solutionType: "software",
    website: "pilotage-zen.fr",
    ...overrides,
  };
}

function buildRequest(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.fr/api/partner-submission", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.fr",
      Referer: "https://demaa.fr/partenaires",
    },
    body: JSON.stringify(buildBody(overrides)),
  });
}

describe("partner submission route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.getEnterpriseBySlug.mockImplementation(async (slug: string) => ({
      name: slug === "cabinet-comptable" ? "Cabinet comptable" : "Agence marketing",
      slug,
    }));
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({
      sectorLabel: null,
      sectorSlug: null,
      source: "Page partenaires - Proposition de solution",
      sourceUrl: "https://demaa.fr/partenaires",
      systemName: null,
      systemSlug: null,
    });
    mocks.submitLeadRequest.mockResolvedValue({
      duplicate: false,
      leadId: "partner-lead-123",
    });
  });

  it("stores the proposal and schedules the same Slack lead channel", async () => {
    const response = await POST(buildRequest());
    const rawPayload = await response.text();

    expect(response.status).toBe(202);
    expect(JSON.parse(rawPayload)).toEqual({ ok: true });
    expect(rawPayload).not.toContain("partner-lead-123");
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        channels: { email: true, resend: false, slack: true },
        contact: {
          company: "Solutions Calmes",
          email: "partenaire@example.com",
          name: "Maya Martin",
        },
        emoji: "🤝",
        idempotencyKey: "web:partner:12345678",
        requestType: "partner_solution_submission",
        title: "Nouvelle proposition de solution · Pilotage Zen",
      }),
    );
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: expect.arrayContaining([
          { label: "Solution", value: "Pilotage Zen" },
          { label: "Site web", value: "https://pilotage-zen.fr/" },
          { label: "Type de solution", value: "Logiciel" },
          {
            label: "Métiers concernés",
            value: "Cabinet comptable, Agence marketing",
          },
          { label: "Version du consentement", value: "partner-submission-v1" },
        ]),
      }),
    );
  });

  it("requires explicit consent", async () => {
    const response = await POST(buildRequest({ consent: false }));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("rejects an unknown selected system", async () => {
    mocks.getEnterpriseBySlug.mockResolvedValueOnce(null);

    const response = await POST(buildRequest({
      selectedSystemSlugs: ["metier-inconnu"],
    }));

    expect(response.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("rejects duplicate systems and more than twelve selections", async () => {
    const duplicateSystems = await POST(buildRequest({
      selectedSystemSlugs: ["cabinet-comptable", "cabinet-comptable"],
    }));
    const tooManySystems = await POST(buildRequest({
      selectedSystemSlugs: Array.from({ length: 13 }, (_, index) => `metier-${index}`),
    }));

    expect(duplicateSystems.status).toBe(400);
    expect(tooManySystems.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("rejects unsafe websites and unknown solution categories", async () => {
    const unsafeWebsite = await POST(buildRequest({ website: "javascript:alert(1)" }));
    const unknownCategory = await POST(buildRequest({ solutionType: "mystery" }));

    expect(unsafeWebsite.status).toBe(400);
    expect(unknownCategory.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("silently accepts honeypot submissions without sending notifications", async () => {
    const response = await POST(buildRequest({ fax: "robot" }));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("stops before storage when rate limiting applies", async () => {
    mocks.enforceRateLimit.mockResolvedValueOnce(
      Response.json({ error: "rate" }, { status: 429 }),
    );

    const response = await POST(buildRequest());

    expect(response.status).toBe(429);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });
});
