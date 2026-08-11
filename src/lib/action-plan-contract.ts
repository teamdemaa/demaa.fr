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

const readyToUseSchema = z
  .object({
    label: nonEmptyText(100),
    content: nonEmptyText(2_000),
  })
  .strict()
  .nullable();

const editableReadyToUseSchema = z
  .object({
    label: editableText(100),
    content: editableText(2_000),
  })
  .strict()
  .nullable();

export const actionPlanActionSchema = z
  .object({
    id: z.string().trim().regex(/^action-[1-7]$/),
    title: nonEmptyText(140),
    objective: nonEmptyText(260),
    channelOrTool: nonEmptyText(180),
    steps: z.array(nonEmptyText(360)).min(2).max(7),
    readyToUse: readyToUseSchema,
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
    readyToUse: editableReadyToUseSchema,
    strategyPillar: actionPlanStrategyPillarSchema,
  })
  .strict();

const legacyActionPlanActionSchema = actionPlanActionSchema
  .extend({
    why: nonEmptyText(360),
    estimatedMinutes: z.number().int().min(5).max(480),
    deliverable: nonEmptyText(260),
    successCriterion: nonEmptyText(300),
    ethicalGuardrail: nonEmptyText(300),
  })
  .strict();

const alignmentSchema = z
  .object({
    headline: nonEmptyText(180),
    desiredCompany: nonEmptyText(500),
    boundariesAndValues: nonEmptyText(500),
    prioritiesAndTradeoffs: nonEmptyText(500),
  })
  .strict();

const positioningSchema = z
  .object({
    headline: nonEmptyText(180),
    preciseCustomer: nonEmptyText(500),
    importantProblem: nonEmptyText(500),
    evidenceAndAlternatives: nonEmptyText(500),
  })
  .strict();

const offerSchema = z
  .object({
    headline: nonEmptyText(180),
    promisedOutcome: nonEmptyText(500),
    scope: nonEmptyText(500),
    priceCommitmentAndRisk: nonEmptyText(500),
  })
  .strict();

const promotionSchema = z
  .object({
    headline: nonEmptyText(180),
    attract: nonEmptyText(500),
    facilitatePurchase: nonEmptyText(500),
    retainAndStrengthen: nonEmptyText(500),
  })
  .strict();

const actionPlanObjectSchema = z
  .object({
    version: z.literal("2"),
    summary: nonEmptyText(700),
    systemId: actionPlanSystemIdSchema,
    systemReason: nonEmptyText(300),
    weeklyActions: z.array(actionPlanActionSchema).min(3).max(7),
    strategy: z
      .object({
        alignment: alignmentSchema,
        positioning: positioningSchema,
        offer: offerSchema,
        promotion: promotionSchema,
      })
      .strict(),
    assumptions: z.array(nonEmptyText(300)).max(8),
  })
  .strict();

function validateActionIds(
  plan: { weeklyActions: readonly { id: string }[] },
  context: z.RefinementCtx,
) {
  const expectedIds = plan.weeklyActions.map((_, index) => `action-${index + 1}`);
  const actualIds = plan.weeklyActions.map(({ id }) => id);

  if (actualIds.some((id, index) => id !== expectedIds[index])) {
    context.addIssue({
      code: "custom",
      message: "Les identifiants d'action doivent etre uniques et consecutifs.",
      path: ["weeklyActions"],
    });
  }
}

export const actionPlanSchema = actionPlanObjectSchema.superRefine(
  validateActionIds,
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
        alignment: z
          .object({
            headline: editableText(180),
            desiredCompany: editableText(500),
            boundariesAndValues: editableText(500),
            prioritiesAndTradeoffs: editableText(500),
          })
          .strict(),
        positioning: z
          .object({
            headline: editableText(180),
            preciseCustomer: editableText(500),
            importantProblem: editableText(500),
            evidenceAndAlternatives: editableText(500),
          })
          .strict(),
        offer: z
          .object({
            headline: editableText(180),
            promisedOutcome: editableText(500),
            scope: editableText(500),
            priceCommitmentAndRisk: editableText(500),
          })
          .strict(),
        promotion: z
          .object({
            headline: editableText(180),
            attract: editableText(500),
            facilitatePurchase: editableText(500),
            retainAndStrengthen: editableText(500),
          })
          .strict(),
      })
      .strict(),
    assumptions: z.array(editableText(300)).max(8),
  })
  .strict()
  .superRefine(validateActionIds);

const legacyActionPlanSchema = actionPlanObjectSchema
  .extend({
    version: z.literal("1"),
    weeklyActions: z.array(legacyActionPlanActionSchema).min(3).max(7),
  })
  .strict()
  .superRefine(validateActionIds);

function migrateLegacyActionPlan(
  plan: z.infer<typeof legacyActionPlanSchema>,
): z.infer<typeof actionPlanSchema> {
  return actionPlanSchema.parse({
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
 * Persistence/API reader. New generations use the strict V2 schema; V1 plans
 * already stored in Firebase are normalized in memory without being rewritten.
 */
export const compatibleActionPlanSchema = z
  .union([actionPlanSchema, legacyActionPlanSchema, manualActionPlanSchema])
  .transform((plan) =>
    plan.version === "1" ? migrateLegacyActionPlan(plan) : plan,
  );

export type ActionPlan = z.infer<typeof actionPlanSchema>;
export type ActionPlanAction = z.infer<typeof actionPlanActionSchema>;
export type ManualActionPlan = z.infer<typeof manualActionPlanSchema>;
export type ManualActionPlanAction = z.infer<
  typeof manualActionPlanActionSchema
>;
export type PersistableActionPlan = z.infer<typeof compatibleActionPlanSchema>;
export type PersistableActionPlanAction =
  | ActionPlanAction
  | ManualActionPlanAction;
export type ActionPlanStrategyPillar = z.infer<
  typeof actionPlanStrategyPillarSchema
>;
