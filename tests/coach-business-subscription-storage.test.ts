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
    return {
      path,
      async get() { return snapshot(path); },
      async set(value: StoredDocument, options?: { merge?: boolean }) {
        documents.set(
          path,
          structuredClone(options?.merge ? { ...documents.get(path), ...value } : value),
        );
      },
    };
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

describe("coach business subscription storage", () => {
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
