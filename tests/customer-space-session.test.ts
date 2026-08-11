import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  getEmailFromCustomerSessionToken: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/customer-space-auth", () => ({
  CUSTOMER_SPACE_COOKIE: "demaa_customer_session",
  getEmailFromCustomerSessionToken: mocks.getEmailFromCustomerSessionToken,
}));

import {
  getCurrentCustomerEmailFromSession,
  requireCurrentCustomerEmail,
} from "@/lib/customer-space-session.server";
import { GET as getCustomerSession } from "@/app/api/customer-space/session/route";

describe("customer-space session helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "session-token" }),
    });
  });

  it("derives the customer email only from the httpOnly session cookie", async () => {
    mocks.getEmailFromCustomerSessionToken.mockResolvedValue("owner@example.com");

    await expect(getCurrentCustomerEmailFromSession()).resolves.toBe("owner@example.com");
    expect(mocks.getEmailFromCustomerSessionToken).toHaveBeenCalledWith("session-token");
  });

  it("returns a no-store 401 response when the session is absent", async () => {
    mocks.getEmailFromCustomerSessionToken.mockResolvedValue(null);

    const result = await requireCurrentCustomerEmail();

    expect(result.email).toBeNull();
    expect(result.response?.status).toBe(401);
    expect(result.response?.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(result.response?.headers.get("vary")).toBe("Cookie");
    await expect(result.response?.json()).resolves.toEqual({
      error: "authentication_required",
      message: "Connectez-vous pour continuer.",
    });
  });

  it("exposes only the derived identity through the session endpoint", async () => {
    mocks.getEmailFromCustomerSessionToken.mockResolvedValue("owner@example.com");

    const response = await getCustomerSession();

    await expect(response.json()).resolves.toEqual({
      authenticated: true,
      email: "owner@example.com",
    });
    expect(response.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(response.headers.get("vary")).toBe("Cookie");
  });
});
