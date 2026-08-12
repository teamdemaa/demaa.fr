"use client";

import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleDot,
  Columns3,
  Copy,
  LayoutList,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useRef,
  useState,
} from "react";
import type {
  PersistableActionPlan,
} from "@/lib/action-plan-contract";
import {
  getActionPlanActions,
  getActionPlanStrategyFields,
  type ActionPlanViewAction,
} from "@/lib/action-plan-view-model";
import {
  compactActionPlanSteps,
  type ActionPlanTaskStatus,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";

type PlanSection = "tasks" | "strategy";
type TaskView = "list" | "kanban";
type TaskFilter = "week" | "all" | "overdue" | "done";

const statusMeta: Record<
  ActionPlanTaskStatus,
  { label: string; icon: typeof Circle }
> = {
  todo: { label: "À faire", icon: Circle },
  in_progress: { label: "En cours", icon: CircleDot },
  done: { label: "Terminé", icon: CheckCircle2 },
};

function TaskStatusButton({
  status,
  onChange,
  compact = false,
}: {
  status: ActionPlanTaskStatus;
  onChange: (status: ActionPlanTaskStatus) => void;
  compact?: boolean;
}) {
  const StatusIcon = statusMeta[status].icon;
  const nextStatus: ActionPlanTaskStatus =
    status === "todo" ? "in_progress" : status === "in_progress" ? "done" : "todo";

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onChange(nextStatus);
      }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 ${
        compact ? "h-9 w-9" : "min-h-10 gap-2 px-3 text-xs font-medium"
      } ${
        status === "done"
          ? "border-dema-forest bg-dema-forest text-white"
          : status === "in_progress"
            ? "border-dema-forest/25 bg-dema-sage text-dema-forest"
            : "border-dema-line bg-dema-paper text-dema-muted"
      }`}
      aria-label={`${statusMeta[status].label}. Passer à ${statusMeta[nextStatus].label}`}
      title={`Passer à ${statusMeta[nextStatus].label}`}
    >
      <StatusIcon className="h-4 w-4" aria-hidden="true" />
      {!compact ? statusMeta[status].label : null}
    </button>
  );
}

function ActionDrawer({
  action,
  workspace,
  onWorkspaceChange,
  onClose,
  onDelete,
}: {
  action: ActionPlanViewAction;
  workspace: ActionPlanWorkspaceState;
  onWorkspaceChange: Dispatch<SetStateAction<ActionPlanWorkspaceState>>;
  onClose: () => void;
  onDelete: () => void;
}) {
  const taskState = workspace.tasks[action.id];
  const effectiveTitle = taskState?.overrides.title || action.title;
  const effectiveObjective = taskState?.overrides.objective || action.objective;
  const effectiveSteps = taskState?.overrides.steps || action.steps;
  const effectiveSupport =
    taskState?.overrides.support === undefined
      ? action.support
      : taskState.overrides.support;
  const [draftTitle, setDraftTitle] = useState(effectiveTitle);
  const [draftObjective, setDraftObjective] = useState(effectiveObjective);
  const [draftSteps, setDraftSteps] = useState(effectiveSteps.join("\n"));
  const [draftSupportLabel, setDraftSupportLabel] = useState(
    effectiveSupport?.label || "",
  );
  const [draftSupportContent, setDraftSupportContent] = useState(
    effectiveSupport?.content || "",
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const skipNextTaskBlur = useRef(false);

  function updateTask(
    updater: (current: NonNullable<typeof taskState>) => NonNullable<typeof taskState>,
  ) {
    onWorkspaceChange((current) => ({
      ...current,
      tasks: {
        ...current.tasks,
        [action.id]: updater(current.tasks[action.id]),
      },
    }));
  }

  function saveTitle() {
    const nextTitle = draftTitle.trim().slice(0, 140);
    if (!nextTitle) {
      setDraftTitle(effectiveTitle);
      return;
    }
    updateTask((current) => ({
      ...current,
      overrides: {
        ...current.overrides,
        title: nextTitle,
      },
    }));
  }

  function saveObjective() {
    const nextObjective = draftObjective.trim().slice(0, 260);
    if (!nextObjective) {
      setDraftObjective(effectiveObjective);
      return;
    }
    updateTask((current) => ({
      ...current,
      overrides: {
        ...current.overrides,
        objective: nextObjective,
      },
    }));
  }

  function saveSteps() {
    const {
      steps: nextSteps,
      completedStepIndexes,
    } = compactActionPlanSteps(
      draftSteps.split("\n"),
      taskState.completedStepIndexes,
    );
    if (nextSteps.length === 0) {
      setDraftSteps(effectiveSteps.join("\n"));
      return;
    }
    updateTask((current) => ({
      ...current,
      completedStepIndexes,
      overrides: {
        ...current.overrides,
        steps: nextSteps,
      },
    }));
    setDraftSteps(nextSteps.join("\n"));
  }

  function saveSupport() {
    const label = draftSupportLabel.trim().slice(0, 100);
    const content = draftSupportContent.trim().slice(0, 2_000);
    updateTask((current) => ({
      ...current,
      overrides: {
        ...current.overrides,
        support: label && content
          ? { type: effectiveSupport?.type || null, label, content }
          : null,
      },
    }));
  }

  function saveDraftsAndClose() {
    saveTitle();
    saveObjective();
    saveSteps();
    saveSupport();
    onClose();
  }

  function addTaskAfter(
    index: number,
    source: HTMLTextAreaElement,
  ) {
    const tasks = draftSteps.split("\n");
    if (tasks.length >= 7) return;

    const nextTasks = [
      ...tasks.slice(0, index + 1),
      "",
      ...tasks.slice(index + 1),
    ];
    const dialog = source.closest('[role="dialog"]');
    skipNextTaskBlur.current = true;
    setDraftSteps(nextTasks.join("\n"));

    window.setTimeout(() => {
      const nextInput = dialog?.querySelector<HTMLTextAreaElement>(
        `[data-task-index="${index + 1}"]`,
      );
      nextInput?.focus();
    }, 0);
  }

  function removeTask(index: number) {
    const currentSteps = draftSteps.split("\n");
    if (currentSteps.length <= 1) return;

    const nextLines = currentSteps.filter((_, currentIndex) => currentIndex !== index);
    const remappedCompletedIndexes = taskState.completedStepIndexes.flatMap(
      (completedIndex) => {
        if (completedIndex === index) return [];
        return [completedIndex > index ? completedIndex - 1 : completedIndex];
      },
    );
    const compacted = compactActionPlanSteps(
      nextLines,
      remappedCompletedIndexes,
    );
    if (compacted.steps.length === 0) return;

    setDraftSteps(compacted.steps.join("\n"));
    updateTask((current) => ({
      ...current,
      completedStepIndexes: compacted.completedStepIndexes,
      overrides: {
        ...current.overrides,
        steps: compacted.steps,
      },
    }));
  }

  async function copySupport() {
    const content = draftSupportContent.trim();
    if (!content) return;
    await navigator.clipboard.writeText(content);
  }

  return (
    <div className="fixed inset-0 z-[110] flex justify-end bg-brand-blue/18 backdrop-blur-[2px]" role="presentation" onMouseDown={saveDraftsAndClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-drawer-title"
        className="mt-auto max-h-[92dvh] w-full overflow-y-auto rounded-t-[1.5rem] bg-dema-paper shadow-2xl sm:mt-0 sm:h-full sm:max-h-none sm:max-w-xl sm:rounded-none"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-dema-line bg-dema-paper/95 px-5 py-5 backdrop-blur sm:px-7">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">Action</p>
            <textarea
              id="action-drawer-title"
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              onBlur={saveTitle}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
              }}
              rows={1}
              aria-label="Titre de l’action"
              className="mt-1 min-h-7 w-full resize-none overflow-hidden rounded-lg bg-transparent text-xl font-medium leading-snug text-brand-blue [field-sizing:content] outline-none transition focus:bg-dema-sage/35"
            />
          </div>
          <button type="button" onClick={saveDraftsAndClose} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dema-line" aria-label="Fermer">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-7 px-5 py-6 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <TaskStatusButton
              status={taskState.status}
              onChange={(status) => updateTask((current) => ({ ...current, status }))}
            />
            <label className="inline-flex min-h-10 items-center gap-2 rounded-full border border-dema-line px-3 text-xs text-dema-muted">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <input
                type="date"
                value={taskState.dueDate || ""}
                onChange={(event) => updateTask((current) => ({ ...current, dueDate: event.target.value || null }))}
                className="bg-transparent text-brand-blue outline-none"
                aria-label="Échéance"
              />
            </label>
          </div>

          <div>
            <label htmlFor="action-drawer-objective" className="text-xs font-medium uppercase tracking-[0.12em] text-dema-muted">
              Résultat attendu
            </label>
            <textarea
              id="action-drawer-objective"
              value={draftObjective}
              onChange={(event) => setDraftObjective(event.target.value)}
              onBlur={saveObjective}
              rows={2}
              className="mt-1.5 min-h-[3.75rem] w-full resize-none overflow-hidden rounded-lg bg-brand-blue/[0.035] px-2 py-1.5 text-sm leading-relaxed text-brand-blue [field-sizing:content] outline-none transition focus:bg-dema-sage/35"
            />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-forest">Tâches</p>
            <div className="mt-3 space-y-2">
              {draftSteps.split("\n").map((step, index) => {
                const checked = taskState.completedStepIndexes.includes(index);
                return (
                  <div key={`${action.id}-${index}`} className="group flex items-start gap-3 rounded-xl bg-dema-sage/45 px-3 py-3 text-sm leading-relaxed text-brand-blue">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => updateTask((current) => ({
                        ...current,
                        completedStepIndexes: checked
                          ? current.completedStepIndexes.filter((item) => item !== index)
                          : [...current.completedStepIndexes, index].sort((left, right) => left - right),
                      }))}
                      className="mt-0.5 h-4 w-4 accent-[#2f664a]"
                      aria-label={`Marquer la tâche ${index + 1} comme terminée`}
                    />
                    <textarea
                      value={step}
                      onChange={(event) => {
                        const nextSteps = draftSteps.split("\n");
                        nextSteps[index] = event.target.value.replace(/\n/g, " ");
                        setDraftSteps(nextSteps.join("\n"));
                      }}
                      onBlur={() => {
                        if (skipNextTaskBlur.current) {
                          skipNextTaskBlur.current = false;
                          return;
                        }
                        saveSteps();
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return;
                        event.preventDefault();
                        addTaskAfter(index, event.currentTarget);
                      }}
                      rows={1}
                      aria-label={`Tâche ${index + 1}`}
                      data-task-index={index}
                      className={`min-h-6 min-w-0 flex-1 resize-none overflow-hidden bg-transparent [field-sizing:content] outline-none transition focus:bg-dema-paper/70 ${checked ? "text-dema-muted" : ""}`}
                    />
                    {draftSteps.split("\n").length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-dema-muted/70 transition hover:bg-dema-paper hover:text-red-700 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                        aria-label={`Supprimer la tâche ${index + 1}`}
                        title="Supprimer la tâche"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {effectiveSupport || draftSupportLabel || draftSupportContent ? (
            <div className="rounded-[1.1rem] border border-dema-line p-4">
              <div className="flex items-center justify-between gap-3">
                <input
                  value={draftSupportLabel}
                  onChange={(event) => setDraftSupportLabel(event.target.value)}
                  onBlur={saveSupport}
                  aria-label="Titre du support"
                  className="min-w-0 flex-1 bg-transparent text-xs font-medium uppercase tracking-[0.12em] text-dema-forest outline-none"
                />
                <button type="button" onClick={() => void copySupport()} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-dema-line px-3 text-xs text-dema-forest">
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copier
                </button>
              </div>
              <textarea
                value={draftSupportContent}
                onChange={(event) => setDraftSupportContent(event.target.value)}
                onBlur={saveSupport}
                rows={4}
                aria-label="Contenu du support"
                className="mt-3 min-h-[5rem] w-full resize-y whitespace-pre-wrap bg-transparent text-sm leading-relaxed text-brand-blue outline-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setDraftSupportLabel("Nouveau support")}
              className="text-sm text-dema-muted underline decoration-dema-line underline-offset-4 hover:text-dema-forest"
            >
              Ajouter un support
            </button>
          )}

          <label className="block text-xs font-medium text-dema-muted">
            Notes personnelles
            <textarea
              value={taskState.notes}
              onChange={(event) => updateTask((current) => ({ ...current, notes: event.target.value.slice(0, 4_000) }))}
              rows={4}
              placeholder="Ajoutez un suivi, une décision ou un point à retenir…"
              className="mt-2 w-full resize-y rounded-xl border border-dema-line bg-dema-cream p-3 text-sm leading-relaxed text-brand-blue outline-none focus:border-dema-forest/30"
            />
          </label>

          <div className="border-t border-dema-line pt-5">
            {confirmingDelete ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" role="alert">
                <p className="text-sm text-brand-blue">Supprimer cette action ?</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(false)}
                    className="min-h-10 rounded-full px-4 text-sm text-dema-muted transition hover:text-brand-blue"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete();
                      onClose();
                    }}
                    className="min-h-10 rounded-full border border-red-200 px-4 text-sm text-red-700 transition hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="inline-flex min-h-10 items-center gap-2 text-sm text-dema-muted transition hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Supprimer l’action
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function StrategyPanel({
  plan,
  workspace,
  onWorkspaceChange,
}: {
  plan: PersistableActionPlan;
  workspace: ActionPlanWorkspaceState;
  onWorkspaceChange: Dispatch<SetStateAction<ActionPlanWorkspaceState>>;
}) {
  const strategySections = getActionPlanStrategyFields(plan);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {strategySections.map((section) => {
        const overrides = workspace.strategyOverrides[section.overrideKey];
        const answers = section.fields.map((field, index) =>
          overrides?.[`answer${["One", "Two", "Three"][index]}` as keyof typeof overrides] ?? field.value,
        );

        return (
          <article key={section.key} className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 shadow-[0_10px_30px_rgba(23,35,29,0.035)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">{section.label}</p>
            <div className="mt-4 space-y-4">
              {section.fields.map((field, index) => (
                <div key={field.key}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-blue/70">{field.label}</p>
                  <textarea
                    value={answers[index]}
                    onChange={(event) => {
                      const answerKey = `answer${["One", "Two", "Three"][index]}` as "answerOne" | "answerTwo" | "answerThree";
                      onWorkspaceChange((current) => ({
                        ...current,
                        strategyOverrides: {
                          ...current.strategyOverrides,
                          [section.overrideKey]: {
                            ...current.strategyOverrides[section.overrideKey],
                            [answerKey]: event.target.value,
                          },
                        },
                      }));
                    }}
                    rows={2}
                    maxLength={500}
                    aria-label={field.label}
                    className="mt-1.5 min-h-[3.75rem] w-full resize-none overflow-hidden rounded-lg bg-brand-blue/[0.035] px-2 py-1.5 text-sm leading-relaxed text-brand-blue/75 [field-sizing:content] outline-none transition focus:bg-dema-sage/40 focus:text-brand-blue"
                  />
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function ActionPlanResult({
  plan,
  workspace,
  onWorkspaceChange,
  headerActions,
  manualMode = false,
  onAddAction,
  onDeleteAction,
  onGenerateLater,
}: {
  plan: PersistableActionPlan;
  workspace: ActionPlanWorkspaceState;
  onWorkspaceChange: Dispatch<SetStateAction<ActionPlanWorkspaceState>>;
  headerActions?: ReactNode;
  manualMode?: boolean;
  onAddAction?: () => void;
  onDeleteAction: (actionId: string) => void;
  onGenerateLater?: () => void;
}) {
  const [section, setSection] = useState<PlanSection>("tasks");
  const [view, setView] = useState<TaskView>("list");
  const [filter, setFilter] = useState<TaskFilter>("week");
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const allActions: ActionPlanViewAction[] = [
    ...getActionPlanActions(plan),
    ...workspace.addedActions,
  ];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + ((7 - today.getDay()) % 7));
  const visibleActions = allActions
    .filter((action) => !workspace.deletedActionIds.includes(action.id))
    .filter((action) => {
      const task = workspace.tasks[action.id];
      if (!task) return false;
      if (filter === "all") return true;
      if (filter === "done") return task.status === "done";
      const dueDate = task.dueDate ? new Date(`${task.dueDate}T00:00:00`) : null;
      if (filter === "overdue") {
        return task.status !== "done" && Boolean(dueDate && dueDate < today);
      }
      return !dueDate || dueDate <= endOfWeek;
    });
  const selectedAction = visibleActions.find((action) => action.id === selectedActionId) || null;

  function updateStatus(actionId: string, status: ActionPlanTaskStatus) {
    onWorkspaceChange((current) => ({
      ...current,
      tasks: {
        ...current.tasks,
        [actionId]: { ...current.tasks[actionId], status },
      },
    }));
  }

  return (
    <div>
      <div className="mb-7 flex items-end justify-between gap-1 border-b border-dema-line sm:gap-3">
        <div className="flex items-center gap-1" role="tablist" aria-label="Plan d’action">
          <button type="button" role="tab" aria-selected={section === "tasks"} onClick={() => setSection("tasks")} className={`-mb-px min-h-12 border-b-2 px-2.5 text-xs font-medium sm:px-4 sm:text-sm ${section === "tasks" ? "border-dema-forest text-dema-forest" : "border-transparent text-dema-muted"}`}>À faire</button>
          <button type="button" role="tab" aria-selected={section === "strategy"} onClick={() => setSection("strategy")} className={`-mb-px min-h-12 border-b-2 px-2.5 text-xs font-medium sm:px-4 sm:text-sm ${section === "strategy" ? "border-dema-forest text-dema-forest" : "border-transparent text-dema-muted"}`}>Stratégie</button>
        </div>
      </div>

      {section === "tasks" ? (
        <section aria-labelledby="tasks-title">
          <h2 id="tasks-title" className="sr-only">Actions du plan</h2>
          <div className="flex flex-wrap items-center gap-2">
            {onAddAction ? (
              <button type="button" onClick={onAddAction} disabled={allActions.length >= 50} className="demaa-secondary-button min-h-10 gap-2 px-4 text-xs disabled:cursor-not-allowed disabled:opacity-45">
                <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter une action
              </button>
            ) : null}
            <label className="sr-only" htmlFor="action-plan-filter">Filtrer les actions</label>
            <select
              id="action-plan-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value as TaskFilter)}
              className="min-h-10 rounded-full border border-dema-line bg-dema-paper px-4 text-xs text-brand-blue outline-none focus:border-dema-forest/35"
            >
              <option value="week">Cette semaine</option>
              <option value="all">Toutes les actions</option>
              <option value="overdue">En retard</option>
              <option value="done">Terminées</option>
            </select>
            <div className="inline-flex w-fit rounded-full border border-dema-line bg-dema-paper p-1" aria-label="Vue des actions">
              <button type="button" onClick={() => setView("list")} aria-pressed={view === "list"} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${view === "list" ? "bg-dema-sage text-dema-forest" : "text-dema-muted"}`}><LayoutList className="h-4 w-4" aria-hidden="true" /> Liste</button>
              <button type="button" onClick={() => setView("kanban")} aria-pressed={view === "kanban"} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium ${view === "kanban" ? "bg-dema-sage text-dema-forest" : "text-dema-muted"}`}><Columns3 className="h-4 w-4" aria-hidden="true" /> Kanban</button>
            </div>
            {headerActions}
          </div>

          {manualMode && allActions.length === 0 ? (
            <div className="mt-6 rounded-[1.25rem] border border-dashed border-dema-line bg-dema-paper px-6 py-10 text-center">
              {onAddAction ? (
                <button type="button" onClick={onAddAction} className="demaa-secondary-button min-h-11 gap-2 px-5">
                  <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter une action
                </button>
              ) : null}
              {onGenerateLater ? (
                <button type="button" onClick={onGenerateLater} className="mx-auto mt-4 block text-sm text-dema-muted underline decoration-dema-line underline-offset-4 transition hover:text-dema-forest">
                  Générer un plan à partir de ma situation
                </button>
              ) : null}
            </div>
          ) : null}

          {visibleActions.length > 0 && view === "list" ? (
            <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper">
              {visibleActions.map((action) => {
                const taskState = workspace.tasks[action.id];
                const title = taskState.overrides.title || action.title;
                return (
                  <div key={action.id} className="flex items-center gap-3 border-b border-dema-line px-4 py-3 last:border-b-0 sm:px-5">
                    <TaskStatusButton status={taskState.status} onChange={(status) => updateStatus(action.id, status)} compact />
                    <button type="button" onClick={() => setSelectedActionId(action.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none">
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-medium leading-snug ${taskState.status === "done" ? "text-dema-muted" : "text-brand-blue"}`}>{title}</span>
                        <span className="mt-1 block truncate text-xs text-dema-muted">{action.channelOrTool}{action.support ? ` · ${action.support.label}` : ""}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-dema-muted" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : visibleActions.length > 0 ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {(Object.keys(statusMeta) as ActionPlanTaskStatus[]).map((status) => (
                <section key={status} className="rounded-[1.25rem] bg-dema-sage/45 p-3" aria-labelledby={`kanban-${status}`}>
                  <h3 id={`kanban-${status}`} className="px-1 py-2 text-xs font-medium uppercase tracking-[0.12em] text-dema-muted">{statusMeta[status].label}</h3>
                  <div className="space-y-2">
                    {visibleActions.filter((action) => workspace.tasks[action.id].status === status).map((action) => (
                      <article key={action.id} className="rounded-xl border border-dema-line bg-dema-paper p-4 shadow-[0_7px_18px_rgba(23,35,29,0.03)]">
                        <button type="button" onClick={() => setSelectedActionId(action.id)} className="w-full text-left">
                          <span className="block text-sm font-medium leading-snug text-brand-blue">{workspace.tasks[action.id].overrides.title || action.title}</span>
                          <span className="mt-2 block text-xs text-dema-muted">{action.channelOrTool}</span>
                        </button>
                        <div className="mt-3">
                          <TaskStatusButton status={status} onChange={(nextStatus) => updateStatus(action.id, nextStatus)} />
                        </div>
                      </article>
                    ))}
                    {visibleActions.every((action) => workspace.tasks[action.id].status !== status) ? <p className="px-2 py-4 text-xs text-dema-muted">Aucune action</p> : null}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {manualMode && visibleActions.length > 0 && onGenerateLater ? (
            <div className="mt-5 text-center">
              <button type="button" onClick={onGenerateLater} className="text-sm text-dema-muted underline decoration-dema-line underline-offset-4 transition hover:text-dema-forest">
                Générer un plan à partir de ma situation
              </button>
            </div>
          ) : null}
        </section>
      ) : (
        <section aria-label="Stratégie">
          <StrategyPanel plan={plan} workspace={workspace} onWorkspaceChange={onWorkspaceChange} />
        </section>
      )}

      {selectedAction ? (
        <ActionDrawer
          action={selectedAction}
          workspace={workspace}
          onWorkspaceChange={onWorkspaceChange}
          onClose={() => setSelectedActionId(null)}
          onDelete={() => onDeleteAction(selectedAction.id)}
        />
      ) : null}
    </div>
  );
}
