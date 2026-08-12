import type {
  ActionPlanStrategyPillar,
  ActionPlanSupportType,
  PersistableActionPlan,
} from "@/lib/action-plan-contract";

export type ActionPlanViewAction = {
  id: string;
  title: string;
  objective: string;
  channelOrTool: string;
  steps: string[];
  support: {
    type: ActionPlanSupportType | null;
    label: string;
    content: string;
  } | null;
  strategyPillar: ActionPlanStrategyPillar;
};

export type ActionPlanStrategyViewField = {
  key: string;
  label: string;
  value: string;
};

export type ActionPlanStrategyViewSection = {
  key: "alignment" | "positioning" | "offer" | "promotion";
  overrideKey: ActionPlanStrategyPillar;
  label: string;
  fields: readonly ActionPlanStrategyViewField[];
};

export function getActionPlanActions(
  plan: PersistableActionPlan,
): ActionPlanViewAction[] {
  if (plan.version === "3") {
    return plan.actions.map((action) => ({ ...action }));
  }

  return plan.weeklyActions.map((action) => ({
    id: action.id,
    title: action.title,
    objective: action.objective,
    channelOrTool: action.channelOrTool,
    steps: [...action.steps],
    support: action.readyToUse
      ? { type: null, label: action.readyToUse.label, content: action.readyToUse.content }
      : null,
    strategyPillar: action.strategyPillar,
  }));
}

/** Stable IDs for generated/manual actions plus workspace additions. */
export function getAllActionPlanActionIds(
  plan: PersistableActionPlan,
  addedActions: readonly { id: string }[] = [],
) {
  return [...new Set([
    ...getActionPlanActions(plan).map(({ id }) => id),
    ...addedActions.map(({ id }) => id),
  ])];
}

export function getActionPlanStrategyFields(
  plan: PersistableActionPlan,
): readonly ActionPlanStrategyViewSection[] {
  if (plan.version === "3") {
    return [
      {
        key: "alignment",
        overrideKey: "alignement",
        label: "Alignement",
        fields: [
          { key: "direction", label: "Le cap", value: plan.strategy.alignment.direction },
          { key: "startingPoint", label: "Le point de départ", value: plan.strategy.alignment.startingPoint },
          { key: "decisionRules", label: "Les règles de décision", value: plan.strategy.alignment.decisionRules },
        ],
      },
      {
        key: "positioning",
        overrideKey: "positionnement",
        label: "Positionnement",
        fields: [
          { key: "preciseCustomer", label: "Le client précis", value: plan.strategy.positioning.preciseCustomer },
          { key: "importantProblem", label: "Le problème important", value: plan.strategy.positioning.importantProblem },
          { key: "evidenceAndAlternatives", label: "Les preuves et les alternatives", value: plan.strategy.positioning.evidenceAndAlternatives },
        ],
      },
      {
        key: "offer",
        overrideKey: "offre",
        label: "Offre",
        fields: [
          { key: "promisedOutcome", label: "Le résultat proposé", value: plan.strategy.offer.promisedOutcome },
          { key: "scope", label: "Le périmètre", value: plan.strategy.offer.scope },
          { key: "priceCommitmentAndRisk", label: "Le prix, l’engagement et le risque", value: plan.strategy.offer.priceCommitmentAndRisk },
        ],
      },
      {
        key: "promotion",
        overrideKey: "promotion",
        label: "Promotion",
        fields: [
          { key: "attract", label: "Attirer", value: plan.strategy.promotion.attract },
          { key: "facilitatePurchase", label: "Faciliter l’achat", value: plan.strategy.promotion.facilitatePurchase },
          { key: "retainAndStrengthen", label: "Fidéliser et renforcer", value: plan.strategy.promotion.retainAndStrengthen },
        ],
      },
    ];
  }

  return [
    {
      key: "alignment",
      overrideKey: "alignement",
      label: "Alignement",
      fields: [
        { key: "desiredCompany", label: "L’entreprise que vous voulez construire", value: plan.strategy.alignment.desiredCompany },
        { key: "boundariesAndValues", label: "Vos limites et vos valeurs", value: plan.strategy.alignment.boundariesAndValues },
        { key: "prioritiesAndTradeoffs", label: "Vos priorités et vos renoncements", value: plan.strategy.alignment.prioritiesAndTradeoffs },
      ],
    },
    {
      key: "positioning",
      overrideKey: "positionnement",
      label: "Positionnement",
      fields: [
        { key: "preciseCustomer", label: "Le client précis", value: plan.strategy.positioning.preciseCustomer },
        { key: "importantProblem", label: "Le problème important", value: plan.strategy.positioning.importantProblem },
        { key: "evidenceAndAlternatives", label: "Les preuves et les alternatives", value: plan.strategy.positioning.evidenceAndAlternatives },
      ],
    },
    {
      key: "offer",
      overrideKey: "offre",
      label: "Offre",
      fields: [
        { key: "promisedOutcome", label: "Le résultat proposé", value: plan.strategy.offer.promisedOutcome },
        { key: "scope", label: "Le périmètre", value: plan.strategy.offer.scope },
        { key: "priceCommitmentAndRisk", label: "Le prix, l’engagement et le risque", value: plan.strategy.offer.priceCommitmentAndRisk },
      ],
    },
    {
      key: "promotion",
      overrideKey: "promotion",
      label: "Promotion",
      fields: [
        { key: "attract", label: "Attirer", value: plan.strategy.promotion.attract },
        { key: "facilitatePurchase", label: "Faciliter l’achat", value: plan.strategy.promotion.facilitatePurchase },
        { key: "retainAndStrengthen", label: "Fidéliser et renforcer", value: plan.strategy.promotion.retainAndStrengthen },
      ],
    },
  ];
}
