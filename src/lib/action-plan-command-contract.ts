import { z } from "zod";
import {
  actionPlanSupportTypeSchema,
  type PersistableActionPlan,
} from "@/lib/action-plan-contract";
import {
  actionPlanWorkspaceActionIdSchema,
  actionPlanWorkspaceStateSchema,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";
import {
  getActionPlanActions,
  getAllActionPlanActionIds,
} from "@/lib/action-plan-view-model";

const commandTextSchema = z.string().trim().min(2).max(1_000);
const titleSchema = z.string().trim().min(1).max(140);
const objectiveSchema = z.string().trim().max(260);
const stepSchema = z.string().trim().min(1).max(360);
const customActionIdSchema = z.string().regex(/^custom-[A-Za-z0-9_-]{1,64}$/);

export const actionPlanCommandSupportSchema = z
  .object({
    type: actionPlanSupportTypeSchema,
    label: z.string().trim().min(1).max(100),
    content: z.string().trim().min(1).max(2_000),
  })
  .strict()
  .nullable();

const actionFieldsSchema = z
  .object({
    title: titleSchema,
    objective: objectiveSchema,
    channelOrTool: z.string().trim().max(180),
    steps: z.array(stepSchema).max(7),
    support: actionPlanCommandSupportSchema,
  })
  .strict();

const updateChangesSchema = z
  .object({
    title: titleSchema.optional(),
    objective: objectiveSchema.optional(),
    steps: z.array(stepSchema).min(1).max(7).optional(),
    support: actionPlanCommandSupportSchema.optional(),
  })
  .strict()
  .superRefine((changes, context) => {
    if (Object.keys(changes).length === 0) {
      context.addIssue({
        code: "custom",
        message: "Une mise a jour doit contenir au moins un changement.",
      });
    }
  });

const draftOperationSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("addAction"),
      action: actionFieldsSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal("updateAction"),
      actionId: actionPlanWorkspaceActionIdSchema,
      changes: updateChangesSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal("deleteAction"),
      actionId: actionPlanWorkspaceActionIdSchema,
    })
    .strict(),
]);

export const actionPlanCommandDraftSchema = z
  .object({
    operations: z.array(draftOperationSchema).max(8),
  })
  .strict();

const finalizedOperationSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("addAction"),
      action: actionFieldsSchema.extend({ id: customActionIdSchema }).strict(),
    })
    .strict(),
  z
    .object({
      type: z.literal("updateAction"),
      actionId: actionPlanWorkspaceActionIdSchema,
      changes: updateChangesSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal("deleteAction"),
      actionId: actionPlanWorkspaceActionIdSchema,
    })
    .strict(),
]);

export const actionPlanCommandOperationsSchema = z
  .array(finalizedOperationSchema)
  .max(8);

export const actionPlanCommandRequestSchema = z
  .object({
    command: commandTextSchema,
    plan: z.unknown(),
    workspace: z.unknown(),
  })
  .strict();

export type ActionPlanCommandDraft = z.infer<
  typeof actionPlanCommandDraftSchema
>;
export type ActionPlanCommandOperation = z.infer<
  typeof finalizedOperationSchema
>;
export type ActionPlanCommandOperations = z.infer<
  typeof actionPlanCommandOperationsSchema
>;

function joinFrenchList(items: readonly string[]) {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} et ${items.at(-1)}`;
}

export function summarizeActionPlanCommandOperations(
  plan: PersistableActionPlan,
  workspace: ActionPlanWorkspaceState,
  operations: ActionPlanCommandOperations,
) {
  const actionById = new Map(
    [...getActionPlanActions(plan), ...workspace.addedActions]
      .map((action) => [action.id, action] as const),
  );
  const titleById = new Map(
    [...getAllActionPlanActionIds(plan, workspace.addedActions)].map((actionId) => {
      const action = actionById.get(actionId);
      const title = workspace.tasks[actionId]?.overrides.title || action?.title || "Action";
      return [actionId, title] as const;
    }),
  );

  return operations.map((operation) => {
    if (operation.type === "addAction") {
      return `Ajout de « ${operation.action.title} »`;
    }
    const title = titleById.get(operation.actionId) ?? "Action";
    if (operation.type === "deleteAction") {
      return `Suppression de « ${title} »`;
    }
    const labels = Object.keys(operation.changes).map((field) => ({
      objective: "résultat attendu",
      steps: "tâches",
      support: "support",
      title: "titre",
    })[field] ?? field);
    return `« ${title} » : ${joinFrenchList(labels)}`;
  }).join(" · ");
}

export function finalizeActionPlanCommandDraft(
  draft: ActionPlanCommandDraft,
  createId: () => string = () => crypto.randomUUID(),
): ActionPlanCommandOperations {
  return actionPlanCommandOperationsSchema.parse(
    draft.operations.map((operation) => {
      if (operation.type !== "addAction") return operation;

      return {
        ...operation,
        action: {
          ...operation.action,
          id: `custom-${createId().replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64)}`,
        },
      };
    }),
  );
}

function emptyTaskState() {
  return {
    status: "todo" as const,
    dueDate: null,
    completedStepIndexes: [],
    notes: "",
    overrides: {},
  };
}

function assertActiveAction(
  actionId: string,
  knownIds: ReadonlySet<string>,
  deletedIds: ReadonlySet<string>,
) {
  if (!knownIds.has(actionId)) {
    throw new Error(`Action inconnue: ${actionId}`);
  }
  if (deletedIds.has(actionId)) {
    throw new Error(`Action deja supprimee: ${actionId}`);
  }
}

/**
 * Applies already validated command operations to a detached workspace copy.
 * The original snapshot is returned verbatim so a future UI can implement one
 * step undo without trying to synthesize fragile inverse operations.
 */
export function applyActionPlanCommandOperations(
  plan: PersistableActionPlan,
  workspace: ActionPlanWorkspaceState,
  operations: ActionPlanCommandOperations,
) {
  const parsedOperations = actionPlanCommandOperationsSchema.parse(operations);
  const undoSnapshot = actionPlanWorkspaceStateSchema.parse(workspace);
  const next = structuredClone(undoSnapshot);
  const knownIds = new Set(getAllActionPlanActionIds(plan, next.addedActions));
  const deletedIds = new Set(next.deletedActionIds);

  for (const operation of parsedOperations) {
    if (operation.type === "addAction") {
      if (knownIds.has(operation.action.id)) {
        throw new Error(`Identifiant d'action duplique: ${operation.action.id}`);
      }
      if (next.addedActions.length >= 50) {
        throw new Error("Le nombre maximal d'actions ajoutees est atteint.");
      }
      next.addedActions.push({
        ...operation.action,
        // Legacy workspace metadata kept internal while Strategy is hidden.
        strategyPillar: "alignement",
      });
      next.tasks[operation.action.id] = emptyTaskState();
      knownIds.add(operation.action.id);
      continue;
    }

    if (operation.type === "updateAction") {
      assertActiveAction(operation.actionId, knownIds, deletedIds);
      const task = next.tasks[operation.actionId] ?? emptyTaskState();
      task.overrides = { ...task.overrides, ...operation.changes };
      next.tasks[operation.actionId] = task;
      continue;
    }

    if (operation.type === "deleteAction") {
      assertActiveAction(operation.actionId, knownIds, deletedIds);
      deletedIds.add(operation.actionId);
      next.deletedActionIds.push(operation.actionId);
      continue;
    }

  }

  return {
    workspace: actionPlanWorkspaceStateSchema.parse(next),
    undoSnapshot,
  };
}
