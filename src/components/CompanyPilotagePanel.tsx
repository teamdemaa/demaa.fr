"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import {
  COMPANY_STRATEGY_VISIBLE,
  type ActionPlanSection,
} from "@/lib/action-plan-app-context";
import type { CompanyMonth } from "@/lib/company-pilotage-contract";

export type CompanyFiguresEntryRequest = {
  id: number;
  period: CompanyMonth;
};

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
  figuresEntryRequest,
  onFiguresEntryRequestConsumed,
  onFiguresAuthenticationRequired,
  solutions,
  localeCode = "fr",
}: {
  available: boolean;
  section: ActionPlanSection;
  onSectionChange: (section: ActionPlanSection) => void;
  children: ReactNode;
  figuresAuthenticated: boolean;
  figuresEntryRequest?: CompanyFiguresEntryRequest | null;
  onFiguresEntryRequestConsumed?: () => void;
  onFiguresAuthenticationRequired?: (period: CompanyMonth) => void;
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
        className="mx-auto mb-5 flex w-fit max-w-full items-center gap-1"
      >
        {SECTIONS.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-current={section === item.key ? "page" : undefined}
            onClick={() => onSectionChange(item.key)}
            className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-full px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/25 ${
              section === item.key
                ? "bg-dema-sage/60 text-dema-forest"
                : "text-dema-muted/90 hover:text-dema-forest"
            }`}
          >
            {item.labels[localeCode]}
          </button>
        ))}
      </nav> : null}
      {section === "actions" ? children : null}
      {section === "figures" ? (
        <CompanyFiguresPanel
          key={figuresEntryRequest?.id ?? "company-figures"}
          authenticated={figuresAuthenticated}
          initialEntryPeriod={figuresEntryRequest?.period}
          onEntryRequestConsumed={onFiguresEntryRequestConsumed}
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
