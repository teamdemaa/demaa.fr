import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  createCheckoutSession: vi.fn(),
  getEnterpriseBySlug: vi.fn(),
  hasPaidOperationalSystemAsset: vi.fn(),
  isStripeCheckoutConfigured: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(null),
  normalizeText: (value: unknown, maxLength: number) =>
    typeof value === "string" ? value.trim().slice(0, maxLength) : "",
  readJsonBody: async <T,>(request: Request) => ({
    data: (await request.json()) as T,
    response: null,
  }),
}));

vi.mock("@/lib/enterprise-annuaire", () => ({
  enterpriseToSystem: (enterprise: { name: string; slug: string }) => enterprise,
}));

vi.mock("@/lib/enterprise-annuaire-server", () => ({
  getEnterpriseBySlug: mocks.getEnterpriseBySlug,
}));

vi.mock("@/lib/paid-operational-system-assets.server", () => ({
  hasPaidOperationalSystemAsset: mocks.hasPaidOperationalSystemAsset,
}));

vi.mock("@/lib/request-guard", () => ({
  enforceAllowedHost: vi.fn().mockReturnValue(null),
  enforceSameOrigin: vi.fn().mockReturnValue(null),
}));

vi.mock("@/lib/stripe.server", () => ({
  isStripeCheckoutConfigured: mocks.isStripeCheckoutConfigured,
  getStripeClient: () => ({
    checkout: {
      sessions: {
        create: mocks.createCheckoutSession,
      },
    },
  }),
}));

import { POST } from "@/app/api/checkout/operational-system/route";

describe("operational system checkout route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasPaidOperationalSystemAsset.mockReturnValue(true);
    mocks.isStripeCheckoutConfigured.mockReturnValue(true);
    mocks.getEnterpriseBySlug.mockResolvedValue({
      name: "Plomberie & chauffage",
      slug: "plomberie-chauffage",
    });
    mocks.createCheckoutSession.mockResolvedValue({
      url: "https://checkout.stripe.com/c/pay/test",
    });
  });

  it("creates one 49 euro payment and lets Stripe collect the email", async () => {
    const response = await POST(
      new Request("https://demaa.fr/api/checkout/operational-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemSlug: "plomberie-chauffage" }),
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: "https://checkout.stripe.com/c/pay/test",
    });
    expect(mocks.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_creation: "always",
        mode: "payment",
        line_items: [
          expect.objectContaining({
            quantity: 1,
            price_data: expect.objectContaining({
              currency: "eur",
              unit_amount: 4_900,
            }),
          }),
        ],
        metadata: {
          orderType: "operational_system",
          systemName: "Plomberie & chauffage",
          systemSlug: "plomberie-chauffage",
        },
        success_url:
          "https://demaa.fr/commande/systeme-operationnel/succes?session_id={CHECKOUT_SESSION_ID}",
        cancel_url:
          "https://demaa.fr/kit-operationnel/plomberie-chauffage",
      }),
    );
  });

  it("returns to the actual preview origin after checkout", async () => {
    await POST(
      new Request(
        "https://demaa-preview.vercel.app/api/checkout/operational-system",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ systemSlug: "plomberie-chauffage" }),
        },
      ),
    );

    expect(mocks.createCheckoutSession).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url:
          "https://demaa-preview.vercel.app/commande/systeme-operationnel/succes?session_id={CHECKOUT_SESSION_ID}",
        cancel_url:
          "https://demaa-preview.vercel.app/kit-operationnel/plomberie-chauffage",
      }),
    );
  });

  it("does not create a checkout for an unpublished paid asset", async () => {
    mocks.hasPaidOperationalSystemAsset.mockReturnValueOnce(false);

    const response = await POST(
      new Request("https://demaa.fr/api/checkout/operational-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemSlug: "agence-marketing" }),
      }),
    );

    expect(response.status).toBe(404);
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });

  it("returns a controlled error when Stripe is not configured", async () => {
    mocks.isStripeCheckoutConfigured.mockReturnValueOnce(false);

    const response = await POST(
      new Request("https://demaa.fr/api/checkout/operational-system", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemSlug: "plomberie-chauffage" }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Le paiement est temporairement indisponible.",
    });
    expect(mocks.createCheckoutSession).not.toHaveBeenCalled();
  });
});
