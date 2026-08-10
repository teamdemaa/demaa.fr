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
  X,
} from "lucide-react";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useState,
} from "react";
import type { ActionPlan, ActionPlanAction } from "@/lib/action-plan-contract";
import {
  compactActionPlanSteps,
  type ActionPlanTaskStatus,
  type ActionPlanWorkspaceState,
} from "@/lib/action-plan-workspace";

type PlanSection = "tasks" | "strategy";
type TaskView = "list" | "kanban";

const statusMeta: Record<
  ActionPlanTaskStatus,
  { label: string; icon: typeof Circle }
> = {
  todo: { label: "À faire", icon: Circle },
  in_progress: { label: "En cours", icon: CircleDot },
  done: { label: "Terminé", icon: CheckCircle2 },
};

const strategySections = [
  {
    key: "alignment" as const,
    overrideKey: "alignement" as const,
    label: "Alignement",
    fields: [
      ["L’entreprise que vous voulez construire", "desiredCompany" as const],
      ["Vos limites et vos valeurs", "boundariesAndValues" as const],
      ["Vos priorités et vos renoncements", "prioritiesAndTradeoffs" as const],
    ],
  },
  {
    key: "positioning" as const,
    overrideKey: "positionnement" as const,
    label: "Positionnement",
    fields: [
      ["Le client précis", "preciseCustomer" as const],
      ["Le problème important", "importantProblem" as const],
      ["Les preuves et les alternatives", "evidenceAndAlternatives" as const],
    ],
  },
  {
    key: "offer" as const,
    overrideKey: "offre" as const,
    label: "Offre",
    fields: [
      ["Le résultat proposé", "promisedOutcome" as const],
      ["Le périmètre", "scope" as const],
      ["Le prix, l’engagement et le risque", "priceCommitmentAndRisk" as const],
    ],
  },
  {
    key: "promotion" as const,
    overrideKey: "promotion" as const,
    label: "Promotion",
    fields: [
      ["Attirer", "attract" as const],
      ["Faciliter l’achat", "facilitatePurchase" as const],
      ["Fidéliser et renforcer", "retainAndStrengthen" as const],
    ],
  },
] as const;

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
}: {
  action: ActionPlanAction;
  workspace: ActionPlanWorkspaceState;
  onWorkspaceChange: Dispatch<SetStateAction<ActionPlanWorkspaceState>>;
  onClose: () => void;
}) {
  const taskState = workspace.tasks[action.id];
  const effectiveTitle = taskState?.overrides.title || action.title;
  const effectiveObjective = taskState?.overrides.objective || action.objective;
  const effectiveSteps = taskState?.overrides.steps || action.steps;
  const effectiveSupport =
    taskState?.overrides.readyToUse === undefined
      ? action.readyToUse
      : taskState.overrides.readyToUse;
  const [draftTitle, setDraftTitle] = useState(effectiveTitle);
  const [draftObjective, setDraftObjective] = useState(effectiveObjective);
  const [draftSteps, setDraftSteps] = useState(effectiveSteps.join("\n"));

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

  async function copySupport() {
    if (!effectiveSupport) return;
    await navigator.clipboard.writeText(effectiveSupport.content);
  }

  return (
    <div className="fixed inset-0 z-[110] flex justify-end bg-brand-blue/18 backdrop-blur-[2px]" role="presentation" onMouseDown={onClose}>
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
          <button type="button" onClick={onClose} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-dema-line" aria-label="Fermer">
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
              rows={1}
              className="-mx-1 mt-1.5 min-h-6 w-[calc(100%+0.5rem)] resize-none overflow-hidden rounded-lg bg-transparent px-1 text-sm leading-relaxed text-brand-blue [field-sizing:content] outline-none transition focus:bg-dema-sage/35"
            />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-forest">Étapes</p>
            <div className="mt-3 space-y-2">
              {draftSteps.split("\n").map((step, index) => {
                const checked = taskState.completedStepIndexes.includes(index);
                return (
                  <label key={`${action.id}-${index}`} className="flex cursor-pointer gap-3 rounded-xl bg-dema-sage/45 px-3 py-3 text-sm leading-relaxed text-brand-blue">
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
                    />
                    <textarea
                      value={step}
                      onChange={(event) => {
                        const nextSteps = draftSteps.split("\n");
                        nextSteps[index] = event.target.value.replace(/\n/g, " ");
                        setDraftSteps(nextSteps.join("\n"));
                      }}
                      onBlur={saveSteps}
                      rows={1}
                      aria-label={`Étape ${index + 1}`}
                      className={`min-h-6 w-full resize-none overflow-hidden bg-transparent [field-sizing:content] outline-none transition focus:bg-dema-paper/70 ${checked ? "text-dema-muted" : ""}`}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {effectiveSupport ? (
            <div className="rounded-[1.1rem] border border-dema-line p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-forest">{effectiveSupport.label}</p>
                <button type="button" onClick={() => void copySupport()} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-dema-line px-3 text-xs text-dema-forest">
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Copier
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-brand-blue">{effectiveSupport.content}</p>
            </div>
          ) : null}

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
  plan: ActionPlan;
  workspace: ActionPlanWorkspaceState;
  onWorkspaceChange: Dispatch<SetStateAction<ActionPlanWorkspaceState>>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {strategySections.map((section) => {
        const pillar = plan.strategy[section.key] as unknown as Readonly<Record<string, string>>;
        const overrides = workspace.strategyOverrides[section.overrideKey];
        const answers = section.fields.map(([, key], index) =>
          overrides?.[`answer${["One", "Two", "Three"][index]}` as keyof typeof overrides] ?? pillar[key],
        );
        const headline = overrides?.headline ?? pillar.headline;

        return (
          <article key={section.key} className="rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 shadow-[0_10px_30px_rgba(23,35,29,0.035)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-dema-forest">{section.label}</p>
            <textarea
              value={headline}
              onChange={(event) => onWorkspaceChange((current) => ({
                ...current,
                strategyOverrides: {
                  ...current.strategyOverrides,
                  [section.overrideKey]: {
                    ...current.strategyOverrides[section.overrideKey],
                    headline: event.target.value,
                  },
                },
              }))}
              rows={1}
              maxLength={180}
              aria-label={`Titre ${section.label}`}
              className="-mx-1 mt-2 min-h-7 w-[calc(100%+0.5rem)] resize-none overflow-hidden rounded-lg bg-transparent px-1 text-xl font-medium leading-snug text-brand-blue [field-sizing:content] outline-none transition focus:bg-dema-sage/40"
            />
            <div className="mt-5 space-y-4">
              {section.fields.map(([label], index) => (
                <div key={label}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-blue/70">{label}</p>
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
                    rows={1}
                    maxLength={500}
                    aria-label={label}
                    className="-mx-1 mt-1.5 min-h-6 w-[calc(100%+0.5rem)] resize-none overflow-hidden rounded-lg bg-transparent px-1 text-sm leading-relaxed text-brand-blue/75 [field-sizing:content] outline-none transition focus:bg-dema-sage/40 focus:text-brand-blue"
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
}: {
  plan: ActionPlan;
  workspace: ActionPlanWorkspaceState;
  onWorkspaceChange: Dispatch<SetStateAction<ActionPlanWorkspaceState>>;
  headerActions?: ReactNode;
}) {
  const [section, setSection] = useState<PlanSection>("tasks");
  const [view, setView] = useState<TaskView>("list");
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const selectedAction = plan.weeklyActions.find((action) => action.id === selectedActionId) || null;

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
      <div className="mb-7 flex items-end justify-between gap-3 border-b border-dema-line">
        <div className="flex items-center gap-1" role="tablist" aria-label="Plan d’action">
          <button type="button" role="tab" aria-selected={section === "tasks"} onClick={() => setSection("tasks")} className={`-mb-px min-h-12 border-b-2 px-4 text-sm font-medium ${section === "tasks" ? "border-dema-forest text-dema-forest" : "border-transparent text-dema-muted"}`}>À faire</button>
          <button type="button" role="tab" aria-selected={section === "strategy"} onClick={() => setSection("strategy")} className={`-mb-px min-h-12 border-b-2 px-4 text-sm font-medium ${section === "strategy" ? "border-dema-forest text-dema-forest" : "border-transparent text-dema-muted"}`}>Stratégie</button>
        </div>
        {headerActions}
      </div>

      {section === "tasks" ? (
        <section aria-labelledby="tasks-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="tasks-title" className="text-3xl font-light tracking-[-0.04em] text-brand-blue sm:text-4xl">Cette semaine</h2>
            </div>
            <div className="inline-flex w-fit rounded-full border border-dema-line bg-dema-paper p-1" aria-label="Vue des actions">
              <button type="button" onClick={() => setView("list")} aria-pressed={view === "list"} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-medium ${view === "list" ? "bg-dema-sage text-dema-forest" : "text-dema-muted"}`}><LayoutList className="h-4 w-4" aria-hidden="true" /> Liste</button>
              <button type="button" onClick={() => setView("kanban")} aria-pressed={view === "kanban"} className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-medium ${view === "kanban" ? "bg-dema-sage text-dema-forest" : "text-dema-muted"}`}><Columns3 className="h-4 w-4" aria-hidden="true" /> Kanban</button>
            </div>
          </div>

          {view === "list" ? (
            <div className="mt-6 overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper">
              {plan.weeklyActions.map((action) => {
                const taskState = workspace.tasks[action.id];
                const title = taskState.overrides.title || action.title;
                return (
                  <div key={action.id} className="flex items-center gap-3 border-b border-dema-line px-4 py-3 last:border-b-0 sm:px-5">
                    <TaskStatusButton status={taskState.status} onChange={(status) => updateStatus(action.id, status)} compact />
                    <button type="button" onClick={() => setSelectedActionId(action.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none">
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-medium leading-snug ${taskState.status === "done" ? "text-dema-muted" : "text-brand-blue"}`}>{title}</span>
                        <span className="mt-1 block truncate text-xs text-dema-muted">{action.channelOrTool}{action.readyToUse ? ` · ${action.readyToUse.label}` : ""}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-dema-muted" aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {(Object.keys(statusMeta) as ActionPlanTaskStatus[]).map((status) => (
                <section key={status} className="rounded-[1.25rem] bg-dema-sage/45 p-3" aria-labelledby={`kanban-${status}`}>
                  <h3 id={`kanban-${status}`} className="px-1 py-2 text-xs font-medium uppercase tracking-[0.12em] text-dema-muted">{statusMeta[status].label}</h3>
                  <div className="space-y-2">
                    {plan.weeklyActions.filter((action) => workspace.tasks[action.id].status === status).map((action) => (
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
                    {plan.weeklyActions.every((action) => workspace.tasks[action.id].status !== status) ? <p className="px-2 py-4 text-xs text-dema-muted">Aucune action</p> : null}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section aria-labelledby="strategy-title">
          <div className="mb-6">
            <h2 id="strategy-title" className="text-3xl font-light tracking-[-0.04em] text-brand-blue sm:text-4xl">Stratégie</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dema-muted">Votre cap en quatre points. Modifiez-le directement pour qu’il reste fidèle à votre entreprise.</p>
          </div>
          <StrategyPanel plan={plan} workspace={workspace} onWorkspaceChange={onWorkspaceChange} />
        </section>
      )}

      {selectedAction ? (
        <ActionDrawer action={selectedAction} workspace={workspace} onWorkspaceChange={onWorkspaceChange} onClose={() => setSelectedActionId(null)} />
      ) : null}
    </div>
  );
}
