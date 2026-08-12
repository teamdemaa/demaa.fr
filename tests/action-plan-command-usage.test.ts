import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  AI_USAGE_EVENTS_COLLECTION,
  recordAiUsage,
} from "@/lib/ai-usage-ledger.server";

describe("action plan command usage ledger", () => {
  it("records command metering without command or plan content", async () => {
    const set = vi.fn().mockResolvedValue(undefined);
    const doc = vi.fn(() => ({ set }));
    const collection = vi.fn(() => ({ doc }));

    await recordAiUsage(
      {
        operation: "action_plan_command",
        subjectHash: "c".repeat(64),
        model: "openai/gpt-5-mini",
        durationMs: 420,
        inputTokens: 300,
        outputTokens: 90,
        totalTokens: 390,
        requestCount: 1,
        repairCount: 0,
      },
      {
        database: { collection } as never,
        now: () => new Date("2026-08-12T10:30:00.000Z"),
      },
    );

    expect(collection).toHaveBeenCalledWith(AI_USAGE_EVENTS_COLLECTION);
    const stored = set.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(stored).toMatchObject({
      operation: "action_plan_command",
      duration_ms: 420,
      input_tokens: 300,
      output_tokens: 90,
      total_tokens: 390,
      request_count: 1,
      repair_count: 0,
    });
    expect(stored).not.toHaveProperty("command");
    expect(stored).not.toHaveProperty("prompt");
    expect(stored).not.toHaveProperty("plan");
    expect(stored).not.toHaveProperty("workspace");
  });
});
