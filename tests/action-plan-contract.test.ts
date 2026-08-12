import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  actionPlanSchema,
  compatibleActionPlanSchema,
  legacyV2ActionPlanSchema,
  type ActionPlan,
  type LegacyV3ActionPlan,
  type LegacyV2ActionPlan,
} from "@/lib/action-plan-contract";
import {
  actionPlanSystemOptions,
  isActionPlanSystemId,
} from "@/lib/action-plan-system-catalog";
import {
  getActionPlanActions,
  getActionPlanStrategyFields,
} from "@/lib/action-plan-view-model";

function action(index: number): ActionPlan["actions"][number] {
  return {
    id: `action-${index}` as ActionPlan["actions"][number]["id"],
    title: `Action ${index}`,
    objective: "Obtenir un résultat observable cette semaine.",
    channelOrTool: "Tableau de suivi",
    steps: ["Préparer les informations utiles.", "Réaliser puis consigner le résultat."],
    support: index === 1 ? {
      type: "checklist",
      label: "Checklist de contrôle",
      content: "1. Préparer\n2. Vérifier",
    } : null,
  };
}

function validPlan(): ActionPlan {
  return {
    version: "4",
    systemId: "cabinet-comptable",
    actions: [action(1), action(2), action(3)],
  };
}

function validV3Plan(): LegacyV3ActionPlan {
  return {
    version: "3",
    summary: "Le dirigeant doit clarifier sa priorité puis agir simplement.",
    systemId: "cabinet-comptable",
    actions: validPlan().actions.map((item) => ({
      ...item,
      strategyPillar: "alignement",
    })),
    strategy: {
      alignment: {
        direction: "Construire un cabinet rentable et pilotable.",
        startingPoint: "Une petite équipe et des demandes encore dispersées.",
        decisionRules: "Privilégier la fiabilité avant de multiplier les offres.",
      },
      positioning: {
        preciseCustomer: "Des TPE de services avec une équipe réduite.",
        importantProblem: "Le suivi des échéances et des demandes dispersées.",
        evidenceAndAlternatives: "Vérifier les irritants dans les dossiers récents.",
      },
      offer: {
        promisedOutcome: "Des dossiers suivis avec une prochaine action claire.",
        scope: "Cadrage, mise en place et routine de suivi.",
        priceCommitmentAndRisk: "Clarifier le périmètre avant tout engagement.",
      },
      promotion: {
        attract: "Partager une preuve utile issue d’un cas réel autorisé.",
        facilitatePurchase: "Expliquer le parcours et le résultat attendu.",
        retainAndStrengthen: "Organiser un point de suivi simple après la livraison.",
      },
    },
  };
}

function validV2Plan(): LegacyV2ActionPlan {
  return legacyV2ActionPlanSchema.parse({
    version: "2",
    summary: "Plan historique.",
    systemId: "cabinet-comptable",
    systemReason: "Raison historique.",
    weeklyActions: [1, 2, 3].map((index) => ({
      id: `action-${index}`,
      title: `Action ${index}`,
      objective: "Objectif historique.",
      channelOrTool: "Outil historique",
      steps: ["Étape une.", "Étape deux."],
      readyToUse: index === 1
        ? { label: "Support historique", content: "Contenu historique" }
        : null,
      strategyPillar: "alignement",
    })),
    strategy: {
      alignment: {
        headline: "Cap historique",
        desiredCompany: "Entreprise historique",
        boundariesAndValues: "Limites historiques",
        prioritiesAndTradeoffs: "Priorités historiques",
      },
      positioning: {
        headline: "Positionnement historique",
        preciseCustomer: "Client historique",
        importantProblem: "Problème historique",
        evidenceAndAlternatives: "Preuves historiques",
      },
      offer: {
        headline: "Offre historique",
        promisedOutcome: "Résultat historique",
        scope: "Périmètre historique",
        priceCommitmentAndRisk: "Conditions historiques",
      },
      promotion: {
        headline: "Promotion historique",
        attract: "Attirer historiquement",
        facilitatePurchase: "Achat historique",
        retainAndStrengthen: "Fidélisation historique",
      },
    },
    assumptions: ["Hypothèse historique"],
  });
}

describe("action plan contract", () => {
  it("derives a lightweight catalog of exactly 115 unique systems", () => {
    expect(actionPlanSystemOptions).toHaveLength(115);
    expect(new Set(actionPlanSystemOptions.map(({ id }) => id)).size).toBe(115);
  });

  it("accepts the strict actions-only V4 plan and typed supports", () => {
    expect(actionPlanSchema.parse(validPlan())).toEqual(validPlan());
    expect(isActionPlanSystemId("cabinet-comptable")).toBe(true);
  });

  it("exposes V4 to structured-output providers without Strategy or retired fields", () => {
    const jsonSchema = JSON.stringify(z.toJSONSchema(actionPlanSchema));
    expect(jsonSchema).toContain('"version"');
    expect(jsonSchema).toContain('"actions"');
    expect(jsonSchema).toContain('"checklist"');
    expect(jsonSchema).not.toMatch(
      /summary|strategy|strategyPillar|weeklyActions|readyToUse|systemReason|assumptions|why|estimatedMinutes|deliverable|successCriterion|ethicalGuardrail/,
    );
  });

  it("reads V3 with its historical Strategy without exposing it as V4", () => {
    const historical = validV3Plan();
    const parsed = compatibleActionPlanSchema.parse(historical);
    expect(parsed).toEqual(historical);
    expect(getActionPlanStrategyFields(parsed)[0]?.fields.map(({ label }) => label)).toEqual([
      "Le cap",
      "Le point de départ",
      "Les règles de décision",
    ]);
  });

  it("reads V2 without relabelling its alignment as V3", () => {
    const historical = validV2Plan();
    const parsed = compatibleActionPlanSchema.parse(historical);
    expect(parsed).toEqual(historical);
    expect(getActionPlanStrategyFields(parsed)[0]?.fields.map(({ label }) => label)).toEqual([
      "L’entreprise que vous voulez construire",
      "Vos limites et vos valeurs",
      "Vos priorités et vos renoncements",
    ]);
    expect(getActionPlanActions(parsed)[0]?.support).toEqual({
      type: null,
      label: "Support historique",
      content: "Contenu historique",
    });
  });

  it("normalizes V1 to its V2 equivalent only in memory", () => {
    const current = validV2Plan();
    const legacy = {
      ...current,
      version: "1",
      weeklyActions: current.weeklyActions.map((item) => ({
        ...item,
        why: "Ancienne justification.",
        estimatedMinutes: 45,
        deliverable: "Ancien livrable.",
        successCriterion: "Ancien critère.",
        ethicalGuardrail: "Ancien garde-fou.",
      })),
    };
    expect(compatibleActionPlanSchema.parse(legacy)).toEqual(current);
  });

  it("rejects an unknown system, fewer than three actions and extra fields", () => {
    expect(actionPlanSchema.safeParse({ ...validPlan(), systemId: "metier-invente" }).success).toBe(false);
    expect(actionPlanSchema.safeParse({ ...validPlan(), actions: [action(1), action(2)] }).success).toBe(false);
    expect(actionPlanSchema.safeParse({ ...validPlan(), internalNotes: "secret" }).success).toBe(false);
  });

  it("rejects non-consecutive IDs and more than five generated actions", () => {
    const plan = validPlan();
    plan.actions[1] = { ...plan.actions[1], id: "action-3" };
    expect(actionPlanSchema.safeParse(plan).success).toBe(false);
    expect(actionPlanSchema.safeParse({
      ...validPlan(),
      actions: [1, 2, 3, 4, 5, 6].map(action),
    }).success).toBe(false);
  });
});
