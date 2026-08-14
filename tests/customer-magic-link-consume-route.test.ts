import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  consumeCustomerMagicLink: vi.fn(),
  createCustomerSession: vi.fn(),
  enforceRateLimit: vi.fn(),
}));

vi.mock("@/lib/generations-db", () => ({
  consumeCustomerMagicLink: mocks.consumeCustomerMagicLink,
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
  hashToken: (token: string) => `hash:${token}`,
}));

vi.mock("@/lib/api-security", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-security")>();
  return {
    ...actual,
    enforceRateLimit: mocks.enforceRateLimit,
  };
});

import { GET, POST } from "@/app/api/customer-space/consume/route";

describe("customer magic-link consumption route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = "https://demaa.co";
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.createCustomerSession.mockResolvedValue("session-token");
  });

  it("does not consume a token during an email-scanner GET", async () => {
    const response = await GET(new Request(
      "https://demaa.co/api/customer-space/consume?token=raw-token&returnTo=%2Fmon-espace%2Fplans%2Fplan-123",
    ));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://demaa.co/connexion?token=raw-token&returnTo=%2Fplans%2Fplan-123",
    );
    expect(mocks.consumeCustomerMagicLink).not.toHaveBeenCalled();
  });

  it("consumes the token only through a same-origin browser POST", async () => {
    mocks.consumeCustomerMagicLink.mockResolvedValue("dirigeant@example.com");
    const response = await POST(new Request(
      "https://demaa.co/api/customer-space/consume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://demaa.co",
        },
        body: JSON.stringify({
          token: "raw-token",
          returnTo: "/mon-espace/plans/plan-123",
        }),
      },
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      redirectTo: "/plans/plan-123",
    });
    expect(mocks.consumeCustomerMagicLink).toHaveBeenCalledWith("hash:raw-token");
    expect(mocks.createCustomerSession).toHaveBeenCalledWith("dirigeant@example.com");
    expect(response.headers.get("set-cookie")).toContain("demaa_customer_session=session-token");
  });

  it("returns to the exact saved-plan specialist draft after consuming the link", async () => {
    const draftToken = "a".repeat(43);
    const returnTo =
      `/plans/plan-123?intent=coaching&tab=messages&draftToken=${draftToken}`;
    mocks.consumeCustomerMagicLink.mockResolvedValue("dirigeant@example.com");

    const response = await POST(new Request(
      "https://demaa.co/api/customer-space/consume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://demaa.co",
        },
        body: JSON.stringify({ returnTo, token: "raw-token" }),
      },
    ));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ redirectTo: returnTo });
    expect(mocks.createCustomerSession).toHaveBeenCalledWith(
      "dirigeant@example.com",
    );
  });

  it("returns a neutral expired-link error without creating a session", async () => {
    mocks.consumeCustomerMagicLink.mockResolvedValue(null);
    const response = await POST(new Request(
      "https://demaa.co/api/customer-space/consume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://demaa.co",
        },
        body: JSON.stringify({ token: "expired-token", returnTo: "/mon-espace" }),
      },
    ));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "lien-expire" });
    expect(mocks.createCustomerSession).not.toHaveBeenCalled();
  });
});
