"use client";

import { ArrowUp, LoaderCircle, Undo2 } from "lucide-react";
import { type Dispatch, type FormEvent, type SetStateAction, useState } from "react";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import {
  actionPlanCommandOperationsSchema,
  applyActionPlanCommandOperations,
} from "@/lib/action-plan-command-contract";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

export default function ActionPlanCommandBar({
  demoMode = false,
  mode = "edit",
  onGeneratePlan,
  onWorkspaceChange,
  plan,
  workspace,
}: {
  demoMode?: boolean;
  mode?: "generate" | "edit";
  onGeneratePlan?: (situation: string) => Promise<void>;
  onWorkspaceChange: Dispatch<SetStateAction<ActionPlanWorkspaceState>>;
  plan: PersistableActionPlan;
  workspace: ActionPlanWorkspaceState;
}) {
  const [command, setCommand] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [undoSnapshot, setUndoSnapshot] =
    useState<ActionPlanWorkspaceState | null>(null);

  async function submitCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedCommand = command.trim();
    const minimumLength = mode === "generate" ? 20 : 2;
    const editDisabled = demoMode && mode === "edit";
    if (editDisabled || isSubmitting || trimmedCommand.length < minimumLength) {
      return;
    }

    setIsSubmitting(true);
    setFeedback("");
    try {
      if (mode === "generate") {
        if (!onGeneratePlan) {
          throw new Error("La génération du plan n’est pas disponible.");
        }
        await onGeneratePlan(trimmedCommand);
        setCommand("");
        return;
      }

      const response = await fetch("/api/action-plan/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: trimmedCommand, plan, workspace }),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        operations?: unknown;
      } | null;
      if (!response.ok) {
        throw new Error(
          body?.error || "La modification n’a pas pu être appliquée.",
        );
      }

      const operations = actionPlanCommandOperationsSchema.parse(
        body?.operations,
      );
      if (operations.length === 0) {
        setFeedback("Précisez le changement souhaité.");
        return;
      }

      const applied = applyActionPlanCommandOperations(
        plan,
        workspace,
        operations,
      );
      onWorkspaceChange(applied.workspace);
      setUndoSnapshot(applied.undoSnapshot);
      setCommand("");
      setFeedback("Plan mis à jour.");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "La modification n’a pas pu être appliquée.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function undoLastCommand() {
    if (!undoSnapshot) return;
    onWorkspaceChange(undoSnapshot);
    setUndoSnapshot(null);
    setFeedback("Modification annulée.");
  }

  const minimumLength = mode === "generate" ? 20 : 2;
  const inputDisabled = isSubmitting || (demoMode && mode === "edit");

  return (
    <div className="fixed inset-x-4 bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-40 mx-auto w-auto max-w-3xl xl:inset-x-auto xl:bottom-4 xl:left-1/2 xl:w-full xl:-translate-x-1/2">
      <form
        onSubmit={submitCommand}
        className="flex min-h-14 items-center gap-2 rounded-full border border-dema-line bg-white/95 p-1.5 pl-5 shadow-[0_16px_40px_rgba(23,35,29,0.12)] backdrop-blur"
      >
        <label htmlFor="action-plan-command" className="sr-only">
          {mode === "generate"
            ? "Décrivez votre situation pour générer un plan"
            : "Modifier le plan avec une commande"}
        </label>
        <input
          id="action-plan-command"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          disabled={inputDisabled}
          maxLength={mode === "generate" ? 4_000 : 1_000}
          placeholder={
            demoMode && mode === "edit"
              ? "Commande IA désactivée dans la démo"
              : mode === "generate"
                ? "Décrivez votre situation pour générer un plan"
                : "Que voulez-vous modifier ?"
          }
          className="min-w-0 flex-1 bg-transparent text-sm text-brand-blue outline-none placeholder:text-dema-muted disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={inputDisabled || command.trim().length < minimumLength}
          aria-label={mode === "generate" ? "Générer le plan" : "Appliquer la commande"}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-forest text-white transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:bg-dema-muted/45"
        >
          {isSubmitting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </form>
      {feedback || undoSnapshot ? (
        <div className="mt-1 flex min-h-6 items-center justify-center gap-3 px-4 text-xs text-dema-muted" aria-live="polite">
          <span>{feedback}</span>
          {undoSnapshot ? (
            <button
              type="button"
              onClick={undoLastCommand}
              className="inline-flex items-center gap-1 font-medium text-dema-forest hover:text-brand-blue"
            >
              <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
              Annuler
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
