import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  getExpertiseById: vi.fn(),
  getOpportunityById: vi.fn(),
  logOperationalError: vi.fn(),
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  normalizeIdempotencyKey: (value: unknown) =>
    typeof value === "string" && value.length >= 8 ? value : null,
  normalizeText: (value: unknown, maxLength: number, options: { multiline?: boolean } = {}) => {
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
  normalizeEmail: (value: string) => value.trim().toLowerCase(),
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
vi.mock("@/lib/provider-network.server", () => ({
  getExpertiseById: mocks.getExpertiseById,
  getOpportunityById: mocks.getOpportunityById,
}));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));

import { POST } from "@/app/api/provider-profile-submission/route";

function request(overrides: Record<string, unknown> = {}) {
  return new Request("https://demaa.fr/api/provider-profile-submission", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.fr",
      Referer: "https://demaa.fr/rejoindre-team-demaa",
    },
    body: JSON.stringify({
      company: "Studio Calme",
      consent: true,
      countries: "France et à distance",
      email: "maya@example.com",
      expertiseIds: ["google-ads"],
      fullName: "Maya Martin",
      idempotencyKey: "web:provider:12345678",
      message: "Je pilote des campagnes Google Ads pour des entreprises de services depuis six ans.",
      profileUrl: "https://example.com/maya",
      website: "",
      ...overrides,
    }),
  });
}

describe("provider profile submission route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.getExpertiseById.mockResolvedValue({
      expertiseId: "google-ads",
      label: "Spécialiste Google Ads",
      visibility: "public",
    });
    mocks.getOpportunityById.mockResolvedValue(null);
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: {} });
    mocks.resolveLeadContext.mockResolvedValue({
      source: "Rejoindre Team Demaa - Profil",
      sourceUrl: "https://demaa.fr/rejoindre-team-demaa",
    });
    mocks.submitLeadRequest.mockResolvedValue({ duplicate: false, leadId: "provider-1" });
  });

  it("stores a general provider profile and schedules Slack", async () => {
    const response = await POST(request());
    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      channels: { email: false, resend: false, slack: true },
      contact: {
        company: "Studio Calme",
        email: "maya@example.com",
        name: "Maya Martin",
      },
      requestType: "provider_profile_submission",
      title: "Nouveau profil - Spécialiste Google Ads",
    }));
  });

  it("links an interest only to an open opportunity", async () => {
    mocks.getOpportunityById.mockResolvedValue({
      category: "Acquisition",
      createdAt: "2026-08-08T00:00:00.000Z",
      expertiseId: "google-ads",
      expiresAt: null,
      geography: "France",
      opportunityId: "campagne-google",
      opportunityType: "mission",
      publishedAt: "2026-08-08T00:00:00.000Z",
      status: "open",
      summary: "Piloter une campagne Google Ads pour une entreprise de services.",
      title: "Campagne Google Ads",
    });
    const response = await POST(request({ opportunityId: "campagne-google" }));
    expect(response.status).toBe(202);
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.arrayContaining([
        { label: "Identifiant opportunité", value: "campagne-google" },
        { label: "Type d’opportunité", value: "Mission" },
      ]),
      requestType: "opportunity_interest",
      title: "Intérêt pour une opportunité - Campagne Google Ads",
    }));
  });

  it("accepts interest in an opportunity without expertise or coverage fields", async () => {
    mocks.getOpportunityById.mockResolvedValue({
      category: "Transmission",
      createdAt: "2026-08-10T00:00:00.000Z",
      expertiseId: null,
      expiresAt: null,
      geography: null,
      opportunityId: "reprise-activite",
      opportunityType: "reprise-transmission",
      publishedAt: "2026-08-10T00:00:00.000Z",
      status: "open",
      summary: "Étudier une possibilité de reprise ou de transmission d’une activité existante.",
      title: "Reprise d’une activité",
    });
    const response = await POST(request({
      countries: "",
      expertiseIds: [],
      opportunityId: "reprise-activite",
    }));
    expect(response.status).toBe(202);
    expect(mocks.getExpertiseById).not.toHaveBeenCalled();
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      requestType: "opportunity_interest",
      title: "Intérêt pour une opportunité - Reprise d’une activité",
    }));
  });

  it("refuses unknown expertise and silently accepts the honeypot", async () => {
    mocks.getExpertiseById.mockResolvedValueOnce(null);
    expect((await POST(request())).status).toBe(400);
    expect((await POST(request({ website: "robot.example" }))).status).toBe(202);
    expect(mocks.submitLeadRequest).not.toHaveBeenCalled();
  });
});
