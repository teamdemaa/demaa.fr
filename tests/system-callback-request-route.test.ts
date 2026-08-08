import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  rateLimits: [] as Array<{ keyPrefix: string; suffix?: string }>,
  submitted: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/lib/api-security", () => ({
  enforceRateLimit: async (_request: Request, options: { keyPrefix: string }, suffix?: string) => {
    mocks.rateLimits.push({ keyPrefix: options.keyPrefix, suffix });
    return null;
  },
  normalizeIdempotencyKey: (value: unknown) => typeof value === "string" && value.length >= 8 ? value : null,
  normalizeText: (value: unknown, max: number, options?: { multiline?: boolean }) => typeof value === "string" ? (options?.multiline ? value.replace(/\r\n?/g, "\n").trim() : value.replace(/\s+/g, " ").trim()).slice(0, max) : "",
  readJsonBody: async (request: Request) => ({ data: await request.json(), response: null }),
}));
vi.mock("@/lib/request-guard", () => ({ enforceAllowedHost: () => null, enforceSameOrigin: () => null }));
vi.mock("@/lib/lead-attribution-server", () => ({ resolveLeadAttribution: () => ({ conversion: { request_id: "test" } }) }));
vi.mock("@/lib/lead-context", () => ({ resolveLeadContext: async (input: Record<string, unknown>) => ({ ...input, systemName: "Plomberie", sectorSlug: null, sectorLabel: null }) }));
vi.mock("@/lib/lead-notifications", () => ({ submitLeadRequest: async (input: Record<string, unknown>) => { mocks.submitted.push(input); return { leadId: "lead-1" }; } }));
vi.mock("@/lib/operational-log", () => ({ logOperationalError: vi.fn() }));

import { POST } from "@/app/api/callback-request/route";

function request(payload: unknown) {
  return new Request("https://demaa.fr/api/callback-request", { method: "POST", body: JSON.stringify(payload) });
}

describe("callback request route", () => {
  it("normalizes a French phone and stores the fixed Process source", async () => {
    const response = await POST(request({ context: "process", firstName: "Maya", phone: "06 12 34 56 78", need: "Structurer les interventions", systemSlug: "plomberie", idempotencyKey: "web:callback:12345678" }));
    expect(response.status).toBe(202);
    expect(mocks.rateLimits.map((limit) => limit.keyPrefix)).toEqual(["callback-request-ip", "callback-request-phone"]);
    expect(mocks.submitted[0]).toMatchObject({ contact: { firstName: "Maya", phone: "+33612345678" }, context: { source: "Système métier - Demande de rappel (Process)", systemSlug: "plomberie" }, requestType: "system_callback_request" });
  });

  it("rejects missing fields before the phone rate limit or storage", async () => {
    mocks.rateLimits.length = 0;
    mocks.submitted.length = 0;
    const response = await POST(request({ context: "solutions", firstName: "Maya", phone: "invalid", need: "", systemSlug: "plomberie" }));
    expect(response.status).toBe(400);
    expect(mocks.rateLimits.map((limit) => limit.keyPrefix)).toEqual(["callback-request-ip"]);
    expect(mocks.submitted).toHaveLength(0);
  });

  it("stores a distinct authoritative source for a Solutions callback", async () => {
    mocks.rateLimits.length = 0;
    mocks.submitted.length = 0;
    const response = await POST(request({
      context: "solutions",
      firstName: "Maya",
      phone: "+225 07 12 34 56 78",
      need: "Choisir un outil de suivi",
      preferredTime: "Après-midi",
      systemSlug: "plomberie",
      idempotencyKey: "web:callback:solutions:12345678",
    }));

    expect(response.status).toBe(202);
    expect(mocks.submitted[0]).toMatchObject({
      contact: { firstName: "Maya", phone: "+2250712345678" },
      context: {
        source: "Système métier - Demande de rappel (Solutions)",
        systemSlug: "plomberie",
      },
      fields: expect.arrayContaining([
        { label: "Moment préféré", value: "Après-midi" },
      ]),
    });
  });

  it("silently accepts the honeypot without storing a lead", async () => {
    mocks.rateLimits.length = 0;
    mocks.submitted.length = 0;
    const response = await POST(request({
      context: "process",
      firstName: "Robot",
      phone: "+33123456789",
      need: "Spam",
      systemSlug: "plomberie",
      website: "https://spam.invalid",
    }));

    expect(response.status).toBe(202);
    expect(mocks.submitted).toHaveLength(0);
  });
});
