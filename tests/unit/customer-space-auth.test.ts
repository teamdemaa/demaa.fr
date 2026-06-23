import { beforeEach, describe, expect, it, vi } from "vitest";

const getCustomerSessionEmail = vi.fn();
const saveCustomerMagicLink = vi.fn();
const saveCustomerSession = vi.fn();

vi.mock("@/lib/generations-db", () => ({
  getCustomerSessionEmail,
  saveCustomerMagicLink,
  saveCustomerSession,
}));

describe("customer-space-auth", () => {
  beforeEach(() => {
    vi.resetModules();
    getCustomerSessionEmail.mockReset();
    saveCustomerMagicLink.mockReset();
    saveCustomerSession.mockReset();
  });

  it("hashes tokens deterministically", async () => {
    const { hashToken } = await import("@/lib/customer-space-auth");

    expect(hashToken("token-123")).toBe(hashToken("token-123"));
    expect(hashToken("token-123")).not.toBe(hashToken("token-456"));
  });

  it("returns secure cookie options only in production", async () => {
    process.env.NODE_ENV = "development";
    const { getCustomerCookieOptions } = await import("@/lib/customer-space-auth");

    expect(getCustomerCookieOptions().secure).toBe(false);

    vi.resetModules();
    process.env.NODE_ENV = "production";
    const prodModule = await import("@/lib/customer-space-auth");
    expect(prodModule.getCustomerCookieOptions().secure).toBe(true);
  });

  it("creates and stores normalized magic-link tokens", async () => {
    const { createMagicLinkToken } = await import("@/lib/customer-space-auth");

    const token = await createMagicLinkToken(" Client@Demaa.fr ");

    expect(token).toBeTruthy();
    expect(saveCustomerMagicLink).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "client@demaa.fr",
        tokenHash: expect.any(String),
        expiresAt: expect.any(String),
      })
    );
  });

  it("creates customer sessions and resolves emails from hashed session tokens", async () => {
    const { createCustomerSession, getEmailFromCustomerSessionToken, hashToken } =
      await import("@/lib/customer-space-auth");

    const token = await createCustomerSession(" Client@Demaa.fr ");

    expect(token).toBeTruthy();
    expect(saveCustomerSession).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "client@demaa.fr",
        sessionHash: expect.any(String),
        expiresAt: expect.any(String),
      })
    );

    getCustomerSessionEmail.mockResolvedValue("client@demaa.fr");
    await expect(getEmailFromCustomerSessionToken("session-token")).resolves.toBe("client@demaa.fr");
    expect(getCustomerSessionEmail).toHaveBeenCalledWith(hashToken("session-token"));
  });
});
