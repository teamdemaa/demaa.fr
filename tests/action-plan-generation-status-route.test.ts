import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  executeClaimedActionPlanGeneration: vi.fn(),
  getActionPlanGenerationForAccess: vi.fn(),
  getCurrentCustomerIdentity: vi.fn(),
  resumeActionPlanGenerationForAccess: vi.fn(),
}));

vi.mock("@/lib/action-plan-storage.server", () => ({
  getActionPlanGenerationForAccess: mocks.getActionPlanGenerationForAccess,
  resumeActionPlanGenerationForAccess: mocks.resumeActionPlanGenerationForAccess,
}));
vi.mock("@/lib/action-plan-generation-execution.server", () => ({
  executeClaimedActionPlanGeneration: mocks.executeClaimedActionPlanGeneration,
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

import { GET, POST } from "@/app/api/action-plans/[id]/generation/route";

const id = `apl_${"a".repeat(40)}`;
const request = new Request(`http://localhost:3000/api/action-plans/${id}/generation`);

describe("action plan generation status route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentCustomerIdentity.mockResolvedValue({
      email: "owner@example.com",
      provider: "password",
      uid: "owner-uid",
    });
    mocks.enforceRateLimit.mockResolvedValue(null);
  });

  it("authenticates before reading the generation document", async () => {
    mocks.getCurrentCustomerIdentity.mockResolvedValue(null);
    const response = await GET(request, { params: Promise.resolve({ id }) });
    expect(response.status).toBe(401);
    expect(mocks.getActionPlanGenerationForAccess).not.toHaveBeenCalled();
  });

  it("returns an owned in-flight generation without its source text", async () => {
    mocks.getActionPlanGenerationForAccess.mockResolvedValue({
      status: "generating",
      id,
      attemptCount: 1,
      leaseExpiresAt: "2026-08-15T22:00:00.000Z",
    });
    const response = await GET(request, { params: Promise.resolve({ id }) });
    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      status: "generating",
      actionPlanId: id,
      leaseExpiresAt: "2026-08-15T22:00:00.000Z",
    });
    expect(mocks.getActionPlanGenerationForAccess).toHaveBeenCalledWith({
      id,
      uid: "owner-uid",
    });
  });

  it("does not reveal another company plan", async () => {
    mocks.getActionPlanGenerationForAccess.mockResolvedValue(null);
    const response = await GET(request, { params: Promise.resolve({ id }) });
    expect(response.status).toBe(404);
  });

  it("rejects non-deterministic document identifiers", async () => {
    const response = await GET(request, {
      params: Promise.resolve({ id: "legacy-plan-id" }),
    });
    expect(response.status).toBe(404);
    expect(mocks.getActionPlanGenerationForAccess).not.toHaveBeenCalled();
  });

  it("resumes an owned expired generation and executes its server claim", async () => {
    const claim = {
      id,
      leaseOwner: "new-lease",
      situation: "La situation conservée uniquement dans Firestore est assez détaillée.",
    };
    mocks.resumeActionPlanGenerationForAccess.mockResolvedValue({ kind: "claimed", claim });
    mocks.executeClaimedActionPlanGeneration.mockResolvedValue({
      status: "active",
      id,
      actionPlan: { id },
    });
    const response = await POST(new Request(request.url, {
      method: "POST",
      headers: { Origin: "http://localhost:3000" },
    }), { params: Promise.resolve({ id }) });
    expect(response.status).toBe(201);
    expect(mocks.resumeActionPlanGenerationForAccess).toHaveBeenCalledWith({
      identity: expect.objectContaining({ uid: "owner-uid" }),
      id,
    });
    expect(mocks.executeClaimedActionPlanGeneration).toHaveBeenCalledWith({
      claim,
      identity: expect.objectContaining({ uid: "owner-uid" }),
      request: expect.any(Request),
    });
  });

  it("does not expose or resume another company generation", async () => {
    mocks.resumeActionPlanGenerationForAccess.mockResolvedValue(null);
    const response = await POST(new Request(request.url, {
      method: "POST",
      headers: { Origin: "http://localhost:3000" },
    }), { params: Promise.resolve({ id }) });
    expect(response.status).toBe(404);
    expect(mocks.executeClaimedActionPlanGeneration).not.toHaveBeenCalled();
  });
});
