import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const grantStripePaymentCredits = vi.fn();
const upsertConfirmedStripePayment = vi.fn();

vi.mock("@/lib/generations-db", () => ({
  grantStripePaymentCredits,
  upsertConfirmedStripePayment,
}));

function signPayload(payload: string, secret: string, timestamp = Math.floor(Date.now() / 1000)) {
  const signature = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`, "utf8")
    .digest("hex");

  return `t=${timestamp},v1=${signature}`;
}

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    upsertConfirmedStripePayment.mockResolvedValue(undefined);
    grantStripePaymentCredits.mockResolvedValue({
      granted: true,
      credits: 10,
      reason: "granted",
    });
  });

  it("rejects requests without a Stripe signature", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const response = await POST(
      new Request("https://demaa.fr/api/stripe/webhook", {
        method: "POST",
        body: "{}",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Stripe webhook is not configured.",
    });
  });

  it("rejects invalid Stripe signatures", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const response = await POST(
      new Request("https://demaa.fr/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "t=123,v1=invalid",
        },
        body: "{}",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid Stripe signature.",
    });
  });

  it("rejects invalid JSON even with a valid signature", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const payload = "{invalid";
    const response = await POST(
      new Request("https://demaa.fr/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": signPayload(payload, process.env.STRIPE_WEBHOOK_SECRET!),
        },
        body: payload,
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid Stripe payload.",
    });
  });

  it("stores completed checkout sessions and grants credits when applicable", async () => {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const payload = JSON.stringify({
      id: "evt_123",
      livemode: false,
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          status: "complete",
          payment_status: "paid",
          amount_total: 15000,
          currency: "eur",
          customer_details: {
            email: "client@demaa.fr",
            name: "Client Demaa",
          },
          metadata: {
            credits: "10",
            offer_label: "Pack Credits",
            cart_summary: "Pack Credits",
            order_type: "assistant_credits",
            service_names: "Service A|Service B",
            service_slugs: "service-a,service-b",
            item_count: "2",
          },
        },
      },
    });

    const response = await POST(
      new Request("https://demaa.fr/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": signPayload(payload, process.env.STRIPE_WEBHOOK_SECRET!),
        },
        body: payload,
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ received: true });
    expect(upsertConfirmedStripePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        stripeSessionId: "cs_test_123",
        stripeEventId: "evt_123",
        email: "client@demaa.fr",
        customerName: "Client Demaa",
        offerLabel: "Pack Credits",
        serviceNames: ["Service A", "Service B"],
        serviceSlugs: ["service-a", "service-b"],
        itemCount: 2,
      })
    );
    expect(grantStripePaymentCredits).toHaveBeenCalledWith({
      stripeSessionId: "cs_test_123",
      email: "client@demaa.fr",
      credits: 10,
      offerLabel: "Pack Credits",
    });
  });
});
