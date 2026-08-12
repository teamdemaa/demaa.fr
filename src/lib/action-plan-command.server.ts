import "server-only";

import {
  gateway,
  generateText,
  Output,
  type LanguageModel,
  type LanguageModelUsage,
} from "ai";
import { z } from "zod";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import {
  actionPlanCommandDraftSchema,
  finalizeActionPlanCommandDraft,
  type ActionPlanCommandOperations,
} from "@/lib/action-plan-command-contract";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import {
  getActionPlanActions,
  type ActionPlanViewAction,
} from "@/lib/action-plan-view-model";

export const ACTION_PLAN_COMMAND_EXTERNAL_GENERATION_ENABLED = true;
export const ACTION_PLAN_COMMAND_MODEL_ID =
  process.env.DEMAA_AI_COMMAND_MODEL?.trim() ||
  process.env.DEMAA_AI_MODEL?.trim() ||
  "openai/gpt-5-mini";

const generatedSupportSchema = z
  .object({
    type: z.enum([
      "message",
      "email",
      "script",
      "checklist",
      "table",
      "template",
      "brief",
    ]),
    label: z.string().trim().min(1).max(100),
    content: z.string().trim().min(1).max(2_000),
  })
  .strict();

const generatedChangesSchema = z
  .object({
    title: z.string().trim().min(1).max(140).nullable(),
    objective: z.string().trim().max(260).nullable(),
    steps: z
      .array(z.string().trim().min(1).max(360))
      .min(1)
      .max(7)
      .nullable(),
    supportMode: z.enum(["keep", "remove", "replace"]),
    support: generatedSupportSchema.nullable(),
  })
  .strict()
  .superRefine((changes, context) => {
    if (changes.supportMode === "replace" && changes.support === null) {
      context.addIssue({
        code: "custom",
        path: ["support"],
        message: "Un support de remplacement est requis.",
      });
    }
    if (changes.supportMode !== "replace" && changes.support !== null) {
      context.addIssue({
        code: "custom",
        path: ["support"],
        message: "Le support doit rester vide hors remplacement.",
      });
    }
  });

const generatedActionSchema = z
  .object({
    title: z.string().trim().min(1).max(140),
    objective: z.string().trim().max(260),
    channelOrTool: z.string().trim().max(180),
    steps: z.array(z.string().trim().min(1).max(360)).max(7),
    support: generatedSupportSchema.nullable(),
  })
  .strict();

// OpenAI Structured Outputs rejects `oneOf`, which Zod emits for a
// discriminated union. Keep one flat, fully-required nullable shape for the
// provider, then convert it into the narrower allowlisted command contract
// below. The deterministic parser still rejects incoherent operations.
const generatedOperationSchema = z
  .object({
    type: z.enum(["addAction", "updateAction", "deleteAction"]),
    actionId: z
      .string()
      .regex(/^(action|custom)-[A-Za-z0-9_-]{1,64}$/)
      .nullable(),
    action: generatedActionSchema.nullable(),
    changes: generatedChangesSchema.nullable(),
  })
  .strict();

const generatedDraftSchema = z
  .object({ operations: z.array(generatedOperationSchema).max(8) })
  .strict();

export const ACTION_PLAN_COMMAND_INSTRUCTIONS = `
Tu modifies un plan d'action Demaa a partir d'une commande courte en francais.

Regles :
- Retourne uniquement les operations strictement necessaires, au maximum 8.
- Chaque operation utilise tous les champs du schema : mets null dans les champs qui ne concernent pas son type.
- Utilise seulement les identifiants et contenus visibles fournis.
- N'invente aucun fait, chiffre, client, prix, obligation ou resultat obtenu.
- Une action ajoutee doit etre realiste et directement executable.
- Pour updateAction, mets null dans title, objective ou steps lorsqu'ils ne changent pas.
- Pour le support, utilise keep s'il ne change pas, remove pour le supprimer et replace avec un support complet pour le remplacer.
- Ne change jamais de systeme, statut, date, note, identite ou information absente.
- Si la commande ne demande aucun changement exploitable, retourne operations vide.
- Ecris en francais simple, concret et concis.
`.trim();

type CommandGenerationOptions = {
  abortSignal?: AbortSignal;
  model?: LanguageModel;
  modelId?: string;
  createId?: () => string;
};

function normalizeUsage(usage?: LanguageModelUsage) {
  return {
    inputTokens: usage?.inputTokens ?? null,
    outputTokens: usage?.outputTokens ?? null,
    totalTokens: usage?.totalTokens ?? null,
  };
}

function normalizeGeneratedDraft(value: z.infer<typeof generatedDraftSchema>) {
  return actionPlanCommandDraftSchema.parse({
    operations: value.operations.map((operation) => {
      if (operation.type === "addAction") {
        if (operation.action === null) {
          throw new Error("The generated addAction operation has no action.");
        }
        return { type: operation.type, action: operation.action };
      }

      if (operation.type === "deleteAction") {
        if (operation.actionId === null) {
          throw new Error("The generated deleteAction operation has no ID.");
        }
        return { type: operation.type, actionId: operation.actionId };
      }

      if (operation.actionId === null || operation.changes === null) {
        throw new Error("The generated updateAction operation is incomplete.");
      }

      const changes: Record<string, unknown> = {};
      if (operation.changes.title !== null) {
        changes.title = operation.changes.title;
      }
      if (operation.changes.objective !== null) {
        changes.objective = operation.changes.objective;
      }
      if (operation.changes.steps !== null) {
        changes.steps = operation.changes.steps;
      }
      if (operation.changes.supportMode === "remove") {
        changes.support = null;
      } else if (operation.changes.supportMode === "replace") {
        changes.support = operation.changes.support;
      }

      return {
        type: operation.type,
        actionId: operation.actionId,
        changes,
      };
    }),
  });
}

function getEffectiveActions(
  plan: PersistableActionPlan,
  workspace: ActionPlanWorkspaceState,
) {
  const generated = getActionPlanActions(plan);
  const added: ActionPlanViewAction[] = workspace.addedActions.map((action) => ({
    ...action,
    support: action.support,
  }));
  const deleted = new Set(workspace.deletedActionIds);

  return [...generated, ...added]
    .filter(({ id }) => !deleted.has(id))
    .map((action) => {
      const overrides = workspace.tasks[action.id]?.overrides;
      return {
        id: action.id,
        title: overrides?.title ?? action.title,
        objective: overrides?.objective ?? action.objective,
        channelOrTool: action.channelOrTool,
        steps: overrides?.steps ?? action.steps,
        support:
          overrides && Object.hasOwn(overrides, "support")
            ? overrides.support ?? null
            : action.support,
      };
    });
}

/**
 * Exact future external payload, kept pure and inspectable for consent review.
 *
 * Included: the command and effective visible actions.
 * Excluded: notes, email, account/session identity, source situation, history,
 * selected systems, process checks, solution choices and the 115-system catalog.
 */
export function buildActionPlanCommandMinimalEnvelope(
  command: string,
  plan: PersistableActionPlan,
  workspace: ActionPlanWorkspaceState,
) {
  return {
    command,
    currentPlan: {
      actions: getEffectiveActions(plan, workspace),
    },
  };
}

export type ActionPlanCommandGenerationResult = {
  operations: ActionPlanCommandOperations;
  generation: {
    model: string;
    durationMs: number;
    inputTokens: number | null;
    outputTokens: number | null;
    totalTokens: number | null;
    requestCount: 1;
    repairCount: 0;
  };
};

export async function generateActionPlanCommand(
  command: string,
  plan: PersistableActionPlan,
  workspace: ActionPlanWorkspaceState,
  options: CommandGenerationOptions = {},
): Promise<ActionPlanCommandGenerationResult> {
  const startedAt = Date.now();
  const modelId = options.modelId?.trim() || ACTION_PLAN_COMMAND_MODEL_ID;
  const result = await generateText({
    model: options.model ?? gateway(modelId),
    instructions: ACTION_PLAN_COMMAND_INSTRUCTIONS,
    prompt: JSON.stringify(
      buildActionPlanCommandMinimalEnvelope(command, plan, workspace),
    ),
    output: Output.object({
      name: "demaa_action_plan_command",
      description: "Operations ciblees pour modifier un plan d'action Demaa.",
      schema: generatedDraftSchema,
    }),
    providerOptions: {
      gateway: { order: ["openai", "bedrock", "azure"] },
    },
    maxOutputTokens: 1_400,
    reasoning: "low",
    temperature: 0,
    maxRetries: 1,
    timeout: { totalMs: 30_000 },
    abortSignal: options.abortSignal,
  });
  const draft = normalizeGeneratedDraft(result.output);

  return {
    operations: finalizeActionPlanCommandDraft(draft, options.createId),
    generation: {
      model: modelId,
      durationMs: Date.now() - startedAt,
      ...normalizeUsage(result.usage),
      requestCount: 1,
      repairCount: 0,
    },
  };
}
