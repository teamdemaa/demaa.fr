import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const firestore = vi.hoisted(() => {
  const documents = new Map<string, Record<string, unknown>>();
  return {
    documents,
    database: {
      collection() { return { doc(id: string) { return { id }; } }; },
      async runTransaction<T>(operation: (transaction: {
        get: (reference: { id: string }) => Promise<{ data: () => Record<string, unknown> | undefined; exists: boolean }>;
        set: (reference: { id: string }, data: Record<string, unknown>) => void;
      }) => Promise<T>) {
        return operation({
          async get(reference) {
            const data = firestore.documents.get(reference.id);
            return { data: () => data, exists: Boolean(data) };
          },
          set(reference, data) { firestore.documents.set(reference.id, structuredClone(data)); },
        });
      },
    },
  };
});
vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));

import { POST as submitService } from "@/app/api/service-request/route";
import { POST as submitSolution } from "@/app/api/solution-referral/route";
import { resetServiceRequestMemoryRateLimitsForTests } from "@/lib/service-request-security.server";

const originalEnv = { ...process.env };

function body(target: "service" | "solution") {
  return {
    company: "Atelier Martin",
    email: "maya@gmail.com",
    firstName: "Maya",
    idempotencyKey: `web:${target}:12345678`,
    need: "Besoin de mieux organiser le travail.",
    systemSlug: "batiment",
    ...(target === "service"
      ? { serviceSlug: "site-vitrine-prise-contact" }
      : { resourceSlug: "partenaire-juridique" }),
  };
}

function request(path: string, payload: unknown, headers: Record<string, string> = {}) {
  return new Request(`https://demaa.fr${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://demaa.fr",
      "x-vercel-forwarded-for": "198.51.100.20",
      ...headers,
    },
    body: JSON.stringify(payload),
  });
}

describe("real service request route boundaries", () => {
  beforeEach(() => {
    firestore.documents.clear();
    resetServiceRequestMemoryRateLimitsForTests();
    process.env.SITE_URL = "https://demaa.fr";
    process.env.VERCEL = "1";
    process.env.SERVICE_REQUEST_RATE_LIMIT_HMAC_SECRET = "test-only-rate-limit-pepper-32-characters";
  });
  afterAll(() => { process.env = { ...originalEnv }; });

  it("does not trust X-Forwarded-For without the platform header", async () => {
    const response = await submitService(request("/api/service-request", body("service"), {
      "x-forwarded-for": "203.0.113.9",
      "x-vercel-forwarded-for": "",
    }));
    expect(response.status).toBe(503);
  });

  it("returns 413 for declared and measured oversized bodies", async () => {
    const declared = await submitService(request("/api/service-request", body("service"), {
      "content-length": String(13 * 1024),
    }));
    expect(declared.status).toBe(413);
    resetServiceRequestMemoryRateLimitsForTests();
    firestore.documents.clear();
    const measured = await submitService(request("/api/service-request", {
      ...body("service"), need: "x".repeat(13 * 1024),
    }));
    expect(measured.status).toBe(413);
  });

  it("refuses the real draft Service before consuming the email quota", async () => {
    const response = await submitService(request("/api/service-request", body("service")));
    expect(response.status).toBe(404);
    expect(firestore.documents.size).toBe(1);
  });

  it("refuses the real empty Solution registries before consuming the email quota", async () => {
    const response = await submitSolution(request("/api/solution-referral", body("solution")));
    expect(response.status).toBe(404);
    expect(firestore.documents.size).toBe(1);
  });
});
