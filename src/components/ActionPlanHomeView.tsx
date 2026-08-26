import ActionPlanExperience from "@/components/ActionPlanExperience";
import GuestActionPlanExperience from "@/components/GuestActionPlanExperience";
import Navbar from "@/components/Navbar";
import type { ActionPlanAppContext } from "@/lib/action-plan-app-context";
import type { ActionPlanAccessIntent } from "@/lib/action-plan-access-intent";
import { getActionPlanPageConfig } from "@/lib/action-plan-page-config";
import { getActionPlanSystemOptionsForContext } from "@/lib/action-plan-localization";
import { getCanonicalServices } from "@/lib/canonical-service-catalog";

type ActionPlanPageConfig = ReturnType<typeof getActionPlanPageConfig>;

export default function ActionPlanHomeView({
  config,
  focusedDiagnostic = false,
  guestProductEnabled,
  initialAccessIntent,
  initialAppContext,
  initialEmail,
  initialGenerationIntent,
  initialIsAuthenticated,
  initialStructureIntent,
}: {
  config: ActionPlanPageConfig;
  focusedDiagnostic?: boolean;
  guestProductEnabled: boolean;
  initialAccessIntent: ActionPlanAccessIntent | null;
  initialAppContext: ActionPlanAppContext;
  initialEmail: string;
  initialGenerationIntent: boolean;
  initialIsAuthenticated: boolean;
  initialStructureIntent: boolean;
}) {
  if (!guestProductEnabled) {
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
          initialAccessIntent={initialAccessIntent}
          initialAppContext={initialAppContext}
          initialEmail={initialEmail}
          initialGenerationIntent={initialGenerationIntent}
          initialIsAuthenticated={initialIsAuthenticated}
          initialStructureIntent={initialStructureIntent}
          marketCodeAtCreation={config.marketCode}
          services={getCanonicalServices()}
          showCoaching={config.showCoaching}
          systemOptions={getActionPlanSystemOptionsForContext({
            contentLocaleCode: config.localeCode,
            marketCodeAtCreation: config.marketCode,
          })}
          visibleViews={config.visibleViews}
        />
      </>
    );
  }

  return (
    <>
      {!focusedDiagnostic ? <Navbar localeCode={config.localeCode} minimal /> : null}
      <GuestActionPlanExperience
        contentLocaleCode={config.localeCode}
        focusedDiagnostic={focusedDiagnostic}
        initialAppContext={initialAppContext}
        initialStructureIntent={initialStructureIntent}
        marketCodeAtCreation={config.marketCode}
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
