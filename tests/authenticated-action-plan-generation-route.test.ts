import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  beginActionPlanGeneration: vi.fn(),
  completeActionPlanGeneration: vi.fn(),
  enforceRateLimit: vi.fn(),
  failActionPlanGeneration: vi.fn(),
  generateActionPlanWithMetadata: vi.fn(),
  getActionPlanGenerationForAccess: vi.fn(),
  getAiUsageSubjectHash: vi.fn(),
  getCurrentCustomerIdentity: vi.fn(),
  logOperationalError: vi.fn(),
  recordAiUsage: vi.fn(),
  RequestConflictError: class extends Error {},
}));

vi.mock("@/lib/action-plan-storage.server", () => ({
  ActionPlanGenerationRequestConflictError: mocks.RequestConflictError,
  beginActionPlanGeneration: mocks.beginActionPlanGeneration,
  completeActionPlanGeneration: mocks.completeActionPlanGeneration,
  failActionPlanGeneration: mocks.failActionPlanGeneration,
  getActionPlanGenerationForAccess: mocks.getActionPlanGenerationForAccess,
}));
vi.mock("@/lib/action-plan-generation.server", () => ({
  generateActionPlanWithMetadata: mocks.generateActionPlanWithMetadata,
}));
vi.mock("@/lib/action-plan-api.server", () => ({
  getCurrentCustomerIdentity: mocks.getCurrentCustomerIdentity,
  noStoreHeaders: () => ({ "Cache-Control": "private, no-store, max-age=0" }),
  withNoStore: (response: Response) => response,
}));
vi.mock("@/lib/api-security", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-security")>()),
  enforceRateLimit: mocks.enforceRateLimit,
}));
vi.mock("@/lib/ai-usage-ledger.server", () => ({
  getAiUsageSubjectHash: mocks.getAiUsageSubjectHash,
  recordAiUsage: mocks.recordAiUsage,
}));
vi.mock("@/lib/operational-log", () => ({
  logOperationalError: mocks.logOperationalError,
}));

import { POST } from "@/app/api/action-plans/generate/route";

function request(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/action-plans/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
      "X-Forwarded-For": "127.0.0.1",
    },
    body: JSON.stringify(body),
  });
}

const identity = {
  email: "dirigeant@example.com",
  provider: "password" as const,
  uid: "owner-uid",
};
const claim = {
  id: `apl_${"a".repeat(40)}`,
  leaseOwner: "lease-owner",
  situation: "Je dois mieux organiser le suivi commercial de mon entreprise.",
};

describe("authenticated action plan generation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentCustomerIdentity.mockResolvedValue(identity);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.beginActionPlanGeneration.mockResolvedValue({ kind: "claimed", claim });
    mocks.generateActionPlanWithMetadata.mockResolvedValue({
      plan: { version: "4", systemId: "cabinet-comptable", actions: [] },
      generation: {
        model: "openai/gpt-5-mini",
        durationMs: 900,
        inputTokens: 100,
        outputTokens: 200,
        totalTokens: 300,
        requestCount: 1,
        repairCount: 0,
      },
    });
    mocks.completeActionPlanGeneration.mockResolvedValue({ id: claim.id });
    mocks.failActionPlanGeneration.mockResolvedValue({
      status: "failed",
      id: claim.id,
      attemptCount: 1,
      canRetry: true,
    });
    mocks.getAiUsageSubjectHash.mockReturnValue("subject-hash");
    mocks.recordAiUsage.mockResolvedValue(undefined);
  });

  it("authenticates before creating or paying for a generation", async () => {
    mocks.getCurrentCustomerIdentity.mockResolvedValue(null);
    const response = await POST(request({
      requestId: "generation-request-1234",
      situation: claim.situation,
    }));
    expect(response.status).toBe(401);
    expect(mocks.beginActionPlanGeneration).not.toHaveBeenCalled();
    expect(mocks.generateActionPlanWithMetadata).not.toHaveBeenCalled();
  });

  it("creates, generates and activates one server-owned plan", async () => {
    const response = await POST(request({
      requestId: "generation-request-1234",
      situation: claim.situation,
    }));
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      status: "active",
      actionPlanId: claim.id,
    });
    expect(mocks.beginActionPlanGeneration).toHaveBeenCalledWith({
      identity,
      requestId: "generation-request-1234",
      situation: claim.situation,
    });
    expect(mocks.generateActionPlanWithMetadata).toHaveBeenCalledWith(claim.situation);
    expect(mocks.completeActionPlanGeneration).toHaveBeenCalledWith(
      expect.objectContaining({ identity, claim }),
    );
  });

  it("returns an existing in-flight generation without another AI call", async () => {
    mocks.beginActionPlanGeneration.mockResolvedValue({
      kind: "existing",
      state: {
        status: "generating",
        id: claim.id,
        attemptCount: 1,
        leaseExpiresAt: "2026-08-15T21:00:00.000Z",
      },
    });
    const response = await POST(request({
      requestId: "generation-request-1234",
      situation: claim.situation,
    }));
    expect(response.status).toBe(202);
    expect(mocks.generateActionPlanWithMetadata).not.toHaveBeenCalled();
  });

  it("retries a transient persistence failure without paying for another AI call", async () => {
    mocks.completeActionPlanGeneration
      .mockRejectedValueOnce(new Error("firestore unavailable"))
      .mockResolvedValueOnce({ id: claim.id });
    const response = await POST(request({
      requestId: "generation-request-1234",
      situation: claim.situation,
    }));
    expect(response.status).toBe(201);
    expect(mocks.generateActionPlanWithMetadata).toHaveBeenCalledTimes(1);
    expect(mocks.completeActionPlanGeneration).toHaveBeenCalledTimes(2);
    expect(mocks.failActionPlanGeneration).not.toHaveBeenCalled();
  });

  it("rejects one request ID reused with another fingerprint", async () => {
    mocks.beginActionPlanGeneration.mockRejectedValue(new mocks.RequestConflictError());
    const response = await POST(request({
      requestId: "generation-request-1234",
      situation: claim.situation,
    }));
    expect(response.status).toBe(409);
    expect(mocks.generateActionPlanWithMetadata).not.toHaveBeenCalled();
  });

  it("persists a stable failure without exposing the submitted situation", async () => {
    mocks.generateActionPlanWithMetadata.mockRejectedValue(
      new Error(`provider failure: ${claim.situation}`),
    );
    const response = await POST(request({
      requestId: "generation-request-1234",
      situation: claim.situation,
    }));
    expect(response.status).toBe(502);
    expect(JSON.stringify(await response.json())).not.toContain(claim.situation);
    expect(mocks.failActionPlanGeneration).toHaveBeenCalledWith({
      identity,
      claim,
      errorCode: "generation_failed",
    });
    expect(JSON.stringify(mocks.logOperationalError.mock.calls)).not.toContain(claim.situation);
  });
});
