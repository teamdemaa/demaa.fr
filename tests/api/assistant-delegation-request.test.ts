import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimit = vi.fn();
const getAssistantDelegationRequestBySessionId = vi.fn();
const saveAssistantDelegationRequest = vi.fn();
const sendSlackMessage = vi.fn();
const retrieveStripeCheckoutSession = vi.fn();

vi.mock("@/lib/api-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-security")>("@/lib/api-security");

  return {
    ...actual,
    enforceRateLimit,
  };
});

vi.mock("@/lib/generations-db", () => ({
  getAssistantDelegationRequestBySessionId,
  saveAssistantDelegationRequest,
}));

vi.mock("@/lib/slack", () => ({
  sendSlackMessage,
}));

vi.mock("@/lib/stripe-server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/stripe-server")>("@/lib/stripe-server");

  return {
    ...actual,
    retrieveStripeCheckoutSession,
  };
});

describe("POST /api/assistant/delegation-request", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
    getAssistantDelegationRequestBySessionId.mockResolvedValue(null);
    saveAssistantDelegationRequest.mockResolvedValue(undefined);
    sendSlackMessage.mockResolvedValue(undefined);
    retrieveStripeCheckoutSession.mockReset();
  });

  it("rejects missing Stripe sessions", async () => {
    const { POST } = await import("@/app/api/assistant/delegation-request/route");

    const response = await POST(
      new Request("https://demaa.fr/api/assistant/delegation-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: "Jean",
          tasks: "Deleguer l'administratif",
          whatsappPhone: "+33600000000",
        }),
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "La session Stripe est manquante.",
    });
  });

  it("rejects unpaid Stripe sessions", async () => {
    retrieveStripeCheckoutSession.mockResolvedValue({
      session: {
        id: "cs_test_123",
        status: "open",
        payment_status: "unpaid",
      },
    });
    const { POST } = await import("@/app/api/assistant/delegation-request/route");

    const response = await POST(
      new Request("https://demaa.fr/api/assistant/delegation-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: "Jean",
          sessionId: "cs_test_123",
          tasks: "Deleguer l'administratif",
          whatsappPhone: "+33600000000",
        }),
      })
    );

    expect(response.status).toBe(402);
    await expect(response.json()).resolves.toEqual({
      error: "Le paiement Stripe n'est pas encore confirmé.",
    });
  });

  it("short-circuits duplicate delegation requests", async () => {
    retrieveStripeCheckoutSession.mockResolvedValue({
      session: {
        id: "cs_test_123",
        status: "complete",
        payment_status: "paid",
      },
    });
    getAssistantDelegationRequestBySessionId.mockResolvedValue({
      slack_notified_at: "2026-06-23T10:00:00.000Z",
    });
    const { POST } = await import("@/app/api/assistant/delegation-request/route");

    const response = await POST(
      new Request("https://demaa.fr/api/assistant/delegation-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: "Jean",
          sessionId: "cs_test_123",
          tasks: "Deleguer l'administratif",
          whatsappPhone: "+33600000000",
        }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      sent: true,
      duplicate: true,
    });
  });

  it("sends and stores paid delegation requests", async () => {
    retrieveStripeCheckoutSession.mockResolvedValue({
      session: {
        id: "cs_test_123",
        status: "complete",
        payment_status: "paid",
        amount_total: 2500,
        currency: "eur",
        livemode: false,
        customer_details: {
          email: "client@demaa.fr",
          name: "Jean Client",
        },
        metadata: {
          credits: "5",
          offer_label: "Credits assistant",
          cart_summary: "Credits assistant x 5",
        },
      },
    });
    const { POST } = await import("@/app/api/assistant/delegation-request/route");

    const response = await POST(
      new Request("https://demaa.fr/api/assistant/delegation-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: "Jean",
          lastName: "Client",
          sessionId: "cs_test_123",
          tasks: "Deleguer l'administratif",
          whatsappPhone: "+33600000000",
        }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      sent: true,
    });
    expect(sendSlackMessage).toHaveBeenCalled();
    expect(saveAssistantDelegationRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        stripeSessionId: "cs_test_123",
        email: "client@demaa.fr",
        customerName: "Jean Client",
        whatsappPhone: "+33600000000",
        offerLabel: "Credits assistant",
        credits: 5,
        tasks: "Deleguer l'administratif",
        livemode: false,
      })
    );
  });
});
