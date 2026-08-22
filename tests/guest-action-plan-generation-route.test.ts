import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  begin: vi.fn(),
  enforceRateLimit: vi.fn(),
  execute: vi.fn(),
  fail: vi.fn(),
  get: vi.fn(),
  isEnabled: vi.fn(),
  reserveBudget: vi.fn(),
  resume: vi.fn(),
  ConflictError: class extends Error {},
  ExpiredError: class extends Error {},
}));

vi.mock("@/lib/action-plan-api.server", () => ({
  noStoreHeaders: () => ({ "Cache-Control": "private, no-store, max-age=0" }),
  withNoStore: (response: Response) => response,
}));
vi.mock("@/lib/guest-action-plan-generation.server", () => ({
  beginGuestActionPlanGeneration: mocks.begin,
  failGuestActionPlanGeneration: mocks.fail,
  getGuestActionPlanGenerationForAccess: mocks.get,
  resumeGuestActionPlanGeneration: mocks.resume,
  GuestActionPlanGenerationConflictError: mocks.ConflictError,
  GuestActionPlanGenerationExpiredError: mocks.ExpiredError,
}));
vi.mock("@/lib/guest-action-plan-generation-execution.server", () => ({
  executeClaimedGuestActionPlanGeneration: mocks.execute,
}));
vi.mock("@/lib/guest-action-plan-security.server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/guest-action-plan-security.server")>()),
  enforceGuestActionPlanRateLimit: mocks.enforceRateLimit,
  isGuestProductEnabled: mocks.isEnabled,
  reserveGuestAiGenerationBudget: mocks.reserveBudget,
}));

import { POST as generate } from "@/app/api/guest/action-plans/generate/route";
import { GET as read } from "@/app/api/guest/action-plans/[id]/route";
import { POST as retry } from "@/app/api/guest/action-plans/[id]/generation/route";

const accessKey = "a".repeat(43);
const generationId = `gpl_${"b".repeat(40)}`;
const claim = {
  id: generationId,
  leaseOwner: "lease-owner",
  situation: "Je dois clarifier les priorités de mon entreprise cette semaine.",
  contentLocaleCode: "fr" as const,
  marketCodeAtCreation: "fr-fr" as const,
};
const activeState = {
  status: "active" as const,
  id: generationId,
  expiresAt: "2026-08-23T10:00:00.000Z",
  actionPlan: {
    id: generationId,
    title: "Clarifier les priorités",
    plan: { version: "manual", summary: "", systemId: null, systemReason: "", weeklyActions: [], assumptions: [] },
    workspaceState: { version: "2", selectedSystemId: null },
    sourceText: claim.situation,
    generation: {},
    revision: 1,
    contentLocaleCode: "fr" as const,
    marketCodeAtCreation: "fr-fr" as const,
    createdAt: "2026-08-22T10:00:00.000Z",
    updatedAt: "2026-08-22T10:00:00.000Z",
    expiresAt: "2026-08-23T10:00:00.000Z",
  },
};

function generateRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/guest/action-plans/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:3000" },
    body: JSON.stringify(body),
  });
}

function accessRequest(path: string, method: "GET" | "POST" = "GET", key = accessKey) {
  return new Request(`http://localhost:3000${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, Origin: "http://localhost:3000" },
  });
}

describe("guest action plan generation routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isEnabled.mockReturnValue(true);
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.begin.mockResolvedValue({ kind: "claimed", claim });
    mocks.reserveBudget.mockResolvedValue({ allowed: true, alreadyReserved: false, remaining: 9 });
    mocks.execute.mockResolvedValue(activeState);
    mocks.fail.mockResolvedValue(null);
    mocks.get.mockResolvedValue(activeState);
    mocks.resume.mockResolvedValue({ kind: "claimed", claim });
  });

  it("is invisible and incurs no work while the server flag is closed", async () => {
    mocks.isEnabled.mockReturnValue(false);
    const response = await generate(generateRequest({
      requestId: "guest-request-123456",
      accessKey,
      situation: claim.situation,
    }));
    expect(response.status).toBe(404);
    expect(mocks.enforceRateLimit).not.toHaveBeenCalled();
    expect(mocks.begin).not.toHaveBeenCalled();
  });

  it("generates without customer authentication and never returns the access key", async () => {
    const response = await generate(generateRequest({
      requestId: "guest-request-123456",
      accessKey,
      situation: claim.situation,
    }));
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body).toMatchObject({ status: "active", generationId, actionPlan: { title: "Clarifier les priorités" } });
    expect(JSON.stringify(body)).not.toContain(accessKey);
    expect(mocks.begin).toHaveBeenCalledWith(expect.objectContaining({
      accessKey,
      contentLocaleCode: "fr",
      marketCodeAtCreation: "fr-fr",
    }));
    expect(mocks.reserveBudget).toHaveBeenCalledWith(`${generationId}:lease-owner`);
    expect(mocks.execute).toHaveBeenCalledWith({ accessKey, claim, request: expect.any(Request) });
  });

  it("fails closed before the AI call when the global budget is unavailable", async () => {
    mocks.reserveBudget.mockResolvedValue({ allowed: false, reason: "limit_reached" });
    const response = await generate(generateRequest({
      requestId: "guest-request-123456",
      accessKey,
      situation: claim.situation,
    }));
    expect(response.status).toBe(503);
    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.fail).toHaveBeenCalledWith({ claim, errorCode: "capacity_limit_reached" });
  });

  it("reads and resumes only through the Authorization header", async () => {
    const readResponse = await read(
      accessRequest(`/api/guest/action-plans/${generationId}`),
      { params: Promise.resolve({ id: generationId }) },
    );
    expect(readResponse.status).toBe(200);
    expect(mocks.get).toHaveBeenCalledWith({ id: generationId, accessKey });

    const retryResponse = await retry(
      accessRequest(`/api/guest/action-plans/${generationId}/generation`, "POST"),
      { params: Promise.resolve({ id: generationId }) },
    );
    expect(retryResponse.status).toBe(200);
    expect(mocks.resume).toHaveBeenCalledWith({ id: generationId, accessKey });
  });

  it("does not accept a secret supplied only in the URL", async () => {
    const response = await read(
      new Request(`http://localhost:3000/api/guest/action-plans/${generationId}?accessKey=${accessKey}`),
      { params: Promise.resolve({ id: generationId }) },
    );
    expect(response.status).toBe(401);
    expect(mocks.get).not.toHaveBeenCalled();
  });
});
