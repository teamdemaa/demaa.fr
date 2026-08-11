import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  logOperationalError: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  requireCurrentCustomerEmail: vi.fn(),
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
vi.mock("@/lib/customer-space-session.server", () => ({
  requireCurrentCustomerEmail: mocks.requireCurrentCustomerEmail,
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

import { POST } from "@/app/api/structure-problem/route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.fr/api/structure-problem", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.fr",
      Referer: "https://demaa.fr/academie",
    },
    body: JSON.stringify({
      attribution: { version: 1 },
      companyActivity: "Atelier Horizon — architecture intérieure",
      consent: true,
      email: "maya@example.com",
      faxNumber: "",
      idempotencyKey: "structure:12345678",
      problem: "Notre équipe perd trop de temps à coordonner les validations entre les clients et les artisans.",
      professionalPage: "https://atelier-horizon.example/a-propos#equipe",
      ...overrides,
    }),
  });
}

describe("Structure problem submission route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.requireCurrentCustomerEmail.mockResolvedValue({
      email: "owner@example.com",
      response: null,
    });
    mocks.resolveLeadContext.mockResolvedValue({
      source: "Newsletter Structure - Proposition de problématique",
      sourceUrl: "https://demaa.fr/academie",
    });
    mocks.submitLeadRequest.mockResolvedValue({ duplicate: false, leadId: "structure-1" });
  });

  it("stores a written proposal with Slack-only delivery and consent evidence", async () => {
    const response = await POST(request());

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      channels: { email: false, resend: false, slack: true },
      contact: {
        company: "Atelier Horizon — architecture intérieure",
        email: "owner@example.com",
      },
      requestType: "structure_problem_submission",
      title: "Proposition de problématique - Structure",
    }));
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      consents: [expect.objectContaining({
        granted: true,
        purpose: "structure_case_publication",
        version: "structure-case-publication-v1",
      })],
      fields: expect.arrayContaining([
        { label: "Site ou page professionnelle", value: "https://atelier-horizon.example/a-propos" },
        { label: "Traitement garanti", value: "Non" },
      ]),
    }));
  });

  it("rejects incomplete, invalid, unconsented or voice submissions", async () => {
    const cases = [
      { companyActivity: "" },
      { problem: "Trop court" },
      { professionalPage: "javascript:alert(1)" },
      { consent: false },
      { voice: { blob: "not-accepted" } },
    ];

    for (const invalidCase of cases) {
      const response = await POST(request(invalidCase));
      expect(response.status).toBe(400);
    }
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("requires an authenticated session and ignores a body email", async () => {
    mocks.requireCurrentCustomerEmail.mockResolvedValueOnce({
      email: null,
      response: Response.json({ error: "authentication_required" }, { status: 401 }),
    });
    expect((await POST(request({ email: "spoofed@example.net" }))).status).toBe(401);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("silently accepts honeypots", async () => {
    const response = await POST(request({ faxNumber: "robot" }));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("stops before storage when host, origin or rate limiting rejects", async () => {
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
