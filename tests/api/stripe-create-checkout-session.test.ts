import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimit = vi.fn();
const getPurchasableServices = vi.fn();
const getCanonicalSiteUrl = vi.fn();
const getDefaultStripeSecretKey = vi.fn();

vi.mock("@/lib/api-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-security")>("@/lib/api-security");

  return {
    ...actual,
    enforceRateLimit,
  };
});

vi.mock("@/lib/service-purchase", () => ({
  getPurchasableServices,
}));

vi.mock("@/lib/site-url", () => ({
  getCanonicalSiteUrl,
}));

vi.mock("@/lib/stripe-server", () => ({
  getDefaultStripeSecretKey,
}));

describe("POST /api/stripe/create-checkout-session", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
    getCanonicalSiteUrl.mockReturnValue("https://demaa.fr");
    getDefaultStripeSecretKey.mockReturnValue("sk_test_123");
    getPurchasableServices.mockReturnValue([
      {
        slug: "site-web",
        name: "Site web",
        shortDescription: "Creation site web",
        unitAmount: 135000,
        currency: "eur",
      },
      {
        slug: "assistant-polyvalent",
        name: "Assistant polyvalent",
        shortDescription: "Support business",
        unitAmount: 50000,
        currency: "eur",
      },
    ]);
  });

  it("rejects empty selections", async () => {
    const { POST } = await import("@/app/api/stripe/create-checkout-session/route");

    const response = await POST(
      new Request("https://demaa.fr/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceSlugs: [] }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Aucun service payable n'a été sélectionné.",
    });
  });

  it("rejects unavailable services", async () => {
    const { POST } = await import("@/app/api/stripe/create-checkout-session/route");

    const response = await POST(
      new Request("https://demaa.fr/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceSlugs: ["site-web", "service-inconnu"] }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Un ou plusieurs services sélectionnés ne sont pas disponibles.",
    });
  });

  it("returns 502 when Stripe session creation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("stripe down", { status: 502 }))
    );
    const { POST } = await import("@/app/api/stripe/create-checkout-session/route");

    const response = await POST(
      new Request("https://demaa.fr/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceSlugs: ["site-web"] }),
      })
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Impossible de créer la session de paiement pour le moment.",
    });
  });

  it("returns the Stripe checkout URL when creation succeeds", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ url: "https://checkout.stripe.com/pay/cs_test_123" }), {
        status: 200,
      })
    );
    vi.stubGlobal("fetch", fetchMock);
    const { POST } = await import("@/app/api/stripe/create-checkout-session/route");

    const response = await POST(
      new Request("https://demaa.fr/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceSlugs: ["site-web", "assistant-polyvalent"] }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "https://checkout.stripe.com/pay/cs_test_123",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.stripe.com/v1/checkout/sessions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sk_test_123",
        }),
      })
    );
  });
});
