import type { ActionPlanView } from "@/components/ActionPlanNavbar";
import {
  normalizeSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";

const ACTION_PLAN_VIEWS = [
  "plan",
  "services",
  "academy",
  "opportunities",
] as const satisfies readonly ActionPlanView[];

const SAFE_SLUG_PATTERN = /^[A-Za-z0-9_-]{1,160}$/;
const OPPORTUNITY_DRAFT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
export const COMPANY_STRATEGY_VISIBLE = true;

const ACTION_PLAN_SECTIONS = ["actions", "figures", "solutions", "strategy"] as const;
export type ActionPlanSection = (typeof ACTION_PLAN_SECTIONS)[number];

const SOLUTION_ENTRY_SOURCES = ["action_recommendation"] as const;
export type SolutionEntrySource = (typeof SOLUTION_ENTRY_SOURCES)[number];

export type ActionPlanAppContext = {
  view: ActionPlanView;
  planSection: ActionPlanSection;
  systemId?: string;
  systemTab?: SystemDetailTab;
  solutionResourceSlug?: string;
  solutionEntrySource?: SolutionEntrySource;
  academyContentSlug?: string;
  opportunityId?: string;
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

function isSolutionEntrySource(value: string | undefined): value is SolutionEntrySource {
  return SOLUTION_ENTRY_SOURCES.includes(value as SolutionEntrySource);
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
    ? "plan"
    : intent === "structure" || intent === "structure-problem"
      ? "academy"
    : intent === "opportunity"
        || intent === "opportunity-submit"
        || intent === "team-demaa-profile"
      ? "opportunities"
      : undefined;
  const requestedAppView = requestedView === "system" || requestedView === "solutions"
    ? "plan"
    : isActionPlanView(requestedView)
      ? requestedView
      : undefined;
  const view = requestedAppView ?? intentView ?? "plan";
  const planSection = view === "plan" && (
    requestedView === "system"
      || requestedView === "solutions"
      || requestedPlanTab === "solutions"
      || intent === "solution-referral"
  )
    ? "solutions"
    : view === "plan" && isActionPlanSection(requestedSection)
      ? requestedSection
      : "actions";
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
  const opportunityId = safeSlug(
    readSearchValue(input, "opportunity")
      ?? (intent === "opportunity"
        ? readSearchValue(input, "opportunityId")
        : undefined),
  );
  const requestedSystemTab = normalizeSystemDetailTab(
    readSearchValue(input, "systemTab"),
  );
  const solutionEntrySource = view === "plan" && planSection === "solutions"
    && isSolutionEntrySource(readSearchValue(input, "toolSource"))
    ? readSearchValue(input, "toolSource") as SolutionEntrySource
    : undefined;

  const isSolutionsContext = view === "plan" && planSection === "solutions";

  return {
    view,
    planSection,
    ...(isSolutionsContext && systemId ? { systemId } : {}),
    ...(isSolutionsContext && requestedSystemTab ? { systemTab: requestedSystemTab } : {}),
    ...(isSolutionsContext && solutionResourceSlug ? { solutionResourceSlug } : {}),
    ...(isSolutionsContext && solutionEntrySource ? { solutionEntrySource } : {}),
    ...(view === "academy" && academyContentSlug ? { academyContentSlug } : {}),
    ...(view === "opportunities" && opportunityId ? { opportunityId } : {}),
  };
}

const CONTEXT_QUERY_KEYS = [
  "view",
  "section",
  "planTab",
  "system",
  "systemTab",
  "resource",
  "toolSource",
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

  if (view === "plan" && planSection === "solutions") {
    if (input.context.systemId) params.set("system", input.context.systemId);
    if (input.context.systemTab) params.set("systemTab", input.context.systemTab);
    if (input.context.solutionResourceSlug) {
      params.set("resource", input.context.solutionResourceSlug);
    }
    if (input.context.solutionEntrySource) {
      params.set("toolSource", input.context.solutionEntrySource);
    }
  }

  if (input.context.view === "academy" && input.context.academyContentSlug) {
    params.set("academy", input.context.academyContentSlug);
  }

  if (input.context.view === "opportunities" && input.context.opportunityId) {
    params.set("opportunity", input.context.opportunityId);
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
      view: "plan",
      planSection: "solutions",
      systemId: input.systemId,
      systemTab: input.systemTab ?? "solutions",
      ...(input.solutionResourceSlug
        ? { solutionResourceSlug: input.solutionResourceSlug }
        : {}),
    },
  });
}
