import { describe, expect, it } from "vitest";
import type { ActionPlan, ActionPlanAction } from "@/lib/action-plan-contract";
import {
  getExpectedSupportTypes,
  validateActionPlanQuality,
} from "@/lib/action-plan-quality";

function action(overrides: Partial<ActionPlanAction> = {}): ActionPlanAction {
  return {
    id: "action-1",
    title: "Verifier le parcours client",
    objective: "Identifier les points qui bloquent une demande.",
    channelOrTool: "Parcours existant",
    steps: ["Tester le parcours.", "Noter chaque point de blocage."],
    support: {
      type: "checklist",
      label: "Checklist de verification",
      content: "Point teste :\nBlocage observe :\nCorrection prioritaire :",
    },
    strategyPillar: "offre",
    ...overrides,
  };
}

function plan(actions: ActionPlanAction[]): ActionPlan {
  return {
    version: "3",
    summary: "Une premiere progression realiste est visee.",
    systemId: "cabinet-de-conseil",
    actions,
    strategy: {
      alignment: {
        direction: "Construire une activite fiable.",
        startingPoint: "Les ressources exactes restent a confirmer.",
        decisionRules: "Proteger la qualite et la marge.",
      },
      positioning: {
        preciseCustomer: "Un dirigeant avec une decision identifiee.",
        importantProblem: "Une decision reste bloquee.",
        evidenceAndAlternatives: "Verifier les faits disponibles.",
      },
      offer: {
        promisedOutcome: "Une prochaine decision claire.",
        scope: "Le besoin prioritaire.",
        priceCommitmentAndRisk: "A confirmer avec le client.",
      },
      promotion: {
        attract: "Recommandations ciblees.",
        facilitatePurchase: "Une prochaine etape simple.",
        retainAndStrengthen: "Un suivi utile et limite.",
      },
    },
  };
}

describe("action plan deterministic quality controls", () => {
  it("maps action families to allowed support types", () => {
    expect(getExpectedSupportTypes(action())).toEqual([
      "checklist",
      "table",
      "template",
    ]);
    expect(
      getExpectedSupportTypes(
        action({
          title: "Relancer un ancien client",
          objective: "Obtenir une reponse sans insister.",
          channelOrTool: "Email",
        }),
      ),
    ).toEqual(["message", "email", "script"]);
  });

  it("detects duplicates, missing supports and support copies", () => {
    const copiedSteps = ["Tester le parcours.", "Noter chaque point de blocage."];
    const issues = validateActionPlanQuality(
      plan([
        action({
          support: {
            type: "checklist",
            label: "Copie",
            content: copiedSteps.join(" "),
          },
          steps: copiedSteps,
        }),
        action({ id: "action-2", support: null }),
        action({
          id: "action-3",
          title: "Relancer un client",
          objective: "Obtenir une reponse ciblee.",
          channelOrTool: "Email",
          support: null,
        }),
      ]),
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        { code: "repeated_support", actionId: "action-1" },
        { code: "duplicate_action", actionId: "action-2" },
        { code: "missing_required_support", actionId: "action-2" },
        { code: "missing_required_support", actionId: "action-3" },
      ]),
    );
  });

  it("rejects full-transformation promises in seven days", () => {
    const candidate = plan([
      action(),
      action({ id: "action-2", title: "Choisir une priorite" }),
      action({ id: "action-3", title: "Faire un premier test" }),
    ]);
    candidate.summary = "L'equipe sera totalement autonome en 7 jours.";

    expect(validateActionPlanQuality(candidate)).toContainEqual({
      code: "unrealistic_seven_day_claim",
    });

    candidate.summary =
      "Plan pragmatique pour rendre l'equipe BTP moins dependante du dirigeant en une semaine.";
    expect(validateActionPlanQuality(candidate)).toContainEqual({
      code: "unrealistic_seven_day_claim",
    });

    candidate.summary =
      "Commencer cette semaine a clarifier les responsabilites de l'equipe.";
    expect(validateActionPlanQuality(candidate)).not.toContainEqual({
      code: "unrealistic_seven_day_claim",
    });
  });
});
