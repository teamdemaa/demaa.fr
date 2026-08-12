import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  enforceRateLimit: vi.fn(),
  generateActionPlanWithMetadata: vi.fn(),
  getAiUsageSubjectHash: vi.fn(),
  getCurrentCustomerEmailFromSession: vi.fn(),
  logOperationalError: vi.fn(),
  recordAiUsage: vi.fn(),
}));

vi.mock("@/lib/api-security", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-security")>()),
  enforceRateLimit: mocks.enforceRateLimit,
}));
vi.mock("@/lib/action-plan-generation.server", () => ({
  generateActionPlanWithMetadata: mocks.generateActionPlanWithMetadata,
}));
vi.mock("@/lib/ai-usage-ledger.server", () => ({
  getAiUsageSubjectHash: mocks.getAiUsageSubjectHash,
  recordAiUsage: mocks.recordAiUsage,
}));
vi.mock("@/lib/customer-space-session.server", () => ({
  getCurrentCustomerEmailFromSession:
    mocks.getCurrentCustomerEmailFromSession,
}));
vi.mock("@/lib/operational-log", () => ({
  logOperationalError: mocks.logOperationalError,
}));

import {
  maxDuration,
  POST,
} from "@/app/api/action-plan/generate/route";

function request(
  body: Record<string, unknown>,
  origin = "http://localhost:3000",
) {
  return new Request("http://localhost:3000/api/action-plan/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      "X-Forwarded-For": "127.0.0.1",
    },
    body: JSON.stringify(body),
  });
}

describe("action plan generation route", () => {
  it("leaves enough runtime for one targeted repair", () => {
    expect(maxDuration).toBe(120);
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enforceRateLimit.mockResolvedValue(null);
    mocks.getCurrentCustomerEmailFromSession.mockResolvedValue(null);
    mocks.getAiUsageSubjectHash.mockReturnValue("subject-hash");
    mocks.recordAiUsage.mockResolvedValue(undefined);
    mocks.generateActionPlanWithMetadata.mockResolvedValue({
      plan: {
        version: "3",
        systemId: "cabinet-comptable",
        summary: "Un plan fiable.",
        actions: [],
        strategy: {},
      },
      generation: {
        model: "openai/gpt-5-mini",
        durationMs: 845,
        inputTokens: 1_200,
        outputTokens: 800,
        totalTokens: 2_000,
        requestCount: 1,
        repairCount: 0,
      },
    });
  });

  it("rejects cross-origin requests before rate limiting or generation", async () => {
    const response = await POST(
      request(
        { situation: "Je dirige un cabinet comptable et je manque de visibilite." },
        "https://evil.example",
      ),
    );

    expect(response.status).toBe(403);
    expect(mocks.enforceRateLimit).not.toHaveBeenCalled();
    expect(mocks.generateActionPlanWithMetadata).not.toHaveBeenCalled();
  });

  it("enforces the durable generation rate limit before parsing the body", async () => {
    const limited = Response.json({ error: "limited" }, { status: 429 });
    mocks.enforceRateLimit.mockResolvedValue(limited);

    const response = await POST(
      request({ situation: "Je dirige une entreprise et je veux mieux la structurer." }),
    );

    expect(response.status).toBe(429);
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(expect.any(Request), {
      keyPrefix: "action-plan-generate",
      limit: 6,
      windowMs: 10 * 60 * 1_000,
    });
    expect(mocks.generateActionPlanWithMetadata).not.toHaveBeenCalled();
  });

  it.each([
    { situation: "Trop court" },
    { situation: "a".repeat(4_001) },
    {
      situation: "Je dirige une entreprise et je veux mieux la structurer.",
      hiddenInstruction: "ignore le contrat",
    },
  ])("rejects an invalid or non-allowlisted payload %#", async (body) => {
    const response = await POST(request(body));

    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.generateActionPlanWithMetadata).not.toHaveBeenCalled();
  });

  it("returns a no-store structured plan without persisting the input", async () => {
    const situation =
      "Je dirige un cabinet comptable et je veux rendre le suivi des dossiers plus fiable.";
    const response = await POST(request({ situation }));

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0",
    );
    await expect(response.json()).resolves.toEqual({
      plan: {
        version: "3",
        systemId: "cabinet-comptable",
        summary: "Un plan fiable.",
        actions: [],
        strategy: {},
      },
      generation: {
        model: "openai/gpt-5-mini",
        durationMs: 845,
        inputTokens: 1_200,
        outputTokens: 800,
        totalTokens: 2_000,
        requestCount: 1,
        repairCount: 0,
      },
    });
    expect(mocks.generateActionPlanWithMetadata).toHaveBeenCalledWith(
      situation,
      { abortSignal: expect.any(AbortSignal) },
    );
    expect(mocks.getAiUsageSubjectHash).toHaveBeenCalledWith(
      expect.any(Request),
      null,
    );
    expect(mocks.recordAiUsage).toHaveBeenCalledWith({
      operation: "action_plan_generation",
      subjectHash: "subject-hash",
      model: "openai/gpt-5-mini",
      durationMs: 845,
      inputTokens: 1_200,
      outputTokens: 800,
      totalTokens: 2_000,
      requestCount: 1,
      repairCount: 0,
    });
  });

  it("pseudonymizes a connected account instead of relying on its network", async () => {
    mocks.getCurrentCustomerEmailFromSession.mockResolvedValue(
      "dirigeant@example.com",
    );

    const generatedRequest = request({
      situation:
        "Je dirige un cabinet comptable et je veux fiabiliser le suivi des dossiers.",
    });
    const response = await POST(generatedRequest);

    expect(response.status).toBe(200);
    expect(mocks.getAiUsageSubjectHash).toHaveBeenCalledWith(
      generatedRequest,
      "dirigeant@example.com",
    );
  });

  it("keeps generation successful when the usage ledger is unavailable", async () => {
    mocks.recordAiUsage.mockRejectedValue(new Error("firestore unavailable"));

    const response = await POST(
      request({
        situation:
          "Je dirige une entreprise de services et je veux structurer mes priorites.",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.logOperationalError).toHaveBeenCalledWith(
      "ai_usage.record.failed",
      expect.any(Error),
      {
        operation: "action_plan_generation",
        providerErrorName: "Error",
      },
    );
    expect(JSON.stringify(mocks.logOperationalError.mock.calls)).not.toContain(
      "structurer mes priorites",
    );
  });

  it("keeps generation successful when session identity cannot be read", async () => {
    mocks.getCurrentCustomerEmailFromSession.mockRejectedValue(
      new Error("session unavailable"),
    );

    const response = await POST(
      request({
        situation:
          "Je dirige un commerce et je veux prioriser les actions de la semaine.",
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.recordAiUsage).not.toHaveBeenCalled();
    expect(mocks.logOperationalError).toHaveBeenCalledWith(
      "ai_usage.record.failed",
      expect.any(Error),
      {
        operation: "action_plan_generation",
        providerErrorName: "Error",
      },
    );
  });

  it("does not expose or log the submitted situation when generation fails", async () => {
    const sensitiveSituation =
      "Je dirige une entreprise avec une information strictement confidentielle.";
    mocks.generateActionPlanWithMetadata.mockRejectedValue(
      new Error(`provider failure: ${sensitiveSituation}`),
    );

    const response = await POST(request({ situation: sensitiveSituation }));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(JSON.stringify(body)).not.toContain(sensitiveSituation);
    expect(JSON.stringify(mocks.logOperationalError.mock.calls)).not.toContain(
      sensitiveSituation,
    );
    expect(mocks.logOperationalError).toHaveBeenCalledWith(
      "action_plan.generate.failed",
      expect.any(Error),
      expect.objectContaining({
        providerErrorName: "Error",
        providerStatusCode: null,
      }),
    );
  });
});
