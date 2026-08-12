import type {
  ActionPlan,
  ActionPlanAction,
  ActionPlanSupportType,
} from "@/lib/action-plan-contract";

export type ActionPlanQualityIssueCode =
  | "duplicate_action"
  | "missing_required_support"
  | "missing_plan_support"
  | "repeated_support"
  | "unrealistic_seven_day_claim";

export type ActionPlanQualityIssue = {
  code: ActionPlanQualityIssueCode;
  actionId?: string;
};

const SUPPORT_RULES: ReadonlyArray<{
  pattern: RegExp;
  allowedTypes: readonly ActionPlanSupportType[];
}> = [
  {
    pattern:
      /\b(contact|prospect|relanc|message|email|e-mail|courriel|appel|invitation|recommandation)\w*/,
    allowedTypes: ["message", "email", "script"],
  },
  {
    pattern:
      /\b(audit|verif|control|diagnosti|analys|evalu|revue|checklist|inventair)\w*/,
    allowedTypes: ["checklist", "table", "template"],
  },
  {
    pattern:
      /\b(organis|pilot|suiv|planif|rituel|tableau|process|procedur|prioris)\w*/,
    allowedTypes: ["table", "checklist", "template"],
  },
  {
    pattern: /\b(offre|contenu|publication|brief|proposition|argumentaire)\w*/,
    allowedTypes: ["brief", "template", "checklist"],
  },
] as const;

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getActionText(action: ActionPlanAction) {
  return normalizeText(
    [action.title, action.objective, action.channelOrTool].join(" "),
  );
}

export function getExpectedSupportTypes(
  action: ActionPlanAction,
): readonly ActionPlanSupportType[] | null {
  const actionText = getActionText(action);
  return (
    SUPPORT_RULES.find(({ pattern }) => pattern.test(actionText))?.allowedTypes ??
    null
  );
}

function supportRepeatsSteps(action: ActionPlanAction) {
  if (!action.support) return false;

  const support = normalizeText(action.support.content);
  const steps = action.steps.map(normalizeText).filter(Boolean);
  const joinedSteps = normalizeText(action.steps.join(" "));

  return (
    support === joinedSteps ||
    (steps.length > 0 &&
      steps.every((step) => support.includes(step)) &&
      support.length <= joinedSteps.length + 40)
  );
}

function containsUnrealisticSevenDayClaim(plan: ActionPlan) {
  const strategyValues = Object.values(plan.strategy).flatMap((pillar) =>
    Object.values(pillar),
  );
  const text = normalizeText(
    [
      plan.summary,
      ...plan.actions.flatMap((action) => [
        action.title,
        action.objective,
        ...action.steps,
      ]),
      ...strategyValues,
    ].join(" "),
  );

  const claimsOneWeek =
    /\b(en|sous|dans) (les )?(7|sept) jours\b/.test(text) ||
    /\b(en|sous|dans) une semaine\b/.test(text) ||
    /\bd ici (7|sept) jours\b/.test(text);
  const promisesFullTransformation =
    /\b(transform|resoud|regl|garanti|total|complet|rentab)\w*/.test(text) ||
    /\b(sera|deviendra) autonome\b/.test(text) ||
    /\brendre\b.{0,100}\b(moins )?dependan\w*/.test(text) ||
    /\bne dependra plus\b/.test(text);

  return claimsOneWeek && promisesFullTransformation;
}

export function validateActionPlanQuality(plan: ActionPlan) {
  const issues: ActionPlanQualityIssue[] = [];
  const seenTitles = new Set<string>();

  for (const action of plan.actions) {
    const normalizedTitle = normalizeText(action.title);
    if (seenTitles.has(normalizedTitle)) {
      issues.push({ code: "duplicate_action", actionId: action.id });
    }
    seenTitles.add(normalizedTitle);

    const expectedSupportTypes = getExpectedSupportTypes(action);
    if (
      expectedSupportTypes &&
      (!action.support || !expectedSupportTypes.includes(action.support.type))
    ) {
      issues.push({ code: "missing_required_support", actionId: action.id });
    }

    if (supportRepeatsSteps(action)) {
      issues.push({ code: "repeated_support", actionId: action.id });
    }
  }

  if (!plan.actions.some(({ support }) => support !== null)) {
    issues.push({ code: "missing_plan_support" });
  }

  if (containsUnrealisticSevenDayClaim(plan)) {
    issues.push({ code: "unrealistic_seven_day_claim" });
  }

  return issues;
}
