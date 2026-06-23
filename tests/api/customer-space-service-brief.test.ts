import { beforeEach, describe, expect, it, vi } from "vitest";

const cookies = vi.fn();
const enforceRateLimit = vi.fn();
const getEmailFromCustomerSessionToken = vi.fn();
const getStripePaymentBySessionId = vi.fn();
const markStripePaymentSlackNotified = vi.fn();
const saveServiceBundleBrief = vi.fn();
const sendSlackMessage = vi.fn();

vi.mock("next/headers", () => ({
  cookies,
}));

vi.mock("@/lib/api-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-security")>("@/lib/api-security");

  return {
    ...actual,
    enforceRateLimit,
  };
});

vi.mock("@/lib/customer-space-auth", () => ({
  CUSTOMER_SPACE_COOKIE: "demaa_customer_session",
  getEmailFromCustomerSessionToken,
}));

vi.mock("@/lib/generations-db", () => ({
  getStripePaymentBySessionId,
  markStripePaymentSlackNotified,
  saveServiceBundleBrief,
}));

vi.mock("@/lib/slack", () => ({
  sendSlackMessage,
}));

describe("POST /api/customer-space/service-brief", () => {
  beforeEach(() => {
    vi.resetModules();
    enforceRateLimit.mockResolvedValue(null);
    cookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "session-token" }),
    });
    getEmailFromCustomerSessionToken.mockReset();
    getStripePaymentBySessionId.mockReset();
    markStripePaymentSlackNotified.mockResolvedValue(undefined);
    saveServiceBundleBrief.mockResolvedValue({
      brief: "Brief valide",
      serviceBriefSubmittedAt: "2026-06-23T10:00:00.000Z",
    });
    sendSlackMessage.mockResolvedValue(undefined);
  });

  it("rejects expired member sessions", async () => {
    getEmailFromCustomerSessionToken.mockResolvedValue(null);
    const { POST } = await import("@/app/api/customer-space/service-brief/route");

    const response = await POST(
      new Request("https://demaa.fr/api/customer-space/service-brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: "cs_test_123", brief: "Besoin de support" }),
      })
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Session expirée. Reconnectez-vous.",
    });
  });

  it("rejects orders that do not belong to the authenticated email", async () => {
    getEmailFromCustomerSessionToken.mockResolvedValue("client@demaa.fr");
    getStripePaymentBySessionId.mockResolvedValue({
      email: "other@demaa.fr",
      order_type: "service_bundle",
    });
    const { POST } = await import("@/app/api/customer-space/service-brief/route");

    const response = await POST(
      new Request("https://demaa.fr/api/customer-space/service-brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: "cs_test_123", brief: "Besoin de support" }),
      })
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Accès refusé à cette commande.",
    });
  });

  it("stores the brief and tolerates Slack notification failures", async () => {
    getEmailFromCustomerSessionToken.mockResolvedValue("client@demaa.fr");
    getStripePaymentBySessionId.mockResolvedValue({
      email: "client@demaa.fr",
      order_type: "service_bundle",
      cart_summary: "Pack service",
      customer_name: "Client Demaa",
      service_names: ["Service A"],
    });
    sendSlackMessage.mockRejectedValue(new Error("slack down"));
    const { POST } = await import("@/app/api/customer-space/service-brief/route");

    const response = await POST(
      new Request("https://demaa.fr/api/customer-space/service-brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: "cs_test_123", brief: "Brief valide" }),
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      saved: true,
      brief: "Brief valide",
      serviceBriefSubmittedAt: "2026-06-23T10:00:00.000Z",
      slackNotifiedAt: null,
    });
    expect(saveServiceBundleBrief).toHaveBeenCalledWith({
      stripeSessionId: "cs_test_123",
      brief: "Brief valide",
    });
  });
});
