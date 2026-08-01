import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import {
  createServiceRequestRateLimiter,
  getTrustedServiceRequestClientIp,
  resetServiceRequestMemoryRateLimitsForTests,
} from "@/lib/service-request-security.server";

const originalEnv = { ...process.env };
const pepper = "test-only-rate-limit-pepper-32-characters";

function request(url = "https://demaa.fr/api/service-request", headers: Record<string, string> = {}) {
  return new Request(url, { method: "POST", headers });
}

function database(options: { fail?: boolean } = {}) {
  const documents = new Map<string, Record<string, unknown>>();
  return {
    documents,
    value: {
      collection() {
        return { doc(id: string) { return { id }; } };
      },
      async runTransaction<T>(operation: (transaction: {
        get: (reference: { id: string }) => Promise<{ data: () => Record<string, unknown> | undefined; exists: boolean }>;
        set: (reference: { id: string }, data: Record<string, unknown>) => void;
      }) => Promise<T>) {
        if (options.fail) throw new Error("database unavailable with private detail");
        return operation({
          async get(reference) {
            const data = documents.get(reference.id);
            return { data: () => data, exists: Boolean(data) };
          },
          set(reference, data) { documents.set(reference.id, structuredClone(data)); },
        });
      },
    },
  };
}

describe("service request network security", () => {
  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: "test", SITE_URL: "https://demaa.fr" };
    resetServiceRequestMemoryRateLimitsForTests();
  });
  afterEach(() => { process.env = { ...originalEnv }; });

  it("ignores spoofable forwarding headers and accepts only the platform header", () => {
    const env = { ...process.env, VERCEL: "1" };
    expect(getTrustedServiceRequestClientIp(request(undefined, {
      "x-forwarded-for": "203.0.113.99",
    }), env)).toBeNull();
    expect(getTrustedServiceRequestClientIp(request(undefined, {
      "x-forwarded-for": "203.0.113.99",
      "x-vercel-forwarded-for": "198.51.100.7, 10.0.0.1",
    }), env)).toBe("198.51.100.7");
    expect(getTrustedServiceRequestClientIp(request(undefined, {
      "x-vercel-forwarded-for": "not-an-ip",
    }), env)).toBeNull();
  });

  it("rejects missing or malformed origins, hostile hosts and accepts the configured Preview host", () => {
    expect(enforceSameOrigin(request())).toMatchObject({ status: 403 });
    expect(enforceSameOrigin(request(undefined, { origin: "::::" }))).toMatchObject({ status: 403 });
    expect(enforceAllowedHost(request("https://evil.example/api/service-request"))).toMatchObject({ status: 403 });
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_URL = "demaa-preview.example.vercel.app";
    const preview = request("https://demaa-preview.example.vercel.app/api/service-request", {
      origin: "https://demaa-preview.example.vercel.app",
    });
    expect(enforceAllowedHost(preview)).toBeNull();
    expect(enforceSameOrigin(preview)).toBeNull();
  });

  it("requires a secret pepper, HMACs identity and enforces the durable limit", async () => {
    const store = database();
    const env = { ...process.env, VERCEL: "1", SERVICE_REQUEST_RATE_LIMIT_HMAC_SECRET: pepper };
    const enforce = createServiceRequestRateLimiter({ database: store.value as never, env, now: () => 1_000 });
    const incoming = request(undefined, { "x-vercel-forwarded-for": "198.51.100.7" });
    expect(await enforce(incoming, { limit: 1, scope: "ip", windowMs: 60_000 })).toBeNull();
    expect((await enforce(incoming, { limit: 1, scope: "ip", windowMs: 60_000 }))?.status).toBe(429);
    const documentId = [...store.documents.keys()][0] ?? "";
    expect(documentId).toMatch(/^[a-f0-9]{64}$/);
    expect(documentId).not.toContain("198.51.100.7");

    const missingPepper = createServiceRequestRateLimiter({ database: store.value as never, env: { ...env, SERVICE_REQUEST_RATE_LIMIT_HMAC_SECRET: undefined } });
    expect((await missingPepper(incoming, { limit: 1, scope: "ip", windowMs: 60_000 }))?.status).toBe(503);
  });

  it("fails closed on durable-store failure and bounds the explicit degraded mode", async () => {
    const failing = database({ fail: true });
    const baseEnv = { ...process.env, VERCEL: "1", SERVICE_REQUEST_RATE_LIMIT_HMAC_SECRET: pepper };
    const incoming = request(undefined, { "x-vercel-forwarded-for": "198.51.100.8" });
    const closed = createServiceRequestRateLimiter({ database: failing.value as never, env: baseEnv, now: () => 2_000 });
    expect((await closed(incoming, { limit: 8, scope: "ip", windowMs: 60_000 }))?.status).toBe(503);

    resetServiceRequestMemoryRateLimitsForTests();
    const degraded = createServiceRequestRateLimiter({
      database: failing.value as never,
      env: { ...baseEnv, SERVICE_REQUEST_RATE_LIMIT_FAILURE_MODE: "bounded-memory" },
      now: () => 2_000,
    });
    expect(await degraded(incoming, { limit: 8, scope: "ip", windowMs: 60_000 })).toBeNull();
    expect((await degraded(incoming, { limit: 8, scope: "ip", windowMs: 60_000 }))?.status).toBe(429);
  });
});
