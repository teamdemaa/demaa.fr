import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceAllowedHost: vi.fn(),
  enforceRateLimit: vi.fn(),
  enforceSameOrigin: vi.fn(),
  getAdminRequest: vi.fn(),
  getCurrentAdminIdentity: vi.fn(),
  listAdminRequests: vi.fn(),
  updateAdminRequestStatus: vi.fn(),
}));

vi.mock("@/lib/admin-auth.server", () => ({
  getCurrentAdminIdentity: mocks.getCurrentAdminIdentity,
}));
vi.mock("@/lib/admin-request-read-model.server", () => ({
  getAdminRequest: mocks.getAdminRequest,
  listAdminRequests: mocks.listAdminRequests,
  updateAdminRequestStatus: mocks.updateAdminRequestStatus,
}));
vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: mocks.enforceRateLimit,
  readJsonBody: async <T,>(request: Request) => ({
    data: await request.json() as T,
    response: null,
  }),
}));
vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: mocks.enforceAllowedHost,
  enforceSameOrigin: mocks.enforceSameOrigin,
}));

import { GET, PATCH } from "@/app/api/admin/lead-requests/route";

function getRequest(query = "") {
  return new Request(`https://demaa.co/api/admin/lead-requests${query}`);
}

function patchRequest(body: unknown) {
  return new Request("https://demaa.co/api/admin/lead-requests", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", Origin: "https://demaa.co" },
    method: "PATCH",
  });
}

const summary = {
  contact: {
    company: "Boulangerie Exemple",
    email: "contact@example.com",
    name: "Claire Martin",
    phone: "0600000000",
  },
  createdAt: "2026-08-17T09:00:00.000Z",
  deliveryStatus: { email: "sent", slack: "sent" },
  id: "lead-1",
  requestType: "service_callback_request",
  source: "lead",
  sourceLabel: "Services",
  status: "new",
  title: "Demande de rappel",
} as const;

describe("admin requests route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceAllowedHost.mockReturnValue(null);
    mocks.enforceSameOrigin.mockReturnValue(null);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.getCurrentAdminIdentity.mockResolvedValue({
      email: "hi.teamdemaa@gmail.com",
      provider: "google",
      uid: "admin-uid",
    });
    mocks.listAdminRequests.mockResolvedValue({ nextCursor: null, requests: [summary] });
    mocks.getAdminRequest.mockResolvedValue({
      ...summary,
      attribution: null,
      fields: [{ label: "Besoin", value: "Être rappelée" }],
      sourceUrl: "https://demaa.co/services",
      specializedHref: null,
      systemName: "Boulangerie",
    });
    mocks.updateAdminRequestStatus.mockResolvedValue(true);
  });

  it("requires an authenticated Team session", async () => {
    mocks.getCurrentAdminIdentity.mockResolvedValueOnce(null);
    const response = await GET(getRequest());
    expect(response.status).toBe(401);
    expect(mocks.listAdminRequests).not.toHaveBeenCalled();
  });

  it("rate limits before checking the Team session", async () => {
    mocks.enforceRateLimit.mockResolvedValueOnce(new Response(null, { status: 429 }));
    const response = await GET(getRequest());
    expect(response.status).toBe(429);
    expect(mocks.getCurrentAdminIdentity).not.toHaveBeenCalled();
  });

  it("returns a bounded, filtered, never-cached request page", async () => {
    const response = await GET(getRequest("?source=service&status=new&type=service_request&limit=12&cursor=abc"));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.listAdminRequests).toHaveBeenCalledWith({
      cursor: "abc",
      limit: 12,
      requestType: "service_request",
      source: "service",
      status: "new",
    });
    await expect(response.json()).resolves.toEqual({ nextCursor: null, requests: [summary] });
  });

  it("loads one normalized detail only when its source is explicit", async () => {
    expect((await GET(getRequest("?id=lead-1"))).status).toBe(400);
    const response = await GET(getRequest("?source=lead&id=lead-1"));
    expect(response.status).toBe(200);
    expect(mocks.getAdminRequest).toHaveBeenCalledWith("lead", "lead-1");
    await expect(response.json()).resolves.toMatchObject({
      request: { id: "lead-1", fields: [{ label: "Besoin", value: "Être rappelée" }] },
    });
  });

  it("rejects unknown filters before reading Firestore", async () => {
    expect((await GET(getRequest("?source=unknown"))).status).toBe(400);
    expect((await GET(getRequest("?status=unknown"))).status).toBe(400);
    expect(mocks.listAdminRequests).not.toHaveBeenCalled();
  });

  it("updates a status after origin, rate-limit and Team authorization checks", async () => {
    const response = await PATCH(patchRequest({
      id: "lead-1",
      source: "lead",
      status: "in_progress",
    }));
    expect(response.status).toBe(200);
    expect(mocks.updateAdminRequestStatus).toHaveBeenCalledWith({
      adminUid: "admin-uid",
      id: "lead-1",
      source: "lead",
      status: "in_progress",
    });
  });

  it("rejects cross-origin or invalid status mutations", async () => {
    mocks.enforceSameOrigin.mockReturnValueOnce(new Response(null, { status: 403 }));
    expect((await PATCH(patchRequest({ id: "lead-1", source: "lead", status: "closed" }))).status).toBe(403);
    expect((await PATCH(patchRequest({ id: "lead-1", source: "lead", status: "unknown" }))).status).toBe(400);
    expect(mocks.updateAdminRequestStatus).not.toHaveBeenCalled();
  });
});
