import type { ActionPlanAppContext } from "@/lib/action-plan-app-context";
import type { ActionPlanAccessIntent } from "@/lib/action-plan-access-intent";

const HOME_INTENTS = new Set([
  "coaching",
  "generate-plan",
  "guide-notify",
  "opportunity",
  "opportunity-submit",
  "solution-referral",
  "structure",
  "structure-problem",
  "team-demaa-profile",
]);

export function shouldRedirectAuthenticatedHomeToPlans(input: {
  isAuthenticated: boolean;
  appContext: ActionPlanAppContext;
  requestedAccessIntent?: ActionPlanAccessIntent | null;
  requestedIntent?: string;
  requestedNewPlan?: string;
}) {
  const hasActionableAccessIntent = Boolean(
    input.requestedAccessIntent
      && input.requestedAccessIntent.kind !== "open-company-strategy",
  );
  return input.isAuthenticated
    && input.appContext.view === "plan"
    && input.appContext.planSection === "actions"
    && !hasActionableAccessIntent
    && !HOME_INTENTS.has(input.requestedIntent ?? "")
    && input.requestedNewPlan !== "1";
}
