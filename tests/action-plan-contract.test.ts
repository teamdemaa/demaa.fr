import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  actionPlanSchema,
  compatibleActionPlanSchema,
  type ActionPlan,
} from "@/lib/action-plan-contract";
import {
  actionPlanSystemOptions,
  isActionPlanSystemId,
} from "@/lib/action-plan-system-catalog";

function action(index: number): ActionPlan["weeklyActions"][number] {
  return {
    id: `action-${index}`,
    title: `Action ${index}`,
    objective: "Obtenir un resultat observable cette semaine.",
    channelOrTool: "Tableau de suivi",
    steps: ["Preparer les informations utiles.", "Realiser puis consigner le resultat."],
    readyToUse: null,
    strategyPillar: "alignement",
  };
}

function validPlan(): ActionPlan {
  return {
    version: "2",
    summary: "Le dirigeant doit clarifier sa priorite puis la traduire en actions simples.",
    systemId: "cabinet-comptable",
    systemReason: "La situation concerne le pilotage d'un cabinet comptable.",
    weeklyActions: [action(1), action(2), action(3)],
    strategy: {
      alignment: {
        headline: "Choisir un cap tenable.",
        desiredCompany: "Un cabinet rentable qui ne repose pas sur une seule personne.",
        boundariesAndValues: "Preserver la qualite et des horaires soutenables.",
        prioritiesAndTradeoffs: "Prioriser la fiabilite avant de multiplier les offres.",
      },
      positioning: {
        headline: "Servir une cible precise.",
        preciseCustomer: "Des TPE de services avec une equipe reduite.",
        importantProblem: "Le suivi des echeances et des demandes dispersees.",
        evidenceAndAlternatives: "Verifier les irritants dans les dossiers recents et les solutions deja utilisees.",
      },
      offer: {
        headline: "Rendre le resultat lisible.",
        promisedOutcome: "Des dossiers suivis avec une prochaine action claire.",
        scope: "Cadrage, mise en place et routine de suivi.",
        priceCommitmentAndRisk: "Clarifier le perimetre et les limites avant tout engagement.",
      },
      promotion: {
        headline: "Faire connaitre l'offre sans forcer.",
        attract: "Publier une preuve utile issue d'un cas reel autorise.",
        facilitatePurchase: "Expliquer le parcours et le resultat attendu.",
        retainAndStrengthen: "Organiser un point de suivi simple apres la livraison.",
      },
    },
    assumptions: ["Le cabinet est deja en activite."],
  };
}

describe("action plan contract", () => {
  it("derives a lightweight catalog of exactly 115 unique systems", () => {
    expect(actionPlanSystemOptions).toHaveLength(115);
    expect(new Set(actionPlanSystemOptions.map(({ id }) => id)).size).toBe(115);
    expect(actionPlanSystemOptions[0]).toEqual({
      id: expect.any(String),
      label: expect.any(String),
      aliases: expect.any(Array),
    });
    expect(Object.keys(actionPlanSystemOptions[0] ?? {})).toEqual([
      "id",
      "label",
      "aliases",
    ]);
  });

  it("accepts the complete strict plan and a known system", () => {
    expect(actionPlanSchema.parse(validPlan())).toEqual(validPlan());
    expect(isActionPlanSystemId("cabinet-comptable")).toBe(true);
  });

  it("exposes the 115 identifiers to structured-output providers as an enum", () => {
    const jsonSchema = JSON.stringify(z.toJSONSchema(actionPlanSchema));
    expect(jsonSchema).toContain('"cabinet-comptable"');
    expect(jsonSchema).toContain('"additionalProperties":false');
    expect(jsonSchema.match(/cabinet-comptable/g)).toHaveLength(1);
    expect(jsonSchema).not.toMatch(
      /why|estimatedMinutes|deliverable|successCriterion|ethicalGuardrail/,
    );
  });

  it("normalizes already-saved V1 plans without legacy action fields", () => {
    const current = validPlan();
    const legacy = {
      ...current,
      version: "1",
      weeklyActions: current.weeklyActions.map((item) => ({
        ...item,
        why: "Ancienne justification.",
        estimatedMinutes: 45,
        deliverable: "Ancien livrable.",
        successCriterion: "Ancien critere.",
        ethicalGuardrail: "Ancien garde-fou.",
      })),
    };

    expect(compatibleActionPlanSchema.parse(legacy)).toEqual(current);
  });

  it("rejects an unknown system, fewer than three actions and extra fields", () => {
    expect(
      actionPlanSchema.safeParse({ ...validPlan(), systemId: "metier-invente" }).success,
    ).toBe(false);
    expect(
      actionPlanSchema.safeParse({ ...validPlan(), weeklyActions: [action(1), action(2)] }).success,
    ).toBe(false);
    expect(
      actionPlanSchema.safeParse({ ...validPlan(), internalNotes: "secret" }).success,
    ).toBe(false);
  });

  it("rejects non-consecutive action identifiers", () => {
    const plan = validPlan();
    plan.weeklyActions[1] = { ...plan.weeklyActions[1], id: "action-3" };
    expect(actionPlanSchema.safeParse(plan).success).toBe(false);
  });

  it("allows a longer week when every action is necessary", () => {
    const plan = validPlan();
    plan.weeklyActions = [1, 2, 3, 4, 5, 6].map(action);
    expect(actionPlanSchema.safeParse(plan).success).toBe(true);
  });
});
