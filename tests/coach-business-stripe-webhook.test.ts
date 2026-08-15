import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  projectCoachBusinessSubscription: vi.fn(),
  retrieveSubscription: vi.fn(),
}));

vi.mock("@/lib/coach-business-subscription.server", () => ({
  projectCoachBusinessSubscription: mocks.projectCoachBusinessSubscription,
}));
vi.mock("@/lib/operational-log", () => ({
  logOperationalError: vi.fn(),
  logOperationalEvent: vi.fn(),
}));
vi.mock("@/lib/stripe.server", () => ({
  getCoachBusinessStripePriceIds: () => new Set(["price_coach_350", "price_coach_550"]),
  getStripeClient: () => ({
    subscriptions: { retrieve: mocks.retrieveSubscription },
    webhooks: { constructEvent: mocks.constructEvent },
  }),
  getStripeWebhookSecret: () => "whsec_test",
  subscriptionUsesCoachBusinessStripePrice: (
    subscription: { items: { data: Array<{ price: { id: string } }> } },
    expectedIds: ReadonlySet<string>,
  ) => subscription.items.data.some((item) => expectedIds.has(item.price.id)),
}));

import { POST } from "@/app/api/webhooks/stripe/route";

function request() {
  return new Request("https://demaa.co/api/webhooks/stripe", {
    body: "{\"id\":\"evt_coach\"}",
    headers: { "stripe-signature": "valid_signature" },
    method: "POST",
  });
}

function coachSubscription(priceId = "price_coach_350") {
  return {
    id: "sub_coach",
    items: { data: [{ price: { id: priceId } }] },
    metadata: { firebaseUid: "owner-uid", offer: "coach_business" },
  };
}

describe("Coach business Stripe webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.projectCoachBusinessSubscription.mockResolvedValue({ duplicate: false, uid: "owner-uid" });
    mocks.retrieveSubscription.mockResolvedValue(coachSubscription());
    mocks.constructEvent.mockReturnValue({
      data: { object: { id: "sub_coach" } },
      id: "evt_coach",
      type: "customer.subscription.updated",
    });
  });

  it("projects only a configured Coach business subscription", async () => {
    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.retrieveSubscription).toHaveBeenCalledWith("sub_coach");
    expect(mocks.projectCoachBusinessSubscription).toHaveBeenCalledWith({
      eventId: "evt_coach",
      eventType: "customer.subscription.updated",
      subscription: expect.objectContaining({ id: "sub_coach" }),
      uidOverride: undefined,
    });
  });

  it("ignores a subscription whose Stripe price is not configured", async () => {
    mocks.retrieveSubscription.mockResolvedValue(coachSubscription("price_unexpected"));

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.projectCoachBusinessSubscription).not.toHaveBeenCalled();
  });

  it("rejects an invalid Stripe signature before reading any entitlement", async () => {
    mocks.constructEvent.mockImplementation(() => { throw new Error("invalid signature"); });

    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(mocks.retrieveSubscription).not.toHaveBeenCalled();
    expect(mocks.projectCoachBusinessSubscription).not.toHaveBeenCalled();
  });
});
