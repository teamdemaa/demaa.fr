import "server-only";

import { notFound, redirect } from "next/navigation";
import {
  buildActionPlanAppHref,
  buildLegacyOpportunitiesHref,
  parseActionPlanAppContext,
  type ActionPlanAppContext,
} from "@/lib/action-plan-app-context";
import { parseActionPlanAccessIntent } from "@/lib/action-plan-access-intent";
import {
  constrainActionPlanView,
  getActionPlanPageConfig,
} from "@/lib/action-plan-page-config";
import {
  getActionPlanIndexPageForIdentity,
  getActionPlanWorkspacePageForIdentity,
} from "@/lib/action-plan-storage.server";
import { shouldRedirectAuthenticatedHomeToPlans } from "@/lib/action-plan-home-routing";
import { getActiveDefaultCompanyContext } from "@/lib/company-membership.server";
import { getCurrentCustomerAppIdentityFromSession } from "@/lib/customer-space-session.server";
import { isGuestProductEnabled } from "@/lib/guest-action-plan-security.server";
import {
  GLOBAL_ENGLISH_BETA_COMMERCIAL_CONTEXT,
  FRANCE_COMMERCIAL_CONTEXT,
  type InterfaceLocaleCode,
} from "@/lib/international-context";

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

  const parsedContext = parseActionPlanAppContext(input.searchParams);
  const requestedIntent = Array.isArray(input.searchParams.intent)
    ? input.searchParams.intent[0]
    : input.searchParams.intent;
  const unauthenticatedConfig = getUnauthenticatedConfig(input.localeCode);

  if (isGuestProductEnabled()) {
    return {
      config: unauthenticatedConfig,
      guestProductEnabled: true,
      initialAccessIntent: null,
      initialAppContext: constrainContext(
        parsedContext,
        unauthenticatedConfig.visibleViews,
      ),
      initialEmail: "",
      initialGenerationIntent: false,
      initialIsAuthenticated: false,
      initialStructureIntent: input.localeCode === "fr"
        && (requestedIntent === "structure" || requestedIntent === "structure-problem"),
    };
  }

  const identity = await getCurrentCustomerAppIdentityFromSession();
  const requestedNewPlan = Array.isArray(input.searchParams.new)
    ? input.searchParams.new[0]
    : input.searchParams.new;
  const parsedAccessIntent = parseActionPlanAccessIntent(input.searchParams);
  const requestedAccessIntent = parsedAccessIntent?.kind === "open-company-strategy"
    ? null
    : parsedAccessIntent;

  if (shouldRedirectAuthenticatedHomeToPlans({
    isAuthenticated: Boolean(identity),
    appContext: parsedContext,
    requestedAccessIntent,
    requestedIntent,
    requestedNewPlan,
  })) {
    redirect(unauthenticatedConfig.paths.latest);
  }

  const companyContext = identity
    ? await getActiveDefaultCompanyContext(identity.uid)
    : null;
  const config = getActionPlanPageConfig({
    localeCode: input.localeCode,
    marketCode: companyContext?.marketCode ?? unauthenticatedConfig.marketCode,
  });

  return {
    config,
    guestProductEnabled: false,
    initialAccessIntent: requestedAccessIntent,
    initialAppContext: constrainContext(parsedContext, config.visibleViews),
    initialEmail: identity?.email ?? "",
    initialGenerationIntent: requestedIntent === "generate-plan",
    initialIsAuthenticated: Boolean(identity),
    initialStructureIntent: input.localeCode === "fr"
      && (requestedIntent === "structure" || requestedIntent === "structure-problem"),
  };
}

function getUnauthenticatedConfig(localeCode: InterfaceLocaleCode) {
  return getActionPlanPageConfig({
    localeCode,
    marketCode: localeCode === "en"
      ? GLOBAL_ENGLISH_BETA_COMMERCIAL_CONTEXT.marketCode
      : FRANCE_COMMERCIAL_CONTEXT.marketCode,
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

function redirectRetiredCustomerRoute(localeCode: InterfaceLocaleCode) {
  if (isGuestProductEnabled()) redirect(localeCode === "en" ? "/en" : "/");
}

export async function loadActionPlansPage(localeCode: InterfaceLocaleCode) {
  redirectRetiredCustomerRoute(localeCode);
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
  redirectRetiredCustomerRoute(input.localeCode);
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
  redirectRetiredCustomerRoute(input.localeCode);
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
  redirectRetiredCustomerRoute(localeCode);
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
