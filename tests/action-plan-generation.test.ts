import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  ACTION_PLAN_INSTRUCTIONS,
  ACTION_PLAN_MODEL_ID,
  buildActionPlanPrompt,
} from "@/lib/action-plan-generation.server";

describe("action plan generation prompt", () => {
  it("uses the model available on the current Vercel AI Gateway plan", () => {
    expect(ACTION_PLAN_MODEL_ID).toBe("openai/gpt-5-mini");
  });

  it("contains all 115 lightweight systems but no full process payload", () => {
    expect(ACTION_PLAN_INSTRUCTIONS.match(/\[\"[^\"]+\",\"[^\"]+\",\[/g)).toHaveLength(115);
    expect(ACTION_PLAN_INSTRUCTIONS).not.toContain("processSteps");
    expect(ACTION_PLAN_INSTRUCTIONS).not.toContain("recommendedToolSlugs");
  });

  it("keeps the weekly workload concise and realistic", () => {
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("3 ou 4 premieres actions");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("a commencer cette semaine");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("N'affirme jamais");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("3 a 5 etapes courtes");
    expect(ACTION_PLAN_INSTRUCTIONS).not.toMatch(
      /why|estimatedMinutes|livrables|criteres de reussite|garde-fous/,
    );
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
