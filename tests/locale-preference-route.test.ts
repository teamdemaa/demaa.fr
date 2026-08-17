import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  getCurrentCustomerIdentityFromSession: vi.fn(),
  saveMemberLocalePreference: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/api-security", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api-security")>();
  return { ...actual, enforceRateLimit: mocks.enforceRateLimit };
});
vi.mock("@/lib/customer-space-session.server", () => ({
  getCurrentCustomerIdentityFromSession: mocks.getCurrentCustomerIdentityFromSession,
}));
vi.mock("@/lib/member-locale-preference.server", () => ({
  saveMemberLocalePreference: mocks.saveMemberLocalePreference,
}));

import { POST } from "@/app/api/preferences/locale/route";

function request(localeCode: unknown, origin = "https://demaa.co") {
  return new Request("https://demaa.co/api/preferences/locale", {
    body: JSON.stringify({ localeCode }),
    headers: { "Content-Type": "application/json", Origin: origin },
    method: "POST",
  });
}

describe("locale preference route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITE_URL = "https://demaa.co";
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.getCurrentCustomerIdentityFromSession.mockResolvedValue(null);
    mocks.saveMemberLocalePreference.mockResolvedValue(undefined);
  });

  it("stores a functional cookie for an anonymous visitor", async () => {
    const response = await POST(request("en"));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      localeCode: "en",
      persistedForMember: false,
    });
    expect(response.headers.get("set-cookie")).toContain("demaa_locale=en");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=15552000");
    expect(mocks.saveMemberLocalePreference).not.toHaveBeenCalled();
  });

  it("also persists the explicit choice for an authenticated member", async () => {
    mocks.getCurrentCustomerIdentityFromSession.mockResolvedValue({
      email: "member@example.com",
      provider: "google",
      uid: "member-uid",
    });
    const response = await POST(request("fr"));
    expect(response.status).toBe(200);
    expect(mocks.saveMemberLocalePreference).toHaveBeenCalledWith({
      localeCode: "fr",
      uid: "member-uid",
    });
  });

  it("rejects unsupported locales and cross-origin writes", async () => {
    expect((await POST(request("de"))).status).toBe(400);
    expect((await POST(request("en", "https://evil.example"))).status).toBe(403);
  });
});
