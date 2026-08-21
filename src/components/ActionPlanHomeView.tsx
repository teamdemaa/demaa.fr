import ActionPlanExperience from "@/components/ActionPlanExperience";
import Navbar from "@/components/Navbar";
import type { ActionPlanAppContext } from "@/lib/action-plan-app-context";
import { getActionPlanPageConfig } from "@/lib/action-plan-page-config";
import { getActionPlanSystemOptionsForContext } from "@/lib/action-plan-localization";
import { getCanonicalServices } from "@/lib/canonical-service-catalog";

type ActionPlanPageConfig = ReturnType<typeof getActionPlanPageConfig>;

export default function ActionPlanHomeView({
  config,
  initialAppContext,
  initialEmail,
  initialGenerationIntent,
  initialIsAuthenticated,
  initialStructureIntent,
}: {
  config: ActionPlanPageConfig;
  initialAppContext: ActionPlanAppContext;
  initialEmail: string;
  initialGenerationIntent: boolean;
  initialIsAuthenticated: boolean;
  initialStructureIntent: boolean;
}) {
  return (
    <>
      <Navbar
        anonymousLanding
        isAuthenticated={initialIsAuthenticated}
        localeCode={config.localeCode}
        minimal
      />
      <ActionPlanExperience
        contentLocaleCode={config.localeCode}
        initialAppContext={initialAppContext}
        initialEmail={initialEmail}
        initialGenerationIntent={initialGenerationIntent}
        initialIsAuthenticated={initialIsAuthenticated}
        initialStructureIntent={initialStructureIntent}
        marketCodeAtCreation={config.marketCode}
        showCoaching={config.showCoaching}
        services={getCanonicalServices()}
        systemOptions={getActionPlanSystemOptionsForContext({
          contentLocaleCode: config.localeCode,
          marketCodeAtCreation: config.marketCode,
        })}
        visibleViews={config.visibleViews}
      />
    </>
  );
}
