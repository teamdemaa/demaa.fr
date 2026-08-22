import { beforeEach, describe, expect, it, vi } from "vitest";
import { createManualActionPlan } from "@/lib/action-plan-manual";
import { createManualActionPlanWorkspaceState } from "@/lib/action-plan-manual";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({ sendTransactionalEmail: vi.fn() }));

const firestore = vi.hoisted(() => {
  const documents = new Map<string, Record<string, unknown>>();
  function ref(path: string) { return { id: path.split("/").at(-1) || "", path }; }
  function snapshot(path: string) {
    const data = documents.get(path);
    return { exists: Boolean(data), data: () => data };
  }
  const database = {
    collection(name: string) { return { doc(id: string) { return ref(`${name}/${id}`); } }; },
    async runTransaction<T>(operation: (transaction: {
      create(reference: ReturnType<typeof ref>, value: Record<string, unknown>): void;
      get(reference: ReturnType<typeof ref>): Promise<ReturnType<typeof snapshot>>;
      update(reference: ReturnType<typeof ref>, value: Record<string, unknown>): void;
    }) => Promise<T>) {
      const writes: Array<{ reference: ReturnType<typeof ref>; value: Record<string, unknown>; create: boolean }> = [];
      const result = await operation({
        create: (reference, value) => writes.push({ reference, value, create: true }),
        get: async (reference) => snapshot(reference.path),
        update: (reference, value) => writes.push({ reference, value, create: false }),
      });
      for (const write of writes) {
        if (write.create && documents.has(write.reference.path)) throw new Error("already exists");
        documents.set(write.reference.path, structuredClone({
          ...(documents.get(write.reference.path) ?? {}),
          ...write.value,
        }));
      }
      return result;
    },
  };
  return { database, documents };
});

vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));
vi.mock("@/lib/transactional-email.server", () => ({
  sendTransactionalEmail: mocks.sendTransactionalEmail,
  TransactionalEmailProviderError: class extends Error { code = "email_failed"; },
}));

import {
  deliverGuestPlanEmail,
  GuestPlanEmailIdempotencyConflictError,
  prepareGuestPlanEmailDelivery,
} from "@/lib/guest-plan-email-delivery.server";

const plan = {
  id: `gpl_${"a".repeat(40)}`,
  title: "Clarifier les priorités",
  plan: createManualActionPlan(),
  workspaceState: createManualActionPlanWorkspaceState(),
  sourceText: "Je dois clarifier mes priorités cette semaine.",
  generation: {
    model: null,
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
    durationMs: null,
    requestCount: null,
    repairCount: null,
  },
  revision: 1,
  contentLocaleCode: "fr" as const,
  marketCodeAtCreation: "fr-fr" as const,
  createdAt: "2026-08-22T10:00:00.000Z",
  updatedAt: "2026-08-22T10:00:00.000Z",
  expiresAt: "2026-08-23T10:00:00.000Z",
};

describe("guest plan email delivery", () => {
  beforeEach(() => {
    firestore.documents.clear();
    vi.clearAllMocks();
    mocks.sendTransactionalEmail.mockResolvedValue(undefined);
  });

  it("stores an idempotent delivery and sends the plan without marketing sync", async () => {
    const prepared = await prepareGuestPlanEmailDelivery({
      email: "owner@example.com",
      generationId: plan.id,
      idempotencyKey: "email-request-123456",
      now: new Date("2026-08-22T10:00:00.000Z"),
    });
    expect(prepared.created).toBe(true);
    await expect(deliverGuestPlanEmail({ deliveryId: prepared.id, plan })).resolves.toEqual({ status: "sent" });
    expect(mocks.sendTransactionalEmail).toHaveBeenCalledWith(expect.objectContaining({
      subject: "Votre plan d’action Demaa - Clarifier les priorités",
      to: "owner@example.com",
    }));
    expect(firestore.documents.get(`guest_plan_email_deliveries/${prepared.id}`)).toMatchObject({
      status: "sent",
      attempt_count: 1,
    });

    const duplicate = await prepareGuestPlanEmailDelivery({
      email: "owner@example.com",
      generationId: plan.id,
      idempotencyKey: "email-request-123456",
    });
    expect(duplicate.created).toBe(false);
    await deliverGuestPlanEmail({ deliveryId: duplicate.id, plan });
    expect(mocks.sendTransactionalEmail).toHaveBeenCalledTimes(1);
  });

  it("rejects an idempotency key reused for another recipient", async () => {
    await prepareGuestPlanEmailDelivery({
      email: "owner@example.com",
      generationId: plan.id,
      idempotencyKey: "email-request-123456",
    });
    await expect(prepareGuestPlanEmailDelivery({
      email: "other@example.com",
      generationId: plan.id,
      idempotencyKey: "email-request-123456",
    })).rejects.toBeInstanceOf(GuestPlanEmailIdempotencyConflictError);
  });

  it("keeps a failed delivery retryable with a stable provider key", async () => {
    mocks.sendTransactionalEmail.mockRejectedValueOnce(new Error("private provider error"));
    const prepared = await prepareGuestPlanEmailDelivery({
      email: "owner@example.com",
      generationId: plan.id,
      idempotencyKey: "email-request-123456",
    });
    await expect(deliverGuestPlanEmail({ deliveryId: prepared.id, plan })).resolves.toEqual({ status: "failed" });
    mocks.sendTransactionalEmail.mockResolvedValue(undefined);
    await expect(deliverGuestPlanEmail({ deliveryId: prepared.id, plan })).resolves.toEqual({ status: "sent" });
    expect(mocks.sendTransactionalEmail.mock.calls[0]?.[0].idempotencyKey)
      .toBe(mocks.sendTransactionalEmail.mock.calls[1]?.[0].idempotencyKey);
  });
});
