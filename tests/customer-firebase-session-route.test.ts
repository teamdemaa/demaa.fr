import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCustomerSession: vi.fn(),
  enforceRateLimit: vi.fn(),
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

import { POST } from "@/app/api/customer-space/firebase-session/route";

function request(body: Record<string, unknown>) {
  return new Request("https://demaa.co/api/customer-space/firebase-session", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://demaa.co" },
    body: JSON.stringify(body),
  });
}

describe("Firebase customer session route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = "https://demaa.co";
    mocks.enforceRateLimit.mockResolvedValue(null);
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
  });
});
