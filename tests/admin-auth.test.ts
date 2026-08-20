import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: vi.fn() }));

import { isAdminIdentity } from "@/lib/admin-auth.server";

describe("admin identity authority", () => {
  afterEach(() => vi.unstubAllEnvs());

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
});
