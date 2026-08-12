import { MockLanguageModelV4 } from "ai/test";
import { describe, expect, it, vi } from "vitest";
import type { ActionPlan } from "@/lib/action-plan-contract";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import { createActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

vi.mock("server-only", () => ({}));

import {
  ACTION_PLAN_COMMAND_EXTERNAL_GENERATION_ENABLED,
  buildActionPlanCommandMinimalEnvelope,
  generateActionPlanCommand,
} from "@/lib/action-plan-command.server";

const systemId = actionPlanSystemOptions[0]?.id;
if (!systemId) throw new Error("Missing action plan system fixture.");

function plan(): ActionPlan {
  return {
    version: "3",
    summary: "Un plan simple.",
    systemId,
    actions: [1, 2, 3].map((index) => ({
      id: `action-${index}` as `action-${1 | 2 | 3}`,
      title: `Action ${index}`,
      objective: "Obtenir un resultat observable.",
      channelOrTool: "Document de suivi",
      steps: ["Preparer.", "Verifier."],
      support: null,
      strategyPillar: "alignement" as const,
    })),
    strategy: {
      alignment: {
        direction: "Une entreprise pilotable.",
        startingPoint: "Une priorite reste a choisir.",
        decisionRules: "Finir avant d'ajouter.",
      },
      positioning: {
        preciseCustomer: "Un client precis.",
        importantProblem: "Un probleme important.",
        evidenceAndAlternatives: "Une verification terrain.",
      },
      offer: {
        promisedOutcome: "Un resultat clair.",
        scope: "Un perimetre clair.",
        priceCommitmentAndRisk: "Un engagement a clarifier.",
      },
      promotion: {
        attract: "Attirer utilement.",
        facilitatePurchase: "Faciliter la decision.",
        retainAndStrengthen: "Tenir la promesse.",
      },
    },
  };
}

describe("action plan command external envelope", () => {
  it("is enabled after explicit minimal data-transfer consent", () => {
    expect(ACTION_PLAN_COMMAND_EXTERNAL_GENERATION_ENABLED).toBe(true);
  });

  it("contains only the command and effective visible plan fields", () => {
    const currentPlan = plan();
    const workspace = createActionPlanWorkspaceState(currentPlan);
    workspace.tasks["action-1"]!.notes =
      "Note personnelle strictement confidentielle.";
    workspace.tasks["action-1"]!.overrides.title = "Titre effectivement visible";
    workspace.selectedSolutionPlacementIdsBySystem[systemId] = [
      "placement-secret",
    ];

    const envelope = buildActionPlanCommandMinimalEnvelope(
      "Rends la premiere action plus claire",
      currentPlan,
      workspace,
    );
    const serialized = JSON.stringify(envelope);

    expect(envelope.currentPlan.actions[0]?.title).toBe(
      "Titre effectivement visible",
    );
    expect(serialized).toContain("Rends la premiere action plus claire");
    expect(serialized).not.toContain("Note personnelle");
    expect(serialized).not.toContain("placement-secret");
    expect(serialized).not.toContain(systemId);
    expect(serialized).not.toMatch(/email|owner|session|notes/i);
  });

  it("generates allowlisted operations and assigns local custom IDs", async () => {
    const generated = {
      operations: [
        {
          type: "addAction",
          actionId: null,
          action: {
            title: "Verifier le prochain besoin",
            objective: "Obtenir un fait avant de decider.",
            channelOrTool: "Entretien client",
            steps: ["Choisir un client.", "Noter sa reponse."],
            support: null,
            strategyPillar: "positionnement",
          },
          changes: null,
          pillar: null,
          answer: null,
          value: null,
        },
        {
          type: "updateAction",
          actionId: "action-1",
          action: null,
          changes: {
            title: "Clarifier la priorite",
            objective: null,
            steps: null,
            supportMode: "keep",
            support: null,
          },
          pillar: null,
          answer: null,
          value: null,
        },
      ],
    };
    const model = new MockLanguageModelV4({
      doGenerate: {
        content: [{ type: "text", text: JSON.stringify(generated) }],
        finishReason: { unified: "stop", raw: undefined },
        usage: {
          inputTokens: {
            total: 120,
            noCache: 120,
            cacheRead: undefined,
            cacheWrite: undefined,
          },
          outputTokens: { total: 40, text: 40, reasoning: undefined },
        },
        warnings: [],
      },
    });
    const currentPlan = plan();
    const result = await generateActionPlanCommand(
      "Ajoute une verification et clarifie la premiere action",
      currentPlan,
      createActionPlanWorkspaceState(currentPlan),
      {
        model,
        modelId: "mock/command",
        createId: () => "command-test",
      },
    );

    expect(result.operations).toEqual([
      expect.objectContaining({
        type: "addAction",
        action: expect.objectContaining({ id: "custom-command-test" }),
      }),
      {
        type: "updateAction",
        actionId: "action-1",
        changes: { title: "Clarifier la priorite" },
      },
    ]);
    expect(result.generation).toMatchObject({
      model: "mock/command",
      inputTokens: 120,
      outputTokens: 40,
      totalTokens: 160,
      requestCount: 1,
    });
  });
});
