import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  getEnterpriseBySlug: vi.fn(),
  getSystemResource: vi.fn(),
  requireCurrentCustomerIdentity: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  normalizeIdempotencyKey: (value: unknown) => typeof value === "string" ? value : null,
  normalizeText: (value: unknown, maxLength: number) =>
    typeof value === "string" ? value.trim().slice(0, maxLength) : "",
  readJsonBody: async <T,>(request: Request) => ({ data: await request.json() as T, response: null }),
}));
vi.mock("@/lib/email", () => ({
  isValidEmail: (value: string) => value.includes("@"),
  normalizeEmail: (value: string) => value.toLowerCase(),
}));
vi.mock("@/lib/customer-space-session.server", () => ({
  requireCurrentCustomerIdentity: mocks.requireCurrentCustomerIdentity,
}));
vi.mock("@/lib/enterprise-annuaire", () => ({
  enterpriseToSystem: (enterprise: { name: string }) => enterprise,
}));
vi.mock("@/lib/enterprise-annuaire-server", () => ({
  getEnterpriseBySlug: mocks.getEnterpriseBySlug,
}));
vi.mock("@/lib/lead-attribution-server", () => ({
  resolveLeadAttribution: mocks.resolveLeadAttribution,
}));
vi.mock("@/lib/lead-context", () => ({ resolveLeadContext: mocks.resolveLeadContext }));
vi.mock("@/lib/lead-notifications", () => ({ submitLeadRequest: mocks.submitLeadRequest }));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: vi.fn() }));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));
vi.mock("@/lib/system-resource-catalog", () => ({
  getSystemResource: mocks.getSystemResource,
}));

import { POST } from "@/app/api/systeme-kit/notify/route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.fr/api/systeme-kit/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://demaa.fr" },
    body: JSON.stringify({
      email: "spoofed@example.net",
      idempotencyKey: "guide:12345678",
      marketingConsent: false,
      resourceSlug: "guide-cabinet-comptable-lancer",
      systemSlug: "cabinet-comptable",
      website: "",
      ...overrides,
    }),
  });
}

describe("system guide waitlist route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.requireCurrentCustomerIdentity.mockResolvedValue({
      identity: { email: "maya@example.com", provider: "password", uid: "maya-uid" },
      response: null,
    });
    mocks.getEnterpriseBySlug.mockResolvedValue({ name: "Cabinet comptable" });
    mocks.getSystemResource.mockReturnValue({
      availability: "coming-soon",
      resourceSlug: "guide-cabinet-comptable-lancer",
      systemSlugs: ["cabinet-comptable"],
      title: "Créer un cabinet comptable",
    });
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({
      sectorLabel: "Conseil",
      source: "Liste d’attente",
      systemName: "Cabinet comptable",
      systemSlug: "cabinet-comptable",
    });
    mocks.submitLeadRequest.mockResolvedValue({ duplicate: false, leadId: "waitlist-1" });
  });

  it("stores the contextual guide identifiers and alerts the team by email and Slack", async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      channels: { email: true, resend: false, slack: true },
      contact: { email: "maya@example.com", firstName: null },
      fields: [
        { label: "Guide", value: "Créer un cabinet comptable" },
        { label: "Resource slug", value: "guide-cabinet-comptable-lancer" },
        { label: "System slug", value: "cabinet-comptable" },
        { label: "Source", value: "Liste d’attente - Créer un cabinet comptable" },
      ],
      requestType: "guide_waitlist",
    }));
    expect(mocks.resolveLeadContext).toHaveBeenCalledWith(expect.objectContaining({
      source: "Liste d’attente - Créer un cabinet comptable",
      systemSlug: "cabinet-comptable",
    }));
  });

  it("rejects a guide belonging to another system", async () => {
    const response = await POST(request({ systemSlug: "cabinet-davocat" }));

    expect(response.status).toBe(404);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });

  it("requires an authenticated customer session", async () => {
    mocks.requireCurrentCustomerIdentity.mockResolvedValue({
      identity: null,
      response: Response.json({ error: "authentication_required" }, { status: 401 }),
    });

    const response = await POST(request());

    expect(response.status).toBe(401);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });
});
