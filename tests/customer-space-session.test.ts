import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  ensureDefaultCompanyForIdentity: vi.fn(),
  getActiveDefaultCompanyIdentity: vi.fn(),
  getIdentityFromCustomerSessionToken: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("@/lib/customer-space-auth", () => ({
  CUSTOMER_SPACE_COOKIE: "demaa_session",
  getIdentityFromCustomerSessionToken: mocks.getIdentityFromCustomerSessionToken,
}));
vi.mock("@/lib/company-membership.server", () => ({
  ensureDefaultCompanyForIdentity: mocks.ensureDefaultCompanyForIdentity,
  getActiveDefaultCompanyIdentity: mocks.getActiveDefaultCompanyIdentity,
}));

import {
  getCurrentCustomerAppIdentityFromSession,
  getCurrentCustomerIdentityFromSession,
  requireCurrentCustomerIdentity,
} from "@/lib/customer-space-session.server";
import { GET as getCustomerSession } from "@/app/api/auth/session/route";

describe("customer-space session helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.DEMAA_GUEST_PRODUCT_ENABLED;
    mocks.cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "session-cookie" }),
    });
    mocks.getActiveDefaultCompanyIdentity.mockResolvedValue({
      companyId: "company-1",
      membershipId: "membership-1",
    });
  });

  it("does not inspect or repair a customer session when the guest product is enabled", async () => {
    process.env.DEMAA_GUEST_PRODUCT_ENABLED = "true";

    const response = await getCustomerSession();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    await expect(response.json()).resolves.toEqual({
      authenticated: false,
      companyReady: false,
      email: null,
      provider: null,
      uid: null,
    });
    expect(mocks.getIdentityFromCustomerSessionToken).not.toHaveBeenCalled();
    expect(mocks.ensureDefaultCompanyForIdentity).not.toHaveBeenCalled();
  });

  it("derives the full UID identity from the HttpOnly cookie", async () => {
    const identity = { email: "owner@example.com", provider: "password", uid: "owner-uid" };
    mocks.getIdentityFromCustomerSessionToken.mockResolvedValue(identity);
    await expect(getCurrentCustomerIdentityFromSession()).resolves.toEqual(identity);
    expect(mocks.getIdentityFromCustomerSessionToken).toHaveBeenCalledWith("session-cookie");
  });

  it("repairs a missing company context before admitting a session into the app", async () => {
    const identity = { email: "owner@example.com", provider: "password", uid: "owner-uid" };
    mocks.getIdentityFromCustomerSessionToken.mockResolvedValue(identity);
    mocks.ensureDefaultCompanyForIdentity.mockResolvedValue({
      companyId: "company-1",
      membershipId: "membership-1",
    });

    await expect(getCurrentCustomerAppIdentityFromSession()).resolves.toEqual(identity);
    expect(mocks.ensureDefaultCompanyForIdentity).toHaveBeenCalledWith(identity);
  });

  it("does not admit a suspended membership into the app", async () => {
    const identity = { email: "owner@example.com", provider: "password", uid: "owner-uid" };
    mocks.getIdentityFromCustomerSessionToken.mockResolvedValue(identity);
    mocks.ensureDefaultCompanyForIdentity.mockRejectedValue(
      new Error("The default company membership is not active."),
    );

    await expect(getCurrentCustomerAppIdentityFromSession()).rejects.toThrow(
      "membership is not active",
    );
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
      companyReady: true,
      email: "owner@example.com",
      provider: "password",
      uid: "owner-uid",
    });
  });

  it("repairs a missing default company before reporting the session ready", async () => {
    const identity = {
      email: "owner@example.com",
      provider: "password",
      uid: "owner-uid",
    };
    mocks.getIdentityFromCustomerSessionToken.mockResolvedValue(identity);
    mocks.getActiveDefaultCompanyIdentity.mockResolvedValue(null);
    mocks.ensureDefaultCompanyForIdentity.mockResolvedValue({
      companyId: "company-1",
      membershipId: "membership-1",
    });

    const response = await getCustomerSession();

    expect(response.status).toBe(200);
    expect(mocks.ensureDefaultCompanyForIdentity).toHaveBeenCalledWith(identity);
    await expect(response.json()).resolves.toMatchObject({
      authenticated: true,
      companyReady: true,
    });
  });

  it("exposes an explicit company error instead of an empty unauthenticated state", async () => {
    mocks.getIdentityFromCustomerSessionToken.mockResolvedValue({
      email: "owner@example.com",
      provider: "password",
      uid: "owner-uid",
    });
    mocks.getActiveDefaultCompanyIdentity.mockRejectedValue(new Error("unavailable"));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await getCustomerSession();

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      authenticated: true,
      companyReady: false,
      error: "company_context_unavailable",
    });
  });
});
