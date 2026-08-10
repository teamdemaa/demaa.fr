"use client";

import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<"plan" | "system">("plan");
  const [selectedSystemId, setSelectedSystemId] = useState(plan.systemId);

  return (
    <>
      <div className="mt-7 grid max-w-md grid-cols-2 rounded-full border border-dema-line bg-dema-paper p-1" role="tablist" aria-label="Plan sauvegardé">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "plan"}
          onClick={() => setActiveTab("plan")}
          className={`min-h-11 rounded-full px-4 text-sm transition ${activeTab === "plan" ? "bg-dema-sage font-semibold text-dema-forest" : "text-dema-muted"}`}
        >
          Plan d’action
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "system"}
          onClick={() => setActiveTab("system")}
          className={`min-h-11 rounded-full px-4 text-sm transition ${activeTab === "system" ? "bg-dema-sage font-semibold text-dema-forest" : "text-dema-muted"}`}
        >
          Système
        </button>
      </div>
      <div className="mt-8" role="tabpanel">
        {activeTab === "plan" ? <ActionPlanResult plan={plan} /> : null}
        {activeTab === "system" ? (
          <ActionPlanSystemPanel
            options={systemOptions}
            selectedSystemId={selectedSystemId}
            onSystemChange={setSelectedSystemId}
          />
        ) : null}
      </div>
    </>
  );
}
