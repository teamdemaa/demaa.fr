import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCustomerSession: vi.fn(),
  enforceRateLimit: vi.fn(),
  ensureDefaultCompanyForIdentity: vi.fn(),
  getActiveDefaultCompanyIdentity: vi.fn(),
}));

vi.mock("@/lib/customer-space-auth", () => ({
  CUSTOMER_SPACE_COOKIE: "demaa_session",
  createCustomerSession: mocks.createCustomerSession,
  getCustomerCookieOptions: () => ({
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: true,
  }),
}));
vi.mock("@/lib/api-security", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-security")>();
  return { ...actual, enforceRateLimit: mocks.enforceRateLimit };
});
vi.mock("@/lib/company-membership.server", () => ({
  ensureDefaultCompanyForIdentity: mocks.ensureDefaultCompanyForIdentity,
  getActiveDefaultCompanyIdentity: mocks.getActiveDefaultCompanyIdentity,
}));

import { POST } from "@/app/api/auth/session/route";

function request(body: Record<string, unknown>) {
  return new Request("https://demaa.co/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://demaa.co" },
    body: JSON.stringify(body),
  });
}

describe("Firebase customer session route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    process.env.SITE_URL = "https://demaa.co";
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.ensureDefaultCompanyForIdentity.mockResolvedValue({
      companyId: "company-1",
      membershipId: "membership-1",
    });
    mocks.createCustomerSession.mockResolvedValue({
      identity: { email: "owner@example.com", provider: "password", uid: "owner-uid" },
      sessionCookie: "firebase-session-cookie",
    });
  });

  it("creates the single HttpOnly Firebase session cookie", async () => {
    const response = await POST(request({ idToken: "id-token", returnTo: "/plans" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ redirectTo: "/plans" });
    expect(mocks.createCustomerSession).toHaveBeenCalledWith("id-token");
    expect(mocks.ensureDefaultCompanyForIdentity).toHaveBeenCalledWith({
      email: "owner@example.com",
      provider: "password",
      uid: "owner-uid",
    });
    expect(response.headers.get("set-cookie")).toContain("demaa_session=firebase-session-cookie");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("rejects an unsupported or expired Firebase identity", async () => {
    mocks.createCustomerSession.mockResolvedValue(null);
    const unsupported = await POST(request({ idToken: "unsupported" }));
    expect(unsupported.status).toBe(401);

    mocks.createCustomerSession.mockRejectedValue(new Error("expired"));
    const expired = await POST(request({ idToken: "expired" }));
    expect(expired.status).toBe(401);
    expect(console.error).toHaveBeenCalledWith(
      "[auth-session] Firebase session creation failed",
      "expired",
    );
  });

  it("does not create a browser session when the company context fails", async () => {
    mocks.ensureDefaultCompanyForIdentity.mockRejectedValue(new Error("firestore unavailable"));

    const response = await POST(request({ idToken: "id-token", returnTo: "/plans" }));

    expect(response.status).toBe(503);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "[auth-session] Company provisioning failed",
      "firestore unavailable",
    );
  });
});
