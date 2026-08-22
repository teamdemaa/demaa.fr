import { beforeEach, describe, expect, it, vi } from "vitest";
import { createManualActionPlan } from "@/lib/action-plan-manual";

vi.mock("server-only", () => ({}));

type StoredDocument = Record<string, unknown>;

const firestore = vi.hoisted(() => {
  const documents = new Map<string, StoredDocument>();
  function snapshot(path: string) {
    const data = documents.get(path);
    return { id: path.split("/").at(-1) || "", exists: Boolean(data), data: () => data };
  }
  function ref(path: string) {
    return {
      path,
      async get() { return snapshot(path); },
      async set(value: StoredDocument) { documents.set(path, structuredClone(value)); },
    };
  }
  const database = {
    collection(name: string) {
      return { doc(id: string) { return ref(`${name}/${id}`); } };
    },
    async runTransaction<T>(operation: (transaction: {
      get(reference: ReturnType<typeof ref>): Promise<ReturnType<typeof snapshot>>;
      set(reference: ReturnType<typeof ref>, value: StoredDocument): void;
    }) => Promise<T>) {
      const writes: Array<{ reference: ReturnType<typeof ref>; value: StoredDocument }> = [];
      const result = await operation({
        get: async (reference) => snapshot(reference.path),
        set: (reference, value) => writes.push({ reference, value }),
      });
      for (const write of writes) await write.reference.set(write.value);
      return result;
    },
  };
  return { database, documents };
});

vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));

import {
  beginGuestActionPlanGeneration,
  completeGuestActionPlanGeneration,
  getGuestActionPlanGenerationForAccess,
  GuestActionPlanGenerationConflictError,
  GuestActionPlanGenerationExpiredError,
  hashGuestActionPlanAccessKey,
  resumeGuestActionPlanGeneration,
} from "@/lib/guest-action-plan-generation.server";

const accessKey = "a".repeat(43);
const situation = "Je dois clarifier les priorités de mon entreprise cette semaine.";

describe("guest action plan generation persistence", () => {
  beforeEach(() => firestore.documents.clear());

  it("stores only a hash of the opaque access key and reuses an active lease", async () => {
    const now = new Date("2026-08-22T09:00:00.000Z");
    const started = await beginGuestActionPlanGeneration({
      requestId: "guest-request-123456",
      accessKey,
      situation,
      contentLocaleCode: "fr",
      marketCodeAtCreation: "fr-fr",
      now,
    });
    expect(started.kind).toBe("claimed");
    if (started.kind !== "claimed") throw new Error("Expected claim");
    const document = firestore.documents.get(`guest_action_plan_generations/${started.claim.id}`);
    expect(document).toMatchObject({
      access_key_hash: hashGuestActionPlanAccessKey(accessKey),
      attempt_count: 1,
      status: "generating",
    });
    expect(JSON.stringify(document)).not.toContain(accessKey);
    expect(document?.expires_at).toBe("2026-08-23T09:00:00.000Z");

    await expect(beginGuestActionPlanGeneration({
      requestId: "guest-request-123456",
      accessKey,
      situation,
      contentLocaleCode: "fr",
      marketCodeAtCreation: "fr-fr",
      now: new Date("2026-08-22T09:01:00.000Z"),
    })).resolves.toMatchObject({ kind: "existing", state: { status: "generating" } });
  });

  it("rejects a reused idempotency key with another secret or situation", async () => {
    await beginGuestActionPlanGeneration({
      requestId: "guest-request-123456",
      accessKey,
      situation,
      contentLocaleCode: "fr",
      marketCodeAtCreation: "fr-fr",
    });
    await expect(beginGuestActionPlanGeneration({
      requestId: "guest-request-123456",
      accessKey: "b".repeat(43),
      situation,
      contentLocaleCode: "fr",
      marketCodeAtCreation: "fr-fr",
    })).rejects.toBeInstanceOf(GuestActionPlanGenerationConflictError);
    await expect(beginGuestActionPlanGeneration({
      requestId: "guest-request-123456",
      accessKey,
      situation: `${situation} Autre contenu.`,
      contentLocaleCode: "fr",
      marketCodeAtCreation: "fr-fr",
    })).rejects.toBeInstanceOf(GuestActionPlanGenerationConflictError);
  });

  it("activates only the current lease and returns the plan only with the access key", async () => {
    const started = await beginGuestActionPlanGeneration({
      requestId: "guest-request-123456",
      accessKey,
      situation,
      contentLocaleCode: "fr",
      marketCodeAtCreation: "fr-fr",
    });
    if (started.kind !== "claimed") throw new Error("Expected claim");
    await expect(completeGuestActionPlanGeneration({
      claim: { ...started.claim, leaseOwner: "wrong-lease" },
      plan: createManualActionPlan(),
    })).resolves.toBeNull();
    const completed = await completeGuestActionPlanGeneration({
      claim: started.claim,
      title: "Clarifier les priorités",
      plan: createManualActionPlan(),
    });
    expect(completed).toMatchObject({ title: "Clarifier les priorités" });
    await expect(getGuestActionPlanGenerationForAccess({
      id: started.claim.id,
      accessKey: "b".repeat(43),
    })).resolves.toBeNull();
    await expect(getGuestActionPlanGenerationForAccess({
      id: started.claim.id,
      accessKey,
    })).resolves.toMatchObject({ status: "active" });
  });

  it("expires after 24 hours and never revives an expired request", async () => {
    const started = await beginGuestActionPlanGeneration({
      requestId: "guest-request-123456",
      accessKey,
      situation,
      contentLocaleCode: "fr",
      marketCodeAtCreation: "fr-fr",
      now: new Date("2026-08-22T09:00:00.000Z"),
    });
    if (started.kind !== "claimed") throw new Error("Expected claim");
    await expect(getGuestActionPlanGenerationForAccess({
      id: started.claim.id,
      accessKey,
      now: new Date("2026-08-23T09:00:00.000Z"),
    })).resolves.toBeNull();
    await expect(resumeGuestActionPlanGeneration({
      id: started.claim.id,
      accessKey,
      now: new Date("2026-08-23T09:00:00.000Z"),
    })).resolves.toBeNull();
    await expect(beginGuestActionPlanGeneration({
      requestId: "guest-request-123456",
      accessKey,
      situation,
      contentLocaleCode: "fr",
      marketCodeAtCreation: "fr-fr",
      now: new Date("2026-08-23T09:00:00.000Z"),
    })).rejects.toBeInstanceOf(GuestActionPlanGenerationExpiredError);
  });
});
