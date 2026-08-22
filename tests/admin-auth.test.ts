import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  cookieGet: vi.fn(),
  getIdentityFromCustomerSessionToken: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: mocks.cookieGet }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/customer-space-auth", () => ({
  getCustomerCookieOptions: (maxAge: number) => ({
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: true,
  }),
  getIdentityFromCustomerSessionToken: mocks.getIdentityFromCustomerSessionToken,
}));

import {
  ADMIN_SESSION_COOKIE,
  getCurrentAdminIdentity,
  isAdminIdentity,
  requireAdminIdentity,
} from "@/lib/admin-auth.server";

describe("admin identity authority", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("accepts an allowlisted Firebase UID even without email verification", () => {
    vi.stubEnv("DEMAA_ADMIN_UIDS", "admin-uid");
    vi.stubEnv("DEMAA_ADMIN_EMAILS", "");
    expect(isAdminIdentity({
      email: "owner@example.com",
      emailVerified: false,
      provider: "password",
      uid: "admin-uid",
    })).toBe(true);
  });

  it("uses a verified allowlisted email only as a compatibility fallback", () => {
    vi.stubEnv("DEMAA_ADMIN_UIDS", "");
    vi.stubEnv("DEMAA_ADMIN_EMAILS", "owner@example.com");
    expect(isAdminIdentity({
      email: "owner@example.com",
      emailVerified: true,
      provider: "google",
      uid: "other-uid",
    })).toBe(true);
    expect(isAdminIdentity({
      email: "owner@example.com",
      emailVerified: false,
      provider: "password",
      uid: "other-uid",
    })).toBe(false);
  });

  it("rejects identities absent from both allowlists", () => {
    vi.stubEnv("DEMAA_ADMIN_UIDS", "admin-uid");
    vi.stubEnv("DEMAA_ADMIN_EMAILS", "owner@example.com");
    expect(isAdminIdentity({
      email: "visitor@example.com",
      emailVerified: true,
      provider: "google",
      uid: "visitor-uid",
    })).toBe(false);
  });

  it("reads only the independent Team cookie", async () => {
    vi.stubEnv("DEMAA_ADMIN_UIDS", "admin-uid");
    vi.stubEnv("DEMAA_ADMIN_EMAILS", "");
    mocks.cookieGet.mockImplementation((name: string) => name === ADMIN_SESSION_COOKIE
      ? { value: "team-session-cookie" }
      : name === "demaa_session"
        ? { value: "customer-session-cookie" }
        : undefined);
    mocks.getIdentityFromCustomerSessionToken.mockResolvedValue({
      email: "owner@example.com",
      emailVerified: true,
      provider: "google",
      uid: "admin-uid",
    });

    await expect(getCurrentAdminIdentity()).resolves.toMatchObject({ uid: "admin-uid" });
    expect(mocks.cookieGet).toHaveBeenCalledTimes(1);
    expect(mocks.cookieGet).toHaveBeenCalledWith("demaa_admin_session");
    expect(mocks.getIdentityFromCustomerSessionToken).toHaveBeenCalledWith(
      "team-session-cookie",
    );
  });

  it("rejects a falsified or expired Team cookie", async () => {
    vi.stubEnv("DEMAA_ADMIN_UIDS", "admin-uid");
    mocks.cookieGet.mockReturnValue({ value: "invalid-session-cookie" });
    mocks.getIdentityFromCustomerSessionToken.mockResolvedValue(null);

    await expect(getCurrentAdminIdentity()).resolves.toBeNull();
  });

  it("redirects an unauthenticated admin page to the dedicated Team login", async () => {
    vi.stubEnv("DEMAA_ADMIN_UIDS", "admin-uid");
    mocks.cookieGet.mockReturnValue(undefined);
    mocks.getIdentityFromCustomerSessionToken.mockResolvedValue(null);

    await requireAdminIdentity("/admin/opportunites");
    expect(mocks.redirect).toHaveBeenCalledWith(
      "/admin/connexion?returnTo=%2Fadmin%2Fopportunites",
    );
  });
});
