import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  createSessionCookie: vi.fn(),
  verifyIdToken: vi.fn(),
  verifySessionCookie: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => ({
  getAdminAuth: () => ({
    createSessionCookie: mocks.createSessionCookie,
    verifyIdToken: mocks.verifyIdToken,
    verifySessionCookie: mocks.verifySessionCookie,
  }),
}));

import {
  CUSTOMER_SESSION_MAX_AUTH_AGE_SECONDS,
  CUSTOMER_SESSION_TTL_MS,
  createCustomerSession,
  getIdentityFromCustomerSessionToken,
} from "@/lib/customer-space-auth";

describe("native Firebase session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createSessionCookie.mockResolvedValue("session-cookie");
  });

  it.each([
    ["password", "password"],
    ["google.com", "google"],
  ] as const)("accepts %s and normalizes the identity", async (provider, expected) => {
    mocks.verifyIdToken.mockResolvedValue({
      auth_time: Math.floor(Date.now() / 1000),
      email: " Owner@Example.com ",
      firebase: { sign_in_provider: provider },
      uid: "firebase-uid",
    });

    await expect(createCustomerSession("id-token")).resolves.toEqual({
      identity: { email: "owner@example.com", provider: expected, uid: "firebase-uid" },
      sessionCookie: "session-cookie",
    });
    expect(mocks.createSessionCookie).toHaveBeenCalledWith("id-token", {
      expiresIn: CUSTOMER_SESSION_TTL_MS,
    });
  });

  it("rejects providers outside the password/Google allowlist", async () => {
    mocks.verifyIdToken.mockResolvedValue({
      auth_time: Math.floor(Date.now() / 1000),
      email: "owner@example.com",
      firebase: { sign_in_provider: "custom" },
      uid: "firebase-uid",
    });
    await expect(createCustomerSession("id-token")).resolves.toBeNull();
    expect(mocks.createSessionCookie).not.toHaveBeenCalled();
  });

  it("rejects an ID token whose authentication is no longer recent", async () => {
    mocks.verifyIdToken.mockResolvedValue({
      auth_time: Math.floor(Date.now() / 1000) - CUSTOMER_SESSION_MAX_AUTH_AGE_SECONDS - 1,
      email: "owner@example.com",
      firebase: { sign_in_provider: "password" },
      uid: "firebase-uid",
    });

    await expect(createCustomerSession("old-id-token")).resolves.toBeNull();
    expect(mocks.createSessionCookie).not.toHaveBeenCalled();
  });

  it("verifies the native cookie with revocation checks", async () => {
    mocks.verifySessionCookie.mockResolvedValue({
      email: "owner@example.com",
      firebase: { sign_in_provider: "google.com" },
      uid: "firebase-uid",
    });
    await expect(getIdentityFromCustomerSessionToken("cookie")).resolves.toEqual({
      email: "owner@example.com",
      provider: "google",
      uid: "firebase-uid",
    });
    expect(mocks.verifySessionCookie).toHaveBeenCalledWith("cookie", true);
  });
});
