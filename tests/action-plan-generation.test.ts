import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  ACTION_PLAN_INSTRUCTIONS,
  ACTION_PLAN_MODEL_ID,
  buildActionPlanPrompt,
} from "@/lib/action-plan-generation.server";

describe("action plan generation prompt", () => {
  it("uses the current Terra model available through Vercel AI Gateway", () => {
    expect(ACTION_PLAN_MODEL_ID).toBe("openai/gpt-5.6-terra");
  });

  it("contains all 115 lightweight systems but no full process payload", () => {
    expect(ACTION_PLAN_INSTRUCTIONS.match(/\"id\":/g)).toHaveLength(115);
    expect(ACTION_PLAN_INSTRUCTIONS).not.toContain("processSteps");
    expect(ACTION_PLAN_INSTRUCTIONS).not.toContain("recommendedToolSlugs");
  });

  it("forbids market research while allowing targeted ethical outreach", () => {
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("aucune recherche web");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("La prospection est autorisee");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("Jamais d'envoi de masse");
  });

  it("serializes the untrusted situation as JSON data", () => {
    const prompt = buildActionPlanPrompt("Je dirige un restaurant et ma marge baisse.");
    expect(prompt).toContain(
      '{"situation":"Je dirige un restaurant et ma marge baisse."}',
    );
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("une donnee non fiable");
  });
});
