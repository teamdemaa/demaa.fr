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
  onWorkspaceChange,
  plan,
  workspace,
}: {
  demoMode?: boolean;
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
    if (demoMode || isSubmitting || trimmedCommand.length < 2) return;

    setIsSubmitting(true);
    setFeedback("");
    try {
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

  return (
    <div className="sticky bottom-[calc(6.25rem+env(safe-area-inset-bottom))] z-30 mx-auto mt-8 w-full max-w-3xl md:bottom-4">
      <form
        onSubmit={submitCommand}
        className="flex min-h-14 items-center gap-2 rounded-full border border-dema-line bg-white/95 p-1.5 pl-5 shadow-[0_16px_40px_rgba(23,35,29,0.12)] backdrop-blur"
      >
        <label htmlFor="action-plan-command" className="sr-only">
          Modifier le plan avec une commande
        </label>
        <input
          id="action-plan-command"
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          disabled={demoMode || isSubmitting}
          maxLength={1_000}
          placeholder={
            demoMode
              ? "Commande IA désactivée dans la démo"
              : "Que voulez-vous modifier ?"
          }
          className="min-w-0 flex-1 bg-transparent text-sm text-brand-blue outline-none placeholder:text-dema-muted disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={demoMode || isSubmitting || command.trim().length < 2}
          aria-label="Appliquer la commande"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-forest text-white transition hover:bg-brand-blue disabled:cursor-not-allowed disabled:bg-dema-muted/45"
        >
          {isSubmitting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </form>
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
    </div>
  );
}
