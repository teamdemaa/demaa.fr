"use client";

import type { KeyboardEvent } from "react";

export type ActionPlanWorkspaceTab = "actions" | "solutions";

const tabs = [
  { id: "actions", label: "Actions" },
  { id: "solutions", label: "Solutions" },
] as const satisfies readonly {
  id: ActionPlanWorkspaceTab;
  label: string;
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
        className="inline-flex items-center gap-8 border-b border-dema-line"
      >
        {tabs.map(({ id, label }, index) => (
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
            className={`-mb-px inline-flex min-h-10 items-center justify-center border-b-2 px-1 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 ${
              value === id
                ? "border-dema-forest text-dema-forest"
                : "border-transparent text-dema-muted hover:border-dema-forest/25 hover:text-brand-blue"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
