"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  Columns3,
  Copy,
  FileText,
  LayoutList,
  Plus,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import ActionPlanGenerationBar from "@/components/ActionPlanGenerationBar";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import { useActionPlanContextualAids } from "@/hooks/useActionPlanContextualAids";
import { isBlankManualActionPlan } from "@/lib/action-plan-manual";
import {
  type ActionPlanContextualAid,
} from "@/lib/action-plan-contextual-aids";
import type {
  PersistableActionPlan,
} from "@/lib/action-plan-contract";
import {
  getActionPlanActions,
  type ActionPlanViewAction,
} from "@/lib/action-plan-view-model";
import {
  compactActionPlanSteps,
  type ActionPlanTaskStatus,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";
import type { InterfaceLocaleCode } from "@/lib/international-context";

type TaskView = "list" | "kanban";
type TaskFilter = "week" | "all" | "overdue" | "done";

function getTaskFilterLabels(localeCode: InterfaceLocaleCode): Record<TaskFilter, string> {
  return localeCode === "en" ? {
    week: "This week",
    all: "All actions",
    overdue: "Overdue",
    done: "Completed",
  } : {
    week: "Cette semaine",
    all: "Toutes les actions",
    overdue: "En retard",
    done: "Terminées",
  };
}

function TaskFilterMenu({
  value,
  onChange,
  localeCode,
}: {
  value: TaskFilter;
  onChange: (value: TaskFilter) => void;
  localeCode: InterfaceLocaleCode;
}) {
  const taskFilterLabels = getTaskFilterLabels(localeCode);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1 sm:flex-none">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-10 w-full min-w-0 items-center justify-between gap-3 rounded-full border border-dema-line bg-dema-paper px-4 text-xs text-brand-blue transition hover:border-dema-forest/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 sm:w-40"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="truncate">{taskFilterLabels[value]}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-dema-forest transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={localeCode === "en" ? "Filter actions" : "Filtrer les actions"}
          className="demaa-popover-shadow absolute left-0 top-full z-50 mt-2 min-w-full overflow-hidden rounded-2xl border border-dema-line bg-dema-paper p-1.5"
        >
          {(Object.keys(taskFilterLabels) as TaskFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              role="menuitemradio"
              aria-checked={value === option}
              onClick={() => {
                onChange(option);
                setOpen(false);
                buttonRef.current?.focus();
              }}
              className={`flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2 text-left text-xs transition ${
                value === option
                  ? "bg-dema-sage text-dema-forest"
                  : "text-brand-blue hover:bg-dema-soft"
              }`}
            >
              <span className="whitespace-nowrap">{taskFilterLabels[option]}</span>
              <Check
                className={`h-3.5 w-3.5 ${value === option ? "opacity-100" : "opacity-0"}`}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function getStatusMeta(localeCode: InterfaceLocaleCode): Record<
  ActionPlanTaskStatus,
  { label: string; icon: typeof Circle }
> {
  return localeCode === "en" ? {
    todo: { label: "To do", icon: Circle },
    in_progress: { label: "In progress", icon: CircleDot },
    done: { label: "Completed", icon: CheckCircle2 },
  } : {
    todo: { label: "À faire", icon: Circle },
    in_progress: { label: "En cours", icon: CircleDot },
    done: { label: "Terminé", icon: CheckCircle2 },
  };
}

function TaskStatusButton({
  status,
  onChange,
  compact = false,
  localeCode,
}: {
  status: ActionPlanTaskStatus;
  onChange: (status: ActionPlanTaskStatus) => void;
  compact?: boolean;
  localeCode: InterfaceLocaleCode;
}) {
  const statusMeta = getStatusMeta(localeCode);
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
      aria-label={`${statusMeta[status].label}. ${localeCode === "en" ? "Move to" : "Passer à"} ${statusMeta[nextStatus].label}`}
      title={`${localeCode === "en" ? "Move to" : "Passer à"} ${statusMeta[nextStatus].label}`}
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
  onOpenService,
  onOpenSolution,
  contextualAid,
  localeCode,
}: {
  action: ActionPlanViewAction;
  workspace: ActionPlanWorkspaceState;
  onWorkspaceChange: Dispatch<SetStateAction<ActionPlanWorkspaceState>>;
  onClose: () => void;
  onDelete: () => void;
  onOpenService?: (serviceSlug: string) => void;
  onOpenSolution?: (input: { resourceSlug: string; systemId: string }) => void;
  contextualAid?: ActionPlanContextualAid;
  localeCode: InterfaceLocaleCode;
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
  const [supportEditorOpen, setSupportEditorOpen] = useState(
    Boolean(effectiveSupport),
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

  function openSupportEditor() {
    setDraftSupportLabel("Support personnel");
    setSupportEditorOpen(true);
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

  const supportIsCopyable =
    effectiveSupport?.type === "message" ||
    effectiveSupport?.type === "email" ||
    effectiveSupport?.type === "script";

  return (
    <div className="fixed inset-0 z-[110] flex justify-end bg-brand-blue/18 backdrop-blur-[2px]" role="presentation" onMouseDown={saveDraftsAndClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-drawer-title"
        className="demaa-dialog-shadow mt-auto max-h-[92dvh] w-full overflow-y-auto rounded-t-[1.5rem] bg-dema-paper sm:mt-0 sm:h-full sm:max-h-none sm:max-w-xl sm:rounded-none"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-dema-line bg-dema-paper/95 px-5 py-5 backdrop-blur sm:px-7">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-dema-forest">{localeCode === "en" ? "Action" : "Action"}</p>
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
              aria-label={localeCode === "en" ? "Action title" : "Titre de l’action"}
              className="mt-1 min-h-7 w-full resize-none overflow-hidden rounded-lg bg-transparent text-xl font-medium leading-snug text-brand-blue [field-sizing:content] outline-none transition focus:bg-dema-sage/35"
            />
          </div>
          <button type="button" onClick={saveDraftsAndClose} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dema-line" aria-label={localeCode === "en" ? "Close" : "Fermer"}>
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-7 px-5 py-6 sm:px-7">
          <div className="flex flex-wrap items-center gap-2">
            <TaskStatusButton
              status={taskState.status}
              onChange={(status) => updateTask((current) => ({ ...current, status }))}
              localeCode={localeCode}
            />
            <label className="inline-flex min-h-10 items-center gap-2 rounded-full border border-dema-line px-3 text-xs text-dema-muted">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <input
                type="date"
                value={taskState.dueDate || ""}
                onChange={(event) => updateTask((current) => ({ ...current, dueDate: event.target.value || null }))}
                className="bg-transparent text-brand-blue outline-none"
                aria-label={localeCode === "en" ? "Due date" : "Échéance"}
              />
            </label>
          </div>

          <div>
            <label htmlFor="action-drawer-objective" className="text-xs font-medium uppercase tracking-[0.12em] text-dema-muted">
              {localeCode === "en" ? "Expected result" : "Résultat attendu"}
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
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-forest">{localeCode === "en" ? "Tasks" : "Tâches"}</p>
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
                      aria-label={localeCode === "en" ? `Mark task ${index + 1} as completed` : `Marquer la tâche ${index + 1} comme terminée`}
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
                      aria-label={localeCode === "en" ? `Task ${index + 1}` : `Tâche ${index + 1}`}
                      data-task-index={index}
                      className={`min-h-6 min-w-0 flex-1 resize-none overflow-hidden bg-transparent [field-sizing:content] outline-none transition focus:bg-dema-paper/70 ${checked ? "text-dema-muted" : ""}`}
                    />
                    {draftSteps.split("\n").length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-dema-muted/70 transition hover:bg-dema-paper hover:text-red-700 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                        aria-label={localeCode === "en" ? `Delete task ${index + 1}` : `Supprimer la tâche ${index + 1}`}
                        title={localeCode === "en" ? "Delete task" : "Supprimer la tâche"}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {supportEditorOpen || effectiveSupport || draftSupportLabel || draftSupportContent ? (
            <div className="rounded-[1.1rem] border border-dema-line p-4">
              <div className="flex items-center justify-between gap-3">
                <input
                  value={draftSupportLabel}
                  onChange={(event) => setDraftSupportLabel(event.target.value)}
                  onBlur={saveSupport}
                  aria-label={localeCode === "en" ? "Support title" : "Titre du support"}
                  className="min-w-0 flex-1 bg-transparent text-xs font-medium uppercase tracking-[0.12em] text-dema-forest outline-none"
                />
                {supportIsCopyable ? (
                  <button type="button" onClick={() => void copySupport()} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-dema-line px-3 text-xs text-dema-forest">
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" /> {localeCode === "en" ? "Copy" : "Copier"}
                  </button>
                ) : null}
              </div>
              <textarea
                value={draftSupportContent}
                onChange={(event) => setDraftSupportContent(event.target.value)}
                onBlur={saveSupport}
                rows={4}
                aria-label={localeCode === "en" ? "Support content" : "Contenu du support"}
                className="mt-3 min-h-[5rem] w-full resize-y whitespace-pre-wrap bg-transparent text-sm leading-relaxed text-brand-blue outline-none"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={openSupportEditor}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-dema-line px-4 text-sm text-dema-forest transition hover:border-dema-forest/30 hover:bg-dema-sage/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {localeCode === "en" ? "Add personal support" : "Ajouter un support personnel"}
            </button>
          )}

          {contextualAid?.model || contextualAid?.organisation ? (
            <section aria-label="Aides utiles dans votre système">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-muted">
                Dans votre système
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {contextualAid?.model ? (
                  <button
                    type="button"
                    onClick={() => onOpenSolution?.({
                      resourceSlug: contextualAid.model!.resourceSlug,
                      systemId: contextualAid.model!.systemId,
                    })}
                    className="group rounded-xl bg-dema-sage/45 px-3 py-3 text-left transition hover:bg-dema-sage/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-dema-muted">
                          {contextualAid.model.formatLabel}
                        </p>
                        <p className="mt-0.5 text-sm text-brand-blue">
                          {contextualAid.model.label}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-dema-muted">
                          {contextualAid.model.description}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-dema-forest">
                          Ouvrir le modèle
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </button>
                ) : null}
                {contextualAid?.organisation ? (
                  <Link
                    href={`/systemes/${contextualAid.organisation.systemId}/processus#${encodeURIComponent(contextualAid.organisation.routineId)}`}
                    className="group rounded-xl bg-dema-sage/45 px-3 py-3 transition hover:bg-dema-sage/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30"
                  >
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-dema-muted">
                          Processus associé
                        </p>
                        <p className="mt-0.5 text-sm text-brand-blue">
                          {contextualAid.organisation.label}
                        </p>
                        <p className="mt-1 text-xs text-dema-muted">
                          {contextualAid.organisation.cadence}
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-dema-forest">
                          Voir le processus
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ) : null}
              </div>
            </section>
          ) : null}

          {contextualAid?.tool || contextualAid?.accompaniment ? (
            <section aria-label="Solutions utiles pour cette action">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-muted">
                Pour faciliter cette action
              </p>
              <div className="mt-3 space-y-2">
                {contextualAid.tool ? (
                  <button
                    type="button"
                    onClick={() => onOpenSolution?.({
                      resourceSlug: contextualAid.tool!.resourceSlug,
                      systemId: contextualAid.tool!.systemId,
                    })}
                    className="group flex w-full items-start gap-3 rounded-xl border border-dema-line bg-dema-paper px-4 py-3 text-left transition hover:border-dema-forest/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30"
                  >
                    <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-dema-muted">
                        {contextualAid.tool.relationship === "selected_in_solutions"
                          ? "Sélectionné dans vos Solutions"
                          : contextualAid.tool.relationship === "already_in_use"
                            ? "Outil déjà utilisé"
                            : "Outil mentionné dans cette action"}
                      </span>
                      <span className="mt-0.5 block text-sm text-brand-blue">{contextualAid.tool.label}</span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-dema-muted">{contextualAid.tool.description}</span>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-dema-forest">
                        Voir dans Solutions
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                ) : null}
                {contextualAid.accompaniment ? (
                  <button
                    type="button"
                    onClick={() => onOpenService?.(
                      contextualAid.accompaniment!.resourceSlug,
                    )}
                    className="group flex w-full items-start gap-3 rounded-xl border border-dema-line bg-dema-paper px-4 py-3 text-left transition hover:border-dema-forest/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30"
                  >
                    <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0 text-dema-forest" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-dema-muted">
                        {contextualAid.accompaniment.relationship === "selected_in_solutions"
                          ? "Service déjà sélectionné"
                          : "Vous souhaitez déléguer cette action ?"}
                      </span>
                      <span className="mt-0.5 block text-sm text-brand-blue">{contextualAid.accompaniment.label}</span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-dema-muted">{contextualAid.accompaniment.description}</span>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-dema-forest">
                        Voir le service
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}

          <label className="block text-xs font-medium text-dema-muted">
            {localeCode === "en" ? "Personal notes" : "Notes personnelles"}
            <textarea
              value={taskState.notes}
              onChange={(event) => updateTask((current) => ({ ...current, notes: event.target.value.slice(0, 4_000) }))}
              rows={4}
              placeholder={localeCode === "en" ? "Add a follow-up, decision or note…" : "Ajoutez un suivi, une décision ou un point à retenir…"}
              className="mt-2 w-full resize-y rounded-xl border border-dema-line bg-dema-cream p-3 text-sm leading-relaxed text-brand-blue outline-none focus:border-dema-forest/30"
            />
          </label>

          <div className="border-t border-dema-line pt-5">
            {confirmingDelete ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" role="alert">
                <p className="text-sm text-brand-blue">{localeCode === "en" ? "Delete this action?" : "Supprimer cette action ?"}</p>
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
                    {localeCode === "en" ? "Delete" : "Supprimer"}
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
                {localeCode === "en" ? "Delete action" : "Supprimer l’action"}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ActionPlanResult({
  plan,
  workspace,
  onWorkspaceChange,
  headerActions,
  manualMode = false,
  initialSelectedActionId = null,
  onAddAction,
  onActionEditorOpenChange,
  onDeleteAction,
  onGeneratePlan,
  commandDemoMode = false,
  contextualSystemId = "",
  sourceText = null,
  onOpenService,
  onOpenSolution,
  localeCode = "fr",
  contentLocaleCode = localeCode,
}: {
  plan: PersistableActionPlan;
  workspace: ActionPlanWorkspaceState;
  onWorkspaceChange: Dispatch<SetStateAction<ActionPlanWorkspaceState>>;
  headerActions?: ReactNode;
  manualMode?: boolean;
  initialSelectedActionId?: string | null;
  onAddAction?: () => string | undefined;
  onActionEditorOpenChange?: (isOpen: boolean) => void;
  onDeleteAction: (actionId: string) => void;
  onGeneratePlan?: (situation: string) => Promise<void>;
  commandDemoMode?: boolean;
  contextualSystemId?: string;
  sourceText?: string | null;
  onOpenService?: (serviceSlug: string) => void;
  onOpenSolution?: (input: { resourceSlug: string; systemId: string }) => void;
  localeCode?: InterfaceLocaleCode;
  contentLocaleCode?: InterfaceLocaleCode;
}) {
  const statusMeta = getStatusMeta(localeCode);
  const [view, setView] = useState<TaskView>("list");
  const [filter, setFilter] = useState<TaskFilter>("week");
  const [selectedActionId, setSelectedActionId] = useState<string | null>(
    initialSelectedActionId,
  );
  const contextualAids = useActionPlanContextualAids({
    demoMode: commandDemoMode,
    enabled: localeCode === "fr",
    plan,
    sourceText,
    systemId: contextualSystemId,
    workspace,
  });
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
  const selectedAction = allActions
    .filter((action) => !workspace.deletedActionIds.includes(action.id))
    .find((action) => action.id === selectedActionId) || null;
  const isBlankManualPlan = isBlankManualActionPlan(plan, workspace);

  function addAndOpenAction() {
    const actionId = onAddAction?.();
    if (actionId) {
      setSelectedActionId(actionId);
      onActionEditorOpenChange?.(true);
    }
  }

  function openAction(actionId: string) {
    setSelectedActionId(actionId);
    onActionEditorOpenChange?.(true);
  }

  function closeAction() {
    setSelectedActionId(null);
    onActionEditorOpenChange?.(false);
  }

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
    <div className="pb-24 xl:pb-20">
      <section aria-labelledby="tasks-title">
          <h2 id="tasks-title" className="sr-only">{localeCode === "en" ? "Plan actions" : "Actions du plan"}</h2>
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <TaskFilterMenu value={filter} onChange={setFilter} localeCode={localeCode} />
              <button
                type="button"
                onClick={() => setView((current) => current === "list" ? "kanban" : "list")}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-dema-forest transition hover:border-dema-forest/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25"
                aria-label={view === "list" ? localeCode === "en" ? "Show Kanban" : "Afficher en Kanban" : localeCode === "en" ? "Show list" : "Afficher en liste"}
                title={view === "list" ? localeCode === "en" ? "Show Kanban" : "Afficher en Kanban" : localeCode === "en" ? "Show list" : "Afficher en liste"}
              >
                {view === "list" ? (
                  <Columns3 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <LayoutList className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {headerActions ? <div className="flex shrink-0 items-center justify-end">{headerActions}</div> : null}
          </div>

          {visibleActions.length > 0 && view === "list" ? (
            <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper">
              {visibleActions.map((action) => {
                const taskState = workspace.tasks[action.id];
                const title = taskState.overrides.title || action.title;
                return (
                  <div key={action.id} className="flex items-center gap-3 border-b border-dema-line px-4 py-3 last:border-b-0 sm:px-5">
                    <TaskStatusButton status={taskState.status} onChange={(status) => updateStatus(action.id, status)} compact localeCode={localeCode} />
                    <button type="button" onClick={() => openAction(action.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none">
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
                        <button type="button" onClick={() => openAction(action.id)} className="w-full text-left">
                          <span className="block text-sm font-medium leading-snug text-brand-blue">{workspace.tasks[action.id].overrides.title || action.title}</span>
                          <span className="mt-2 block text-xs text-dema-muted">{action.channelOrTool}</span>
                        </button>
                        <div className="mt-3">
                          <TaskStatusButton status={status} onChange={(nextStatus) => updateStatus(action.id, nextStatus)} localeCode={localeCode} />
                        </div>
                      </article>
                    ))}
                    {visibleActions.every((action) => workspace.tasks[action.id].status !== status) ? <p className="px-2 py-4 text-xs text-dema-muted">{localeCode === "en" ? "No actions" : "Aucune action"}</p> : null}
                  </div>
                </section>
              ))}
            </div>
          ) : null}

          {onAddAction && allActions.length < (manualMode ? 7 : 50) ? (
            <button
              type="button"
              onClick={addAndOpenAction}
              className="mt-3 flex h-[52px] w-full items-center gap-2 rounded-[1.1rem] border border-dashed border-dema-line bg-dema-soft/35 px-5 text-left text-sm text-dema-muted transition hover:border-dema-forest/30 hover:bg-dema-soft/60 hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25"
              aria-label={localeCode === "en" ? "Add an action" : "Ajouter une action"}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {localeCode === "en" ? "Add an action" : "Ajouter une action"}
            </button>
          ) : null}
      </section>

      {localeCode === "fr" ? <PwaInstallPrompt /> : null}

      {isBlankManualPlan && onGeneratePlan ? (
        <ActionPlanGenerationBar
          onGeneratePlan={onGeneratePlan}
          localeCode={localeCode}
          contentLocaleCode={contentLocaleCode}
        />
      ) : null}

      {selectedAction ? (
        <ActionDrawer
          action={selectedAction}
          workspace={workspace}
          onWorkspaceChange={onWorkspaceChange}
          onClose={closeAction}
          onDelete={() => onDeleteAction(selectedAction.id)}
          onOpenService={(serviceSlug) => {
            closeAction();
            onOpenService?.(serviceSlug);
          }}
          onOpenSolution={(input) => {
            closeAction();
            onOpenSolution?.(input);
          }}
          contextualAid={localeCode === "fr" ? contextualAids[selectedAction.id] : undefined}
          localeCode={localeCode}
        />
      ) : null}
    </div>
  );
}
