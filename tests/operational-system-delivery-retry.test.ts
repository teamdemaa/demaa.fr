import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  claimLeadDeliveryRetry: vi.fn(),
  getFailedLeadRequests: vi.fn(),
  markLeadDeliveryAbandoned: vi.fn(),
  sendDeliveryEmail: vi.fn(),
  updateLeadDeliveryStatus: vi.fn(),
}));

vi.mock("@/lib/api-security", () => ({
  escapeSlackMrkdwn: (value: string) => value,
}));

vi.mock("@/lib/lead-attribution-server", () => ({
  buildAttributionDisplayFields: () => [],
}));

vi.mock("@/lib/lead-storage", () => ({
  claimLeadDeliveryRetry: mocks.claimLeadDeliveryRetry,
  createLeadRequest: vi.fn(),
  getFailedLeadRequests: mocks.getFailedLeadRequests,
  markLeadDeliveryAbandoned: mocks.markLeadDeliveryAbandoned,
  updateLeadDeliveryStatus: mocks.updateLeadDeliveryStatus,
}));

vi.mock("@/lib/operational-log", () => ({
  logOperationalError: vi.fn(),
  logOperationalEvent: vi.fn(),
}));

vi.mock("@/lib/operational-system-delivery-email.server", () => ({
  sendOperationalSystemDeliveryEmail: mocks.sendDeliveryEmail,
}));

vi.mock("@/lib/resend-audience", () => ({
  syncResendLeadContact: vi.fn(),
}));

vi.mock("@/lib/slack", () => ({
  sendSlackMessage: vi.fn(),
}));

import { retryFailedLeadDeliveries } from "@/lib/lead-notifications";

function buildFailedLead() {
  return {
    id: "lead-123",
    data: {
      attribution: {
        consent: { analytics: false, marketing: false, status: "pending" },
        conversion: { request_id: "request-123" },
        first_touch: null,
        last_touch: null,
      },
      contact: {
        company: null,
        email: "maya@example.com",
        first_name: "Maya",
        last_name: null,
        name: null,
        phone: null,
      },
      context: {
        sector_label: "BTP",
        sector_slug: "btp",
        source: "Livraison du système opérationnel gratuit",
        source_url: "/kit-operationnel/plomberie-chauffage",
        system_name: "Plomberie & chauffage",
        system_slug: "plomberie-chauffage",
      },
      created_at: "2026-07-27T07:00:00.000Z",
      fields: [],
      notification_status: {
        email: { status: "skipped" },
        kit_email: {
          attempt_count: 1,
          next_retry_at: "2026-07-27T07:01:00.000Z",
          status: "failed",
        },
        resend: { status: "skipped" },
        slack: { status: "skipped" },
      },
      request_type: "system_kit_request",
      title: "Livraison",
    },
  };
}

describe("operational system delivery retry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getFailedLeadRequests.mockResolvedValue([buildFailedLead()]);
    mocks.claimLeadDeliveryRetry.mockResolvedValue(true);
    mocks.sendDeliveryEmail.mockResolvedValue({ sent: true, reason: null });
    mocks.updateLeadDeliveryStatus.mockResolvedValue(undefined);
  });

  it("retries a failed transactional delivery with the same delivery id", async () => {
    const result = await retryFailedLeadDeliveries(10);

    expect(result).toEqual([{ channel: "kit_email", status: "sent" }]);
    expect(mocks.sendDeliveryEmail).toHaveBeenCalledWith({
      deliveryId: "lead-lead-123-system",
      email: "maya@example.com",
      firstName: "Maya",
      systemName: "Plomberie & chauffage",
      systemSlug: "plomberie-chauffage",
    });
    expect(mocks.updateLeadDeliveryStatus).toHaveBeenCalledWith({
      channel: "kit_email",
      leadId: "lead-123",
      status: "sent",
    });
  });

  it("keeps a failed retry scheduled through the shared retry state", async () => {
    mocks.sendDeliveryEmail.mockResolvedValueOnce({
      sent: false,
      reason: "resend_error",
    });

    const result = await retryFailedLeadDeliveries(10);

    expect(result).toEqual([{ channel: "kit_email", status: "failed" }]);
    expect(mocks.updateLeadDeliveryStatus).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "kit_email",
        error: "resend_error",
        leadId: "lead-123",
        status: "failed",
      }),
    );
  });
});
