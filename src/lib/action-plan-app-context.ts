import type { ActionPlanView } from "@/components/ActionPlanNavbar";
import {
  normalizeSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";

const ACTION_PLAN_VIEWS = [
  "plan",
  "solutions",
  "academy",
] as const satisfies readonly ActionPlanView[];

const SAFE_SLUG_PATTERN = /^[A-Za-z0-9_-]{1,160}$/;
const OPPORTUNITY_DRAFT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const COMPANY_STRATEGY_VISIBLE = false;

const ACTION_PLAN_SECTIONS = ["actions", "figures", "strategy"] as const;
export type ActionPlanSection = (typeof ACTION_PLAN_SECTIONS)[number];

export type ActionPlanAppContext = {
  view: ActionPlanView;
  planSection: ActionPlanSection;
  systemId?: string;
  systemTab?: SystemDetailTab;
  solutionResourceSlug?: string;
  academyContentSlug?: string;
};

type SearchValue = string | string[] | undefined;
type SearchInput = URLSearchParams | Record<string, SearchValue>;

function firstValue(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function readSearchValue(input: SearchInput, key: string) {
  return input instanceof URLSearchParams
    ? input.get(key) ?? undefined
    : firstValue(input[key]);
}

function safeSlug(value: string | undefined) {
  return value && SAFE_SLUG_PATTERN.test(value) ? value : undefined;
}

function isActionPlanView(value: string | undefined): value is ActionPlanView {
  return ACTION_PLAN_VIEWS.includes(value as ActionPlanView);
}

function isActionPlanSection(value: string | undefined): value is ActionPlanSection {
  return ACTION_PLAN_SECTIONS.includes(value as ActionPlanSection)
    && (value !== "strategy" || COMPANY_STRATEGY_VISIBLE);
}

export function buildLegacyOpportunitiesHref(input: SearchInput) {
  const requestedView = readSearchValue(input, "view");
  const intent = readSearchValue(input, "intent");
  const opportunityId = safeSlug(
    readSearchValue(input, "opportunityId")
      ?? readSearchValue(input, "opportunity"),
  );
  const isOpportunityIntent = intent === "opportunity"
    || intent === "opportunity-submit"
    || intent === "team-demaa-profile";

  if (requestedView !== "opportunities" && !isOpportunityIntent) return null;

  const params = new URLSearchParams();
  if (intent === "team-demaa-profile") {
    params.set("intent", intent);
    const expertiseId = safeSlug(readSearchValue(input, "expertiseId"));
    if (expertiseId) params.set("expertiseId", expertiseId);
  } else if (intent === "opportunity" && opportunityId) {
    params.set("intent", "opportunity");
    params.set("opportunityId", opportunityId);
  } else if (requestedView === "opportunities" && opportunityId) {
    params.set("opportunity", opportunityId);
  } else if (intent === "opportunity-submit") {
    const draftToken = readSearchValue(input, "draftToken");
    if (draftToken && OPPORTUNITY_DRAFT_TOKEN_PATTERN.test(draftToken)) {
      params.set("intent", intent);
      params.set("draftToken", draftToken);
    }
  }

  const query = params.toString();
  return `/opportunites${query ? `?${query}` : ""}`;
}

export function parseActionPlanAppContext(
  input: SearchInput,
): ActionPlanAppContext {
  const intent = readSearchValue(input, "intent");
  const requestedView = readSearchValue(input, "view");
  const requestedPlanTab = readSearchValue(input, "planTab");
  const requestedSection = readSearchValue(input, "section");
  const intentView = intent === "solution-referral"
    ? "solutions"
    : intent === "structure" || intent === "structure-problem"
      ? "academy"
      : undefined;
  const requestedAppView = requestedView === "system"
    ? "solutions"
    : isActionPlanView(requestedView)
      ? requestedView
      : undefined;
  const view = requestedAppView === "plan" && requestedPlanTab === "solutions"
    ? "solutions"
    : requestedAppView ?? intentView ?? "plan";
  const systemId = safeSlug(
    readSearchValue(input, "system")
      ?? (intent === "solution-referral"
        ? readSearchValue(input, "systemSlug")
        : undefined),
  );
  const solutionResourceSlug = safeSlug(
    readSearchValue(input, "resource")
      ?? (intent === "solution-referral"
        ? readSearchValue(input, "resourceSlug")
        : undefined),
  );
  const academyContentSlug = safeSlug(readSearchValue(input, "academy"));
  const requestedSystemTab = normalizeSystemDetailTab(
    readSearchValue(input, "systemTab"),
  );

  return {
    view,
    planSection: view === "plan" && isActionPlanSection(requestedSection)
      ? requestedSection
      : "actions",
    ...(systemId ? { systemId } : {}),
    ...(requestedSystemTab ? { systemTab: requestedSystemTab } : {}),
    ...(solutionResourceSlug ? { solutionResourceSlug } : {}),
    ...(academyContentSlug ? { academyContentSlug } : {}),
  };
}

const CONTEXT_QUERY_KEYS = [
  "view",
  "section",
  "planTab",
  "system",
  "systemTab",
  "resource",
  "academy",
  "opportunity",
  "intent",
  "tab",
  "offer",
  "draftToken",
  "systemSlug",
  "resourceSlug",
  "opportunityId",
] as const;

export function buildActionPlanAppHref(input: {
  context: ActionPlanAppContext;
  pathname?: string;
  search?: string | URLSearchParams;
}) {
  const params = input.search instanceof URLSearchParams
    ? new URLSearchParams(input.search)
    : new URLSearchParams(input.search ?? "");

  for (const key of CONTEXT_QUERY_KEYS) params.delete(key);
  const view = input.context.view;

  params.set("view", view);

  const planSection = input.context.planSection === "strategy"
    && !COMPANY_STRATEGY_VISIBLE
    ? "actions"
    : input.context.planSection;

  if (view === "plan" && planSection !== "actions") {
    params.set("section", planSection);
  }

  if (view === "solutions") {
    if (input.context.systemId) params.set("system", input.context.systemId);
    if (input.context.systemTab) params.set("systemTab", input.context.systemTab);
    if (input.context.solutionResourceSlug) {
      params.set("resource", input.context.solutionResourceSlug);
    }
  }

  if (input.context.view === "academy" && input.context.academyContentSlug) {
    params.set("academy", input.context.academyContentSlug);
  }

  const query = params.toString();
  return `${input.pathname ?? "/"}${query ? `?${query}` : ""}`;
}

export function buildPublicSystemAppHref(input: {
  systemId: string;
  systemTab?: SystemDetailTab;
  solutionResourceSlug?: string;
}) {
  return buildActionPlanAppHref({
    pathname: "/",
    context: {
      view: "solutions",
      planSection: "actions",
      systemId: input.systemId,
      systemTab: input.systemTab ?? "solutions",
      ...(input.solutionResourceSlug
        ? { solutionResourceSlug: input.solutionResourceSlug }
        : {}),
    },
  });
}
