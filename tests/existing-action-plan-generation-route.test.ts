import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  begin: vi.fn(),
  enforceRateLimit: vi.fn(),
  execute: vi.fn(),
  getIdentity: vi.fn(),
  ConflictError: class extends Error {},
  InvalidMutationError: class extends Error {},
  RevisionConflictError: class extends Error {},
}));

vi.mock("@/lib/action-plan-storage.server", () => ({
  ActionPlanGenerationRequestConflictError: mocks.ConflictError,
  ActionPlanRevisionConflictError: mocks.RevisionConflictError,
  beginExistingBlankActionPlanGeneration: mocks.begin,
  InvalidActionPlanMutationError: mocks.InvalidMutationError,
}));
vi.mock("@/lib/action-plan-generation-execution.server", () => ({
  executeClaimedActionPlanGeneration: mocks.execute,
}));
vi.mock("@/lib/action-plan-api.server", () => ({
  getCurrentCustomerIdentity: mocks.getIdentity,
  noStoreHeaders: () => ({ "Cache-Control": "private, no-store, max-age=0" }),
  withNoStore: (response: Response) => response,
}));
vi.mock("@/lib/api-security", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-security")>()),
  enforceRateLimit: mocks.enforceRateLimit,
}));

import { POST } from "@/app/api/action-plans/[id]/generate/route";

const identity = {
  email: "owner@example.com",
  provider: "password" as const,
  uid: "owner-uid",
};
const situation = "Je dois structurer le suivi commercial de mon entreprise.";
const claim = { id: "saved-plan-id", leaseOwner: "lease", situation };

function request(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/action-plans/saved-plan-id/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
    },
    body: JSON.stringify(body),
  });
}

describe("existing blank action plan generation route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getIdentity.mockResolvedValue(identity);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.begin.mockResolvedValue({ kind: "claimed", claim });
    mocks.execute.mockResolvedValue({
      status: "active",
      id: claim.id,
      actionPlan: { id: claim.id },
    });
  });

  it("requires authentication before changing the saved plan", async () => {
    mocks.getIdentity.mockResolvedValue(null);
    const response = await POST(request({ expectedRevision: 1, situation }), {
      params: Promise.resolve({ id: claim.id }),
    });
    expect(response.status).toBe(401);
    expect(mocks.begin).not.toHaveBeenCalled();
  });

  it("claims and activates the existing plan in one server-owned command", async () => {
    const response = await POST(request({ expectedRevision: 2, situation }), {
      params: Promise.resolve({ id: claim.id }),
    });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      status: "active",
      actionPlanId: claim.id,
    });
    expect(mocks.begin).toHaveBeenCalledWith({
      identity,
      id: claim.id,
      expectedRevision: 2,
      situation,
    });
    expect(mocks.execute).toHaveBeenCalledWith(expect.objectContaining({ claim, identity }));
  });

  it("rejects a non-blank or conflicting plan", async () => {
    mocks.begin.mockRejectedValue(new mocks.InvalidMutationError());
    const response = await POST(request({ expectedRevision: 2, situation }), {
      params: Promise.resolve({ id: claim.id }),
    });
    expect(response.status).toBe(409);
    expect(mocks.execute).not.toHaveBeenCalled();
  });
});
