import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimit = vi.fn();
const consumeCustomerMagicLink = vi.fn();
const createCustomerSession = vi.fn();
const getCustomerCookieOptions = vi.fn();
const hashToken = vi.fn();

vi.mock("@/lib/api-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-security")>("@/lib/api-security");

  return {
    ...actual,
    enforceRateLimit,
  };
});

vi.mock("@/lib/generations-db", () => ({
  consumeCustomerMagicLink,
}));

vi.mock("@/lib/customer-space-auth", () => ({
  CUSTOMER_SPACE_COOKIE: "demaa_customer_session",
  createCustomerSession,
  getCustomerCookieOptions,
  hashToken,
}));

describe("GET /api/customer-space/consume", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
    consumeCustomerMagicLink.mockReset();
    createCustomerSession.mockReset();
    getCustomerCookieOptions.mockReset();
    hashToken.mockReset();
    hashToken.mockImplementation((value: string) => `hashed:${value}`);
    getCustomerCookieOptions.mockReturnValue({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    });
  });

  it("redirects to the expired-link state when the token is missing or invalid", async () => {
    consumeCustomerMagicLink.mockResolvedValue(null);
    const { GET } = await import("@/app/api/customer-space/consume/route");

    const response = await GET(
      new Request("https://demaa.fr/api/customer-space/consume?token=expired-token")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://demaa.fr/mon-espace?error=lien-expire"
    );
    expect(hashToken).toHaveBeenCalledWith("expired-token");
    expect(consumeCustomerMagicLink).toHaveBeenCalledWith("hashed:expired-token");
  });

  it("creates a member session and sets the auth cookie for valid magic links", async () => {
    consumeCustomerMagicLink.mockResolvedValue("client@demaa.fr");
    createCustomerSession.mockResolvedValue("session-token");
    const { GET } = await import("@/app/api/customer-space/consume/route");

    const response = await GET(
      new Request("https://demaa.fr/api/customer-space/consume?token=valid-token")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://demaa.fr/mon-espace");
    expect(createCustomerSession).toHaveBeenCalledWith("client@demaa.fr");
    expect(response.headers.get("set-cookie")).toContain("demaa_customer_session=session-token");
  });
});
