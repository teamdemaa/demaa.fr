import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createFirebaseSessionCookie: vi.fn(),
  enforceRateLimit: vi.fn(),
  ensureDefaultCompanyForIdentity: vi.fn(),
  getCurrentAdminIdentity: vi.fn(),
  isAdminIdentity: vi.fn(),
  verifyFreshFirebaseIdentity: vi.fn(),
}));

vi.mock("@/lib/admin-auth.server", () => ({
  ADMIN_SESSION_COOKIE: "demaa_admin_session",
  ADMIN_SESSION_TTL_MS: 12 * 60 * 60 * 1000,
  getAdminCookieOptions: (maxAge = 12 * 60 * 60) => ({
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: true,
  }),
  getCurrentAdminIdentity: mocks.getCurrentAdminIdentity,
  isAdminIdentity: mocks.isAdminIdentity,
}));
vi.mock("@/lib/api-security", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-security")>();
  return { ...actual, enforceRateLimit: mocks.enforceRateLimit };
});
vi.mock("@/lib/customer-space-auth", () => ({
  createFirebaseSessionCookie: mocks.createFirebaseSessionCookie,
  verifyFreshFirebaseIdentity: mocks.verifyFreshFirebaseIdentity,
}));
vi.mock("@/lib/company-membership.server", () => ({
  ensureDefaultCompanyForIdentity: mocks.ensureDefaultCompanyForIdentity,
}));

import { DELETE, GET, POST } from "@/app/api/admin/session/route";

function request(method: "DELETE" | "POST", body?: Record<string, unknown>) {
  return new Request("https://demaa.co/api/admin/session", {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("independent Firebase Team session route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    process.env.SITE_URL = "https://demaa.co";
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.verifyFreshFirebaseIdentity.mockResolvedValue({
      email: "owner@example.com",
      emailVerified: true,
      provider: "google",
      uid: "admin-uid",
    });
    mocks.createFirebaseSessionCookie.mockResolvedValue("firebase-team-session-cookie");
    mocks.getCurrentAdminIdentity.mockResolvedValue({
      email: "owner@example.com",
      emailVerified: true,
      provider: "google",
      uid: "admin-uid",
    });
    mocks.isAdminIdentity.mockReturnValue(true);
  });

  it("sets only the short-lived HttpOnly Team cookie for an allowlisted identity", async () => {
    const response = await POST(request("POST", {
      idToken: "id-token",
      returnTo: "/admin/opportunites",
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      redirectTo: "/admin/opportunites",
    });
    expect(mocks.verifyFreshFirebaseIdentity).toHaveBeenCalledWith("id-token");
    expect(mocks.createFirebaseSessionCookie).toHaveBeenCalledWith(
      "id-token",
      12 * 60 * 60 * 1000,
    );
    expect(mocks.isAdminIdentity).toHaveBeenCalledWith(expect.objectContaining({
      uid: "admin-uid",
    }));
    const cookie = response.headers.get("set-cookie");
    expect(cookie).toContain("demaa_admin_session=firebase-team-session-cookie");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Max-Age=43200");
    expect(cookie).not.toMatch(/(?:^|;\s*)demaa_session=/);
    expect(mocks.ensureDefaultCompanyForIdentity).not.toHaveBeenCalled();
  });

  it("refuses a valid Firebase identity outside the Team allowlist before setting a cookie", async () => {
    mocks.isAdminIdentity.mockReturnValueOnce(false);

    const response = await POST(request("POST", { idToken: "visitor-token" }));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      code: "admin_access_denied",
    });
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(mocks.createFirebaseSessionCookie).not.toHaveBeenCalled();
    expect(mocks.ensureDefaultCompanyForIdentity).not.toHaveBeenCalled();
  });

  it("rejects unsupported and expired Firebase tokens without a browser session", async () => {
    mocks.verifyFreshFirebaseIdentity.mockResolvedValueOnce(null);
    const unsupported = await POST(request("POST", { idToken: "unsupported" }));
    expect(unsupported.status).toBe(401);
    expect(unsupported.headers.get("set-cookie")).toBeNull();

    mocks.verifyFreshFirebaseIdentity.mockRejectedValueOnce(new Error("expired"));
    const expired = await POST(request("POST", { idToken: "expired" }));
    expect(expired.status).toBe(401);
    expect(expired.headers.get("set-cookie")).toBeNull();
  });

  it("reports the Team session independently and expires only its cookie on logout", async () => {
    const authenticated = await GET();
    expect(authenticated.status).toBe(200);
    await expect(authenticated.json()).resolves.toMatchObject({
      authenticated: true,
      uid: "admin-uid",
    });

    mocks.getCurrentAdminIdentity.mockResolvedValueOnce(null);
    await expect((await GET()).json()).resolves.toEqual({
      authenticated: false,
      email: null,
      provider: null,
      uid: null,
    });

    const logout = await DELETE(request("DELETE"));
    expect(logout.status).toBe(200);
    const cookie = logout.headers.get("set-cookie");
    expect(cookie).toContain("demaa_admin_session=");
    expect(cookie).toContain("Max-Age=0");
    expect(cookie).not.toMatch(/(?:^|;\s*)demaa_session=/);
  });

  it("canonicalizes untrusted return paths to the admin home", async () => {
    const response = await POST(request("POST", {
      idToken: "id-token",
      returnTo: "https://evil.example/admin",
    }));
    await expect(response.json()).resolves.toEqual({
      redirectTo: "/admin/demandes",
    });
  });
});
