import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const {
  getEnterpriseBySlugMock,
  getPilotingSheetCopyUrlMock,
  recordKitOpenMock,
} = vi.hoisted(() => ({
  getEnterpriseBySlugMock: vi.fn(),
  getPilotingSheetCopyUrlMock: vi.fn(),
  recordKitOpenMock: vi.fn(),
}));

vi.mock("@/lib/document-models", () => ({
  getPilotingSheetCopyUrl: getPilotingSheetCopyUrlMock,
}));

vi.mock("@/lib/enterprise-annuaire", () => ({
  enterpriseToSystem: (enterprise: { name: string }) => ({ name: enterprise.name }),
}));

vi.mock("@/lib/enterprise-annuaire-server", () => ({
  getEnterpriseBySlug: getEnterpriseBySlugMock,
}));

vi.mock("@/lib/kit-analytics.server", () => ({
  recordKitOpen: recordKitOpenMock,
}));

vi.mock("@/lib/operational-log", () => ({
  logOperationalError: vi.fn(),
  logOperationalEvent: vi.fn(),
}));

import { GET } from "@/app/api/kits/[slug]/open/route";

describe("kit open redirect route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getEnterpriseBySlugMock.mockResolvedValue({
      name: "Bâtiment",
      slug: "batiment",
    });
    getPilotingSheetCopyUrlMock.mockReturnValue(
      "https://docs.google.com/spreadsheets/d/example/copy",
    );
    recordKitOpenMock.mockResolvedValue(undefined);
  });

  it("records the opening and redirects to the Google copy page", async () => {
    const request = new Request("https://demaa.fr/api/kits/batiment/open", {
      headers: {
        referer:
          "https://demaa.fr/kit-operationnel/batiment?utm_source=linkedin",
      },
    });
    const response = await GET(request, {
      params: Promise.resolve({ slug: "batiment" }),
    });

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://docs.google.com/spreadsheets/d/example/copy",
    );
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(recordKitOpenMock).toHaveBeenCalledWith({
      kitName: "Bâtiment",
      kitSlug: "batiment",
      request,
    });
  });

  it("still redirects when the analytics write is unavailable", async () => {
    recordKitOpenMock.mockRejectedValueOnce(new Error("Firestore unavailable"));

    const response = await GET(
      new Request("https://demaa.fr/api/kits/batiment/open"),
      { params: Promise.resolve({ slug: "batiment" }) },
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("docs.google.com");
  });

  it("rejects an unknown kit without recording an opening", async () => {
    getEnterpriseBySlugMock.mockResolvedValueOnce(null);
    getPilotingSheetCopyUrlMock.mockReturnValueOnce(null);

    const response = await GET(
      new Request("https://demaa.fr/api/kits/inconnu/open"),
      { params: Promise.resolve({ slug: "inconnu" }) },
    );

    expect(response.status).toBe(404);
    expect(recordKitOpenMock).not.toHaveBeenCalled();
  });
});
