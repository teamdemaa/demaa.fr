import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

type StoredDocument = Record<string, unknown>;

const firestore = vi.hoisted(() => {
  const documents = new Map<string, StoredDocument>();

  function snapshot(path: string) {
    const data = documents.get(path);
    return {
      data: () => data ? structuredClone(data) : undefined,
      exists: Boolean(data),
    };
  }

  function reference(path: string) {
    return { path, async get() { return snapshot(path); } };
  }

  const database = {
    collection(name: string) {
      return { doc(id: string) { return reference(`${name}/${id}`); } };
    },
    async runTransaction<T>(operation: (transaction: {
      create(ref: ReturnType<typeof reference>, value: StoredDocument): void;
      get(ref: ReturnType<typeof reference>): Promise<ReturnType<typeof snapshot>>;
      set(ref: ReturnType<typeof reference>, value: StoredDocument, options?: { merge?: boolean }): void;
    }) => Promise<T>) {
      const writes: Array<{ path: string; value: StoredDocument }> = [];
      const transaction = {
        create(ref: ReturnType<typeof reference>, value: StoredDocument) {
          if (documents.has(ref.path)) throw new Error("already_exists");
          writes.push({ path: ref.path, value });
        },
        get: async (ref: ReturnType<typeof reference>) => snapshot(ref.path),
        set(ref: ReturnType<typeof reference>, value: StoredDocument, options?: { merge?: boolean }) {
          writes.push({
            path: ref.path,
            value: options?.merge ? { ...documents.get(ref.path), ...value } : value,
          });
        },
      };
      const result = await operation(transaction);
      for (const write of writes) documents.set(write.path, structuredClone(write.value));
      return result;
    },
  };

  return { database, documents };
});

vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));

import {
  getCoachBusinessSubscriptionForUid,
  projectCoachBusinessSubscription,
} from "@/lib/coach-business-subscription.server";
import {
  getMonthlyAccompanimentBenefitForUid,
  resolveMonthlyAccompanimentDiscount,
} from "@/lib/monthly-accompaniment-benefit.server";
import { getCanonicalServiceBySlug } from "@/lib/canonical-service-catalog";

function subscription(overrides: Partial<Stripe.Subscription> = {}) {
  return {
    cancel_at_period_end: false,
    customer: "cus_coach",
    id: "sub_coach",
    items: { data: [{ current_period_end: 1_800_000_000 }] },
    metadata: { firebaseUid: "owner-uid", offer: "coach_business" },
    status: "active",
    ...overrides,
  } as unknown as Stripe.Subscription;
}

describe("monthly accompaniment benefit", () => {
  beforeEach(() => firestore.documents.clear());

  it("projects a signed Stripe entitlement once and reads it by Firebase UID", async () => {
    const first = await projectCoachBusinessSubscription({
      eventId: "evt_coach_1",
      eventType: "customer.subscription.updated",
      subscription: subscription(),
    });
    const retry = await projectCoachBusinessSubscription({
      eventId: "evt_coach_1",
      eventType: "customer.subscription.updated",
      subscription: subscription(),
    });

    expect(first).toEqual({ duplicate: false, uid: "owner-uid" });
    expect(retry).toEqual({ duplicate: true, uid: "owner-uid" });
    await expect(getCoachBusinessSubscriptionForUid("owner-uid")).resolves.toMatchObject({
      active: true,
      customerId: "cus_coach",
      status: "active",
      subscriptionId: "sub_coach",
    });
  });

  it("applies 12% only to an eligible Demaa service for an active subscriber", async () => {
    firestore.documents.set("customer_subscriptions/owner-uid", {
      offer: "coach_business",
      status: "active",
    });
    const eligible = getCanonicalServiceBySlug("automatisation-processus");
    const partner = getCanonicalServiceBySlug("expert-comptable");
    const coach = getCanonicalServiceBySlug("coach-business");
    if (!eligible || !partner || !coach) throw new Error("test catalog is incomplete");

    await expect(resolveMonthlyAccompanimentDiscount({ service: eligible, uid: "owner-uid" }))
      .resolves.toEqual({ apply: true, eligible: true, percent: 12, source: "coach_business", validUntil: null });
    await expect(resolveMonthlyAccompanimentDiscount({ service: eligible, uid: null }))
      .resolves.toEqual({ apply: false, eligible: true, percent: 0, source: null, validUntil: null });
    await expect(resolveMonthlyAccompanimentDiscount({ service: partner, uid: "owner-uid" }))
      .resolves.toEqual({ apply: false, eligible: false, percent: 0, source: null, validUntil: null });
    await expect(resolveMonthlyAccompanimentDiscount({ service: coach, uid: "owner-uid" }))
      .resolves.toEqual({ apply: false, eligible: false, percent: 0, source: null, validUntil: null });
  });

  it("accepts a current manually confirmed expert-accountant relationship", async () => {
    firestore.documents.set("customer_accompaniment_benefits/owner-uid", {
      expert_accountant_active: true,
      expert_accountant_valid_until: "2099-01-01T00:00:00.000Z",
    });
    await expect(getMonthlyAccompanimentBenefitForUid("owner-uid")).resolves.toEqual({
      active: true,
      source: "expert_accountant",
      validUntil: "2099-01-01T00:00:00.000Z",
    });
  });

  it("fails closed for another offer or a non-active status", async () => {
    firestore.documents.set("customer_subscriptions/owner-uid", {
      offer: "coach_business",
      status: "past_due",
    });
    await expect(getCoachBusinessSubscriptionForUid("owner-uid"))
      .resolves.toMatchObject({ active: false, status: "past_due" });

    firestore.documents.set("customer_subscriptions/owner-uid", {
      offer: "other_offer",
      status: "active",
    });
    await expect(getCoachBusinessSubscriptionForUid("owner-uid"))
      .resolves.toMatchObject({ active: false, status: "none" });
  });
});
