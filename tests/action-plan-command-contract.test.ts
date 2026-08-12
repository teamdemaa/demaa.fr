import { describe, expect, it } from "vitest";
import type { ActionPlan } from "@/lib/action-plan-contract";
import {
  actionPlanCommandDraftSchema,
  actionPlanCommandOperationsSchema,
  applyActionPlanCommandOperations,
} from "@/lib/action-plan-command-contract";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import { createActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

const systemId = actionPlanSystemOptions[0]?.id;
if (!systemId) throw new Error("Missing action plan system fixture.");

function plan(): ActionPlan {
  return {
    version: "3",
    summary: "Un plan concret pour choisir puis executer la prochaine priorite.",
    systemId,
    actions: [1, 2, 3].map((index) => ({
      id: `action-${index}` as `action-${1 | 2 | 3}`,
      title: `Action ${index}`,
      objective: "Obtenir un resultat observable.",
      channelOrTool: "Document de suivi",
      steps: ["Preparer les informations.", "Realiser la premiere verification."],
      support: null,
      strategyPillar: "alignement" as const,
    })),
    strategy: {
      alignment: {
        direction: "Construire une entreprise claire et pilotable.",
        startingPoint: "La prochaine priorite reste a choisir.",
        decisionRules: "Traiter une priorite avant d'en ajouter une autre.",
      },
      positioning: {
        preciseCustomer: "Le client dont le besoin est clairement formule.",
        importantProblem: "Une decision utile reste bloquee.",
        evidenceAndAlternatives: "Verifier les demandes et solutions existantes.",
      },
      offer: {
        promisedOutcome: "Une prochaine etape claire.",
        scope: "Un besoin prioritaire et sa prochaine etape.",
        priceCommitmentAndRisk: "A clarifier avant tout engagement.",
      },
      promotion: {
        attract: "S'appuyer sur les demandes existantes.",
        facilitatePurchase: "Rendre la prochaine etape simple.",
        retainAndStrengthen: "Tenir la promesse et demander un retour.",
      },
    },
  };
}

describe("action plan command contract", () => {
  it("accepts only the four allowlisted draft operation types", () => {
    expect(
      actionPlanCommandDraftSchema.parse({
        operations: [
          {
            type: "updateAction",
            actionId: "action-1",
            changes: { title: "Verifier la priorite" },
          },
          {
            type: "updateStrategyAnswer",
            pillar: "alignement",
            answer: "answerTwo",
            value: "Le point de depart a ete confirme.",
          },
        ],
      }).operations,
    ).toHaveLength(2);

    expect(
      actionPlanCommandDraftSchema.safeParse({
        operations: [{ type: "updateSystem", systemId: "restaurant" }],
      }).success,
    ).toBe(false);
  });

  it("rejects hidden system changes and empty update payloads", () => {
    expect(
      actionPlanCommandDraftSchema.safeParse({
        operations: [
          {
            type: "updateAction",
            actionId: "action-1",
            changes: { systemId: "restaurant" },
          },
        ],
      }).success,
    ).toBe(false);
    expect(
      actionPlanCommandDraftSchema.safeParse({
        operations: [
          { type: "updateAction", actionId: "action-1", changes: {} },
        ],
      }).success,
    ).toBe(false);
  });

  it("applies additions, edits, deletions and strategy answers with an undo snapshot", () => {
    const currentPlan = plan();
    const initial = createActionPlanWorkspaceState(currentPlan);
    const operations = actionPlanCommandOperationsSchema.parse([
      {
        type: "addAction",
        action: {
          id: "custom-command-1",
          title: "Interroger un client",
          objective: "Verifier le besoin avant de decider.",
          channelOrTool: "Telephone",
          steps: ["Choisir un client.", "Noter sa reponse."],
          support: {
            type: "script",
            label: "Questions d'entretien",
            content: "Quel resultat cherchez-vous ?",
          },
          strategyPillar: "positionnement",
        },
      },
      {
        type: "updateAction",
        actionId: "action-1",
        changes: { title: "Verifier la priorite" },
      },
      { type: "deleteAction", actionId: "action-2" },
      {
        type: "updateStrategyAnswer",
        pillar: "alignement",
        answer: "answerTwo",
        value: "Le point de depart est maintenant documente.",
      },
    ]);

    const result = applyActionPlanCommandOperations(
      currentPlan,
      initial,
      operations,
    );

    expect(result.undoSnapshot).toEqual(initial);
    expect(result.workspace).not.toBe(initial);
    expect(result.workspace.addedActions[0]?.id).toBe("custom-command-1");
    expect(result.workspace.tasks["custom-command-1"]).toMatchObject({
      status: "todo",
    });
    expect(result.workspace.tasks["action-1"]?.overrides.title).toBe(
      "Verifier la priorite",
    );
    expect(result.workspace.deletedActionIds).toContain("action-2");
    expect(result.workspace.strategyOverrides.alignement?.answerTwo).toBe(
      "Le point de depart est maintenant documente.",
    );
  });

  it("rejects unknown, deleted or duplicate action references", () => {
    const currentPlan = plan();
    const initial = createActionPlanWorkspaceState(currentPlan);

    expect(() =>
      applyActionPlanCommandOperations(
        currentPlan,
        initial,
        actionPlanCommandOperationsSchema.parse([
          { type: "deleteAction", actionId: "custom-unknown" },
        ]),
      ),
    ).toThrow("Action inconnue");

    expect(() =>
      applyActionPlanCommandOperations(
        currentPlan,
        initial,
        actionPlanCommandOperationsSchema.parse([
          { type: "deleteAction", actionId: "action-1" },
          {
            type: "updateAction",
            actionId: "action-1",
            changes: { title: "Trop tard" },
          },
        ]),
      ),
    ).toThrow("Action deja supprimee");
  });
});
