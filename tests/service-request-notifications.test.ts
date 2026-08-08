import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({
  sendSlackMessage: vi.fn(),
  syncResendLeadContact: vi.fn(),
}));
vi.mock("@/lib/resend-audience", () => ({ syncResendLeadContact: mocks.syncResendLeadContact }));
vi.mock("@/lib/slack", () => ({ sendSlackMessage: mocks.sendSlackMessage }));

import {
  deliverServiceRequestChannel,
  deliverSolutionReferralChannel,
  RequestDeliveryProviderError,
} from "@/lib/service-request-notifications.server";
import type { StoredServiceRequest, StoredSolutionReferral } from "@/lib/service-request-storage.server";

const attribution = {
  consent: { analytics: false, marketing: false, status: "pending" as const },
  conversion: { browser: null, city: null, country: null, device_type: null, os: null, page: null, region: null, request_id: null, submitted_at: "2026-08-01T00:00:00.000Z", timezone: null },
  first_source: { campaign: null, confidence: "unknown" as const, medium: "unknown", source: "direct" },
  first_touch: null,
  last_source: { campaign: null, confidence: "unknown" as const, medium: "unknown", source: "direct" },
  last_touch: null,
  storage: "memory" as const,
  version: 1 as const,
};
const notification_status = {
  customer_email: { attempt_count: 0, next_attempt_at: "2026-08-01T00:00:00.000Z", status: "pending" as const },
  internal_email: { attempt_count: 0, next_attempt_at: "2026-08-01T00:00:00.000Z", status: "pending" as const },
  slack: { attempt_count: 0, next_attempt_at: "2026-08-01T00:00:00.000Z", status: "pending" as const },
  marketing_sync: { attempt_count: 0, next_attempt_at: null, status: "skipped" as const },
};

function serviceRecord(marketing = false): StoredServiceRequest {
  return {
    attribution,
    contact: { company: "Atelier Martin", email: "maya@atelier-martin.fr", first_name: "Maya" },
    created_at: "2026-08-01T00:00:00.000Z",
    delivery_due_at: "2026-08-01T00:00:00.000Z",
    idempotency_key_hash: "hash",
    marketing_consent: marketing ? { captured_at: "2026-08-01T00:00:00.000Z", granted: true, text: "Consentement", version: "service-requests-v1" } : null,
    need: "Créer un site clair.",
    notification_status,
    request_fingerprint: "fingerprint",
    request_type: "service_request",
    retention_expires_at: "2029-08-01T00:00:00.000Z",
    service: {
      billing_party: "Demaa", category_id: "structurer-digitaliser", category_title: "Structurer et digitaliser votre activité",
      content_hash: "a".repeat(64), contracting_party: "Demaa", description: "Créer un site clair.", offer_version: "1.0.0",
      operator_type: "demaa", pricing: { amountMinor: 95000, currency: "EUR", mode: "fixed", taxMode: "excluding_tax" },
      scope: { clientResponsibilities: [], deliverables: [], exclusions: [], prerequisites: [] }, service_name: "Site vitrine & prise de contact",
      service_slug: "site-vitrine-prise-contact", transparency: "La prestation est contractée et facturée par Demaa.",
    },
    system_slug: "batiment",
    updated_at: "2026-08-01T00:00:00.000Z",
  };
}

function solutionRecord(): StoredSolutionReferral {
  return {
    ...serviceRecord(),
    contact: { company: "Cabinet Martin", email: "maya@cabinet-martin.fr", first_name: "Maya" },
    need: "Déléguer une partie du juridique.",
    request_type: "solution_referral",
    solution: {
      billing_party: "Partenaire Juridique", commercial_relationship: "paid_referral", content_hash: "b".repeat(64),
      contracting_party: "Partenaire Juridique", disclosure_version: "1.0.0", effective_at: "2026-07-01T00:00:00.000Z",
      expires_at: "2027-07-01T00:00:00.000Z", fit_constraints: [], fit_rationale: "Renfort qualifié.",
      interaction: { interactionMode: "referral_form", referralKey: "legal-referral" },
      placement_id: "cabinet-comptable:partenaire-juridique:providers:1", placement_version: "1.0.0",
      resource_description: "Sous-traitance juridique.", resource_name: "Partenaire Juridique", resource_slug: "partenaire-juridique",
      resource_type: "provider", resource_version: "1.0.0", reviewed_at: "2026-06-25T00:00:00.000Z",
      reviewer: "legal@demaa.fr", section: "providers", transparency: "Le partenaire contracte et facture.", usage: "Délégation juridique",
    },
    system_slug: "cabinet-comptable",
  };
}

describe("request notification providers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "Demaa <test@demaa.fr>";
    process.env.LEAD_NOTIFICATION_EMAIL = "team@demaa.fr";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("uses stable provider idempotency keys for each separate channel", async () => {
    await deliverServiceRequestChannel({ channel: "customer_email", record: serviceRecord(), requestId: "service-1" });
    await deliverServiceRequestChannel({ channel: "internal_email", record: serviceRecord(), requestId: "service-1" });
    const keys = vi.mocked(fetch).mock.calls.map(([, init]) => new Headers(init?.headers).get("Idempotency-Key"));
    expect(keys).toEqual(["service-request-service-1-customer", "service-request-service-1-internal"]);
  });

  it("never syncs marketing without explicit consent", async () => {
    await deliverServiceRequestChannel({ channel: "marketing_sync", record: serviceRecord(), requestId: "service-1" });
    expect(mocks.syncResendLeadContact).not.toHaveBeenCalled();
    await deliverServiceRequestChannel({ channel: "marketing_sync", record: serviceRecord(true), requestId: "service-2" });
    expect(mocks.syncResendLeadContact).toHaveBeenCalledOnce();
  });

  it("keeps solution referral messaging separate", async () => {
    await deliverSolutionReferralChannel({ channel: "internal_email", record: solutionRecord(), requestId: "solution-1" });
    const body = String(vi.mocked(fetch).mock.calls[0]?.[1]?.body);
    expect(body).toContain("Contractant");
    expect(body).toContain("Facturant");
  });

  it("sends service and solution requests to Slack without partner claims", async () => {
    await deliverServiceRequestChannel({ channel: "slack", record: serviceRecord(), requestId: "service-1" });
    await deliverSolutionReferralChannel({ channel: "slack", record: solutionRecord(), requestId: "solution-1" });

    expect(mocks.sendSlackMessage).toHaveBeenNthCalledWith(1, expect.objectContaining({
      text: "[Services] Site vitrine & prise de contact",
    }));
    expect(mocks.sendSlackMessage).toHaveBeenNthCalledWith(2, expect.objectContaining({
      text: "[Solutions] Mise en relation - Partenaire Juridique",
    }));
    expect(JSON.stringify(mocks.sendSlackMessage.mock.calls)).not.toContain("partenaire Demaa");
  });

  it("drops provider response bodies and exposes only a stable code and status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      '{"message":"maya@atelier-martin.fr secret provider detail"}',
      { status: 422 },
    )));
    const error = await deliverServiceRequestChannel({
      channel: "customer_email", record: serviceRecord(), requestId: "service-fail",
    }).catch((caught) => caught);
    expect(error).toBeInstanceOf(RequestDeliveryProviderError);
    expect(error).toMatchObject({ code: "email_provider_rejected", providerStatus: 422 });
    expect(String(error)).not.toContain("maya@");
    expect(String(error)).not.toContain("provider detail");
  });
});
