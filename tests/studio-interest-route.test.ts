import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  logOperationalError: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
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
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));

import { POST } from "@/app/api/studio-interest/route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.fr/api/studio-interest", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.fr",
      Referer: "https://demaa.fr/studio",
    },
    body: JSON.stringify({
      attribution: { version: 1 },
      companyActivity: "Atelier Horizon — architecture intérieure",
      consent: true,
      currentSolution: "Des feuilles de calcul et des messages.",
      email: "maya@example.com",
      idempotencyKey: "studio:12345678",
      marketEvidence: "Trois confrères rencontrent le même problème.",
      problem: "Nous perdons du temps à coordonner les validations entre les clients et les artisans.",
      website: "",
      ...overrides,
    }),
  });
}

describe("Studio interest route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({
      source: "Demaa Studio - Besoin métier",
      sourceUrl: "https://demaa.fr/studio",
    });
    mocks.submitLeadRequest.mockResolvedValue({ duplicate: false, leadId: "studio-1" });
  });

  it("sends a consented business need through the internal Slack channel", async () => {
    const response = await POST(request());

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      channels: { email: false, resend: false, slack: true },
      contact: {
        company: "Atelier Horizon — architecture intérieure",
        email: "maya@example.com",
      },
      requestType: "studio_interest_request",
      title: "Demaa Studio - Nouveau besoin métier",
    }));
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      consents: [expect.objectContaining({
        granted: true,
        purpose: "studio_interest_contact",
        version: "studio-interest-contact-v1",
      })],
      fields: expect.arrayContaining([
        { label: "Besoin métier", value: "Nous perdons du temps à coordonner les validations entre les clients et les artisans." },
        { label: "Gestion actuelle", value: "Des feuilles de calcul et des messages." },
        { label: "Besoin partagé dans le secteur", value: "Trois confrères rencontrent le même problème." },
      ]),
    }));
  });

  it("rejects incomplete, invalid or unconsented submissions", async () => {
    for (const invalidCase of [
      { companyActivity: "" },
      { email: "invalid" },
      { problem: "Trop court" },
      { consent: false },
      { idempotencyKey: "short" },
    ]) {
      expect((await POST(request(invalidCase))).status).toBe(400);
    }
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("silently accepts honeypots", async () => {
    const response = await POST(request({ website: "robot" }));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("stops before storage when request guards reject", async () => {
    mocks.enforceAllowedHost.mockReturnValueOnce(
      Response.json({ error: "host" }, { status: 403 }),
    );
    expect((await POST(request())).status).toBe(403);

    mocks.enforceSameOrigin.mockReturnValueOnce(
      Response.json({ error: "origin" }, { status: 403 }),
    );
    expect((await POST(request())).status).toBe(403);

    mocks.enforceRateLimit.mockResolvedValueOnce(
      Response.json({ error: "rate" }, { status: 429 }),
    );
    expect((await POST(request())).status).toBe(429);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });
});
