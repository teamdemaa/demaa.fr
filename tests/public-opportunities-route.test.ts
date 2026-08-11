import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  getPublicExpertises: vi.fn(),
  getPublicOpenOpportunities: vi.fn(),
}));

vi.mock("@/lib/provider-network.server", () => ({
  getPublicExpertises: mocks.getPublicExpertises,
  getPublicOpenOpportunities: mocks.getPublicOpenOpportunities,
}));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
}));

import { GET } from "@/app/api/opportunities/route";

describe("public opportunities route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.getPublicOpenOpportunities.mockResolvedValue([
      {
        category: "Acquisition",
        createdAt: "2026-08-10T00:00:00.000Z",
        expertiseId: "google-ads",
        expiresAt: null,
        geography: "France",
        opportunityId: "campagne-google",
        opportunityType: "mission",
        publishedAt: "2026-08-10T00:00:00.000Z",
        status: "open",
        summary: "Piloter une campagne Google Ads avec un objectif clairement défini.",
        title: "Campagne Google Ads",
      },
      {
        category: "Transmission",
        createdAt: "2026-08-10T00:00:00.000Z",
        expertiseId: null,
        expiresAt: null,
        geography: null,
        opportunityId: "reprise-activite",
        opportunityType: "reprise-transmission",
        publishedAt: "2026-08-10T00:00:00.000Z",
        status: "open",
        summary: "Étudier une possibilité de reprise ou de transmission d’une activité.",
        title: "Reprise d’une activité",
      },
    ]);
    mocks.getPublicExpertises.mockResolvedValue([
      { expertiseId: "google-ads", label: "Spécialiste Google Ads" },
      { expertiseId: "seo", label: "Spécialiste SEO" },
    ]);
  });

  it("returns open opportunities and only their referenced expertises", async () => {
    const response = await GET(new Request("https://demaa.co/api/opportunities"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store, max-age=0");
    const payload = await response.json();
    expect(payload.opportunities).toHaveLength(2);
    expect(payload.expertises).toEqual([
      { expertiseId: "google-ads", label: "Spécialiste Google Ads" },
    ]);
  });
});
