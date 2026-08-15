import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  getIdentityFromCustomerSessionToken: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/customer-space-auth", () => ({
  CUSTOMER_SPACE_COOKIE: "demaa_session",
  getIdentityFromCustomerSessionToken: mocks.getIdentityFromCustomerSessionToken,
}));

import {
  getCurrentCustomerIdentityFromSession,
  requireCurrentCustomerIdentity,
} from "@/lib/customer-space-session.server";
import { GET as getCustomerSession } from "@/app/api/customer-space/session/route";

describe("customer-space session helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "session-cookie" }),
    });
  });

  it("derives the full UID identity from the HttpOnly cookie", async () => {
    const identity = { email: "owner@example.com", provider: "password", uid: "owner-uid" };
    mocks.getIdentityFromCustomerSessionToken.mockResolvedValue(identity);
    await expect(getCurrentCustomerIdentityFromSession()).resolves.toEqual(identity);
    expect(mocks.getIdentityFromCustomerSessionToken).toHaveBeenCalledWith("session-cookie");
  });

  it("returns a private 401 response when the session is absent", async () => {
    mocks.getIdentityFromCustomerSessionToken.mockResolvedValue(null);
    const result = await requireCurrentCustomerIdentity();
    expect(result.identity).toBeNull();
    expect(result.response?.status).toBe(401);
    expect(result.response?.headers.get("vary")).toBe("Cookie");
  });

  it("exposes UID, contact email and provider without emailVerified", async () => {
    mocks.getIdentityFromCustomerSessionToken.mockResolvedValue({
      email: "owner@example.com",
      provider: "password",
      uid: "owner-uid",
    });
    const response = await getCustomerSession();
    await expect(response.json()).resolves.toEqual({
      authenticated: true,
      email: "owner@example.com",
      provider: "password",
      uid: "owner-uid",
    });
  });
});
