import { beforeEach, describe, expect, it, vi } from "vitest";
import { createManualActionPlan } from "@/lib/action-plan-manual";
import { createManualActionPlanWorkspaceState } from "@/lib/action-plan-manual";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  resolveLeadAttribution: vi.fn(),
  resolveLeadContext: vi.fn(),
  submitLeadRequest: vi.fn(),
}));

const firestore = vi.hoisted(() => {
  const documents = new Map<string, Record<string, unknown>>();
  function ref(path: string) {
    return {
      id: path.split("/").at(-1) || "",
      path,
      async set(value: Record<string, unknown>, options?: { merge?: boolean }) {
        documents.set(path, structuredClone({
          ...(options?.merge ? documents.get(path) ?? {} : {}),
          ...value,
        }));
      },
    };
  }
  function snapshot(path: string) {
    const data = documents.get(path);
    return { exists: Boolean(data), data: () => data };
  }
  const database = {
    collection(name: string) {
      return { doc(id: string) { return ref(`${name}/${id}`); } };
    },
    async runTransaction<T>(operation: (transaction: {
      create(reference: ReturnType<typeof ref>, value: Record<string, unknown>): void;
      get(reference: ReturnType<typeof ref>): Promise<ReturnType<typeof snapshot>>;
    }) => Promise<T>) {
      const writes: Array<{ reference: ReturnType<typeof ref>; value: Record<string, unknown> }> = [];
      const result = await operation({
        create: (reference, value) => writes.push({ reference, value }),
        get: async (reference) => snapshot(reference.path),
      });
      for (const write of writes) {
        if (documents.has(write.reference.path)) throw new Error("already exists");
        documents.set(write.reference.path, structuredClone(write.value));
      }
      return result;
    },
  };
  return { database, documents };
});

vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));
vi.mock("@/lib/lead-attribution-server", () => ({
  resolveLeadAttribution: mocks.resolveLeadAttribution,
}));
vi.mock("@/lib/lead-context", () => ({ resolveLeadContext: mocks.resolveLeadContext }));
vi.mock("@/lib/lead-notifications", () => ({ submitLeadRequest: mocks.submitLeadRequest }));

import {
  GuestDiagnosticIdempotencyConflictError,
  submitGuestDiagnosticRequest,
} from "@/lib/guest-diagnostic-request.server";

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

function request() {
  return new Request("https://demaa.co/", {
    headers: { Referer: "https://demaa.co/?view=plan" },
  });
}

describe("guest diagnostic request", () => {
  beforeEach(() => {
    firestore.documents.clear();
    vi.clearAllMocks();
    mocks.resolveLeadAttribution.mockReturnValue({ conversion: { request_id: "request-1" } });
    mocks.resolveLeadContext.mockResolvedValue({
      systemSlug: null,
      systemName: null,
      sectorSlug: null,
      sectorLabel: null,
      source: "Diagnostic Demaa",
      sourceUrl: "https://demaa.co/?view=plan",
    });
    mocks.submitLeadRequest.mockResolvedValue({ duplicate: false, leadId: "lead-123" });
  });

  it("stores one admin lead with contact consent and no marketing delivery", async () => {
    const result = await submitGuestDiagnosticRequest({
      attribution: { version: 1 },
      email: "owner@example.com",
      idempotencyKey: "diagnostic-request-123456",
      message: "Je souhaite un regard extérieur.",
      phone: null,
      plan,
      request: request(),
    });

    expect(result).toEqual({ duplicate: false, leadId: "lead-123" });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      channels: { email: true, resend: false, slack: false },
      contact: { email: "owner@example.com", phone: null },
      consents: [expect.objectContaining({ granted: true, purpose: "diagnostic_contact" })],
      fields: expect.arrayContaining([
        { label: "Message complémentaire", value: "Je souhaite un regard extérieur." },
        { label: "Plan", value: "Clarifier les priorités" },
        { label: "Situation", value: plan.sourceText },
      ]),
      requestType: "guest_plan_diagnostic",
    }));

    const duplicate = await submitGuestDiagnosticRequest({
      attribution: { version: 1 },
      email: "owner@example.com",
      idempotencyKey: "diagnostic-request-123456",
      message: "Je souhaite un regard extérieur.",
      phone: null,
      plan,
      request: request(),
    });
    expect(duplicate).toEqual({ duplicate: true, leadId: "lead-123" });
    expect(mocks.submitLeadRequest).toHaveBeenCalledTimes(1);
  });

  it("stores a diagnostic without a plan in the same admin request stream", async () => {
    const result = await submitGuestDiagnosticRequest({
      attribution: null,
      email: "owner@example.com",
      idempotencyKey: "diagnostic-without-plan-123456",
      message: "Je souhaite clarifier mon organisation.",
      phone: null,
      plan: null,
      request: request(),
      situation: "Je perds du temps dans le suivi des demandes.",
    });

    expect(result).toEqual({ duplicate: false, leadId: "lead-123" });
    expect(mocks.submitLeadRequest).toHaveBeenCalledWith(expect.objectContaining({
      fields: [
        { label: "Message complémentaire", value: "Je souhaite clarifier mon organisation." },
        { label: "Situation saisie", value: "Je perds du temps dans le suivi des demandes." },
      ],
      requestType: "guest_plan_diagnostic",
      title: "Diagnostic demandé",
    }));
  });

  it("rejects reuse of an idempotency key with different personal data", async () => {
    await submitGuestDiagnosticRequest({
      attribution: null,
      email: "owner@example.com",
      idempotencyKey: "diagnostic-request-123456",
      message: null,
      phone: null,
      plan,
      request: request(),
    });
    await expect(submitGuestDiagnosticRequest({
      attribution: null,
      email: "other@example.com",
      idempotencyKey: "diagnostic-request-123456",
      message: null,
      phone: null,
      plan,
      request: request(),
    })).rejects.toBeInstanceOf(GuestDiagnosticIdempotencyConflictError);
  });
});
