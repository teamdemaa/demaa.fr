import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimit = vi.fn();
const retrieveStripeCheckoutSession = vi.fn();

vi.mock("@/lib/api-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-security")>("@/lib/api-security");

  return {
    ...actual,
    enforceRateLimit,
  };
});

vi.mock("@/lib/stripe-server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/stripe-server")>("@/lib/stripe-server");

  return {
    ...actual,
    retrieveStripeCheckoutSession,
  };
});

describe("GET /api/stripe/checkout-session", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
    retrieveStripeCheckoutSession.mockReset();
  });

  it("requires a session_id", async () => {
    const { GET } = await import("@/app/api/stripe/checkout-session/route");

    const response = await GET(new Request("https://demaa.fr/api/stripe/checkout-session"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "session_id is required.",
    });
  });

  it("rejects invalid session identifiers", async () => {
    const { GET } = await import("@/app/api/stripe/checkout-session/route");

    const response = await GET(
      new Request("https://demaa.fr/api/stripe/checkout-session?session_id=bad")
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "session_id is invalid.",
    });
  });

  it("surfaces Stripe lookup errors", async () => {
    retrieveStripeCheckoutSession.mockResolvedValue({
      error: "Impossible de vérifier cette session Stripe.",
      status: 502,
    });
    const { GET } = await import("@/app/api/stripe/checkout-session/route");

    const response = await GET(
      new Request("https://demaa.fr/api/stripe/checkout-session?session_id=cs_test_123")
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      error: "Impossible de vérifier cette session Stripe.",
    });
  });

  it("returns the sanitized checkout session payload", async () => {
    retrieveStripeCheckoutSession.mockResolvedValue({
      session: {
        status: "complete",
        payment_status: "paid",
        metadata: {
          credits: "5",
          offer_type: "assistant_credits",
          offer_label: "Pack Credits",
          cart_summary: "Pack Credits x 5",
        },
      },
    });
    const { GET } = await import("@/app/api/stripe/checkout-session/route");

    const response = await GET(
      new Request("https://demaa.fr/api/stripe/checkout-session?session_id=cs_test_123")
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      paid: true,
      paymentStatus: "paid",
      status: "complete",
      credits: 5,
      offerType: "assistant_credits",
      offerLabel: "Pack Credits",
      cartSummary: "Pack Credits x 5",
    });
  });
});
