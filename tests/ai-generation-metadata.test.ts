import { describe, expect, it } from "vitest";
import { toPersistedAiGenerationMetadata } from "@/lib/ai-generation-metadata";

describe("AI generation metadata", () => {
  it("keeps the storage-compatible subset without operational counters", () => {
    expect(
      toPersistedAiGenerationMetadata({
        model: "openai/gpt-5-mini",
        durationMs: 1_200,
        inputTokens: 900,
        outputTokens: 600,
        totalTokens: 1_500,
        requestCount: 2,
        repairCount: 1,
      }),
    ).toEqual({
      model: "openai/gpt-5-mini",
      inputTokens: 900,
      outputTokens: 600,
      totalTokens: 1_500,
    });
  });

  it("omits metadata for manual and demo plans", () => {
    expect(toPersistedAiGenerationMetadata(null)).toBeUndefined();
  });
});
