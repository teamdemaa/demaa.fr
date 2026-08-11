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
      set(ref: ReturnType<typeof reference>, value: StoredDocument): void;
    }) => Promise<T>) {
      const writes: Array<{ path: string; value: StoredDocument }> = [];
      const result = await operation({
        get: async (ref) => snapshot(ref.path),
        set: (ref, value) => writes.push({ path: ref.path, value }),
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
} from "@/lib/coaching-conversation.server";

describe("coaching conversation storage", () => {
  beforeEach(() => firestore.documents.clear());

  it("keeps one isolated conversation per normalized customer email", async () => {
    await appendCustomerCoachingMessage({
      body: "Comment mieux répartir les responsabilités ?",
      email: " Owner@Example.com ",
      idempotencyKey: "coaching:message:12345678",
    });
    await appendCustomerCoachingMessage({
      body: "Une autre conversation",
      email: "other@example.com",
      idempotencyKey: "coaching:message:other123",
    });

    const messages = await getCustomerCoachingMessages("owner@example.com");
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
    });
    const retry = await appendCustomerCoachingMessage({
      body: "Je veux clarifier la prochaine étape.",
      email: "owner@example.com",
      idempotencyKey: "coaching:message:12345678",
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
});
