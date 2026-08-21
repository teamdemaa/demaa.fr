"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import {
  COMPANY_STRATEGY_VISIBLE,
  type ActionPlanSection,
} from "@/lib/action-plan-app-context";

const CompanyFiguresPanel = dynamic(() => import("@/components/CompanyFiguresPanel"));
const CompanyStrategyPanel = dynamic(() => import("@/components/CompanyStrategyPanel"));

const SECTIONS = [
  { key: "actions", labels: { fr: "Plan", en: "Plan" } },
  { key: "figures", labels: { fr: "Chiffres", en: "Key figures" } },
  { key: "solutions", labels: { fr: "Solutions", en: "Solutions" } },
] as const;

export default function CompanyPilotagePanel({
  available,
  section,
  onSectionChange,
  children,
  figuresAuthenticated,
  onFiguresAuthenticationRequired,
  solutions,
  localeCode = "fr",
}: {
  available: boolean;
  section: ActionPlanSection;
  onSectionChange: (section: ActionPlanSection) => void;
  children: ReactNode;
  figuresAuthenticated: boolean;
  onFiguresAuthenticationRequired?: () => void;
  solutions: ReactNode;
  localeCode?: "fr" | "en";
}) {
  if (!available) {
    return section === "solutions" ? <>{solutions}</> : <>{children}</>;
  }

  return (
    <section aria-label="Pilotage de l’entreprise">
      {section !== "strategy" ? <nav
        aria-label={localeCode === "en" ? "Plan sections" : "Sections du plan"}
        className="mx-auto mb-7 grid w-full max-w-[32.5rem] grid-cols-3 gap-1 rounded-full border border-dema-line bg-dema-sage/35 p-1.5"
      >
        {SECTIONS.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-current={section === item.key ? "page" : undefined}
            onClick={() => onSectionChange(item.key)}
            className={`min-h-12 rounded-full px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 ${
              section === item.key
                ? "bg-dema-paper text-dema-forest shadow-[0_5px_16px_rgba(23,35,29,0.055)]"
                : "text-dema-muted hover:text-dema-forest"
            }`}
          >
            {item.labels[localeCode]}
          </button>
        ))}
      </nav> : null}
      {section === "actions" ? children : null}
      {section === "figures" ? (
        <CompanyFiguresPanel
          authenticated={figuresAuthenticated}
          onAuthenticationRequired={onFiguresAuthenticationRequired}
        />
      ) : null}
      {section === "solutions" ? solutions : null}
      {COMPANY_STRATEGY_VISIBLE && section === "strategy"
        ? <div>
            <button
              type="button"
              onClick={() => onSectionChange("actions")}
              className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-medium text-dema-muted transition hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {localeCode === "en" ? "Back to plan" : "Retour au plan"}
            </button>
            <CompanyStrategyPanel />
          </div>
        : null}
    </section>
  );
}
