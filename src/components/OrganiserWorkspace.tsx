"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AcademyIndexClient from "@/components/AcademyIndexClient";
import ActionPlanSystemPanel from "@/components/ActionPlanSystemPanel";
import type { AcademyContentDefinition } from "@/lib/academy-course-content";
import {
  readGuestSelectedSystemId,
  writeGuestSelectedSystemId,
} from "@/lib/action-plan-guest-preferences";
import { createManualActionPlanWorkspaceState } from "@/lib/action-plan-manual";
import type { ActionPlanSystemOption } from "@/lib/action-plan-system-catalog";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import type { ToolOutboundSurface } from "@/lib/tool-outbound-attribution";
import {
  buildOrganiserHref,
  type OrganiserTab,
} from "@/lib/organiser-navigation";
import { satoshiHeroTitleClassName } from "@/lib/marketing-hero-style";

type OrganiserWorkspaceProps = {
  contents: AcademyContentDefinition[];
  initialResourceSlug?: string;
  initialSystemId?: string;
  initialTab: OrganiserTab;
  systemOptions: readonly ActionPlanSystemOption[];
  toolOutboundSurface: Extract<ToolOutboundSurface, "action_recommendation" | "solutions">;
};

function updateSolutionSelection(
  workspace: ActionPlanWorkspaceState,
  input: { placementId: string; systemId: string },
) {
  const selected = new Set(
    workspace.selectedSolutionPlacementIdsBySystem[input.systemId] ?? [],
  );
  if (selected.has(input.placementId)) selected.delete(input.placementId);
  else selected.add(input.placementId);

  return {
    ...workspace,
    selectedSystemId: input.systemId,
    savedSystemIds: workspace.savedSystemIds.includes(input.systemId)
      ? workspace.savedSystemIds
      : [...workspace.savedSystemIds, input.systemId],
    selectedSolutionPlacementIdsBySystem: {
      ...workspace.selectedSolutionPlacementIdsBySystem,
      [input.systemId]: [...selected],
    },
  };
}

export default function OrganiserWorkspace({
  contents,
  initialResourceSlug,
  initialSystemId,
  initialTab,
  systemOptions,
  toolOutboundSurface,
}: OrganiserWorkspaceProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrganiserTab>(initialTab);
  const [selectedSystemId, setSelectedSystemId] = useState(initialSystemId ?? "");
  const [resourceSlug, setResourceSlug] = useState(initialResourceSlug);
  const [workspace, setWorkspace] = useState<ActionPlanWorkspaceState>(() => ({
    ...createManualActionPlanWorkspaceState(),
    selectedSystemId: initialSystemId ?? null,
    savedSystemIds: initialSystemId ? [initialSystemId] : [],
  }));

  useEffect(() => {
    if (initialTab !== "solutions" || initialSystemId) return;
    const storedSystemId = readGuestSelectedSystemId();
    if (!storedSystemId || !systemOptions.some(({ id }) => id === storedSystemId)) return;
    router.replace(buildOrganiserHref({
      tab: "solutions",
      systemId: storedSystemId,
    }), { scroll: false });
  }, [initialSystemId, initialTab, router, systemOptions]);

  function selectTab(tab: OrganiserTab) {
    setActiveTab(tab);
    router.push(buildOrganiserHref({
      tab,
      systemId: tab === "solutions" ? selectedSystemId : undefined,
      solutionResourceSlug: tab === "solutions" ? resourceSlug : undefined,
    }), { scroll: false });
  }

  function selectSystem(systemId: string) {
    setActiveTab("solutions");
    setSelectedSystemId(systemId);
    setResourceSlug(undefined);
    writeGuestSelectedSystemId(systemId);
    router.replace(buildOrganiserHref({ tab: "solutions", systemId }), {
      scroll: false,
    });
  }

  function selectResource(solutionResourceSlug: string | undefined) {
    setResourceSlug(solutionResourceSlug);
    router.replace(buildOrganiserHref({
      tab: "solutions",
      systemId: selectedSystemId,
      solutionResourceSlug,
    }), { scroll: false });
  }

  return (
    <div className="min-h-[85vh] bg-[#FAFAFA]">
      <div className="px-4 pt-5 sm:pt-6">
        <nav
          className="mx-auto flex w-fit items-center gap-1 rounded-full border border-dema-line/70 bg-dema-sage/25 p-1"
          aria-label="Contenu d’Organiser"
        >
          {(["solutions", "processus"] as const).map((tab) => {
            const label = tab === "solutions" ? "Solutions" : "Processus";
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => selectTab(tab)}
                className={`min-h-10 rounded-full px-5 text-sm transition ${active ? "bg-dema-paper text-dema-forest" : "text-dema-muted hover:text-brand-blue"}`}
              >
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "solutions" ? (
        <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:pt-14">
          <header className="mx-auto max-w-3xl text-center">
            <h1 className={satoshiHeroTitleClassName}>
              Organiser votre activité
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-7 text-dema-muted md:text-lg">
              Choisissez votre activité pour afficher les outils, ressources et partenaires adaptés à votre entreprise.
            </p>
          </header>

          <div className="mt-9 sm:mt-11">
            <ActionPlanSystemPanel
              initialResourceSlug={resourceSlug}
              localeCode="fr"
              marketCode="fr-fr"
              onResourceSlugChange={selectResource}
              onSystemChange={selectSystem}
              onToggleSolutionSelection={(placementId) => {
                const systemId = selectedSystemId || workspace.selectedSystemId;
                if (!systemId) return;
                setWorkspace((current) => updateSolutionSelection(current, {
                  placementId,
                  systemId,
                }));
              }}
              options={systemOptions}
              selectedSystemId={selectedSystemId}
              showHeading={false}
              toolOutboundSurface={toolOutboundSurface}
              workspace={workspace}
              onWorkspaceChange={setWorkspace}
            />
          </div>
        </main>
      ) : (
        <AcademyIndexClient contents={contents} />
      )}
    </div>
  );
}
