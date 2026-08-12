export type AiGenerationMetadata = {
  model: string;
  durationMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
  totalTokens: number | null;
  requestCount: number;
  repairCount: number;
};

export type PersistedAiGenerationMetadata = Pick<
  AiGenerationMetadata,
  "model" | "inputTokens" | "outputTokens" | "totalTokens"
>;

export function toPersistedAiGenerationMetadata(
  generation: AiGenerationMetadata | null,
): PersistedAiGenerationMetadata | undefined {
  if (!generation) return undefined;
  return {
    model: generation.model,
    inputTokens: generation.inputTokens,
    outputTokens: generation.outputTokens,
    totalTokens: generation.totalTokens,
  };
}
