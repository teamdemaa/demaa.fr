import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getCopyUrl: vi.fn(),
  sendDeliveryEmail: vi.fn(),
  setOrder: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => ({
  getAdminFirestore: () => ({
    collection: () => ({
      doc: () => ({
        set: mocks.setOrder,
      }),
    }),
  }),
}));

vi.mock("@/lib/operational-system-delivery-email.server", () => ({
  sendOperationalSystemDeliveryEmail: mocks.sendDeliveryEmail,
}));

vi.mock("@/lib/paid-operational-system-assets.server", () => ({
  getPaidOperationalSystemCopyUrl: mocks.getCopyUrl,
}));

import {
  fulfillOperationalSystemOrder,
  isPaidOperationalSystemSession,
} from "@/lib/operational-system-orders.server";

function buildSession(
  overrides: Record<string, unknown> = {},
) {
  return {
    id: "cs_test_paid",
    amount_total: 4_900,
    created: 1_722_470_400,
    currency: "eur",
    customer_details: {
      email: "CLIENT@EXAMPLE.COM ",
    },
    customer_email: null,
    metadata: {
      orderType: "operational_system",
      systemName: "Plomberie & chauffage",
      systemSlug: "plomberie-chauffage",
    },
    payment_status: "paid",
    ...overrides,
  } as never;
}

describe("operational system order fulfillment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCopyUrl.mockReturnValue(
      "https://docs.google.com/spreadsheets/d/paid-file/copy",
    );
    mocks.sendDeliveryEmail.mockResolvedValue({
      sent: true,
      reason: null,
    });
    mocks.setOrder.mockResolvedValue(undefined);
  });

  it("accepts only the exact paid one-time offer", () => {
    expect(isPaidOperationalSystemSession(buildSession())).toBe(true);
    expect(
      isPaidOperationalSystemSession(
        buildSession({ payment_status: "unpaid" }),
      ),
    ).toBe(false);
    expect(
      isPaidOperationalSystemSession(buildSession({ amount_total: 15_000 })),
    ).toBe(false);
    expect(
      isPaidOperationalSystemSession(buildSession({ currency: "usd" })),
    ).toBe(false);
    expect(
      isPaidOperationalSystemSession(
        buildSession({
          metadata: {
            orderType: "other",
            systemName: "Plomberie & chauffage",
            systemSlug: "plomberie-chauffage",
          },
        }),
      ),
    ).toBe(false);
  });

  it("stores the order and delivers only the paid server-side asset", async () => {
    const result = await fulfillOperationalSystemOrder(buildSession());

    expect(result).toMatchObject({
      fulfilled: true,
      copyUrl:
        "https://docs.google.com/spreadsheets/d/paid-file/copy",
      email: "client@example.com",
      emailSent: true,
      systemSlug: "plomberie-chauffage",
    });
    expect(mocks.getCopyUrl).toHaveBeenCalledWith(
      "plomberie-chauffage",
    );
    expect(mocks.sendDeliveryEmail).toHaveBeenCalledWith({
      copyUrl:
        "https://docs.google.com/spreadsheets/d/paid-file/copy",
      email: "client@example.com",
      sessionId: "cs_test_paid",
      systemName: "Plomberie & chauffage",
    });
    expect(mocks.setOrder).toHaveBeenCalledTimes(2);
  });

  it("rejects an invalid payment before resolving or sending anything", async () => {
    const result = await fulfillOperationalSystemOrder(
      buildSession({ amount_total: 4_899 }),
    );

    expect(result).toEqual({
      fulfilled: false,
      reason: "invalid_payment",
    });
    expect(mocks.getCopyUrl).not.toHaveBeenCalled();
    expect(mocks.sendDeliveryEmail).not.toHaveBeenCalled();
    expect(mocks.setOrder).not.toHaveBeenCalled();
  });

  it("rejects a paid session when the sold asset is missing", async () => {
    mocks.getCopyUrl.mockReturnValueOnce(null);

    const result = await fulfillOperationalSystemOrder(buildSession());

    expect(result).toEqual({
      fulfilled: false,
      reason: "missing_asset",
    });
    expect(mocks.sendDeliveryEmail).not.toHaveBeenCalled();
    expect(mocks.setOrder).not.toHaveBeenCalled();
  });

  it("rejects a paid session without a customer email", async () => {
    const result = await fulfillOperationalSystemOrder(
      buildSession({
        customer_details: null,
        customer_email: null,
      }),
    );

    expect(result).toEqual({
      fulfilled: false,
      reason: "missing_email",
    });
    expect(mocks.sendDeliveryEmail).not.toHaveBeenCalled();
    expect(mocks.setOrder).not.toHaveBeenCalled();
  });

  it("keeps the secure page delivery available when email sending fails", async () => {
    mocks.sendDeliveryEmail.mockResolvedValueOnce({
      sent: false,
      reason: "resend_error",
    });

    const result = await fulfillOperationalSystemOrder(buildSession());

    expect(result).toMatchObject({
      fulfilled: true,
      emailSent: false,
      copyUrl:
        "https://docs.google.com/spreadsheets/d/paid-file/copy",
    });
    expect(mocks.setOrder).toHaveBeenCalledTimes(1);
  });
});
