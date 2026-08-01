import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  logOperationalError: vi.fn(),
  logOperationalEvent: vi.fn(),
  syncResendLeadContact: vi.fn(),
  updateService: vi.fn(),
  updateSolution: vi.fn(),
}));

vi.mock("@/lib/operational-log", () => ({
  logOperationalError: mocks.logOperationalError,
  logOperationalEvent: mocks.logOperationalEvent,
}));
vi.mock("@/lib/resend-audience", () => ({
  syncResendLeadContact: mocks.syncResendLeadContact,
}));
vi.mock("@/lib/service-request-storage.server", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/lib/service-request-storage.server")>();
  return {
    ...original,
    updateServiceRequestDeliveryState: mocks.updateService,
    updateSolutionReferralDeliveryState: mocks.updateSolution,
  };
});

import {
  deliverServiceRequestNotifications,
  deliverSolutionReferralNotifications,
} from "@/lib/service-request-notifications.server";
import type {
  StoredServiceRequest,
  StoredSolutionReferral,
} from "@/lib/service-request-storage.server";

const attribution = {
  consent: { analytics: false, marketing: false, status: "pending" as const },
  conversion: {
    browser: null, city: null, country: null, device_type: null, os: null,
    page: null, region: null, request_id: null, submitted_at: "2026-08-01T00:00:00.000Z", timezone: null,
  },
  first_source: { campaign: null, confidence: "unknown" as const, medium: "unknown", source: "direct" },
  first_touch: null,
  last_source: { campaign: null, confidence: "unknown" as const, medium: "unknown", source: "direct" },
  last_touch: null,
  storage: "memory" as const,
  version: 1 as const,
};

function states(overrides: Partial<StoredServiceRequest["notification_status"]> = {}) {
  return {
    customer_email: { attempt_count: 0, status: "pending" as const },
    internal_email: { attempt_count: 0, status: "pending" as const },
    marketing_sync: { attempt_count: 0, status: "skipped" as const },
    ...overrides,
  };
}

function serviceRecord(overrides: Partial<StoredServiceRequest> = {}): StoredServiceRequest {
  return {
    attribution,
    contact: { company: "Atelier Martin", email: "maya@atelier-martin.fr", first_name: "Maya" },
    created_at: "2026-08-01T00:00:00.000Z",
    idempotency_key_hash: "hash",
    marketing_consent: null,
    need: "Créer un site clair.",
    notification_status: states(),
    request_type: "service_request",
    retention_expires_at: "2029-08-01T00:00:00.000Z",
    service: {
      billing_party: "Demaa",
      contracting_party: "Demaa",
      offer_version: "1.0.0",
      operator_type: "demaa",
      pricing: { mode: "fixed", amountMinor: 95000, currency: "EUR", taxMode: "excluding_tax" },
      service_name: "Site vitrine & prise de contact",
      service_slug: "site-vitrine-prise-contact",
      transparency: "La prestation est contractée et facturée par Demaa.",
    },
    system_slug: "batiment",
    updated_at: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

function solutionRecord(): StoredSolutionReferral {
  return {
    attribution,
    contact: { company: "Cabinet Martin", email: "maya@cabinet-martin.fr", first_name: "Maya" },
    created_at: "2026-08-01T00:00:00.000Z",
    idempotency_key_hash: "hash",
    marketing_consent: null,
    need: "Déléguer une partie du juridique.",
    notification_status: states(),
    request_type: "solution_referral",
    retention_expires_at: "2029-08-01T00:00:00.000Z",
    solution: {
      billing_party: "Partenaire Juridique",
      commercial_relationship: "paid_referral",
      contracting_party: "Partenaire Juridique",
      placement_id: "cabinet-comptable:partenaire-juridique:providers:1",
      placement_version: "1.0.0",
      resource_name: "Partenaire Juridique",
      resource_slug: "partenaire-juridique",
      resource_version: "1.0.0",
      section: "providers",
      transparency: "Partenaire Juridique reste le contractant et le facturant. Demaa peut être rémunérée.",
    },
    system_slug: "cabinet-comptable",
    updated_at: "2026-08-01T00:00:00.000Z",
  };
}

describe("dedicated request notifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "Demaa <test@demaa.fr>";
    process.env.LEAD_NOTIFICATION_EMAIL = "team@demaa.fr";
    mocks.syncResendLeadContact.mockResolvedValue({ email: "maya@atelier-martin.fr" });
    mocks.updateService.mockResolvedValue(undefined);
    mocks.updateSolution.mockResolvedValue(undefined);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
  });

  afterEach(() => vi.unstubAllGlobals());

  it("sends transactional and internal emails without marketing by default", async () => {
    await deliverServiceRequestNotifications({ record: serviceRecord(), requestId: "service-1" });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(mocks.syncResendLeadContact).not.toHaveBeenCalled();
    expect(mocks.updateService).toHaveBeenCalledTimes(2);
  });

  it("syncs the audience only for explicit, versioned consent", async () => {
    const record = serviceRecord({
      marketing_consent: {
        captured_at: "2026-08-01T00:00:00.000Z",
        granted: true,
        text: "Consentement",
        version: "service-requests-v1",
      },
      notification_status: states({
        marketing_sync: { attempt_count: 0, status: "pending" },
      }),
    });

    await deliverServiceRequestNotifications({ record, requestId: "service-2" });

    expect(mocks.syncResendLeadContact).toHaveBeenCalledOnce();
    expect(mocks.updateService).toHaveBeenCalledWith({
      channel: "marketing_sync",
      requestId: "service-2",
      status: "sent",
    });
  });

  it("retries only failed channels and keeps a stable provider idempotency key", async () => {
    const record = serviceRecord({
      notification_status: states({
        customer_email: { attempt_count: 1, status: "failed" },
        internal_email: { attempt_count: 1, status: "sent" },
      }),
    });

    await deliverServiceRequestNotifications({ record, requestId: "service-retry" });

    expect(fetch).toHaveBeenCalledOnce();
    const init = vi.mocked(fetch).mock.calls[0]?.[1];
    expect(new Headers(init?.headers).get("Idempotency-Key"))
      .toBe("service-request-service-retry-customer");
    expect(mocks.updateService).toHaveBeenCalledTimes(1);
  });

  it("keeps solution referral messaging and update workflow separate", async () => {
    await deliverSolutionReferralNotifications({
      record: solutionRecord(),
      requestId: "solution-1",
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(mocks.updateSolution).toHaveBeenCalledTimes(2);
    expect(mocks.updateService).not.toHaveBeenCalled();
    const bodies = vi.mocked(fetch).mock.calls.map(([, init]) => String(init?.body));
    expect(bodies.join("\n")).toContain("contractant");
    expect(bodies.join("\n")).toContain("facturant");
  });
});
