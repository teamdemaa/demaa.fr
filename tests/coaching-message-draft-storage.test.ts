import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
      async create(value: StoredDocument) {
        if (documents.has(path)) throw new Error("already-exists");
        documents.set(path, structuredClone(value));
      },
      path,
    };
  }

  const database = {
    collection(name: string) {
      return {
        doc(id: string) { return reference(`${name}/${id}`); },
      };
    },
    async runTransaction<T>(operation: (transaction: {
      get(ref: ReturnType<typeof reference>): Promise<ReturnType<typeof snapshot>>;
      set(
        ref: ReturnType<typeof reference>,
        value: StoredDocument,
        options?: { merge?: boolean },
      ): void;
    }) => Promise<T>) {
      const writes: Array<{
        options?: { merge?: boolean };
        path: string;
        value: StoredDocument;
      }> = [];
      const result = await operation({
        get: async (ref) => snapshot(ref.path),
        set: (ref, value, options) => {
          writes.push({ options, path: ref.path, value });
        },
      });
      for (const write of writes) {
        const previous = write.options?.merge
          ? documents.get(write.path) ?? {}
          : {};
        documents.set(
          write.path,
          structuredClone({ ...previous, ...write.value }),
        );
      }
      return result;
    },
  };

  return { database, documents };
});
vi.mock("@/lib/firebase-admin", () => ({
  getAdminFirestore: () => firestore.database,
}));

import {
  claimPendingCoachingMessageDraft,
  createPendingCoachingMessageDraft,
  markCoachingMessageDraftSent,
} from "@/lib/coaching-message-draft.server";
import { isCoachingMessageDraftToken } from "@/lib/coaching-message-draft";

describe("coaching message draft storage", () => {
  beforeEach(() => {
    firestore.documents.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-13T10:00:00.000Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("stores only the token hash and expires the draft after 60 minutes", async () => {
    const created = await createPendingCoachingMessageDraft({
      body: "  Je souhaite clarifier ma prochaine décision.  ",
    });
    const tokenHash = createHash("sha256")
      .update(created.draftToken)
      .digest("hex");
    const stored = firestore.documents.get(
      `coaching_message_drafts/${tokenHash}`,
    );

    expect(isCoachingMessageDraftToken(created.draftToken)).toBe(true);
    expect(created.expiresAt).toBe("2026-08-13T11:00:00.000Z");
    expect(stored).toMatchObject({
      body: "Je souhaite clarifier ma prochaine décision.",
      claimed_email: null,
      delivery_idempotency_key: `coaching:draft:${tokenHash}`,
      expires_at: created.expiresAt,
      sent_at: null,
    });
    expect(JSON.stringify(stored)).not.toContain(created.draftToken);
  });

  it("lets only the first normalized email claim and retry the same draft", async () => {
    const created = await createPendingCoachingMessageDraft({
      body: "Comment mieux répartir les responsabilités ?",
    });

    const first = await claimPendingCoachingMessageDraft({
      draftToken: created.draftToken,
      email: " Owner@Example.com ",
    });
    const retry = await claimPendingCoachingMessageDraft({
      draftToken: created.draftToken,
      email: "owner@example.com",
    });
    const otherCustomer = await claimPendingCoachingMessageDraft({
      draftToken: created.draftToken,
      email: "other@example.com",
    });

    expect(first).toEqual(retry);
    expect(first).toMatchObject({
      alreadySent: false,
      body: "Comment mieux répartir les responsabilités ?",
    });
    expect(first?.idempotencyKey).toMatch(/^coaching:draft:[a-f0-9]{64}$/);
    expect(otherCustomer).toBeNull();
  });

  it("rejects expired and malformed draft tokens", async () => {
    const created = await createPendingCoachingMessageDraft({
      body: "Je souhaite avancer sur ce point.",
    });
    vi.setSystemTime(new Date("2026-08-13T11:00:00.001Z"));

    await expect(claimPendingCoachingMessageDraft({
      draftToken: created.draftToken,
      email: "owner@example.com",
    })).resolves.toBeNull();
    await expect(claimPendingCoachingMessageDraft({
      draftToken: "not-a-token",
      email: "owner@example.com",
    })).resolves.toBeNull();
  });

  it("marks delivery only for the claiming email and remains idempotent", async () => {
    const created = await createPendingCoachingMessageDraft({
      body: "Je souhaite avancer sur ce point.",
    });
    await claimPendingCoachingMessageDraft({
      draftToken: created.draftToken,
      email: "owner@example.com",
    });

    await expect(markCoachingMessageDraftSent({
      draftToken: created.draftToken,
      email: "other@example.com",
    })).resolves.toBe(false);
    await expect(markCoachingMessageDraftSent({
      draftToken: created.draftToken,
      email: "OWNER@example.com",
    })).resolves.toBe(true);
    await expect(markCoachingMessageDraftSent({
      draftToken: created.draftToken,
      email: "owner@example.com",
    })).resolves.toBe(true);

    await expect(claimPendingCoachingMessageDraft({
      draftToken: created.draftToken,
      email: "owner@example.com",
    })).resolves.toMatchObject({ alreadySent: true });
  });
});
