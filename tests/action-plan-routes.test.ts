import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LegacyV2ActionPlan } from "@/lib/action-plan-contract";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import { createActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

vi.mock("server-only", () => ({}));

const routeState = vi.hoisted(() => ({
  identity: null as null | { uid: string; email: string; provider: "password" },
}));
const storage = vi.hoisted(() => ({
  create: vi.fn(),
  list: vi.fn(),
  read: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/lib/action-plan-api.server", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/action-plan-api.server")>(),
  getCurrentCustomerIdentity: vi.fn(async () => routeState.identity),
}));
vi.mock("@/lib/action-plan-storage.server", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/action-plan-storage.server")>(),
  createOwnedActionPlanForIdentity: storage.create,
  getOwnedActionPlansForIdentity: storage.list,
  getActionPlanForAccess: storage.read,
  updateActionPlanWorkspaceForAccess: storage.update,
  deleteActionPlanForAccess: storage.remove,
}));
vi.mock("@/lib/api-security", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/api-security")>(),
  enforceRateLimit: vi.fn(async () => null),
}));

import { GET, POST } from "@/app/api/action-plans/route";
import { DELETE, GET as GET_PLAN, PATCH } from "@/app/api/action-plans/[id]/route";

const systemId = actionPlanSystemOptions[0]?.id;
if (!systemId) throw new Error("Missing action plan system fixture.");

const plan: LegacyV2ActionPlan = {
  version: "2",
  summary: "Un plan pour vérifier les routes.",
  systemId,
  systemReason: "Ce système correspond à la recette.",
  weeklyActions: [1, 2, 3].map((index) => ({
    id: `action-${index}` as `action-${1 | 2 | 3}`,
    title: `Action ${index}`,
    objective: "Vérifier une route.",
    channelOrTool: "Plan Demaa",
    steps: ["Préparer.", "Vérifier."],
    readyToUse: null,
    strategyPillar: "alignement" as const,
  })),
  strategy: {
    alignment: {
      headline: "Alignement",
      desiredCompany: "Une entreprise claire.",
      boundariesAndValues: "Une limite claire.",
      prioritiesAndTradeoffs: "Une priorité claire.",
    },
    positioning: {
      headline: "Positionnement",
      preciseCustomer: "Un client précis.",
      importantProblem: "Un problème précis.",
      evidenceAndAlternatives: "Une preuve précise.",
    },
    offer: {
      headline: "Offre",
      promisedOutcome: "Un résultat précis.",
      scope: "Un périmètre précis.",
      priceCommitmentAndRisk: "Un engagement précis.",
    },
    promotion: {
      headline: "Promotion",
      attract: "Attirer utilement.",
      facilitatePurchase: "Faciliter la décision.",
      retainAndStrengthen: "Renforcer la relation.",
    },
  },
  assumptions: ["La recette est contrôlée."],
};
const workspaceState = createActionPlanWorkspaceState(plan);
const planId = "valid-plan-id-123";

function request(path: string, method = "GET", body?: unknown) {
  return new Request(`http://localhost:3000${path}`, {
    method,
    headers: {
      ...(method === "GET" ? {} : { Origin: "http://localhost:3000" }),
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("action plan HTTP routes", () => {
  beforeEach(() => {
    routeState.identity = {
      uid: "owner-uid",
      email: "owner@example.com",
      provider: "password",
    };
    vi.clearAllMocks();
  });

  it("rejects an anonymous list without querying storage", async () => {
    routeState.identity = null;
    const response = await GET(request("/api/action-plans"));
    expect(response.status).toBe(401);
    expect(storage.list).not.toHaveBeenCalled();
  });

  it("passes the authenticated identity through list and create", async () => {
    storage.list.mockResolvedValue([{ id: planId }]);
    storage.create.mockResolvedValue({ id: planId, revision: 1 });

    const listResponse = await GET(request("/api/action-plans"));
    expect(listResponse.status).toBe(200);
    expect(await listResponse.json()).toEqual({ plans: [{ id: planId }] });
    expect(storage.list).toHaveBeenCalledWith(routeState.identity);

    const createResponse = await POST(request("/api/action-plans", "POST", {
      plan,
      workspaceState,
    }));
    expect(createResponse.status).toBe(201);
    expect(storage.create).toHaveBeenCalledWith(
      routeState.identity,
      expect.objectContaining({ plan, workspaceState }),
    );
  });

  it("passes only the authenticated UID to update and delete authorization", async () => {
    storage.update.mockResolvedValue({
      revision: 2,
      updatedAt: "2026-08-15T00:00:00.000Z",
      title: "Plan",
      workspaceState,
    });
    storage.remove.mockResolvedValue({
      revision: 3,
      deletedAt: "2026-08-15T00:01:00.000Z",
    });

    const updateResponse = await PATCH(
      request(`/api/action-plans/${planId}`, "PATCH", {
        expectedRevision: 1,
        workspaceState,
      }),
      { params: Promise.resolve({ id: planId }) },
    );
    expect(updateResponse.status).toBe(200);
    expect(storage.update).toHaveBeenCalledWith(expect.objectContaining({
      uid: "owner-uid",
      id: planId,
      expectedRevision: 1,
    }));

    const deleteResponse = await DELETE(
      request(`/api/action-plans/${planId}`, "DELETE", { expectedRevision: 2 }),
      { params: Promise.resolve({ id: planId }) },
    );
    expect(deleteResponse.status).toBe(200);
    expect(storage.remove).toHaveBeenCalledWith({
      uid: "owner-uid",
      id: planId,
      expectedRevision: 2,
    });
  });

  it("reads only the current revision for explicit conflict resolution", async () => {
    storage.read.mockResolvedValue({ id: planId, revision: 4 });

    const response = await GET_PLAN(
      request(`/api/action-plans/${planId}`),
      { params: Promise.resolve({ id: planId }) },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: planId, revision: 4 });
    expect(storage.read).toHaveBeenCalledWith({
      id: planId,
      uid: "owner-uid",
    });
  });

  it("does not reveal a plan revision without an authenticated session", async () => {
    routeState.identity = null;

    const response = await GET_PLAN(
      request(`/api/action-plans/${planId}`),
      { params: Promise.resolve({ id: planId }) },
    );

    expect(response.status).toBe(401);
    expect(storage.read).not.toHaveBeenCalled();
  });
});
