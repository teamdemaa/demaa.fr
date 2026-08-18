"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import {
  COMPANY_STRATEGY_VISIBLE,
  type ActionPlanSection,
} from "@/lib/action-plan-app-context";

const CompanyFiguresPanel = dynamic(() => import("@/components/CompanyFiguresPanel"));
const CompanyStrategyPanel = dynamic(() => import("@/components/CompanyStrategyPanel"));

const SECTIONS = [
  { key: "actions", label: "Plan d’action" },
  { key: "figures", label: "Chiffres" },
  { key: "strategy", label: "Stratégie" },
] as const;

export default function CompanyPilotagePanel({
  available,
  section,
  onSectionChange,
  children,
}: {
  available: boolean;
  section: ActionPlanSection;
  onSectionChange: (section: ActionPlanSection) => void;
  children: ReactNode;
}) {
  if (!available) return <>{children}</>;

  return (
    <section aria-label="Pilotage de l’entreprise">
      <nav
        aria-label="Sections du plan et du pilotage"
        className="mb-6 flex gap-1 overflow-x-auto border-b border-dema-line"
      >
        {SECTIONS.filter(
          (item) => item.key !== "strategy" || COMPANY_STRATEGY_VISIBLE,
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            aria-current={section === item.key ? "page" : undefined}
            onClick={() => onSectionChange(item.key)}
            className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition sm:px-4 ${
              section === item.key
                ? "border-dema-forest text-dema-forest"
                : "border-transparent text-dema-muted hover:text-dema-forest"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {section === "actions" ? children : null}
      {section === "figures" ? <CompanyFiguresPanel /> : null}
      {COMPANY_STRATEGY_VISIBLE && section === "strategy"
        ? <CompanyStrategyPanel />
        : null}
    </section>
  );
}
