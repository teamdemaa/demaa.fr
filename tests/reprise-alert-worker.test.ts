import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  claim: vi.fn(),
  claimCreation: vi.fn(),
  complete: vi.fn(),
  list: vi.fn(),
  logError: vi.fn(),
  logEvent: vi.fn(),
  send: vi.fn(),
  sendConfirmation: vi.fn(),
  sendInternal: vi.fn(),
}));

vi.mock("@/lib/reprise-alert-storage.server", () => ({
  claimRepriseAlertDelivery: mocks.claim,
  claimRepriseAlertCreationDelivery: mocks.claimCreation,
  completeRepriseAlertDelivery: mocks.complete,
  getRepriseAlertAccessToken: () => "secure-token",
  listActiveRepriseAlerts: mocks.list,
}));
vi.mock("@/lib/reprise-alert-emails.server", () => ({
  sendInternalRepriseAlertCreated: mocks.sendInternal,
  sendRepriseAlertConfirmation: mocks.sendConfirmation,
  sendRepriseOpportunityMatch: mocks.send,
}));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: mocks.logError, logOperationalEvent: mocks.logEvent }));

import {
  deliverNewRepriseAlertMatches,
  deliverRepriseAlertCreationNotifications,
} from "@/lib/reprise-alert-delivery-worker.server";

describe("reprise alert delivery worker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.list.mockResolvedValue([{
      createdAt: "2026-09-11T10:00:00.000Z",
      criteria: { budgetMax: 200_000, categories: ["Services terrain"], includeMissing: false, query: "rénovation sols", regions: ["Provence-Alpes-Côte d’Azur"], revenueMin: 1_000_000 },
      email: "alex@example.com",
      id: "alert-1",
    }]);
    mocks.claim.mockResolvedValue({ deliveryId: "delivery-1" });
    mocks.claimCreation.mockResolvedValue(null);
    mocks.complete.mockResolvedValue(undefined);
    mocks.send.mockResolvedValue(undefined);
    mocks.sendConfirmation.mockResolvedValue(undefined);
    mocks.sendInternal.mockResolvedValue(undefined);
  });

  it("sends a new match once and completes the delivery", async () => {
    const results = await deliverNewRepriseAlertMatches();
    expect(results).toEqual([{ alertId: "alert-1", opportunityId: "sols-murs-alpes-maritimes", status: "sent" }]);
    expect(mocks.send).toHaveBeenCalledWith(expect.objectContaining({
      accessToken: "secure-token",
      email: "alex@example.com",
      opportunity: expect.objectContaining({ id: "sols-murs-alpes-maritimes" }),
    }));
    expect(mocks.complete).toHaveBeenCalledWith({ deliveryId: "delivery-1", success: true });
  });

  it("does not send the same match when the delivery cannot be claimed", async () => {
    mocks.claim.mockResolvedValue(null);
    expect(await deliverNewRepriseAlertMatches()).toEqual([]);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("persists both creation emails and retries a failed channel", async () => {
    mocks.claimCreation
      .mockResolvedValueOnce({ deliveryId: "confirmation-delivery" })
      .mockResolvedValueOnce({ deliveryId: "internal-delivery" });
    mocks.sendConfirmation.mockRejectedValueOnce(new Error("email_network_failed"));

    const first = await deliverRepriseAlertCreationNotifications({
      accessToken: "secure-token",
      alertId: "alert-1",
      baseUrl: "https://demaa.fr",
      criteria: { budgetMax: null, categories: [], includeMissing: true, query: "", regions: [], revenueMin: null },
      email: "alex@example.com",
    });

    expect(first).toEqual([
      { alertId: "alert-1", channel: "subscriber_confirmation", status: "failed" },
      { alertId: "alert-1", channel: "internal_notification", status: "sent" },
    ]);
    expect(mocks.complete).toHaveBeenCalledWith({
      deliveryId: "confirmation-delivery",
      error: "email_network_failed",
      success: false,
    });

    mocks.claimCreation
      .mockReset()
      .mockResolvedValueOnce({ deliveryId: "confirmation-delivery" })
      .mockResolvedValueOnce(null);
    mocks.sendConfirmation.mockResolvedValueOnce(undefined);

    expect(await deliverRepriseAlertCreationNotifications({
      accessToken: "secure-token",
      alertId: "alert-1",
      baseUrl: "https://demaa.fr",
      criteria: { budgetMax: null, categories: [], includeMissing: true, query: "", regions: [], revenueMin: null },
      email: "alex@example.com",
    })).toEqual([
      { alertId: "alert-1", channel: "subscriber_confirmation", status: "sent" },
    ]);
  });
});
