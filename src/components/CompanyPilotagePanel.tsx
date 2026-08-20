"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import {
  COMPANY_STRATEGY_VISIBLE,
  type ActionPlanSection,
} from "@/lib/action-plan-app-context";
import { getCompanyPilotageUiCopy } from "@/lib/company-pilotage-ui-copy";
import type { InterfaceLocaleCode } from "@/lib/international-context";

const CompanyFiguresPanel = dynamic(() => import("@/components/CompanyFiguresPanel"));
const CompanyStrategyPanel = dynamic(() => import("@/components/CompanyStrategyPanel"));

export default function CompanyPilotagePanel({
  available,
  localeCode,
  section,
  onSectionChange,
  children,
}: {
  available: boolean;
  localeCode: InterfaceLocaleCode;
  section: ActionPlanSection;
  onSectionChange: (section: ActionPlanSection) => void;
  children: ReactNode;
}) {
  if (!available) return <>{children}</>;
  const copy = getCompanyPilotageUiCopy(localeCode);
  const sections = (["actions", "figures", "strategy"] as const).map((key) => ({ key, label: copy.sections[key] }));

  return (
    <section aria-label={copy.pilotageLabel}>
      <nav
        aria-label={copy.sectionNavigationLabel}
        className="mb-6 flex gap-1 overflow-x-auto border-b border-dema-line"
      >
        {sections.filter(
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
      {section === "figures" ? <CompanyFiguresPanel localeCode={localeCode} /> : null}
      {COMPANY_STRATEGY_VISIBLE && section === "strategy"
        ? <CompanyStrategyPanel localeCode={localeCode} />
        : null}
    </section>
  );
}
