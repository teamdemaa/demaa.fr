import { beforeEach, describe, expect, it, vi } from "vitest";

const enforceRateLimit = vi.fn();
const upsertConfirmedStripePayment = vi.fn();
const retrieveStripeCheckoutSession = vi.fn();
const createCustomerSession = vi.fn();
const getCustomerCookieOptions = vi.fn();

vi.mock("@/lib/api-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-security")>("@/lib/api-security");

  return {
    ...actual,
    enforceRateLimit,
  };
});

vi.mock("@/lib/generations-db", () => ({
  upsertConfirmedStripePayment,
}));

vi.mock("@/lib/customer-space-auth", () => ({
  CUSTOMER_SPACE_COOKIE: "demaa_customer_session",
  createCustomerSession,
  getCustomerCookieOptions,
}));

vi.mock("@/lib/stripe-server", async () => {
  const actual = await vi.importActual<typeof import("@/lib/stripe-server")>("@/lib/stripe-server");

  return {
    ...actual,
    retrieveStripeCheckoutSession,
  };
});

describe("GET /api/customer-space/stripe-entry", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
    upsertConfirmedStripePayment.mockResolvedValue(undefined);
    retrieveStripeCheckoutSession.mockReset();
    createCustomerSession.mockReset();
    getCustomerCookieOptions.mockReset();
    createCustomerSession.mockResolvedValue("session-token");
    getCustomerCookieOptions.mockReturnValue({
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false,
    });
  });

  it("redirects to access error when the Stripe session id is invalid", async () => {
    const { GET } = await import("@/app/api/customer-space/stripe-entry/route");

    const response = await GET(
      new Request("https://demaa.fr/api/customer-space/stripe-entry?session_id=bad-session")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://demaa.fr/mon-espace?error=acces");
  });

  it("redirects to access error when Stripe lookup does not confirm a paid email session", async () => {
    retrieveStripeCheckoutSession.mockResolvedValue({
      session: {
        id: "cs_test_123",
        status: "open",
        payment_status: "unpaid",
        customer_details: {
          email: "client@demaa.fr",
        },
      },
    });
    const { GET } = await import("@/app/api/customer-space/stripe-entry/route");

    const response = await GET(
      new Request("https://demaa.fr/api/customer-space/stripe-entry?session_id=cs_test_123")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://demaa.fr/mon-espace?error=acces");
  });

  it("stores the paid session and sets the member cookie when Stripe confirms access", async () => {
    retrieveStripeCheckoutSession.mockResolvedValue({
      session: {
        id: "cs_test_123",
        status: "complete",
        payment_status: "paid",
        amount_total: 25000,
        currency: "eur",
        livemode: false,
        customer_details: {
          email: "client@demaa.fr",
        },
        metadata: {
          offer_label: "Commande Demaa",
          order_type: "service_bundle",
          cart_summary: "Pack service",
          service_names: "Service A|Service B",
          service_slugs: "service-a,service-b",
          item_count: "2",
        },
      },
    });
    const { GET } = await import("@/app/api/customer-space/stripe-entry/route");

    const response = await GET(
      new Request("https://demaa.fr/api/customer-space/stripe-entry?session_id=cs_test_123")
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://demaa.fr/mon-espace?paid=1");
    expect(upsertConfirmedStripePayment).toHaveBeenCalledWith(
      expect.objectContaining({
        stripeSessionId: "cs_test_123",
        email: "client@demaa.fr",
        serviceNames: ["Service A", "Service B"],
        serviceSlugs: ["service-a", "service-b"],
      })
    );
    expect(response.headers.get("set-cookie")).toContain("demaa_customer_session=session-token");
  });
});
