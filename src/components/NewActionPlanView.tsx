import Link from "next/link";
import ActionPlanExperience from "@/components/ActionPlanExperience";
import Navbar from "@/components/Navbar";
import { getActionPlanPageConfig } from "@/lib/action-plan-page-config";
import { getActionPlanSystemOptionsForContext } from "@/lib/action-plan-localization";

type ActionPlanPageConfig = ReturnType<typeof getActionPlanPageConfig>;

export default function NewActionPlanView({
  config,
  hasPlans,
  initialEmail,
  initialGenerationIntent,
}: {
  config: ActionPlanPageConfig;
  hasPlans: boolean;
  initialEmail: string;
  initialGenerationIntent: boolean;
}) {
  return (
    <>
      <Navbar
        anonymousLanding
        isAuthenticated
        localeCode={config.localeCode}
        minimal
      />
      {hasPlans ? (
        <div className="mx-auto w-full max-w-[68rem] px-4 pt-3 sm:px-6 lg:px-8">
          <Link
            href={config.paths.plans}
            className="inline-flex min-h-11 items-center text-sm text-dema-muted transition hover:text-dema-forest focus-visible:outline-none focus-visible:underline"
          >
            {config.copy.backToPlans}
          </Link>
        </div>
      ) : null}
      <ActionPlanExperience
        contentLocaleCode={config.localeCode}
        initialEmail={initialEmail}
        initialGenerationIntent={initialGenerationIntent}
        initialIsAuthenticated
        marketCodeAtCreation={config.marketCode}
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
