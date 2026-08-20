import "server-only";

import { notFound, redirect } from "next/navigation";
import {
  buildActionPlanAppHref,
  buildLegacyOpportunitiesHref,
  parseActionPlanAppContext,
  type ActionPlanAppContext,
} from "@/lib/action-plan-app-context";
import {
  constrainActionPlanView,
  getActionPlanPageConfig,
} from "@/lib/action-plan-page-config";
import {
  getActionPlanIndexPageForIdentity,
  getActionPlanWorkspacePageForIdentity,
} from "@/lib/action-plan-storage.server";
import { shouldRedirectAuthenticatedHomeToPlans } from "@/lib/action-plan-home-routing";
import { getCurrentCustomerAppIdentityFromSession } from "@/lib/customer-space-session.server";
import {
  type InterfaceLocaleCode,
} from "@/lib/international-context";
import {
  getConfiguredVisitorCommercialContext,
  resolveAuthenticatedInternationalContext,
} from "@/lib/international-context.server";

type SearchValue = string | string[] | undefined;
export type ActionPlanPageSearchParams = Record<string, SearchValue>;

export async function loadActionPlanHomePage(input: {
  localeCode: InterfaceLocaleCode;
  searchParams: ActionPlanPageSearchParams;
}) {
  if (input.localeCode === "fr") {
    const legacyOpportunitiesHref = buildLegacyOpportunitiesHref(input.searchParams);
    if (legacyOpportunitiesHref) redirect(legacyOpportunitiesHref);
  }

  const identity = await getCurrentCustomerAppIdentityFromSession();
  const parsedContext = parseActionPlanAppContext(input.searchParams);
  const requestedIntent = Array.isArray(input.searchParams.intent)
    ? input.searchParams.intent[0]
    : input.searchParams.intent;
  const requestedNewPlan = Array.isArray(input.searchParams.new)
    ? input.searchParams.new[0]
    : input.searchParams.new;
  const unauthenticatedConfig = getUnauthenticatedConfig(input.localeCode);

  if (shouldRedirectAuthenticatedHomeToPlans({
    isAuthenticated: Boolean(identity),
    appContext: parsedContext,
    requestedIntent,
    requestedNewPlan,
  })) {
    redirect(unauthenticatedConfig.paths.latest);
  }

  const authenticatedContext = identity
    ? await resolveAuthenticatedInternationalContext({
        identity,
        localeCode: input.localeCode,
      })
    : null;
  const config = getActionPlanPageConfig({
    localeCode: input.localeCode,
    marketCode: authenticatedContext?.internationalContext.marketCode
      ?? unauthenticatedConfig.marketCode,
  });

  return {
    config,
    initialAppContext: constrainContext(parsedContext, config.visibleViews),
    initialEmail: identity?.email ?? "",
    initialGenerationIntent: requestedIntent === "generate-plan",
    initialIsAuthenticated: Boolean(identity),
    initialStructureIntent: input.localeCode === "fr"
      && (requestedIntent === "structure" || requestedIntent === "structure-problem"),
  };
}

function getUnauthenticatedConfig(localeCode: InterfaceLocaleCode) {
  const commercialContext = getConfiguredVisitorCommercialContext(localeCode);
  return getActionPlanPageConfig({
    localeCode,
    marketCode: commercialContext.marketCode,
  });
}

function constrainContext(
  context: ActionPlanAppContext,
  visibleViews: ReturnType<typeof getActionPlanPageConfig>["visibleViews"],
): ActionPlanAppContext {
  const view = constrainActionPlanView(context.view, visibleViews);
  return view === context.view
    ? context
    : {
        view,
        planSection: "actions",
      };
}

function redirectToSignIn(input: {
  returnTo: string;
  message?: string;
}): never {
  const params = new URLSearchParams({ returnTo: input.returnTo });
  if (input.message) params.set("message", input.message);
  redirect(`/connexion?${params.toString()}`);
}

export async function loadActionPlansPage(localeCode: InterfaceLocaleCode) {
  const identity = await getCurrentCustomerAppIdentityFromSession();
  const unauthenticatedConfig = getUnauthenticatedConfig(localeCode);
  if (!identity) {
    redirectToSignIn({
      returnTo: unauthenticatedConfig.paths.plans,
    });
  }
  const page = await getActionPlanIndexPageForIdentity(identity);
  return {
    config: getActionPlanPageConfig({
      localeCode,
      marketCode: page.companyContext.marketCode,
    }),
    plans: page.plans,
  };
}

export async function loadNewActionPlanPage(input: {
  localeCode: InterfaceLocaleCode;
  searchParams: Promise<{ resume?: string | string[] }>;
}) {
  const [identity, params] = await Promise.all([
    getCurrentCustomerAppIdentityFromSession(),
    input.searchParams,
  ]);
  const unauthenticatedConfig = getUnauthenticatedConfig(input.localeCode);
  if (!identity) {
    redirectToSignIn({
      returnTo: unauthenticatedConfig.paths.new,
    });
  }
  const page = await getActionPlanIndexPageForIdentity(identity);
  return {
    config: getActionPlanPageConfig({
      localeCode: input.localeCode,
      marketCode: page.companyContext.marketCode,
    }),
    hasPlans: page.plans.length > 0,
    initialEmail: identity.email,
    initialGenerationIntent:
      (Array.isArray(params.resume) ? params.resume[0] : params.resume) === "generation",
  };
}

export async function loadSavedActionPlanPage(input: {
  id: string;
  localeCode: InterfaceLocaleCode;
  searchParams: ActionPlanPageSearchParams;
}) {
  if (input.localeCode === "fr") {
    const legacyOpportunitiesHref = buildLegacyOpportunitiesHref(input.searchParams);
    if (legacyOpportunitiesHref) redirect(legacyOpportunitiesHref);
  }

  const parsedContext = parseActionPlanAppContext(input.searchParams);
  const unauthenticatedConfig = getUnauthenticatedConfig(input.localeCode);
  const unauthenticatedContext = constrainContext(
    parsedContext,
    unauthenticatedConfig.visibleViews,
  );
  const identity = await getCurrentCustomerAppIdentityFromSession();
  if (!identity) {
    redirectToSignIn({
      message: unauthenticatedConfig.copy.signInToOpen,
      returnTo: buildActionPlanAppHref({
        context: unauthenticatedContext,
        pathname: unauthenticatedConfig.paths.plan(input.id),
      }),
    });
  }

  const page = await getActionPlanWorkspacePageForIdentity(identity, input.id);
  if (!page.companyContext || !page.generationState) notFound();
  const config = getActionPlanPageConfig({
    localeCode: input.localeCode,
    marketCode: page.companyContext.marketCode,
  });

  return {
    availablePlans: page.plans,
    config,
    generationState: page.generationState,
    initialAppContext: constrainContext(parsedContext, config.visibleViews),
    initialEmail: identity.email,
  };
}

export async function redirectToLatestActionPlan(localeCode: InterfaceLocaleCode) {
  const identity = await getCurrentCustomerAppIdentityFromSession();
  const unauthenticatedConfig = getUnauthenticatedConfig(localeCode);
  if (!identity) {
    redirectToSignIn({
      returnTo: unauthenticatedConfig.paths.latest,
    });
  }
  const page = await getActionPlanIndexPageForIdentity(identity);
  const config = getActionPlanPageConfig({
    localeCode,
    marketCode: page.companyContext.marketCode,
  });
  const [latestPlan] = page.plans;
  redirect(latestPlan ? config.paths.plan(latestPlan.id) : config.paths.new);
}
