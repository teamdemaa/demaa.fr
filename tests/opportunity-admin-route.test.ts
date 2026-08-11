import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  createOpportunity: vi.fn(),
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  getAllOpportunities: vi.fn(),
  getExpertiseById: vi.fn(),
  getOpportunityById: vi.fn(),
  logOperationalError: vi.fn(),
  revalidateTag: vi.fn(),
  updateOpportunity: vi.fn(),
  updateOpportunityStatus: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidateTag: mocks.revalidateTag }));
vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
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
vi.mock("@/lib/operational-log", () => ({
  logOperationalError: mocks.logOperationalError,
}));
vi.mock("@/lib/provider-network.server", () => ({
  createOpportunity: mocks.createOpportunity,
  getAllOpportunities: mocks.getAllOpportunities,
  getExpertiseById: mocks.getExpertiseById,
  getOpportunityById: mocks.getOpportunityById,
  updateOpportunity: mocks.updateOpportunity,
  updateOpportunityStatus: mocks.updateOpportunityStatus,
}));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));

import { GET, PATCH, POST } from "@/app/api/admin/opportunities/route";

const secret = "this-is-a-long-private-admin-secret";

function request(method: "GET" | "PATCH" | "POST", body?: unknown, providedSecret = secret) {
  return new Request("https://demaa.fr/api/admin/opportunities", {
    method,
    headers: {
      ...(method === "GET" ? {} : { Origin: "https://demaa.fr" }),
      "Content-Type": "application/json",
      "x-demaa-admin-secret": providedSecret,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("opportunity admin route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPPORTUNITIES_ADMIN_SECRET = secret;
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.getAllOpportunities.mockResolvedValue([]);
    mocks.getExpertiseById.mockResolvedValue({ expertiseId: "google-ads" });
    mocks.createOpportunity.mockImplementation(async (input) => input);
    mocks.getOpportunityById.mockResolvedValue({
      cadence: null,
      category: "Acquisition",
      companyName: null,
      compensation: null,
      createdAt: "2026-08-10T00:00:00.000Z",
      expertiseId: "google-ads",
      expiresAt: null,
      expectations: [],
      geography: "France",
      opportunityId: "campagne-google",
      opportunityType: "partenariat",
      publishedAt: "2026-08-10T00:00:00.000Z",
      startTiming: null,
      status: "open",
      summary: "Piloter une campagne Google Ads pour obtenir des demandes qualifiées.",
      title: "Campagne Google Ads",
      workMode: null,
    });
    mocks.updateOpportunity.mockResolvedValue(true);
    mocks.updateOpportunityStatus.mockResolvedValue(true);
  });

  it("requires the private secret", async () => {
    expect((await GET(request("GET", undefined, "wrong"))).status).toBe(401);
  });

  it("creates an open Firebase opportunity and invalidates the public cache", async () => {
    const response = await POST(request("POST", {
      category: "Acquisition",
      cadence: "Deux jours par mois",
      companyName: "Entreprise Exemple",
      compensation: "Budget défini après cadrage",
      expertiseId: "google-ads",
      expectations: "Cadrer la campagne\nCréer les annonces\nSuivre les demandes",
      geography: "France",
      opportunityType: "partenariat",
      startTiming: "Septembre 2026",
      summary: "Piloter une campagne Google Ads pour une entreprise qui souhaite obtenir des demandes qualifiées.",
      title: "Campagne Google Ads",
      workMode: "hybrid",
    }));
    expect(response.status).toBe(201);
    expect(mocks.createOpportunity).toHaveBeenCalledWith(expect.objectContaining({
      expertiseId: "google-ads",
      opportunityType: "partenariat",
      workMode: "hybrid",
      cadence: "Deux jours par mois",
      startTiming: "Septembre 2026",
      companyName: "Entreprise Exemple",
      compensation: "Budget défini après cadrage",
      expectations: [
        "Cadrer la campagne",
        "Créer les annonces",
        "Suivre les demandes",
      ],
      status: "open",
      title: "Campagne Google Ads",
    }));
    expect(mocks.revalidateTag).toHaveBeenCalledWith(
      "provider-network-opportunities",
      { expire: 0 },
    );
  });

  it("creates a broad opportunity without an expertise", async () => {
    const response = await POST(request("POST", {
      category: "Transmission",
      expertiseId: "",
      opportunityType: "reprise-transmission",
      summary: "Étudier une possibilité de reprise ou de transmission avec les personnes intéressées.",
      title: "Reprise d’une activité",
    }));
    expect(response.status).toBe(201);
    expect(mocks.getExpertiseById).not.toHaveBeenCalled();
    expect(mocks.createOpportunity).toHaveBeenCalledWith(expect.objectContaining({
      expertiseId: null,
      opportunityType: "reprise-transmission",
    }));
  });

  it("closes an existing opportunity", async () => {
    const response = await PATCH(request("PATCH", {
      opportunityId: "campagne-google",
      status: "closed",
    }));
    expect(response.status).toBe(200);
    expect(mocks.updateOpportunityStatus).toHaveBeenCalledWith(
      "campagne-google",
      "closed",
    );
  });

  it("updates the optional public details of an existing opportunity", async () => {
    const response = await PATCH(request("PATCH", {
      category: "Acquisition",
      cadence: "Mission récurrente",
      companyName: "",
      compensation: "",
      expertiseId: "google-ads",
      expectations: "Cadrer le besoin\nPiloter la campagne",
      geography: "France",
      opportunityId: "campagne-google",
      opportunityType: "partenariat",
      startTiming: "Dès que possible",
      summary: "Piloter une campagne Google Ads pour une entreprise qui souhaite obtenir des demandes qualifiées.",
      title: "Campagne Google Ads",
      workMode: "remote",
    }));

    expect(response.status).toBe(200);
    expect(mocks.updateOpportunity).toHaveBeenCalledWith(expect.objectContaining({
      cadence: "Mission récurrente",
      companyName: null,
      compensation: null,
      expectations: ["Cadrer le besoin", "Piloter la campagne"],
      opportunityId: "campagne-google",
      startTiming: "Dès que possible",
      workMode: "remote",
    }));
    expect(mocks.updateOpportunityStatus).not.toHaveBeenCalled();
  });
});
