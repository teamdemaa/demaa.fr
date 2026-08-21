import ActionPlanNavbar from "@/components/ActionPlanNavbar";
import Navbar from "@/components/Navbar";
import SavedActionPlanDetail from "@/components/SavedActionPlanDetail";
import SavedActionPlanGenerationState from "@/components/SavedActionPlanGenerationState";
import type { ActionPlanAppContext } from "@/lib/action-plan-app-context";
import { getActionPlanPageConfig } from "@/lib/action-plan-page-config";
import {
  type ActionPlanGenerationState,
  type ActionPlanIndexEntry,
} from "@/lib/action-plan-storage.server";
import { getActionPlanSystemOptionsForContext } from "@/lib/action-plan-localization";
import { getCanonicalServices } from "@/lib/canonical-service-catalog";

type ActionPlanPageConfig = ReturnType<typeof getActionPlanPageConfig>;

export default function SavedActionPlanPageView({
  availablePlans,
  config,
  generationState,
  initialAppContext,
  initialEmail,
}: {
  availablePlans: readonly ActionPlanIndexEntry[];
  config: ActionPlanPageConfig;
  generationState: ActionPlanGenerationState;
  initialAppContext: ActionPlanAppContext;
  initialEmail: string;
}) {
  if (generationState.status !== "active") {
    return (
      <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
        <Navbar
          anonymousLanding
          isAuthenticated
          localeCode={config.localeCode}
          minimal
        />
        <ActionPlanNavbar
          activeView="plan"
          localeCode={config.localeCode}
          routeNavigation
          visibleViews={config.visibleViews}
        />
        <SavedActionPlanGenerationState
          canRetry={generationState.status === "failed" && generationState.canRetry}
          localeCode={config.localeCode}
          planId={generationState.id}
          status={generationState.status}
        />
      </div>
    );
  }

  const stored = generationState.actionPlan;
  return (
    <div data-action-plan-workspace className="min-h-screen bg-dema-cream text-brand-blue">
      <Navbar
        anonymousLanding
        isAuthenticated
        localeCode={config.localeCode}
        minimal
      />
      <main className="px-4 pb-24 pt-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[68rem]">
          <h1 className="sr-only">{config.copy.savedPlanHeading}</h1>
          <SavedActionPlanDetail
            key={stored.id}
            availablePlans={availablePlans}
            contentLocaleCode={stored.contentLocaleCode}
            initialAppContext={initialAppContext}
            initialEmail={initialEmail}
            initialIsAuthenticated
            initialRevision={stored.revision}
            initialSourceText={stored.sourceText}
            initialTitle={stored.title}
            initialWorkspace={stored.workspaceState}
            interfaceLocaleCode={config.localeCode}
            marketCode={config.marketCode}
            plan={stored.plan}
            planId={stored.id}
            showCoaching={config.showCoaching}
            services={getCanonicalServices()}
            systemOptions={getActionPlanSystemOptionsForContext({
              contentLocaleCode: stored.contentLocaleCode,
              marketCodeAtCreation: config.marketCode,
            })}
            visibleViews={config.visibleViews}
          />
        </div>
      </main>
    </div>
  );
}
