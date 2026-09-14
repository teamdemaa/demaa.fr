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
  ) =>
    typeof value === "string"
      ? (options.multiline
          ? value.replace(/\r\n?/g, "\n").trim()
          : value.replace(/\s+/g, " ").trim()
        ).slice(0, maxLength)
      : "",
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

import { POST } from "@/app/api/business-estimate/route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.fr/api/business-estimate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.fr",
      Referer: "https://demaa.fr/transmettre",
    },
    body: JSON.stringify({
      attribution: { version: 1 },
      company: "Atelier Martin",
      email: "direction@example.com",
      faxNumber: "",
      idempotencyKey: "vente:12345678",
      message: "Je souhaite préparer la vente de mon entreprise.",
      name: "Camille Martin",
      phone: "+33 6 12 34 56 78",
      ...overrides,
    }),
  });
}

describe("business sale request route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({
      source: "Demaa - Projet de vente",
      sourceUrl: "https://demaa.fr/transmettre",
    });
    mocks.submitLeadRequest.mockResolvedValue({
      duplicate: false,
      leadId: "lead-1",
    });
  });

  it("sends the seller project and complete contact details by email", async () => {
    const response = await POST(request());

    expect(response.status).toBe(202);
    expect(mocks.resolveLeadContext).toHaveBeenCalledWith({
      source: "Demaa - Projet de vente",
      sourceUrl: "https://demaa.fr/transmettre",
    });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        channels: { email: true, resend: false, slack: false },
        contact: {
          company: "Atelier Martin",
          email: "direction@example.com",
          name: "Camille Martin",
          phone: "+33 6 12 34 56 78",
        },
        fields: expect.arrayContaining([
          {
            label: "Projet de vente",
            value: "Je souhaite préparer la vente de mon entreprise.",
          },
        ]),
        requestType: "business_sale_request",
        title: "Projet de vente - Atelier Martin",
      }),
    );
  });

  it("rejects incomplete requests and silently accepts the honeypot", async () => {
    expect((await POST(request({ phone: "" }))).status).toBe(400);
    expect((await POST(request({ faxNumber: "robot" }))).status).toBe(202);
  });
});
