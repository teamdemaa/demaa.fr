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
vi.mock("@/lib/email", () => ({
  isValidEmail: (value: string) => value.includes("@"),
  normalizeEmail: (value: string) => value.toLowerCase(),
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

import { POST } from "@/app/api/organisation-callback-request/route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.fr/api/organisation-callback-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.fr",
      Referer: "https://demaa.fr/kit-operationnel/cabinet-comptable",
    },
    body: JSON.stringify({
      attribution: { version: 1 },
      email: "maya@example.com",
      firstName: "Maya",
      idempotencyKey: "web:callback:12345678",
      need: "Mieux organiser le suivi de mes dossiers et les relances de l’équipe.",
      phone: "+33 6 12 34 56 78",
      source: "Système métier - Demande de rappel organisation",
      systemSlug: "cabinet-comptable",
      website: "",
      ...overrides,
    }),
  });
}

describe("organisation callback request route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({
      sectorLabel: "Conseil",
      sectorSlug: "conseil",
      source: "Système métier - Demande de rappel organisation",
      sourceUrl: "https://demaa.fr/kit-operationnel/cabinet-comptable",
      systemName: "Cabinet comptable",
      systemSlug: "cabinet-comptable",
    });
    mocks.submitLeadRequest.mockResolvedValue({ duplicate: false, leadId: "callback-1" });
  });

  it("enregistre une demande de rappel attribuée au système", async () => {
    const response = await POST(request());

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      channels: { email: true, resend: false, slack: true },
      contact: {
        email: "maya@example.com",
        name: "Maya",
        phone: "+33 6 12 34 56 78",
      },
      emoji: "📞",
      requestType: "organisation_callback_request",
      title: "Demande de rappel - Organisation",
    }));
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: [{
        label: "Besoin à clarifier",
        value: "Mieux organiser le suivi de mes dossiers et les relances de l’équipe.",
      }],
    }));
  });

  it("refuse une demande incomplète ou des coordonnées invalides", async () => {
    const missingNeed = await POST(request({ need: "" }));
    const invalidPhone = await POST(request({ phone: "abc" }));
    const invalidEmail = await POST(request({ email: "maya.example.com" }));

    expect(missingNeed.status).toBe(400);
    expect(invalidPhone.status).toBe(400);
    expect(invalidEmail.status).toBe(400);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("silently accepts a honeypot submission", async () => {
    const response = await POST(request({ website: "robot.example" }));

    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("stops before storage when origin or rate limiting rejects the request", async () => {
    mocks.enforceSameOrigin.mockReturnValueOnce(
      Response.json({ error: "origin" }, { status: 403 }),
    );
    const forbidden = await POST(request());
    expect(forbidden.status).toBe(403);
    expect(mocks.enforceRateLimit).not.toHaveBeenCalled();

    mocks.enforceRateLimit.mockResolvedValueOnce(
      Response.json({ error: "rate" }, { status: 429 }),
    );
    const limited = await POST(request());
    expect(limited.status).toBe(429);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });
});
