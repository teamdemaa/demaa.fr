import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  claimPendingActionPlanWithAccessToken: vi.fn(),
  createCustomerSession: vi.fn(),
  enforceRateLimit: vi.fn(),
  verifyIdToken: vi.fn(),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({ verifyIdToken: mocks.verifyIdToken }),
}));

vi.mock("@/lib/firebase-admin", () => ({
  getFirebaseAdminApp: () => ({ name: "test" }),
}));

vi.mock("@/lib/action-plan-storage.server", () => ({
  ACTION_PLAN_ACCESS_COOKIE: "demaa_action_plan_access",
  claimPendingActionPlanWithAccessToken: mocks.claimPendingActionPlanWithAccessToken,
}));

vi.mock("@/lib/customer-space-auth", () => ({
  CUSTOMER_SPACE_COOKIE: "demaa_customer_session",
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

import { POST } from "@/app/api/customer-space/google/route";

function request(body: Record<string, unknown>, cookie?: string) {
  return new NextRequest("https://demaa.co/api/customer-space/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://demaa.co",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("Google customer session route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = "https://demaa.co";
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.createCustomerSession.mockResolvedValue("session-token");
    mocks.claimPendingActionPlanWithAccessToken.mockResolvedValue(true);
    mocks.verifyIdToken.mockResolvedValue({
      email: "Dirigeant@Example.com",
      email_verified: true,
    });
  });

  it("verifies Google, creates the existing Demaa session and keeps a safe return path", async () => {
    const response = await POST(request(
      {
        idToken: "firebase-id-token",
        returnTo: "/plans",
      },
      "demaa_action_plan_access=opaque-access-token",
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ redirectTo: "/plans" });
    expect(mocks.verifyIdToken).toHaveBeenCalledWith("firebase-id-token", true);
    expect(mocks.createCustomerSession).toHaveBeenCalledWith("dirigeant@example.com");
    expect(response.headers.get("set-cookie")).toContain(
      "demaa_customer_session=session-token",
    );
    expect(response.headers.get("set-cookie")).not.toContain(
      "demaa_action_plan_access=;",
    );
  });

  it("claims a pending plan with the HttpOnly temporary access cookie", async () => {
    const response = await POST(request(
      {
        actionPlanId: "plan_123456789012",
        idToken: "firebase-id-token",
        returnTo: "/plans/plan_123456789012",
      },
      "demaa_action_plan_access=opaque-access-token",
    ));

    expect(response.status).toBe(200);
    expect(mocks.claimPendingActionPlanWithAccessToken).toHaveBeenCalledWith({
      email: "dirigeant@example.com",
      id: "plan_123456789012",
      temporaryAccessToken: "opaque-access-token",
    });
    expect(response.headers.get("set-cookie")).toContain(
      "demaa_action_plan_access=;",
    );
  });

  it("rejects an unverified Google email without creating a session", async () => {
    mocks.verifyIdToken.mockResolvedValue({
      email: "dirigeant@example.com",
      email_verified: false,
    });

    const response = await POST(request({ idToken: "firebase-id-token" }));
    expect(response.status).toBe(401);
    expect(mocks.createCustomerSession).not.toHaveBeenCalled();
  });

  it("does not create a session when the pending plan cannot be claimed", async () => {
    mocks.claimPendingActionPlanWithAccessToken.mockResolvedValue(false);

    const response = await POST(request(
      { actionPlanId: "plan_123456789012", idToken: "firebase-id-token" },
      "demaa_action_plan_access=expired",
    ));
    expect(response.status).toBe(409);
    expect(mocks.createCustomerSession).not.toHaveBeenCalled();
  });
});
