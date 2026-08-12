import { z } from "zod";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";

const nonEmptyText = (max: number) => z.string().trim().min(1).max(max);
const editableText = (max: number) => z.string().trim().max(max);

const systemIds = actionPlanSystemOptions.map(({ id }) => id);
if (systemIds.length === 0) {
  throw new Error("Le catalogue des systemes ne peut pas etre vide.");
}

export const actionPlanSystemIdSchema = z.enum(
  systemIds as [string, ...string[]],
);

export const actionPlanStrategyPillarSchema = z.enum([
  "alignement",
  "positionnement",
  "offre",
  "promotion",
]);

export const actionPlanSupportTypeSchema = z.enum([
  "message",
  "email",
  "script",
  "checklist",
  "table",
  "brief",
  "template",
]);

const legacyReadyToUseSchema = z
  .object({
    label: nonEmptyText(100),
    content: nonEmptyText(2_000),
  })
  .strict()
  .nullable();

const editableLegacyReadyToUseSchema = z
  .object({
    label: editableText(100),
    content: editableText(2_000),
  })
  .strict()
  .nullable();

export const actionPlanSupportSchema = z
  .object({
    type: actionPlanSupportTypeSchema,
    label: nonEmptyText(100),
    content: nonEmptyText(2_000),
  })
  .strict()
  .nullable();

const v2ActionPlanActionSchema = z
  .object({
    id: z.string().trim().regex(/^action-[1-7]$/),
    title: nonEmptyText(140),
    objective: nonEmptyText(260),
    channelOrTool: nonEmptyText(180),
    steps: z.array(nonEmptyText(360)).min(2).max(7),
    readyToUse: legacyReadyToUseSchema,
    strategyPillar: actionPlanStrategyPillarSchema,
  })
  .strict();

export const actionPlanActionSchema = z
  .object({
    id: z.string().trim().regex(/^action-[1-5]$/),
    title: nonEmptyText(140),
    objective: nonEmptyText(260),
    channelOrTool: nonEmptyText(180),
    steps: z.array(nonEmptyText(360)).min(2).max(7),
    support: actionPlanSupportSchema,
    strategyPillar: actionPlanStrategyPillarSchema,
  })
  .strict();

const manualActionPlanActionSchema = z
  .object({
    id: z.string().trim().regex(/^action-[1-7]$/),
    title: editableText(140),
    objective: editableText(260),
    channelOrTool: editableText(180),
    steps: z.array(editableText(360)).max(7),
    readyToUse: editableLegacyReadyToUseSchema,
    strategyPillar: actionPlanStrategyPillarSchema,
  })
  .strict();

const legacyV1ActionPlanActionSchema = v2ActionPlanActionSchema
  .extend({
    why: nonEmptyText(360),
    estimatedMinutes: z.number().int().min(5).max(480),
    deliverable: nonEmptyText(260),
    successCriterion: nonEmptyText(300),
    ethicalGuardrail: nonEmptyText(300),
  })
  .strict();

const legacyAlignmentSchema = z
  .object({
    headline: nonEmptyText(180),
    desiredCompany: nonEmptyText(500),
    boundariesAndValues: nonEmptyText(500),
    prioritiesAndTradeoffs: nonEmptyText(500),
  })
  .strict();

const legacyPositioningSchema = z
  .object({
    headline: nonEmptyText(180),
    preciseCustomer: nonEmptyText(500),
    importantProblem: nonEmptyText(500),
    evidenceAndAlternatives: nonEmptyText(500),
  })
  .strict();

const legacyOfferSchema = z
  .object({
    headline: nonEmptyText(180),
    promisedOutcome: nonEmptyText(500),
    scope: nonEmptyText(500),
    priceCommitmentAndRisk: nonEmptyText(500),
  })
  .strict();

const legacyPromotionSchema = z
  .object({
    headline: nonEmptyText(180),
    attract: nonEmptyText(500),
    facilitatePurchase: nonEmptyText(500),
    retainAndStrengthen: nonEmptyText(500),
  })
  .strict();

const legacyStrategySchema = z
  .object({
    alignment: legacyAlignmentSchema,
    positioning: legacyPositioningSchema,
    offer: legacyOfferSchema,
    promotion: legacyPromotionSchema,
  })
  .strict();

const v3StrategySchema = z
  .object({
    alignment: z
      .object({
        direction: nonEmptyText(500),
        startingPoint: nonEmptyText(500),
        decisionRules: nonEmptyText(500),
      })
      .strict(),
    positioning: z
      .object({
        preciseCustomer: nonEmptyText(500),
        importantProblem: nonEmptyText(500),
        evidenceAndAlternatives: nonEmptyText(500),
      })
      .strict(),
    offer: z
      .object({
        promisedOutcome: nonEmptyText(500),
        scope: nonEmptyText(500),
        priceCommitmentAndRisk: nonEmptyText(500),
      })
      .strict(),
    promotion: z
      .object({
        attract: nonEmptyText(500),
        facilitatePurchase: nonEmptyText(500),
        retainAndStrengthen: nonEmptyText(500),
      })
      .strict(),
  })
  .strict();

function validateConsecutiveActionIds(
  actions: readonly { id: string }[],
  context: z.RefinementCtx,
  path: "actions" | "weeklyActions",
) {
  const expectedIds = actions.map((_, index) => `action-${index + 1}`);
  if (actions.some(({ id }, index) => id !== expectedIds[index])) {
    context.addIssue({
      code: "custom",
      message: "Les identifiants d'action doivent etre uniques et consecutifs.",
      path: [path],
    });
  }
}

export const actionPlanSchema = z
  .object({
    version: z.literal("3"),
    summary: nonEmptyText(700),
    systemId: actionPlanSystemIdSchema,
    actions: z.array(actionPlanActionSchema).min(3).max(5),
    strategy: v3StrategySchema,
  })
  .strict()
  .superRefine((plan, context) =>
    validateConsecutiveActionIds(plan.actions, context, "actions"),
  );

export const legacyV2ActionPlanSchema = z
  .object({
    version: z.literal("2"),
    summary: nonEmptyText(700),
    systemId: actionPlanSystemIdSchema,
    systemReason: nonEmptyText(300),
    weeklyActions: z.array(v2ActionPlanActionSchema).min(3).max(7),
    strategy: legacyStrategySchema,
    assumptions: z.array(nonEmptyText(300)).max(8),
  })
  .strict()
  .superRefine((plan, context) =>
    validateConsecutiveActionIds(plan.weeklyActions, context, "weeklyActions"),
  );

const manualActionPlanSchema = z
  .object({
    version: z.literal("manual"),
    summary: editableText(700),
    systemId: actionPlanSystemIdSchema.nullable(),
    systemReason: editableText(300),
    weeklyActions: z.array(manualActionPlanActionSchema).max(7),
    strategy: z
      .object({
        alignment: z.object({
          headline: editableText(180),
          desiredCompany: editableText(500),
          boundariesAndValues: editableText(500),
          prioritiesAndTradeoffs: editableText(500),
        }).strict(),
        positioning: z.object({
          headline: editableText(180),
          preciseCustomer: editableText(500),
          importantProblem: editableText(500),
          evidenceAndAlternatives: editableText(500),
        }).strict(),
        offer: z.object({
          headline: editableText(180),
          promisedOutcome: editableText(500),
          scope: editableText(500),
          priceCommitmentAndRisk: editableText(500),
        }).strict(),
        promotion: z.object({
          headline: editableText(180),
          attract: editableText(500),
          facilitatePurchase: editableText(500),
          retainAndStrengthen: editableText(500),
        }).strict(),
      }).strict(),
    assumptions: z.array(editableText(300)).max(8),
  })
  .strict()
  .superRefine((plan, context) =>
    validateConsecutiveActionIds(plan.weeklyActions, context, "weeklyActions"),
  );

const legacyV1ActionPlanSchema = z
  .object({
    version: z.literal("1"),
    summary: nonEmptyText(700),
    systemId: actionPlanSystemIdSchema,
    systemReason: nonEmptyText(300),
    weeklyActions: z.array(legacyV1ActionPlanActionSchema).min(3).max(7),
    strategy: legacyStrategySchema,
    assumptions: z.array(nonEmptyText(300)).max(8),
  })
  .strict()
  .superRefine((plan, context) =>
    validateConsecutiveActionIds(plan.weeklyActions, context, "weeklyActions"),
  );

function migrateLegacyV1ActionPlan(
  plan: z.infer<typeof legacyV1ActionPlanSchema>,
): LegacyV2ActionPlan {
  return legacyV2ActionPlanSchema.parse({
    ...plan,
    version: "2",
    weeklyActions: plan.weeklyActions.map((action) => ({
      id: action.id,
      title: action.title,
      objective: action.objective,
      channelOrTool: action.channelOrTool,
      steps: action.steps,
      readyToUse: action.readyToUse,
      strategyPillar: action.strategyPillar,
    })),
  });
}

/**
 * Persistence/API reader. V1 is normalized to its V2 equivalent in memory.
 * V2 and manual plans retain their historical fields and labels; they are never
 * silently relabelled as V3 or rewritten in Firebase.
 */
export const compatibleActionPlanSchema = z
  .union([
    actionPlanSchema,
    legacyV2ActionPlanSchema,
    legacyV1ActionPlanSchema,
    manualActionPlanSchema,
  ])
  .transform((plan) =>
    plan.version === "1" ? migrateLegacyV1ActionPlan(plan) : plan,
  );

export type ActionPlan = z.infer<typeof actionPlanSchema>;
export type ActionPlanAction = z.infer<typeof actionPlanActionSchema>;
export type ActionPlanSupport = z.infer<typeof actionPlanSupportSchema>;
export type ActionPlanSupportType = z.infer<typeof actionPlanSupportTypeSchema>;
export type LegacyV2ActionPlan = z.infer<typeof legacyV2ActionPlanSchema>;
export type LegacyV2ActionPlanAction = LegacyV2ActionPlan["weeklyActions"][number];
export type ManualActionPlan = z.infer<typeof manualActionPlanSchema>;
export type ManualActionPlanAction = ManualActionPlan["weeklyActions"][number];
export type PersistableActionPlan = z.infer<typeof compatibleActionPlanSchema>;
export type PersistableActionPlanAction =
  | ActionPlanAction
  | LegacyV2ActionPlanAction
  | ManualActionPlanAction;
export type ActionPlanStrategyPillar = z.infer<
  typeof actionPlanStrategyPillarSchema
>;
