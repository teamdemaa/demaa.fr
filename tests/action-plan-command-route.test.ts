import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionPlan } from "@/lib/action-plan-contract";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import { createActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  email: null as string | null,
  enforceRateLimit: vi.fn(),
  generateCommand: vi.fn(),
  recordUsage: vi.fn(),
}));

vi.mock("@/lib/api-security", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-security")>()),
  enforceRateLimit: mocks.enforceRateLimit,
}));
vi.mock("@/lib/customer-space-session.server", () => ({
  getCurrentCustomerEmailFromSession: vi.fn(async () => mocks.email),
}));
vi.mock("@/lib/action-plan-command.server", () => ({
  ACTION_PLAN_COMMAND_EXTERNAL_GENERATION_ENABLED: true,
  generateActionPlanCommand: mocks.generateCommand,
}));
vi.mock("@/lib/ai-usage-ledger.server", () => ({
  getAiUsageSubjectHash: vi.fn(() => "subject-hash"),
  recordAiUsage: mocks.recordUsage,
}));
vi.mock("@/lib/operational-log", () => ({
  logOperationalError: vi.fn(),
}));

import { POST } from "@/app/api/action-plan/command/route";

const systemId = actionPlanSystemOptions[0]?.id;
if (!systemId) throw new Error("Missing action plan system fixture.");

function plan(): ActionPlan {
  return {
    version: "3",
    summary: "Un plan simple.",
    systemId,
    actions: [1, 2, 3].map((index) => ({
      id: `action-${index}` as `action-${1 | 2 | 3}`,
      title: `Action ${index}`,
      objective: "Obtenir un resultat observable.",
      channelOrTool: "Document de suivi",
      steps: ["Preparer.", "Verifier."],
      support: null,
      strategyPillar: "alignement" as const,
    })),
    strategy: {
      alignment: {
        direction: "Une entreprise pilotable.",
        startingPoint: "Une priorite reste a choisir.",
        decisionRules: "Finir avant d'ajouter.",
      },
      positioning: {
        preciseCustomer: "Un client precis.",
        importantProblem: "Un probleme important.",
        evidenceAndAlternatives: "Une verification terrain.",
      },
      offer: {
        promisedOutcome: "Un resultat clair.",
        scope: "Un perimetre clair.",
        priceCommitmentAndRisk: "Un engagement a clarifier.",
      },
      promotion: {
        attract: "Attirer utilement.",
        facilitatePurchase: "Faciliter la decision.",
        retainAndStrengthen: "Tenir la promesse.",
      },
    },
  };
}

function request(
  body: unknown,
  origin = "http://localhost:3000",
) {
  return new Request("http://localhost:3000/api/action-plan/command", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      "X-Forwarded-For": "127.0.0.1",
    },
    body: JSON.stringify(body),
  });
}

function validBody() {
  const currentPlan = plan();
  return {
    command: "Ajoute une action de verification",
    plan: currentPlan,
    workspace: createActionPlanWorkspaceState(currentPlan),
  };
}

describe("action plan command route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.email = null;
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.generateCommand.mockResolvedValue({
      operations: [
        {
          type: "updateAction",
          actionId: "action-1",
          changes: { title: "Action clarifiée" },
        },
      ],
      generation: {
        model: "openai/gpt-5-mini",
        durationMs: 120,
        inputTokens: 100,
        outputTokens: 30,
        totalTokens: 130,
        requestCount: 1,
        repairCount: 0,
      },
    });
    mocks.recordUsage.mockResolvedValue(undefined);
  });

  it("rejects another origin before reading identity or payload", async () => {
    const response = await POST(request(validBody(), "https://evil.example"));

    expect(response.status).toBe(403);
    expect(mocks.enforceRateLimit).not.toHaveBeenCalled();
  });

  it("uses a separate guest IP limit and returns validated operations", async () => {
    const response = await POST(request(validBody()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      operations: [
        {
          type: "updateAction",
          actionId: "action-1",
        },
      ],
    });
    expect(mocks.enforceRateLimit).toHaveBeenCalledTimes(1);
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(expect.any(Request), {
      keyPrefix: "action-plan-command-ip",
      limit: 8,
      windowMs: 10 * 60 * 1_000,
    });
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("uses account identity first and IP as a secondary safeguard", async () => {
    mocks.email = "dirigeant@example.com";

    const response = await POST(request(validBody()));

    expect(response.status).toBe(200);
    expect(mocks.enforceRateLimit).toHaveBeenCalledTimes(2);
    expect(mocks.enforceRateLimit).toHaveBeenNthCalledWith(
      1,
      expect.any(Request),
      {
        keyPrefix: "action-plan-command-account",
        limit: 30,
        windowMs: 10 * 60 * 1_000,
      },
      expect.stringMatching(/^[a-f0-9]{64}$/),
    );
    expect(mocks.enforceRateLimit).toHaveBeenNthCalledWith(
      2,
      expect.any(Request),
      {
        keyPrefix: "action-plan-command-ip",
        limit: 60,
        windowMs: 10 * 60 * 1_000,
      },
    );
    expect(mocks.recordUsage).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "action_plan_command",
        subjectHash: "subject-hash",
      }),
    );
  });

  it("does not accept unknown payload fields or malformed plans", async () => {
    const withHiddenField = { ...validBody(), systemId: "restaurant" };
    const first = await POST(request(withHiddenField));
    const second = await POST(
      request({ command: "Ajoute une action", plan: {}, workspace: {} }),
    );

    expect(first.status).toBe(400);
    expect(second.status).toBe(400);
  });

  it("returns an existing rate-limit response without parsing the plan", async () => {
    mocks.enforceRateLimit.mockResolvedValueOnce(
      Response.json({ error: "limited" }, { status: 429 }),
    );

    const response = await POST(request({ private: "not parsed" }));

    expect(response.status).toBe(429);
  });
});
