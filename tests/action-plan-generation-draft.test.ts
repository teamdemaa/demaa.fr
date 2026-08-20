import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearActionPlanGenerationDraft,
  createActionPlanGenerationDraft,
  readActionPlanGenerationDraft,
  writeActionPlanGenerationDraft,
} from "@/lib/action-plan-generation-draft.client";

describe("action plan generation draft", () => {
  const sessionValues = new Map<string, string>();
  const persistentValues = new Map<string, string>();

  beforeEach(() => {
    sessionValues.clear();
    persistentValues.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-15T20:00:00.000Z"));
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => sessionValues.get(key) ?? null,
        removeItem: (key: string) => sessionValues.delete(key),
        setItem: (key: string, value: string) => sessionValues.set(key, value),
      },
      localStorage: {
        getItem: (key: string) => persistentValues.get(key) ?? null,
        removeItem: (key: string) => persistentValues.delete(key),
        setItem: (key: string, value: string) => persistentValues.set(key, value),
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
    expect(JSON.stringify([...sessionValues.values()])).not.toContain("plan\"");
    expect(JSON.stringify([...persistentValues.values()])).not.toContain("owner_uid");
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
    expect(sessionValues.size).toBe(0);
    expect(persistentValues.size).toBe(0);
  });

  it("falls back to short-lived persistent storage after a Google redirect", () => {
    const draft = createActionPlanGenerationDraft(
      "Je dois clarifier les priorités commerciales de mon entreprise.",
    );
    writeActionPlanGenerationDraft(draft);
    sessionValues.clear();
    expect(readActionPlanGenerationDraft()).toEqual(draft);
    clearActionPlanGenerationDraft();
    expect(persistentValues.size).toBe(0);
  });

  it("clears the draft after activation", () => {
    writeActionPlanGenerationDraft(createActionPlanGenerationDraft(
      "Je dois clarifier les priorités commerciales de mon entreprise.",
    ));
    clearActionPlanGenerationDraft();
    expect(readActionPlanGenerationDraft()).toBeNull();
  });
});
