import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  AI_USAGE_EVENTS_COLLECTION,
  createAiUsageSubjectHash,
  getAiUsageSubjectHash,
  recordAiUsage,
} from "@/lib/ai-usage-ledger.server";

const env = {
  SERVICE_REQUEST_RATE_LIMIT_HMAC_SECRET: "s".repeat(64),
  VERCEL: "1",
} as unknown as NodeJS.ProcessEnv;

describe("AI usage ledger", () => {
  it("creates stable, scoped hashes without retaining account or IP values", () => {
    const accountHash = createAiUsageSubjectHash(
      "account",
      " Dirigeant@Example.com ",
      env,
    );
    const normalizedAccountHash = createAiUsageSubjectHash(
      "account",
      "dirigeant@example.com",
      env,
    );
    const ipHash = createAiUsageSubjectHash(
      "ip",
      "dirigeant@example.com",
      env,
    );

    expect(accountHash).toBe(normalizedAccountHash);
    expect(accountHash).toMatch(/^[a-f0-9]{64}$/);
    expect(ipHash).not.toBe(accountHash);
    expect(accountHash).not.toContain("dirigeant");
  });

  it("prefers a connected account and otherwise hashes the trusted client IP", () => {
    const request = new Request("https://demaa.co/api/action-plan/generate", {
      headers: { "x-vercel-forwarded-for": "203.0.113.42" },
    });

    expect(
      getAiUsageSubjectHash(request, "team@demaa.fr", env),
    ).toBe(createAiUsageSubjectHash("account", "team@demaa.fr", env));
    expect(getAiUsageSubjectHash(request, null, env)).toBe(
      createAiUsageSubjectHash("ip", "203.0.113.42", env),
    );
  });

  it("stores only operational metadata and no prompt or generated content", async () => {
    const set = vi.fn().mockResolvedValue(undefined);
    const doc = vi.fn(() => ({ set }));
    const collection = vi.fn(() => ({ doc }));
    const database = { collection };

    await recordAiUsage(
      {
        operation: "action_plan_generation",
        subjectHash: "a".repeat(64),
        model: "openai/gpt-5-mini",
        durationMs: 1_234,
        inputTokens: 1_000,
        outputTokens: 700,
        totalTokens: 1_700,
        requestCount: 2,
        repairCount: 1,
      },
      {
        database: database as never,
        now: () => new Date("2026-08-12T10:00:00.000Z"),
      },
    );

    expect(collection).toHaveBeenCalledWith(AI_USAGE_EVENTS_COLLECTION);
    expect(doc).toHaveBeenCalledWith();
    expect(set).toHaveBeenCalledWith({
      operation: "action_plan_generation",
      subject_hash: "a".repeat(64),
      model: "openai/gpt-5-mini",
      duration_ms: 1_234,
      input_tokens: 1_000,
      output_tokens: 700,
      total_tokens: 1_700,
      request_count: 2,
      repair_count: 1,
      created_at: "2026-08-12T10:00:00.000Z",
    });
    const storedKeys = Object.keys(set.mock.calls[0]?.[0] ?? {});
    expect(storedKeys).not.toContain("prompt");
    expect(storedKeys).not.toContain("situation");
    expect(storedKeys).not.toContain("content");
    expect(storedKeys).not.toContain("plan");
  });
});
