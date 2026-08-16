import { MockLanguageModelV4 } from "ai/test";
import { describe, expect, it, vi } from "vitest";
import type { ActionPlan } from "@/lib/action-plan-contract";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/operational-log", () => ({
  logOperationalEvent: vi.fn(),
}));

import {
  ACTION_PLAN_INSTRUCTIONS,
  ACTION_PLAN_INSTRUCTIONS_EN,
  ACTION_PLAN_MODEL_ID,
  buildActionPlanPrompt,
  generateActionPlanWithMetadata,
  normalizeGeneratedActionPlanTitle,
} from "@/lib/action-plan-generation.server";

function validPlan(): ActionPlan {
  return {
    version: "4",
    systemId: "cabinet-de-conseil",
    actions: [
      {
        id: "action-1",
        title: "Relancer les demandes prioritaires",
        objective: "Obtenir une reponse ciblee sans relance de masse.",
        channelOrTool: "Email",
        steps: [
          "Choisir les trois demandes prioritaires.",
          "Adapter le message au besoin exprime.",
          "Envoyer chaque message individuellement.",
        ],
        support: {
          type: "email",
          label: "Email de relance",
          content:
            "Bonjour, je reviens vers vous au sujet de votre demande. Souhaitez-vous que nous fixions la prochaine etape ?",
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

function mockResult(
  plan: ActionPlan,
  inputTokens = 10,
  outputTokens = 20,
  title: string | null = "Structurer le suivi commercial",
) {
  return {
    content: [{
      type: "text" as const,
      text: JSON.stringify({ title, plan }),
    }],
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
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("un titre court, les actions prioritaires et le systemId");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("3 a 7 mots");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("60 caracteres");
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

  it("limits generated supports to ready-to-send communication", () => {
    expect(ACTION_PLAN_INSTRUCTIONS).toContain(
      "communication, prospection ou relance exige",
    );
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("Ne genere jamais de tableau");
    expect(ACTION_PLAN_INSTRUCTIONS).toContain("Un plan sans support est valide");
    expect(ACTION_PLAN_INSTRUCTIONS).not.toContain("au moins un support concret");
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

  it("uses only the ten published English business-system projections", () => {
    expect(
      ACTION_PLAN_INSTRUCTIONS_EN.match(/\["[^"]+","[^"]+",\[/g),
    ).toHaveLength(10);
    expect(ACTION_PLAN_INSTRUCTIONS_EN).toContain("Web agency");
    expect(ACTION_PLAN_INSTRUCTIONS_EN).toContain("Online training business");
    expect(ACTION_PLAN_INSTRUCTIONS_EN).not.toContain("Cabinet comptable");
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
    expect(result.title).toBe("Structurer le suivi commercial");
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

  it("generates natural English with the shared model and schema", async () => {
    const plan = validPlan();
    plan.systemId = "saas";
    plan.actions = plan.actions.map((action, index) => ({
      ...action,
      title: [
        "Choose one retention priority",
        "Review recent customer signals",
        "Assign the first measurable step",
      ][index] || action.title,
      objective: "Create one observable result this week.",
      channelOrTool: "Team review",
      steps: ["Review the available facts.", "Choose the next action.", "Record the outcome."],
      support: null,
    }));
    const model = new MockLanguageModelV4({
      doGenerate: mockResult(plan, 10, 20, "Improve recurring customer retention"),
    });

    const result = await generateActionPlanWithMetadata(
      "Our SaaS is growing, but retention work still depends on me.",
      {
        contentLocaleCode: "en",
        marketCodeAtCreation: "global-en-beta",
        model,
        modelId: "mock/english-plan-v4",
      },
    );

    expect(result.plan.systemId).toBe("saas");
    expect(result.title).toBe("Improve recurring customer retention");
    expect(model.doGenerateCalls).toHaveLength(1);
    expect(JSON.stringify(model.doGenerateCalls[0]?.prompt)).toContain(
      "Write in clear, concrete, natural English",
    );
  });

  it("normalizes the model title without adding a second request", async () => {
    const plan = validPlan();
    const model = new MockLanguageModelV4({
      doGenerate: mockResult(
        plan,
        10,
        20,
        "Plan d’action pour retrouver une marge rentable rapidement et durablement",
      ),
    });

    const result = await generateActionPlanWithMetadata("Situation test", {
      model,
      modelId: "mock/title-normalization",
    });

    expect(result.title).toBe("Retrouver une marge rentable rapidement et durablement");
    expect(result.title.split(/\s+/)).toHaveLength(7);
    expect(result.title.length).toBeLessThanOrEqual(60);
    expect(model.doGenerateCalls).toHaveLength(1);
  });

  it("falls back deterministically to the first action for an unusable title", () => {
    const plan = validPlan();
    expect(normalizeGeneratedActionPlanTitle(null, plan)).toBe(
      "Relancer les demandes prioritaires",
    );
    expect(normalizeGeneratedActionPlanTitle("Ventes", plan)).toBe(
      "Relancer les demandes prioritaires",
    );
  });

  it("repairs a communication action that lacks its ready-to-send message", async () => {
    const invalid = validPlan();
    invalid.actions = invalid.actions.map((action) => ({
      ...action,
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
      "missing_required_support",
    );
  });

  it("repairs one schema-invalid structured response without a real API call", async () => {
    const repaired = validPlan();
    const structurallyInvalid = {
      ...mockResult(repaired, 3, 2),
      content: [{ type: "text" as const, text: '{"title":null,"plan":{"version":"3"}}' }],
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
