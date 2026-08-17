import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearActionPlanGenerationDraft,
  createActionPlanGenerationDraft,
  readActionPlanGenerationDraft,
  writeActionPlanGenerationDraft,
} from "@/lib/action-plan-generation-draft.client";

describe("action plan generation draft", () => {
  const values = new Map<string, string>();

  beforeEach(() => {
    values.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-15T20:00:00.000Z"));
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
  });

  it("stores only the raw situation, request ID, creation timestamp and locale context", () => {
    const draft = createActionPlanGenerationDraft(
      "Je dois clarifier les priorités commerciales de mon entreprise.",
      { contentLocaleCode: "en", marketCodeAtCreation: "global-en-beta" },
    );
    writeActionPlanGenerationDraft(draft);
    expect(readActionPlanGenerationDraft()).toEqual(draft);
    expect(JSON.stringify([...values.values()])).not.toContain("plan\"");
    expect(JSON.stringify([...values.values()])).not.toContain("owner_uid");
    expect(readActionPlanGenerationDraft()).toMatchObject({
      contentLocaleCode: "en",
      marketCodeAtCreation: "global-en-beta",
    });
  });

  it("expires and removes an abandoned draft", () => {
    const draft = createActionPlanGenerationDraft(
      "Je dois clarifier les priorités commerciales de mon entreprise.",
    );
    writeActionPlanGenerationDraft(draft);
    vi.advanceTimersByTime(2 * 60 * 60 * 1_000 + 1);
    expect(readActionPlanGenerationDraft()).toBeNull();
    expect(values.size).toBe(0);
  });

  it("clears the draft after activation", () => {
    writeActionPlanGenerationDraft(createActionPlanGenerationDraft(
      "Je dois clarifier les priorités commerciales de mon entreprise.",
    ));
    clearActionPlanGenerationDraft();
    expect(readActionPlanGenerationDraft()).toBeNull();
  });
});
