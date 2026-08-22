"use client";

import { ChevronDown } from "lucide-react";
import type { GuestActionPlan } from "@/lib/guest-action-plan.client";
import { getActionPlanActions } from "@/lib/action-plan-view-model";

export default function GuestActionPlanResult({ actionPlan }: { actionPlan: GuestActionPlan }) {
  const actions = getActionPlanActions(actionPlan.plan).filter(
    (action) => !actionPlan.workspaceState.deletedActionIds.includes(action.id),
  );

  return (
    <section aria-labelledby="guest-plan-title" className="pb-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-dema-forest">Votre plan d’action</p>
          <h1 id="guest-plan-title" className="mt-1 text-xl font-medium text-brand-blue sm:text-2xl">
            {actionPlan.title}
          </h1>
        </div>
        <p className="shrink-0 text-xs text-dema-muted">Disponible pendant 24 h</p>
      </div>

      <div className="overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper">
        {actions.map((action, index) => {
          const task = actionPlan.workspaceState.tasks[action.id];
          const title = task?.overrides.title || action.title;
          const objective = task?.overrides.objective || action.objective;
          const steps = task?.overrides.steps || action.steps;
          const support = task?.overrides.support === undefined
            ? action.support
            : task.overrides.support;
          return (
            <details key={action.id} className="group border-b border-dema-line last:border-b-0">
              <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-4 py-3 text-left [&::-webkit-details-marker]:hidden sm:px-5">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dema-sage/70 text-xs font-medium text-dema-forest">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug text-brand-blue sm:text-base">{title}</span>
                  {action.channelOrTool ? <span className="mt-1 block text-xs text-dema-muted">{action.channelOrTool}</span> : null}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-dema-muted transition group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="border-t border-dema-line/70 px-5 py-5 sm:pl-16">
                {objective ? <p className="text-sm leading-relaxed text-brand-blue">{objective}</p> : null}
                {steps.length > 0 ? (
                  <ol className="mt-4 space-y-2 text-sm leading-relaxed text-dema-muted">
                    {steps.map((step, stepIndex) => (
                      <li key={`${action.id}-step-${stepIndex}`} className="flex gap-2">
                        <span className="text-dema-forest">{stepIndex + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                ) : null}
                {support ? (
                  <div className="mt-5 rounded-xl bg-dema-sage/45 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-dema-forest">{support.label}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-brand-blue">{support.content}</p>
                  </div>
                ) : null}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
