"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ActionPlanAcademyPanel from "@/components/ActionPlanAcademyPanel";
import ActionPlanNavbar, { type ActionPlanView } from "@/components/ActionPlanNavbar";
import ActionPlanResult from "@/components/ActionPlanResult";
import ActionPlanSystemPanel from "@/components/ActionPlanSystemPanel";
import type { ActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

export default function SavedActionPlanDetail({
  plan,
  planId,
  initialRevision,
  initialWorkspace,
  systemOptions,
}: {
  plan: ActionPlan;
  planId: string;
  initialRevision: number;
  initialWorkspace: ActionPlanWorkspaceState;
  systemOptions: readonly ActionPlanSystemOption[];
}) {
  const [activeTab, setActiveTab] = useState<ActionPlanView>("plan");
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const revisionRef = useRef(initialRevision);
  const firstRenderRef = useRef(true);
  const pendingSaveRef = useRef<ActionPlanWorkspaceState | null>(null);
  const saveRunningRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const flushWorkspaceSave = useCallback(async () => {
    if (saveRunningRef.current) return;
    saveRunningRef.current = true;

    while (pendingSaveRef.current) {
      const nextWorkspace = pendingSaveRef.current;
      pendingSaveRef.current = null;
      if (mountedRef.current) {
        setSaveState("saving");
        setSaveError(null);
      }

      try {
        const response = await fetch(`/api/action-plans/${encodeURIComponent(planId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expectedRevision: revisionRef.current,
            workspaceState: nextWorkspace,
          }),
        });
        const body = (await response.json().catch(() => null)) as
          | { revision?: number; error?: string }
          | null;
        if (!response.ok || !body?.revision) {
          throw new Error(body?.error || "Impossible d’enregistrer les modifications.");
        }
        revisionRef.current = body.revision;
      } catch (error) {
        pendingSaveRef.current = null;
        if (mountedRef.current) {
          setSaveState("error");
          setSaveError(error instanceof Error ? error.message : "Impossible d’enregistrer les modifications.");
        }
        saveRunningRef.current = false;
        return;
      }
    }

    saveRunningRef.current = false;
    if (mountedRef.current) setSaveState("saved");
  }, [planId]);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      pendingSaveRef.current = workspace;
      void flushWorkspaceSave();
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [flushWorkspaceSave, workspace]);

  return (
    <div className="contents">
      <ActionPlanNavbar activeView={activeTab} onViewChange={setActiveTab} />
      <div className="mt-8">
        <div hidden={activeTab !== "plan"}>
          <div className="mb-4 flex justify-end text-xs" role="status" aria-live="polite">
            <span className={saveState === "error" ? "text-red-700" : "text-dema-muted"}>
              {saveState === "saving" ? "Enregistrement…" : saveState === "error" ? saveError : "Modifications enregistrées"}
            </span>
          </div>
          <ActionPlanResult plan={plan} workspace={workspace} onWorkspaceChange={setWorkspace} />
        </div>
        <div hidden={activeTab !== "system"}>
          <ActionPlanSystemPanel
            options={systemOptions}
            selectedSystemId={workspace.selectedSystemId}
            onSystemChange={(systemId) => setWorkspace((current) => ({ ...current, selectedSystemId: systemId }))}
            workspace={workspace}
            onWorkspaceChange={setWorkspace}
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
    </div>
  );
}
