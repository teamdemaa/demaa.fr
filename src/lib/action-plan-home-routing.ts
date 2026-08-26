import type { ActionPlanAppContext } from "@/lib/action-plan-app-context";
import type { ActionPlanAccessIntent } from "@/lib/action-plan-access-intent";

type SearchValue = string | string[] | undefined;

const EXPLICIT_HOME_ENTRY_KEYS = new Set([
  "academy",
  "draftToken",
  "intent",
  "new",
  "offer",
  "opportunity",
  "opportunityId",
  "period",
  "planTab",
  "resource",
  "resourceSlug",
  "section",
  "service",
  "system",
  "systemSlug",
  "systemTab",
  "tab",
  "toolSource",
  "view",
]);

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

export function buildDefaultHomeSolutionsHref(
  searchParams: Record<string, SearchValue>,
) {
  const trackingParams = new URLSearchParams();
  let hasExplicitEntry = false;

  for (const [key, rawValue] of Object.entries(searchParams)) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    const nonEmptyValues = values.filter(
      (value): value is string => typeof value === "string" && value.length > 0,
    );

    if (EXPLICIT_HOME_ENTRY_KEYS.has(key)) {
      if (nonEmptyValues.length > 0) hasExplicitEntry = true;
      continue;
    }

    for (const value of nonEmptyValues) trackingParams.append(key, value);
  }

  if (hasExplicitEntry) return null;
  const query = trackingParams.toString();
  return `/solutions${query ? `?${query}` : ""}`;
}

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
