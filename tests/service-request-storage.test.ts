import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const firestore = vi.hoisted(() => {
  const collections = new Map<string, Map<string, Record<string, unknown>>>();
  let queue = Promise.resolve();
  const setNested = (target: Record<string, unknown>, path: string, value: unknown) => {
    const parts = path.split(".");
    let cursor = target;
    for (const part of parts.slice(0, -1)) {
      const nested = cursor[part];
      if (!nested || typeof nested !== "object") cursor[part] = {};
      cursor = cursor[part] as Record<string, unknown>;
    }
    cursor[parts.at(-1) ?? ""] = value;
  };
  const snapshot = (data: Record<string, unknown> | undefined) => ({
    data: () => data ? structuredClone(data) : undefined,
    exists: Boolean(data),
  });
  const database = {
    collection(name: string) {
      if (!collections.has(name)) collections.set(name, new Map());
      const query = {
        maximum: Number.POSITIVE_INFINITY,
        where(field: string, operator: string, value: string) {
          if (field !== "delivery_due_at" || operator !== "<=") throw new Error("unsupported query");
          return {
            orderBy() {
              return {
                limit(maximum: number) {
                  return {
                    async get() {
                      const docs = [...(collections.get(name)?.entries() ?? [])]
                        .filter(([, data]) => typeof data[field] === "string" && String(data[field]) <= value)
                        .sort(([, a], [, b]) => String(a[field]).localeCompare(String(b[field])))
                        .slice(0, maximum)
                        .map(([id, data]) => ({ id, data: () => structuredClone(data) }));
                      return { docs };
                    },
                  };
                },
              };
            },
          };
        },
      };
      return { doc(id: string) { return { collection: name, id }; }, where: query.where };
    },
    runTransaction<T>(operation: (transaction: {
      create: (reference: { collection: string; id: string }, data: Record<string, unknown>) => void;
      get: (reference: { collection: string; id: string }) => Promise<ReturnType<typeof snapshot>>;
      update: (reference: { collection: string; id: string }, updates: Record<string, unknown>) => void;
    }) => Promise<T>) {
      const run = queue.then(() => operation({
        create(reference, data) {
          const collection = collections.get(reference.collection);
          if (collection?.has(reference.id)) throw new Error("already exists");
          collection?.set(reference.id, structuredClone(data));
        },
        async get(reference) {
          return snapshot(collections.get(reference.collection)?.get(reference.id));
        },
        update(reference, updates) {
          const data = collections.get(reference.collection)?.get(reference.id);
          if (!data) throw new Error("missing document");
          for (const [path, value] of Object.entries(updates)) setNested(data, path, value);
        },
      }));
      queue = run.then(() => undefined, () => undefined);
      return run;
    },
  };
  return { collections, database, reset: () => { collections.clear(); queue = Promise.resolve(); } };
});

vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));

import {
  claimServiceRequestDelivery,
  completeServiceRequestDelivery,
  createServiceRequest,
  createSolutionReferral,
  MAX_REQUEST_DELIVERY_ATTEMPTS,
  RequestIdempotencyConflictError,
  SERVICE_REQUEST_COLLECTION,
  SOLUTION_REFERRAL_COLLECTION,
  type ServiceRequestStorageInput,
  type SolutionReferralStorageInput,
} from "@/lib/service-request-storage.server";
import { retryDueServiceSolutionDeliveries } from "@/lib/service-request-delivery-worker.server";

const attribution = {
  consent: { analytics: false, marketing: false, status: "pending" as const },
  conversion: {
    browser: null, city: null, country: null, device_type: null, os: null, page: null,
    region: null, request_id: null, submitted_at: "2026-08-01T00:00:00.000Z", timezone: null,
  },
  first_source: { campaign: null, confidence: "unknown" as const, medium: "unknown", source: "direct" },
  first_touch: null,
  last_source: { campaign: null, confidence: "unknown" as const, medium: "unknown", source: "direct" },
  last_touch: null,
  storage: "memory" as const,
  version: 1 as const,
};

function serviceInput(): ServiceRequestStorageInput {
  return {
    attribution,
    company: "Atelier Martin",
    email: "maya@atelier-martin.fr",
    firstName: "Maya",
    idempotencyKey: "web:service:12345678",
    marketingConsent: null,
    need: "Créer un site clair.",
    service: {
      billing_party: "Demaa",
      category_id: "structurer-digitaliser",
      category_title: "Structurer et digitaliser votre activité",
      content_hash: "a".repeat(64),
      contracting_party: "Demaa",
      description: "Créer un site clair.",
      offer_version: "1.0.0",
      operator_type: "demaa",
      pricing: { amountMinor: 95000, currency: "EUR", mode: "fixed", taxMode: "excluding_tax" },
      scope: { clientResponsibilities: [], deliverables: [], exclusions: [], prerequisites: [] },
      service_name: "Site vitrine & prise de contact",
      service_slug: "site-vitrine-prise-contact",
      transparency: "La prestation est contractée et facturée par Demaa.",
    },
    systemSlug: "batiment",
  };
}

function solutionInput(): SolutionReferralStorageInput {
  return {
    attribution,
    company: "Cabinet Martin",
    email: "maya@cabinet-martin.fr",
    firstName: "Maya",
    idempotencyKey: "web:solution:12345678",
    marketingConsent: null,
    need: "Déléguer une partie du juridique.",
    solution: {
      billing_party: "Partenaire Juridique",
      commercial_relationship: "paid_referral",
      content_hash: "b".repeat(64),
      contracting_party: "Partenaire Juridique",
      disclosure_version: "1.0.0",
      effective_at: "2026-07-01T00:00:00.000Z",
      expires_at: "2027-07-01T00:00:00.000Z",
      fit_constraints: ["Île-de-France"],
      fit_rationale: "Renfort externe qualifié.",
      interaction: { interactionMode: "referral_form", referralKey: "legal-referral" },
      placement_id: "cabinet-comptable:partenaire-juridique:providers:1",
      placement_version: "1.0.0",
      resource_description: "Sous-traitance juridique.",
      resource_name: "Partenaire Juridique",
      resource_slug: "partenaire-juridique",
      resource_type: "provider",
      resource_version: "1.0.0",
      reviewed_at: "2026-06-25T00:00:00.000Z",
      reviewer: "legal@demaa.fr",
      section: "providers",
      transparency: "Le partenaire reste contractant et facturant.",
      usage: "Délégation juridique",
    },
    systemSlug: "cabinet-comptable",
  };
}

describe("dedicated request storage and leases", () => {
  beforeEach(() => firestore.reset());

  it("stores the workflows in distinct collections with a three-year retention", async () => {
    const service = await createServiceRequest(serviceInput());
    await createSolutionReferral(solutionInput());
    expect(firestore.collections.get(SERVICE_REQUEST_COLLECTION)?.size).toBe(1);
    expect(firestore.collections.get(SOLUTION_REFERRAL_COLLECTION)?.size).toBe(1);
    expect(firestore.collections.has("lead_requests")).toBe(false);
    const created = Date.parse(service.record.created_at);
    const expiry = Date.parse(service.record.retention_expires_at);
    expect(expiry).toBeGreaterThan(created + 3 * 365 * 24 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
  });

  it("replays the same fingerprint and rejects a changed payload for the same key", async () => {
    const first = await createServiceRequest(serviceInput());
    const replay = await createServiceRequest(serviceInput());
    expect(first.created).toBe(true);
    expect(replay.created).toBe(false);
    await expect(createServiceRequest({ ...serviceInput(), need: "Autre besoin." }))
      .rejects.toBeInstanceOf(RequestIdempotencyConflictError);
  });

  it("serializes concurrent creates into one record", async () => {
    const results = await Promise.all([
      createServiceRequest(serviceInput()),
      createServiceRequest(serviceInput()),
    ]);
    expect(results.filter((result) => result.created)).toHaveLength(1);
    expect(firestore.collections.get(SERVICE_REQUEST_COLLECTION)?.size).toBe(1);
  });

  it("leases one delivery channel, backs off failures and exhausts at the cap", async () => {
    const stored = await createServiceRequest(serviceInput());
    let now = new Date(stored.record.created_at);
    const customer = await claimServiceRequestDelivery({ now, requestId: stored.id, workerId: "worker-a" });
    expect(customer?.channel).toBe("customer_email");
    await completeServiceRequestDelivery({
      channel: "customer_email", now, requestId: stored.id, success: true, workerId: "worker-a",
    });
    const internal = await claimServiceRequestDelivery({ now, requestId: stored.id, workerId: "worker-a" });
    expect(internal?.channel).toBe("internal_email");
    const slack = await claimServiceRequestDelivery({ now, requestId: stored.id, workerId: "worker-b" });
    expect(slack?.channel).toBe("slack");
    await completeServiceRequestDelivery({
      channel: "slack", now, requestId: stored.id, success: true, workerId: "worker-b",
    });

    for (let attempt = 1; attempt <= MAX_REQUEST_DELIVERY_ATTEMPTS; attempt += 1) {
      await completeServiceRequestDelivery({
        channel: "internal_email", errorCode: "email_provider_rejected", now,
        requestId: stored.id, success: false, workerId: "worker-a",
      });
      const record = firestore.collections.get(SERVICE_REQUEST_COLLECTION)?.get(stored.id);
      const state = (record?.notification_status as Record<string, { next_attempt_at: string | null; status: string }>).internal_email;
      if (attempt === MAX_REQUEST_DELIVERY_ATTEMPTS) {
        expect(state.status).toBe("exhausted");
        break;
      }
      expect(state.status).toBe("failed");
      expect(await claimServiceRequestDelivery({ now, requestId: stored.id, workerId: "worker-a" })).toBeNull();
      now = new Date(state.next_attempt_at ?? "");
      const retry = await claimServiceRequestDelivery({ now, requestId: stored.id, workerId: "worker-a" });
      expect(retry?.channel).toBe("internal_email");
    }
  });

  it("runs the real worker without delivering the same channel twice", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "Demaa <test@demaa.fr>";
    process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.test/services/test";
    const stored = await createServiceRequest(serviceInput());
    const now = new Date(stored.record.created_at);
    const first = await retryDueServiceSolutionDeliveries(30, now);
    const second = await retryDueServiceSolutionDeliveries(30, now);
    expect(first).toEqual([
      { channel: "customer_email", requestType: "service_request", status: "sent" },
      { channel: "internal_email", requestType: "service_request", status: "sent" },
      { channel: "slack", requestType: "service_request", status: "sent" },
    ]);
    expect(second).toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(3);
    vi.unstubAllGlobals();
  });

  it("stores only a stable provider error code after a failed worker attempt", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(
      '{"message":"maya@atelier-martin.fr private provider payload"}',
      { status: 422 },
    )));
    process.env.RESEND_API_KEY = "test-key";
    process.env.RESEND_FROM_EMAIL = "Demaa <test@demaa.fr>";
    const stored = await createServiceRequest(serviceInput());
    const results = await retryDueServiceSolutionDeliveries(30, new Date(stored.record.created_at));
    expect(results).toEqual([
      { channel: "customer_email", requestType: "service_request", status: "failed" },
      { channel: "internal_email", requestType: "service_request", status: "failed" },
      { channel: "slack", requestType: "service_request", status: "failed" },
    ]);
    const record = firestore.collections.get(SERVICE_REQUEST_COLLECTION)?.get(stored.id);
    const state = (record?.notification_status as Record<string, { last_error_code: string }>).customer_email;
    expect(state.last_error_code).toBe("email_provider_rejected");
    expect(JSON.stringify(state)).not.toContain("maya@");
    expect(JSON.stringify(state)).not.toContain("provider payload");
    vi.unstubAllGlobals();
  });
});
