import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  getPublicExpertiseSnapshot: vi.fn(),
  getPublicExpertises: vi.fn(),
  getPublicOpportunitySnapshot: vi.fn(),
  getPublicOpenOpportunities: vi.fn(),
}));

vi.mock("@/lib/provider-network.server", () => ({
  getPublicExpertiseSnapshot: mocks.getPublicExpertiseSnapshot,
  getPublicExpertises: mocks.getPublicExpertises,
  getPublicOpportunitySnapshot: mocks.getPublicOpportunitySnapshot,
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

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns open opportunities and only their referenced expertises", async () => {
    const response = await GET(new Request("https://demaa.co/api/opportunities"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    const payload = await response.json();
    expect(payload.opportunities).toHaveLength(2);
    expect(payload.expertises).toEqual([
      { expertiseId: "google-ads", label: "Spécialiste Google Ads" },
    ]);
  });

  it("serves the local snapshots immediately in demo mode", async () => {
    mocks.getPublicOpportunitySnapshot.mockReturnValue([
      {
        expertiseId: "google-ads",
        opportunityId: "demo-google",
      },
    ]);
    mocks.getPublicExpertiseSnapshot.mockReturnValue([
      { expertiseId: "google-ads", label: "Spécialiste Google Ads" },
    ]);

    const response = await GET(
      new Request("https://demaa.co/api/opportunities?demo=1"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Demaa-Data-Source")).toBe("snapshot-demo");
    expect(mocks.getPublicOpportunitySnapshot).toHaveBeenCalledOnce();
    expect(mocks.getPublicExpertiseSnapshot).toHaveBeenCalledOnce();
    expect(mocks.getPublicOpenOpportunities).not.toHaveBeenCalled();
    expect(mocks.getPublicExpertises).not.toHaveBeenCalled();
  });

  it("never exposes the demo snapshots in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const response = await GET(
      new Request("https://demaa.co/api/opportunities?demo=1"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Demaa-Data-Source")).toBeNull();
    expect(mocks.getPublicOpenOpportunities).toHaveBeenCalledOnce();
    expect(mocks.getPublicExpertises).toHaveBeenCalledOnce();
    expect(mocks.getPublicOpportunitySnapshot).not.toHaveBeenCalled();
    expect(mocks.getPublicExpertiseSnapshot).not.toHaveBeenCalled();
  });
});
