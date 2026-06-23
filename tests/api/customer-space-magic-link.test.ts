import { beforeEach, describe, expect, it, vi } from "vitest";

const createMagicLinkToken = vi.fn();
const getCanonicalSiteUrl = vi.fn();
const enforceRateLimit = vi.fn();

vi.mock("@/lib/customer-space-auth", () => ({
  createMagicLinkToken,
}));

vi.mock("@/lib/site-url", () => ({
  getCanonicalSiteUrl,
}));

vi.mock("@/lib/api-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-security")>("@/lib/api-security");

  return {
    ...actual,
    enforceRateLimit,
  };
});

describe("POST /api/customer-space/magic-link", () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = "resend_test_key";
    process.env.RESEND_FROM_EMAIL = "hello@demaa.fr";
    process.env.NODE_ENV = "development";
    createMagicLinkToken.mockResolvedValue("magic-token");
    getCanonicalSiteUrl.mockReturnValue("https://demaa.fr");
    enforceRateLimit.mockResolvedValue(null);
  });

  it("rejects invalid emails", async () => {
    const { POST } = await import("@/app/api/customer-space/magic-link/route");

    const response = await POST(
      new Request("https://demaa.fr/api/customer-space/magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "not-an-email" }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Merci d'indiquer une adresse email valide.",
    });
  });

  it("returns 503 when email delivery fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Resend unavailable", { status: 503 }))
    );

    const { POST } = await import("@/app/api/customer-space/magic-link/route");
    const response = await POST(
      new Request("https://demaa.fr/api/customer-space/magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "client@demaa.fr" }),
      })
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error:
        "Impossible d'envoyer le lien pour le moment. Merci de réessayer dans quelques minutes.",
      devLink: "https://demaa.fr/api/customer-space/consume?token=magic-token",
      sent: false,
    });
  });

  it("returns a success payload when email delivery succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "email_123" }), { status: 200 })
      )
    );

    const { POST } = await import("@/app/api/customer-space/magic-link/route");
    const response = await POST(
      new Request("https://demaa.fr/api/customer-space/magic-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: "client@demaa.fr" }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      sent: true,
      devLink: "https://demaa.fr/api/customer-space/consume?token=magic-token",
    });
  });
});
