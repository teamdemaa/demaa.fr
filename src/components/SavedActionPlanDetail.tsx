"use client";

import { useState } from "react";
import ActionPlanAcademyPanel from "@/components/ActionPlanAcademyPanel";
import ActionPlanNavbar, { type ActionPlanView } from "@/components/ActionPlanNavbar";
import ActionPlanResult from "@/components/ActionPlanResult";
import ActionPlanSystemPanel from "@/components/ActionPlanSystemPanel";
import type { ActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";

export default function SavedActionPlanDetail({
  plan,
  systemOptions,
}: {
  plan: ActionPlan;
  systemOptions: readonly ActionPlanSystemOption[];
}) {
  const [activeTab, setActiveTab] = useState<ActionPlanView>("plan");
  const [selectedSystemId, setSelectedSystemId] = useState(plan.systemId);

  return (
    <>
      <ActionPlanNavbar activeView={activeTab} onViewChange={setActiveTab} />
      <div className="mt-8">
        <div hidden={activeTab !== "plan"}>
          <ActionPlanResult plan={plan} />
        </div>
        <div hidden={activeTab !== "system"}>
          <ActionPlanSystemPanel
            options={systemOptions}
            selectedSystemId={selectedSystemId}
            onSystemChange={setSelectedSystemId}
          />
        </div>
        {activeTab === "academy" ? <ActionPlanAcademyPanel /> : null}
        {activeTab === "accompaniment" ? (
          <section className="flex min-h-[46vh] flex-col items-center justify-center text-center">
            <h2 className="text-4xl font-light tracking-[-0.04em] text-brand-blue sm:text-5xl">
              Accompagnement
            </h2>
            <p className="mt-4 text-base font-light text-dema-muted">
              Cet espace sera disponible prochainement.
            </p>
          </section>
        ) : null}
      </div>
    </>
  );
}
