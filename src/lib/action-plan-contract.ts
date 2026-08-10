import { z } from "zod";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";

const nonEmptyText = (max: number) => z.string().trim().min(1).max(max);

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

export const actionPlanActionSchema = z
  .object({
    id: z.string().trim().regex(/^action-[1-7]$/),
    title: nonEmptyText(140),
    objective: nonEmptyText(260),
    why: nonEmptyText(360),
    estimatedMinutes: z.number().int().min(5).max(480),
    channelOrTool: nonEmptyText(180),
    deliverable: nonEmptyText(260),
    steps: z.array(nonEmptyText(360)).min(2).max(7),
    readyToUse: readyToUseSchema,
    successCriterion: nonEmptyText(300),
    ethicalGuardrail: nonEmptyText(300),
    strategyPillar: actionPlanStrategyPillarSchema,
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

export const actionPlanSchema = z
  .object({
    version: z.literal("1"),
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
  .strict()
  .superRefine((plan, context) => {
    const expectedIds = plan.weeklyActions.map((_, index) => `action-${index + 1}`);
    const actualIds = plan.weeklyActions.map(({ id }) => id);

    if (actualIds.some((id, index) => id !== expectedIds[index])) {
      context.addIssue({
        code: "custom",
        message: "Les identifiants d'action doivent etre uniques et consecutifs.",
        path: ["weeklyActions"],
      });
    }
  });

export type ActionPlan = z.infer<typeof actionPlanSchema>;
export type ActionPlanAction = z.infer<typeof actionPlanActionSchema>;
export type ActionPlanStrategyPillar = z.infer<
  typeof actionPlanStrategyPillarSchema
>;
