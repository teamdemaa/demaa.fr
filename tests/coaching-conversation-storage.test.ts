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
      id: path.split("/").at(-1) ?? "",
    };
  }

  function reference(path: string) {
    return {
      async get() { return snapshot(path); },
      path,
    };
  }

  const database = {
    collection(name: string) {
      return {
        doc(id: string) { return reference(`${name}/${id}`); },
        orderBy(field: string, direction: string) {
          if (direction !== "desc") throw new Error("unsupported direction");
          return {
            limit(maximum: number) {
              return {
                async get() {
                  const docs = [...documents.entries()]
                    .filter(([path]) => path.startsWith(`${name}/`))
                    .sort(([, left], [, right]) => String(right[field]).localeCompare(String(left[field])))
                    .slice(0, maximum)
                    .map(([path]) => snapshot(path));
                  return { docs };
                },
              };
            },
          };
        },
      };
    },
    async runTransaction<T>(operation: (transaction: {
      get(ref: ReturnType<typeof reference>): Promise<ReturnType<typeof snapshot>>;
      set(ref: ReturnType<typeof reference>, value: StoredDocument, options?: { merge?: boolean }): void;
    }) => Promise<T>) {
      const writes: Array<{ path: string; value: StoredDocument }> = [];
      const result = await operation({
        get: async (ref) => snapshot(ref.path),
        set: (ref, value, options) => writes.push({
          path: ref.path,
          value: options?.merge ? { ...documents.get(ref.path), ...value } : value,
        }),
      });
      for (const write of writes) documents.set(write.path, structuredClone(write.value));
      return result;
    },
  };

  return { database, documents };
});
vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));
vi.mock("@/lib/operational-maintenance", () => ({
  getLeadRetentionExpiry: () => "2029-08-11T00:00:00.000Z",
}));

import {
  appendCustomerCoachingMessage,
  appendSpecialistCoachingMessage,
  getCoachingConversationForAdmin,
  getCoachingConversationSummaries,
  getCustomerCoachingMessages,
  getCustomerCoachingState,
  requestCoachingRecommendation,
  reopenFreeCoachingClarification,
} from "@/lib/coaching-conversation.server";

describe("coaching conversation storage", () => {
  beforeEach(() => firestore.documents.clear());

  it("keeps one isolated conversation per Firebase UID", async () => {
    await appendCustomerCoachingMessage({
      body: "Comment mieux répartir les responsabilités ?",
      email: " Owner@Example.com ",
      idempotencyKey: "coaching:message:12345678",
      uid: "owner-uid",
    });
    await appendCustomerCoachingMessage({
      body: "Une autre conversation",
      email: "other@example.com",
      idempotencyKey: "coaching:message:other123",
      uid: "other-uid",
    });

    const messages = await getCustomerCoachingMessages("owner-uid");
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      author: "customer",
      body: "Comment mieux répartir les responsabilités ?",
    });
  });

  it("deduplicates retries and appends a specialist reply to the same history", async () => {
    const first = await appendCustomerCoachingMessage({
      body: "Je veux clarifier la prochaine étape.",
      email: "owner@example.com",
      idempotencyKey: "coaching:message:12345678",
      uid: "owner-uid",
    });
    const retry = await appendCustomerCoachingMessage({
      body: "Je veux clarifier la prochaine étape.",
      email: "owner@example.com",
      idempotencyKey: "coaching:message:12345678",
      uid: "owner-uid",
    });
    const summaries = await getCoachingConversationSummaries();
    const conversationId = summaries[0]?.id;
    expect(conversationId).toBeTruthy();

    const reply = await appendSpecialistCoachingMessage({
      body: "Commencez par lister les décisions qui remontent encore vers vous.",
      conversationId: conversationId ?? "",
    });
    const conversation = await getCoachingConversationForAdmin(conversationId ?? "");

    expect(first.created).toBe(true);
    expect(retry.created).toBe(false);
    expect(reply?.created).toBe(true);
    expect(conversation?.messages).toHaveLength(2);
    expect(conversation?.messages[1]).toMatchObject({ author: "specialist" });
  });

  it("opens the one-time free clarification and blocks further messages after an atomic final reply", async () => {
    const first = await appendCustomerCoachingMessage({
      body: "Je souhaite clarifier cette situation.",
      email: "owner@example.com",
      idempotencyKey: "coaching:message:first",
      uid: "owner-uid",
    });
    const conversationId = (await getCoachingConversationSummaries())[0]?.id ?? "";
    const finalReply = await appendSpecialistCoachingMessage({
      body: "Voici la réponse finale.",
      completeFreeClarification: true,
      conversationId,
    });
    const blocked = await appendCustomerCoachingMessage({
      body: "Je souhaite poursuivre.",
      email: "owner@example.com",
      idempotencyKey: "coaching:message:blocked",
      uid: "owner-uid",
    });
    const state = await getCustomerCoachingState("owner-uid");

    expect(first).toMatchObject({ allowed: true, access: { freeStatus: "open" } });
    expect(finalReply).toMatchObject({ freeStatus: "completed" });
    expect(blocked).toMatchObject({ allowed: false, access: { freeStatus: "completed" } });
    expect(state.messages).toHaveLength(2);
    expect(state.access.freeStatus).toBe("completed");
  });

  it("allows the Team Demaa to reopen a completed clarification manually", async () => {
    await appendCustomerCoachingMessage({
      body: "Première situation.",
      email: "owner@example.com",
      idempotencyKey: "coaching:message:first",
      uid: "owner-uid",
    });
    const conversationId = (await getCoachingConversationSummaries())[0]?.id ?? "";
    await appendSpecialistCoachingMessage({
      body: "Réponse finale.",
      completeFreeClarification: true,
      conversationId,
    });
    await reopenFreeCoachingClarification(conversationId);
    const reopened = await appendCustomerCoachingMessage({
      body: "Merci, voici la précision.",
      email: "owner@example.com",
      idempotencyKey: "coaching:message:reopened",
      uid: "owner-uid",
    });
    expect(reopened).toMatchObject({ allowed: true, access: { freeStatus: "open" } });

  });

  it("stores a private recommendation with the reply and refuses another UID", async () => {
    await appendCustomerCoachingMessage({
      body: "Je dois créer mon entreprise.",
      email: "owner@example.com",
      idempotencyKey: "coaching:message:recommendation",
      uid: "owner-uid",
    });
    const conversationId = (await getCoachingConversationSummaries())[0]?.id ?? "";
    const reply = await appendSpecialistCoachingMessage({
      body: "Voici la prochaine étape.",
      conversationId,
      recommendation: {
        needKey: "creation",
        resourceSlug: "formalites-entreprise",
      },
    });
    const state = await getCustomerCoachingState("owner-uid");
    expect(state.recommendations).toHaveLength(1);
    expect(state.recommendations[0]).toMatchObject({
      messageId: reply?.message.id,
      name: "Formalités d’entreprise",
      needLabel: "Création",
      status: "recommended",
    });

    const recommendationId = state.recommendations[0]?.id ?? "";
    await expect(requestCoachingRecommendation({
      recommendationId,
      uid: "other-uid",
    })).resolves.toBeNull();
    await expect(requestCoachingRecommendation({
      recommendationId,
      uid: "owner-uid",
    })).resolves.toMatchObject({
      available: true,
      created: true,
      recommendation: { status: "requested" },
    });
  });
});
