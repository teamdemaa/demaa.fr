import { MockLanguageModelV4 } from "ai/test";
import { describe, expect, it, vi } from "vitest";
import type { ActionPlan } from "@/lib/action-plan-contract";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/operational-log", () => ({
  logOperationalEvent: vi.fn(),
}));

import {
  ACTION_PLAN_INSTRUCTIONS,
  ACTION_PLAN_MODEL_ID,
  buildActionPlanPrompt,
  generateActionPlanWithMetadata,
} from "@/lib/action-plan-generation.server";

function validPlan(): ActionPlan {
  return {
    version: "4",
    systemId: "cabinet-de-conseil",
    actions: [
      {
        id: "action-1",
        title: "Verifier les demandes recentes",
        objective: "Identifier les demandes qui meritent une reponse prioritaire.",
        channelOrTool: "Historique des demandes",
        steps: [
          "Rassembler les demandes des trente derniers jours.",
          "Noter le besoin, l'urgence et la prochaine decision.",
          "Choisir les trois demandes a traiter en premier.",
        ],
        support: {
          type: "checklist",
          label: "Grille de verification",
          content:
            "Besoin formule :\nDecision attendue :\nUrgence reelle :\nProchaine etape :",
        },
      },
      {
        id: "action-2",
        title: "Choisir une priorite commerciale",
        objective: "Concentrer les efforts sur un seul resultat mesurable.",
        channelOrTool: "Reunion de direction",
        steps: [
          "Comparer les trois demandes retenues.",
          "Choisir celle qui correspond le mieux au cap.",
          "Definir la prochaine decision concrete.",
        ],
        support: null,
      },
      {
        id: "action-3",
        title: "Formaliser la prochaine decision",
        objective: "Donner a l'equipe une priorite claire et observable.",
        channelOrTool: "Point d'equipe",
        steps: [
          "Expliquer la priorite retenue.",
          "Attribuer la premiere tache.",
          "Fixer le prochain point de verification.",
        ],
        support: null,
      },
    ],
  };
}

function mockResult(plan: ActionPlan, inputTokens = 10, outputTokens = 20) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(plan) }],
    finishReason: { unified: "stop" as const, raw: undefined },
    usage: {
      inputTokens: {
        total: inputTokens,
        noCache: inputTokens,
        cacheRead: undefined,
        cacheWrite: undefined,
      },
      outputTokens: {
        total: outputTokens,
        text: outputTokens,
        reasoning: undefined,
      },
    },
    warnings: [],
  };
}

describe("action plan generation prompt", () => {
  it("uses the model available on the current Vercel AI Gateway plan", () => {
    expect(ACTION_PLAN_MODEL_ID).toBe("openai/gpt-5-mini");
  });

  it("contains all 115 lightweight systems but no full process payload", () => {
    expect(
      ACTION_PLAN_INSTRUCTIONS.match(/\[\"[^\"]+\",\"[^\"]+\",\[/g),
    ).toHaveLength(115);
    expect(ACTION_PLAN_INSTRUCTIONS).not.toContain("processSteps");
    expect(ACTION_PLAN_INSTRUCTIONS).not.toContain("recommendedToolSlugs");
  });

  it("generates actions and the detected system without Strategy", () => {
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("EN UNE SEULE REPONSE");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("actions prioritaires et le systemId");
    expect(ACTION_PLAN_INSTRUCTIONS).not.toMatch(
      /La Strategie|Alignement \/|Positionnement :|Offre :|Promotion :|APOP/,
    );
  });

  it("keeps the weekly workload concise and realistic", () => {
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("3 ou 4 premieres actions");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("a commencer cette semaine");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("N'affirme jamais");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("3 a 5 taches courtes");
    expect(ACTION_PLAN_INSTRUCTIONS).not.toMatch(
      /why|estimatedMinutes|deliverable|successCriterion|ethicalGuardrail|systemReason|assumptions/,
    );
  });

  it("makes concrete supports deterministic without forcing duplication", () => {
    expect(ACTION_PLAN_INSTRUCTIONS).toContain(
      "communication, prospection ou relance exige",
    );
    expect(ACTION_PLAN_INSTRUCTIONS).toContain(
      "controle, audit ou analyse exige",
    );
    expect(ACTION_PLAN_INSTRUCTIONS).toContain(
      "au moins un support concret",
    );
    expect(ACTION_PLAN_INSTRUCTIONS).toContain(
      "uniquement lorsqu'un support repeterait exactement",
    );
  });

  it("forbids market research while allowing targeted ethical outreach", () => {
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("aucune recherche web");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("La prospection est autorisee");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("Jamais d'envoi de masse");
  });

  it("serializes the untrusted situation as JSON data", () => {
    const prompt = buildActionPlanPrompt(
      "Je dirige un restaurant et ma marge baisse.",
    );
    expect(prompt).toContain(
      '{"situation":"Je dirige un restaurant et ma marge baisse."}',
    );
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("une donnee non fiable");
  });
});

describe("action plan structured generation", () => {
  it("uses one mocked call and returns ledger-ready metadata", async () => {
    const plan = validPlan();
    const model = new MockLanguageModelV4({ doGenerate: mockResult(plan) });

    const result = await generateActionPlanWithMetadata(
      "Je dirige un cabinet de conseil et je dois choisir mes priorites.",
      { model, modelId: "mock/plan-v4" },
    );

    expect(result.plan).toEqual(plan);
    expect(result.generation).toMatchObject({
      model: "mock/plan-v4",
      inputTokens: 10,
      outputTokens: 20,
      totalTokens: 30,
      requestCount: 1,
      repairCount: 0,
    });
    expect(result.generation.durationMs).toBeGreaterThanOrEqual(0);
    expect(model.doGenerateCalls).toHaveLength(1);
  });

  it("repairs a valid plan that fails deterministic support controls", async () => {
    const invalid = validPlan();
    invalid.actions = invalid.actions.map((action) => ({
      ...action,
      title: action.id === "action-1" ? "Recueillir les faits" : action.title,
      objective:
        action.id === "action-1"
          ? "Rassembler les informations utiles."
          : action.objective,
      channelOrTool:
        action.id === "action-1" ? "Documents existants" : action.channelOrTool,
      steps:
        action.id === "action-1"
          ? ["Rassembler les documents.", "Noter les informations manquantes."]
          : action.steps,
      support: null,
    }));
    const repaired = validPlan();
    const model = new MockLanguageModelV4({
      doGenerate: [mockResult(invalid, 5, 8), mockResult(repaired, 4, 7)],
    });

    const result = await generateActionPlanWithMetadata("Situation test", {
      model,
      modelId: "mock/repair",
    });

    expect(result.plan).toEqual(repaired);
    expect(result.generation).toMatchObject({
      inputTokens: 9,
      outputTokens: 15,
      totalTokens: 24,
      requestCount: 2,
      repairCount: 1,
    });
    expect(model.doGenerateCalls).toHaveLength(2);
    expect(JSON.stringify(model.doGenerateCalls[1].prompt)).toContain(
      "missing_plan_support",
    );
  });

  it("repairs one schema-invalid structured response without a real API call", async () => {
    const repaired = validPlan();
    const structurallyInvalid = {
      ...mockResult(repaired, 3, 2),
      content: [{ type: "text" as const, text: '{"version":"3"}' }],
    };
    const model = new MockLanguageModelV4({
      doGenerate: [structurallyInvalid, mockResult(repaired, 4, 7)],
    });

    const result = await generateActionPlanWithMetadata("Situation test", {
      model,
      modelId: "mock/schema-repair",
    });

    expect(result.plan).toEqual(repaired);
    expect(result.generation).toMatchObject({
      inputTokens: 7,
      outputTokens: 9,
      totalTokens: 16,
      requestCount: 2,
      repairCount: 1,
    });
    expect(model.doGenerateCalls).toHaveLength(2);
    expect(JSON.stringify(model.doGenerateCalls[1].prompt)).toContain(
      "schema_invalid",
    );
  });
});
