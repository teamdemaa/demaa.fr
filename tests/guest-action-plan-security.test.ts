import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const firestore = vi.hoisted(() => {
  const documents = new Map<string, Record<string, unknown>>();
  function ref(path: string) { return { path }; }
  function snapshot(path: string) {
    const data = documents.get(path);
    return { exists: Boolean(data), data: () => data };
  }
  const database = {
    collection(name: string) {
      return { doc(id: string) { return ref(`${name}/${id}`); } };
    },
    async runTransaction<T>(operation: (transaction: {
      get(reference: ReturnType<typeof ref>): Promise<ReturnType<typeof snapshot>>;
      set(reference: ReturnType<typeof ref>, value: Record<string, unknown>): void;
    }) => Promise<T>) {
      const writes: Array<{ reference: ReturnType<typeof ref>; value: Record<string, unknown> }> = [];
      const result = await operation({
        get: async (reference) => snapshot(reference.path),
        set: (reference, value) => writes.push({ reference, value }),
      });
      for (const { reference, value } of writes) documents.set(reference.path, structuredClone(value));
      return result;
    },
  };
  return { database, documents };
});

vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));

import {
  isGuestProductEnabled,
  readGuestAccessKey,
  reserveGuestAiGenerationBudget,
} from "@/lib/guest-action-plan-security.server";

describe("guest action plan security", () => {
  it("keeps the feature closed unless explicitly enabled", () => {
    expect(isGuestProductEnabled({ NODE_ENV: "test" } as NodeJS.ProcessEnv)).toBe(false);
    expect(isGuestProductEnabled({
      NODE_ENV: "test",
      DEMAA_GUEST_PRODUCT_ENABLED: "true",
    } as NodeJS.ProcessEnv)).toBe(true);
  });

  it("accepts the opaque key only in a strict Authorization header", () => {
    const key = "a".repeat(43);
    expect(readGuestAccessKey(new Request("https://demaa.co", {
      headers: { Authorization: `Bearer ${key}` },
    }))).toBe(key);
    expect(readGuestAccessKey(new Request("https://demaa.co?accessKey=secret"))).toBeNull();
    expect(readGuestAccessKey(new Request("https://demaa.co", {
      headers: { Authorization: "Bearer short" },
    }))).toBeNull();
  });

  it("reserves the daily budget idempotently and fails closed at the limit", async () => {
    firestore.documents.clear();
    const env = { NODE_ENV: "test", DEMAA_GUEST_AI_DAILY_LIMIT: "2" } as NodeJS.ProcessEnv;
    const dependencies = {
      database: firestore.database as never,
      env,
      now: () => new Date("2026-08-22T10:00:00.000Z"),
    };
    await expect(reserveGuestAiGenerationBudget("gpl_one", dependencies)).resolves.toEqual({
      allowed: true,
      alreadyReserved: false,
      remaining: 1,
    });
    await expect(reserveGuestAiGenerationBudget("gpl_one", dependencies)).resolves.toEqual({
      allowed: true,
      alreadyReserved: true,
      remaining: 1,
    });
    await expect(reserveGuestAiGenerationBudget("gpl_two", dependencies)).resolves.toMatchObject({
      allowed: true,
      remaining: 0,
    });
    await expect(reserveGuestAiGenerationBudget("gpl_three", dependencies)).resolves.toEqual({
      allowed: false,
      reason: "limit_reached",
    });
    expect(firestore.documents.get("guest_ai_daily_budgets/2026-08-22")).toMatchObject({ count: 2, limit: 2 });
  });

  it("fails closed when the budget is missing or the circuit is open", async () => {
    await expect(reserveGuestAiGenerationBudget("gpl_one", {
      database: firestore.database as never,
      env: { NODE_ENV: "test" } as NodeJS.ProcessEnv,
    })).resolves.toEqual({ allowed: false, reason: "misconfigured" });
    await expect(reserveGuestAiGenerationBudget("gpl_one", {
      database: firestore.database as never,
      env: {
        NODE_ENV: "test",
        DEMAA_GUEST_AI_CIRCUIT_OPEN: "true",
        DEMAA_GUEST_AI_DAILY_LIMIT: "10",
      } as NodeJS.ProcessEnv,
    })).resolves.toEqual({ allowed: false, reason: "circuit_open" });
  });

  it("fails closed without exposing a durable-store failure", async () => {
    const failingDatabase = {
      collection() { return { doc() { return {}; } }; },
      async runTransaction() { throw new Error("private firestore detail"); },
    };
    await expect(reserveGuestAiGenerationBudget("gpl_one", {
      database: failingDatabase as never,
      env: { NODE_ENV: "test", DEMAA_GUEST_AI_DAILY_LIMIT: "10" } as NodeJS.ProcessEnv,
    })).resolves.toEqual({ allowed: false, reason: "unavailable" });
  });
});
