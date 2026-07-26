import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  fulfillOperationalSystemOrder: vi.fn(),
  logOperationalError: vi.fn(),
}));

vi.mock("@/lib/operational-system-orders.server", () => ({
  fulfillOperationalSystemOrder: mocks.fulfillOperationalSystemOrder,
}));

vi.mock("@/lib/operational-log", () => ({
  logOperationalError: mocks.logOperationalError,
  logOperationalEvent: vi.fn(),
}));

vi.mock("@/lib/stripe.server", () => ({
  getStripeClient: () => ({
    webhooks: {
      constructEvent: mocks.constructEvent,
    },
  }),
  getStripeWebhookSecret: () => "whsec_test",
}));

import { POST } from "@/app/api/webhooks/stripe/route";

describe("Stripe operational system webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
        },
      },
    });
    mocks.fulfillOperationalSystemOrder.mockResolvedValue({
      fulfilled: true,
      emailSent: true,
      systemSlug: "plomberie-chauffage",
    });
  });

  it("verifies the raw payload then fulfills a completed checkout", async () => {
    const rawPayload = '{"id":"evt_123"}';
    const response = await POST(
      new Request("https://demaa.fr/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "signed-payload" },
        body: rawPayload,
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.constructEvent).toHaveBeenCalledWith(
      rawPayload,
      "signed-payload",
      "whsec_test",
    );
    expect(mocks.fulfillOperationalSystemOrder).toHaveBeenCalledWith({
      id: "cs_test_123",
    });
  });

  it("rejects an invalid Stripe signature", async () => {
    mocks.constructEvent.mockImplementationOnce(() => {
      throw new Error("invalid signature");
    });

    const response = await POST(
      new Request("https://demaa.fr/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "invalid" },
        body: "{}",
      }),
    );

    expect(response.status).toBe(400);
    expect(mocks.fulfillOperationalSystemOrder).not.toHaveBeenCalled();
  });

  it("asks Stripe to retry when delivery is incomplete", async () => {
    mocks.fulfillOperationalSystemOrder.mockResolvedValueOnce({
      fulfilled: true,
      emailSent: false,
      systemSlug: "plomberie-chauffage",
    });

    const response = await POST(
      new Request("https://demaa.fr/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "signed-payload" },
        body: "{}",
      }),
    );

    expect(response.status).toBe(500);
  });
});
