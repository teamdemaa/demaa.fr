"use client";

import { ListChecks, Workflow } from "lucide-react";
import type { KeyboardEvent } from "react";

export type ActionPlanWorkspaceTab = "actions" | "solutions";

const tabs = [
  { id: "actions", label: "Actions", Icon: ListChecks },
  { id: "solutions", label: "Solutions", Icon: Workflow },
] as const satisfies readonly {
  id: ActionPlanWorkspaceTab;
  label: string;
  Icon: typeof ListChecks;
}[];

export function getNextActionPlanWorkspaceTab(input: {
  currentTab: ActionPlanWorkspaceTab;
  key: string;
}): ActionPlanWorkspaceTab | null {
  const currentIndex = tabs.findIndex(({ id }) => id === input.currentTab);
  if (input.key === "ArrowRight") {
    return tabs[(currentIndex + 1) % tabs.length].id;
  }
  if (input.key === "ArrowLeft") {
    return tabs[(currentIndex - 1 + tabs.length) % tabs.length].id;
  }
  if (input.key === "Home") return tabs[0].id;
  if (input.key === "End") return tabs[tabs.length - 1].id;
  return null;
}

export default function ActionPlanWorkspaceTabs({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: ActionPlanWorkspaceTab;
  onChange: (tab: ActionPlanWorkspaceTab) => void;
}) {
  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    const nextTab = getNextActionPlanWorkspaceTab({
      currentTab: tabs[currentIndex].id,
      key: event.key,
    });
    if (!nextTab) return;
    event.preventDefault();
    const nextIndex = tabs.findIndex(({ id }) => id === nextTab);
    onChange(nextTab);
    event.currentTarget
      .closest('[role="tablist"]')
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      .item(nextIndex)
      .focus();
  }

  return (
    <div className="mb-6 flex justify-center">
      <div
        role="tablist"
        aria-label="Contenu du plan"
        className="inline-grid grid-cols-2 rounded-full border border-dema-line bg-dema-paper p-1 shadow-[0_8px_24px_rgba(23,35,29,0.04)]"
      >
        {tabs.map(({ id, label, Icon }, index) => (
          <button
            key={id}
            id={`${idPrefix}-${id}-tab`}
            type="button"
            role="tab"
            aria-controls={`${idPrefix}-${id}-panel`}
            aria-selected={value === id}
            tabIndex={value === id ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 ${
              value === id
                ? "bg-dema-sage text-dema-forest"
                : "text-dema-muted hover:text-brand-blue"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
