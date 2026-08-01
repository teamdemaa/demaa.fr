import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const firestore = vi.hoisted(() => {
  const collections = new Map<string, Map<string, Record<string, unknown>>>();
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
  const database = {
    collection(name: string) {
      if (!collections.has(name)) collections.set(name, new Map());
      return {
        doc(id: string) {
          return { collection: name, id };
        },
      };
    },
    async runTransaction<T>(operation: (transaction: {
      create: (reference: { collection: string; id: string }, data: Record<string, unknown>) => void;
      get: (reference: { collection: string; id: string }) => Promise<{ data: () => Record<string, unknown> | undefined; exists: boolean }>;
      update: (reference: { collection: string; id: string }, updates: Record<string, unknown>) => void;
    }) => Promise<T>) {
      return operation({
        create(reference, data) {
          collections.get(reference.collection)?.set(reference.id, structuredClone(data));
        },
        async get(reference) {
          const data = collections.get(reference.collection)?.get(reference.id);
          return { data: () => data, exists: Boolean(data) };
        },
        update(reference, updates) {
          const data = collections.get(reference.collection)?.get(reference.id);
          if (!data) throw new Error("missing document");
          for (const [path, value] of Object.entries(updates)) setNested(data, path, value);
        },
      });
    },
  };
  return { collections, database };
});

vi.mock("@/lib/firebase-admin", () => ({
  getAdminFirestore: () => firestore.database,
}));

import {
  createServiceRequest,
  createSolutionReferral,
  SERVICE_REQUEST_COLLECTION,
  SOLUTION_REFERRAL_COLLECTION,
  updateServiceRequestDeliveryState,
  updateSolutionReferralDeliveryState,
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

function serviceInput(version = "1.0.0") {
  return {
    attribution,
    company: "Atelier Martin",
    email: "maya@atelier-martin.fr",
    firstName: "Maya",
    idempotencyKey: "web:service:12345678",
    marketingConsent: null,
    need: "Créer un site clair.",
    service: {
      billing_party: "Demaa" as const,
      contracting_party: "Demaa" as const,
      offer_version: version,
      operator_type: "demaa" as const,
      pricing: { mode: "fixed" as const, amountMinor: 95000, currency: "EUR" as const, taxMode: "excluding_tax" as const },
      service_name: "Site vitrine & prise de contact",
      service_slug: "site-vitrine-prise-contact",
      transparency: "La prestation est contractée et facturée par Demaa.",
    },
    systemSlug: "batiment",
  };
}

function solutionInput() {
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
      commercial_relationship: "paid_referral" as const,
      contracting_party: "Partenaire Juridique",
      placement_id: "cabinet-comptable:partenaire-juridique:providers:1",
      placement_version: "1.0.0",
      resource_name: "Partenaire Juridique",
      resource_slug: "partenaire-juridique",
      resource_version: "1.0.0",
      section: "providers" as const,
      transparency: "Le partenaire reste contractant et facturant.",
    },
    systemSlug: "cabinet-comptable",
  };
}

describe("dedicated service and solution request storage", () => {
  beforeEach(() => firestore.collections.clear());

  it("stores the workflows in distinct collections", async () => {
    await createServiceRequest(serviceInput());
    await createSolutionReferral(solutionInput());

    expect(firestore.collections.get(SERVICE_REQUEST_COLLECTION)?.size).toBe(1);
    expect(firestore.collections.get(SOLUTION_REFERRAL_COLLECTION)?.size).toBe(1);
    expect(firestore.collections.has("lead_requests")).toBe(false);
  });

  it("returns the immutable first service snapshot on an idempotent replay", async () => {
    const first = await createServiceRequest(serviceInput("1.0.0"));
    const replay = await createServiceRequest(serviceInput("2.0.0"));

    expect(first.created).toBe(true);
    expect(replay.created).toBe(false);
    expect(replay.id).toBe(first.id);
    expect(replay.record.service.offer_version).toBe("1.0.0");
  });

  it("updates notification state only in the matching collection", async () => {
    const service = await createServiceRequest(serviceInput());
    const solution = await createSolutionReferral(solutionInput());

    await updateServiceRequestDeliveryState({
      channel: "internal_email",
      requestId: service.id,
      status: "sent",
    });
    await updateSolutionReferralDeliveryState({
      channel: "customer_email",
      requestId: solution.id,
      status: "failed",
      error: "temporary",
    });

    expect(service.record.request_type).toBe("service_request");
    expect(solution.record.request_type).toBe("solution_referral");
    const storedService = firestore.collections.get(SERVICE_REQUEST_COLLECTION)?.get(service.id);
    const storedSolution = firestore.collections.get(SOLUTION_REFERRAL_COLLECTION)?.get(solution.id);
    expect(storedService?.notification_status).toMatchObject({ internal_email: { status: "sent" } });
    expect(storedSolution?.notification_status).toMatchObject({ customer_email: { status: "failed" } });
  });
});
