import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  createOpportunity: vi.fn(),
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  getAllOpportunities: vi.fn(),
  getExpertiseById: vi.fn(),
  logOperationalError: vi.fn(),
  revalidateTag: vi.fn(),
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
    mocks.updateOpportunityStatus.mockResolvedValue(true);
  });

  it("requires the private secret", async () => {
    expect((await GET(request("GET", undefined, "wrong"))).status).toBe(401);
  });

  it("creates an open Firebase opportunity and invalidates the public cache", async () => {
    const response = await POST(request("POST", {
      category: "Acquisition",
      expertiseId: "google-ads",
      geography: "France",
      summary: "Piloter une campagne Google Ads pour une entreprise qui souhaite obtenir des demandes qualifiées.",
      title: "Campagne Google Ads",
    }));
    expect(response.status).toBe(201);
    expect(mocks.createOpportunity).toHaveBeenCalledWith(expect.objectContaining({
      expertiseId: "google-ads",
      status: "open",
      title: "Campagne Google Ads",
    }));
    expect(mocks.revalidateTag).toHaveBeenCalledWith(
      "provider-network-opportunities",
      { expire: 0 },
    );
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
});
