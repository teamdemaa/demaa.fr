import { z } from "zod";
import type { ActionPlan } from "@/lib/action-plan-contract";
import {
  actionPlanStrategyPillarSchema,
  actionPlanSystemIdSchema,
} from "@/lib/action-plan-contract";

export const actionPlanTaskStatusSchema = z.enum([
  "todo",
  "in_progress",
  "done",
]);

const optionalText = (max: number) => z.string().trim().max(max).optional();

const actionOverrideSchema = z
  .object({
    title: optionalText(140),
    estimatedMinutes: z.number().int().min(5).max(480).optional(),
    steps: z.array(z.string().trim().min(1).max(360)).min(1).max(7).optional(),
    readyToUse: z
      .object({
        label: z.string().trim().min(1).max(100),
        content: z.string().trim().min(1).max(2_000),
      })
      .strict()
      .nullable()
      .optional(),
  })
  .strict();

export const actionPlanTaskStateSchema = z
  .object({
    status: actionPlanTaskStatusSchema,
    dueDate: z.string().date().nullable(),
    completedStepIndexes: z.array(z.number().int().min(0).max(6)).max(7),
    notes: z.string().trim().max(4_000),
    overrides: actionOverrideSchema,
  })
  .strict();

const strategyOverrideSchema = z
  .object({
    headline: optionalText(180),
    answerOne: optionalText(500),
    answerTwo: optionalText(500),
    answerThree: optionalText(500),
  })
  .strict();

export const actionPlanWorkspaceStateSchema = z
  .object({
    version: z.literal("1"),
    selectedSystemId: actionPlanSystemIdSchema,
    tasks: z.record(z.string().regex(/^action-[1-7]$/), actionPlanTaskStateSchema),
    strategyOverrides: z.partialRecord(
      actionPlanStrategyPillarSchema,
      strategyOverrideSchema,
    ),
    checkedProcessStepIdsBySystem: z.partialRecord(
      actionPlanSystemIdSchema,
      z.array(z.string().trim().min(1).max(180)).max(200),
    ),
    selectedSolutionPlacementIdsBySystem: z.partialRecord(
      actionPlanSystemIdSchema,
      z.array(z.string().trim().min(1).max(240)).max(120),
    ),
  })
  .strict();

export type ActionPlanTaskStatus = z.infer<typeof actionPlanTaskStatusSchema>;
export type ActionPlanTaskState = z.infer<typeof actionPlanTaskStateSchema>;
export type ActionPlanWorkspaceState = z.infer<
  typeof actionPlanWorkspaceStateSchema
>;

export function createActionPlanWorkspaceState(
  plan: ActionPlan,
): ActionPlanWorkspaceState {
  return {
    version: "1",
    selectedSystemId: plan.systemId,
    tasks: Object.fromEntries(
      plan.weeklyActions.map((action) => [
        action.id,
        {
          status: "todo" as const,
          dueDate: null,
          completedStepIndexes: [],
          notes: "",
          overrides: {},
        },
      ]),
    ),
    strategyOverrides: {},
    checkedProcessStepIdsBySystem: {},
    selectedSolutionPlacementIdsBySystem: {},
  };
}

export function normalizeActionPlanWorkspaceState(
  plan: ActionPlan,
  value: unknown,
): ActionPlanWorkspaceState {
  const parsed = actionPlanWorkspaceStateSchema.safeParse(value);
  const base = createActionPlanWorkspaceState(plan);
  if (!parsed.success) return base;

  const tasks = Object.fromEntries(
    plan.weeklyActions.map((action) => [
      action.id,
      parsed.data.tasks[action.id] ?? base.tasks[action.id],
    ]),
  );

  return {
    ...parsed.data,
    tasks,
  };
}
