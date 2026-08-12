import { z } from "zod";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import {
  actionPlanStrategyPillarSchema,
  actionPlanSupportTypeSchema,
  actionPlanSystemIdSchema,
} from "@/lib/action-plan-contract";
import {
  getActionPlanActions,
  getAllActionPlanActionIds,
} from "@/lib/action-plan-view-model";

export const actionPlanTaskStatusSchema = z.enum([
  "todo",
  "in_progress",
  "done",
]);

const optionalText = (max: number) => z.string().trim().max(max).optional();
const baseActionIdSchema = z.string().regex(/^action-[1-7]$/);
const customActionIdSchema = z.string().regex(/^custom-[A-Za-z0-9_-]{1,64}$/);
export const actionPlanWorkspaceActionIdSchema = z.union([
  baseActionIdSchema,
  customActionIdSchema,
]);

const editableSupportSchema = z
  .object({
    type: actionPlanSupportTypeSchema.nullable(),
    label: z.string().trim().min(1).max(100),
    content: z.string().trim().min(1).max(2_000),
  })
  .strict()
  .nullable();

const actionOverrideSchema = z
  .object({
    title: optionalText(140),
    objective: optionalText(260),
    steps: z.array(z.string().trim().min(1).max(360)).min(1).max(7).optional(),
    support: editableSupportSchema.optional(),
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

const addedActionSchema = z
  .object({
    id: customActionIdSchema,
    title: z.string().trim().min(1).max(140),
    objective: z.string().trim().max(260),
    channelOrTool: z.string().trim().max(180),
    steps: z.array(z.string().trim().min(1).max(360)).max(7),
    support: editableSupportSchema,
    strategyPillar: actionPlanStrategyPillarSchema,
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

const processChecksSchema = z.partialRecord(
  actionPlanSystemIdSchema,
  z.array(z.string().trim().min(1).max(180)).max(200),
);

const solutionSelectionsSchema = z.partialRecord(
  actionPlanSystemIdSchema,
  z.array(z.string().trim().min(1).max(240)).max(120),
);

export const actionPlanWorkspaceStateSchema = z
  .object({
    version: z.literal("2"),
    selectedSystemId: actionPlanSystemIdSchema.nullable(),
    savedSystemIds: z.array(actionPlanSystemIdSchema).max(115),
    addedActions: z.array(addedActionSchema).max(50),
    deletedActionIds: z.array(actionPlanWorkspaceActionIdSchema).max(50),
    tasks: z.record(actionPlanWorkspaceActionIdSchema, actionPlanTaskStateSchema),
    strategyOverrides: z.partialRecord(
      actionPlanStrategyPillarSchema,
      strategyOverrideSchema,
    ),
    checkedProcessStepIdsBySystem: processChecksSchema,
    selectedSolutionPlacementIdsBySystem: solutionSelectionsSchema,
  })
  .strict()
  .superRefine((workspace, context) => {
    if (new Set(workspace.savedSystemIds).size !== workspace.savedSystemIds.length) {
      context.addIssue({
        code: "custom",
        message: "Les systemes sauvegardes doivent etre uniques.",
        path: ["savedSystemIds"],
      });
    }
    const addedIds = workspace.addedActions.map(({ id }) => id);
    if (new Set(addedIds).size !== addedIds.length) {
      context.addIssue({
        code: "custom",
        message: "Les identifiants des actions ajoutees doivent etre uniques.",
        path: ["addedActions"],
      });
    }
  });

const legacyActionOverrideSchema = z
  .object({
    title: optionalText(140),
    objective: optionalText(260),
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
  .passthrough();

const legacyTaskSchema = actionPlanTaskStateSchema
  .omit({ overrides: true })
  .extend({ overrides: legacyActionOverrideSchema })
  .strict();

const legacyWorkspaceSchema = z
  .object({
    version: z.literal("1"),
    selectedSystemId: actionPlanSystemIdSchema.nullable(),
    deletedActionIds: z.array(baseActionIdSchema).max(7).default([]),
    tasks: z.record(baseActionIdSchema, legacyTaskSchema),
    strategyOverrides: z.partialRecord(
      actionPlanStrategyPillarSchema,
      strategyOverrideSchema,
    ),
    checkedProcessStepIdsBySystem: processChecksSchema,
    selectedSolutionPlacementIdsBySystem: solutionSelectionsSchema,
  })
  .strict();

function migrateLegacyWorkspace(value: z.infer<typeof legacyWorkspaceSchema>) {
  return actionPlanWorkspaceStateSchema.parse({
    version: "2",
    selectedSystemId: value.selectedSystemId,
    savedSystemIds: value.selectedSystemId ? [value.selectedSystemId] : [],
    addedActions: [],
    deletedActionIds: value.deletedActionIds,
    tasks: Object.fromEntries(
      Object.entries(value.tasks).map(([id, task]) => {
        const { readyToUse, ...legacyOverrides } = task.overrides;
        const overrides = { ...legacyOverrides } as Record<string, unknown>;
        delete overrides.estimatedMinutes;
        if (readyToUse !== undefined) {
          overrides.support = readyToUse
            ? { type: null, label: readyToUse.label, content: readyToUse.content }
            : null;
        }
        return [id, { ...task, overrides }];
      }),
    ),
    strategyOverrides: value.strategyOverrides,
    checkedProcessStepIdsBySystem: value.checkedProcessStepIdsBySystem,
    selectedSolutionPlacementIdsBySystem: value.selectedSolutionPlacementIdsBySystem,
  });
}

function stripRetiredEstimatedMinutes(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const workspace = value as Record<string, unknown>;
  if (!workspace.tasks || typeof workspace.tasks !== "object" || Array.isArray(workspace.tasks)) {
    return value;
  }
  const tasks = Object.fromEntries(
    Object.entries(workspace.tasks as Record<string, unknown>).map(([id, taskValue]) => {
      if (!taskValue || typeof taskValue !== "object" || Array.isArray(taskValue)) {
        return [id, taskValue];
      }
      const task = taskValue as Record<string, unknown>;
      if (!task.overrides || typeof task.overrides !== "object" || Array.isArray(task.overrides)) {
        return [id, taskValue];
      }
      const overrides = { ...(task.overrides as Record<string, unknown>) };
      delete overrides.estimatedMinutes;
      return [id, { ...task, overrides }];
    }),
  );
  return { ...workspace, tasks };
}

export const compatibleActionPlanWorkspaceStateSchema = z.preprocess(
  stripRetiredEstimatedMinutes,
  z.union([actionPlanWorkspaceStateSchema, legacyWorkspaceSchema])
    .transform((workspace) =>
      workspace.version === "1" ? migrateLegacyWorkspace(workspace) : workspace,
    ),
);

export type ActionPlanTaskStatus = z.infer<typeof actionPlanTaskStatusSchema>;
export type ActionPlanTaskState = z.infer<typeof actionPlanTaskStateSchema>;
export type AddedActionPlanAction = z.infer<typeof addedActionSchema>;
export type ActionPlanWorkspaceState = z.infer<
  typeof actionPlanWorkspaceStateSchema
>;

export function addActionPlanWorkspaceAction(
  workspace: ActionPlanWorkspaceState,
  input: Partial<Omit<AddedActionPlanAction, "id">> = {},
): ActionPlanWorkspaceState {
  if (workspace.addedActions.length >= 50) return workspace;

  const id = `custom-${crypto.randomUUID()}`;
  const action: AddedActionPlanAction = {
    id,
    title: input.title?.trim().slice(0, 140) || "Nouvelle action",
    objective: input.objective?.trim().slice(0, 260) || "",
    channelOrTool: input.channelOrTool?.trim().slice(0, 180) || "",
    steps: input.steps?.slice(0, 7) || [],
    support: input.support ?? null,
    strategyPillar: input.strategyPillar || "alignement",
  };

  return {
    ...workspace,
    addedActions: [...workspace.addedActions, action],
    tasks: {
      ...workspace.tasks,
      [id]: createEmptyTaskState(),
    },
  };
}

export function compactActionPlanSteps(
  lines: readonly string[],
  completedStepIndexes: readonly number[],
) {
  const completed = new Set(completedStepIndexes);
  const steps: string[] = [];
  const remappedCompletedStepIndexes: number[] = [];

  for (const [originalIndex, rawStep] of lines.entries()) {
    const step = rawStep.trim();
    if (!step) continue;
    if (steps.length >= 7) break;

    const nextIndex = steps.length;
    steps.push(step);
    if (completed.has(originalIndex)) {
      remappedCompletedStepIndexes.push(nextIndex);
    }
  }

  return { steps, completedStepIndexes: remappedCompletedStepIndexes };
}

function createEmptyTaskState(): ActionPlanTaskState {
  return {
    status: "todo",
    dueDate: null,
    completedStepIndexes: [],
    notes: "",
    overrides: {},
  };
}

export function createActionPlanWorkspaceState(
  plan: PersistableActionPlan,
): ActionPlanWorkspaceState {
  return {
    version: "2",
    selectedSystemId: plan.systemId,
    savedSystemIds: plan.systemId ? [plan.systemId] : [],
    addedActions: [],
    deletedActionIds: [],
    tasks: Object.fromEntries(
      getActionPlanActions(plan).map(({ id }) => [id, createEmptyTaskState()]),
    ),
    strategyOverrides: {},
    checkedProcessStepIdsBySystem: {},
    selectedSolutionPlacementIdsBySystem: {},
  };
}

/**
 * Starts a generated plan while preserving only the deterministic System
 * choices made before generation. Action and Strategy state always comes from
 * the newly generated plan.
 */
export function createGeneratedActionPlanWorkspaceState(
  plan: PersistableActionPlan,
  previous: ActionPlanWorkspaceState,
): ActionPlanWorkspaceState {
  const generated = createActionPlanWorkspaceState(plan);
  const selectedSystemId = previous.selectedSystemId ?? plan.systemId;
  const savedSystemIds = Array.from(
    new Set([
      ...previous.savedSystemIds,
      ...(selectedSystemId ? [selectedSystemId] : []),
      ...(plan.systemId ? [plan.systemId] : []),
    ]),
  );

  return actionPlanWorkspaceStateSchema.parse({
    ...generated,
    selectedSystemId,
    savedSystemIds,
    checkedProcessStepIdsBySystem: previous.checkedProcessStepIdsBySystem,
    selectedSolutionPlacementIdsBySystem:
      previous.selectedSolutionPlacementIdsBySystem,
  });
}

export function normalizeActionPlanWorkspaceState(
  plan: PersistableActionPlan,
  value: unknown,
): ActionPlanWorkspaceState {
  const parsed = compatibleActionPlanWorkspaceStateSchema.safeParse(value);
  const base = createActionPlanWorkspaceState(plan);
  if (!parsed.success) return base;

  const allActionIds = getAllActionPlanActionIds(plan, parsed.data.addedActions);
  const allowedIds = new Set(allActionIds);
  const tasks = Object.fromEntries(
    allActionIds.map((id) => [id, parsed.data.tasks[id] ?? createEmptyTaskState()]),
  );
  const savedSystemIds = [...new Set([
    ...parsed.data.savedSystemIds,
    ...(parsed.data.selectedSystemId ? [parsed.data.selectedSystemId] : []),
  ])];

  return {
    ...parsed.data,
    savedSystemIds,
    deletedActionIds: parsed.data.deletedActionIds.filter((id) => allowedIds.has(id)),
    tasks,
  };
}
