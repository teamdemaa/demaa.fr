import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  getCurrentAdminIdentity: vi.fn(),
  getRecentLeadRequests: vi.fn(),
}));

vi.mock("@/lib/admin-auth.server", () => ({
  getCurrentAdminIdentity: mocks.getCurrentAdminIdentity,
}));
vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
}));
vi.mock("@/lib/lead-storage", () => ({
  getRecentLeadRequests: mocks.getRecentLeadRequests,
}));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
}));

import { GET } from "@/app/api/admin/lead-requests/route";

function request() {
  return new Request("https://demaa.co/api/admin/lead-requests");
}

describe("lead requests admin route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.getCurrentAdminIdentity.mockResolvedValue({
      email: "hi.teamdemaa@gmail.com",
      provider: "google",
      uid: "admin-uid",
    });
    mocks.getRecentLeadRequests.mockResolvedValue([
      {
        id: "lead-1",
        data: {
          contact: {
            company: "Boulangerie Exemple",
            email: "contact@example.com",
            first_name: "Claire",
            last_name: "Martin",
            name: null,
            phone: "0600000000",
          },
          context: {
            sector_label: "Boulangerie",
            sector_slug: "boulangerie",
            source: "system_page",
            source_url: null,
            system_name: "Boulangerie",
            system_slug: "boulangerie",
          },
          created_at: "2026-08-17T09:00:00.000Z",
          fields: [],
          notification_status: {
            email: { status: "sent" },
            slack: { status: "sent" },
          },
          request_type: "service_callback_request",
          title: "Demande de rappel",
        },
      },
    ]);
  });

  it("requires an authenticated admin session", async () => {
    mocks.getCurrentAdminIdentity.mockResolvedValueOnce(null);
    const response = await GET(request());
    expect(response.status).toBe(401);
    expect(mocks.getRecentLeadRequests).not.toHaveBeenCalled();
  });

  it("rate limits before checking the admin session", async () => {
    mocks.enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }));
    const response = await GET(request());
    expect(response.status).toBe(429);
    expect(mocks.getCurrentAdminIdentity).not.toHaveBeenCalled();
  });

  it("returns a flattened, never-cached summary of recent requests", async () => {
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({
      requests: [
        {
          contact: {
            company: "Boulangerie Exemple",
            email: "contact@example.com",
            name: "Claire Martin",
            phone: "0600000000",
          },
          createdAt: "2026-08-17T09:00:00.000Z",
          id: "lead-1",
          notificationStatus: { email: "sent", slack: "sent" },
          requestType: "service_callback_request",
          sectorLabel: "Boulangerie",
          systemName: "Boulangerie",
          title: "Demande de rappel",
        },
      ],
    });
  });
});
