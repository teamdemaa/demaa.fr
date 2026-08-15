import type { ActionPlanAppContext } from "@/lib/action-plan-app-context";

export function shouldRedirectAuthenticatedHomeToPlans(input: {
  isAuthenticated: boolean;
  appContext: ActionPlanAppContext;
  requestedIntent?: string;
  requestedNewPlan?: string;
}) {
  return input.isAuthenticated
    && input.appContext.view === "plan"
    && !input.requestedIntent
    && input.requestedNewPlan !== "1";
}
