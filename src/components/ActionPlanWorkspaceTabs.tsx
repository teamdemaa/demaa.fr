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
    <div className="relative left-1/2 -mt-3 mb-6 flex w-[100dvw] max-w-[100dvw] -translate-x-1/2 justify-center border-b border-dema-line/90 px-3 pb-4 pt-3">
      <div
        role="tablist"
        aria-label="Contenu du plan"
        className="flex w-full max-w-xl items-center rounded-full border border-dema-line bg-dema-paper/70 p-1 shadow-[0_5px_18px_rgba(23,35,29,0.05)] xl:w-[min(40vw,36rem)]"
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
            className={`inline-flex min-h-10 flex-1 items-center justify-center rounded-[1rem] px-8 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-dema-forest/25 sm:px-10 ${
              value === id
                ? "bg-dema-sage text-dema-forest"
                : "text-dema-muted hover:bg-dema-sage/40 hover:text-brand-blue"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
