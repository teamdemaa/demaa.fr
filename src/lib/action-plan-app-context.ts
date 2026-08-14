import type { ActionPlanView } from "@/components/ActionPlanNavbar";
import {
  normalizeSystemDetailTab,
  type SystemDetailTab,
} from "@/lib/system-detail-tabs";

const ACTION_PLAN_VIEWS = [
  "plan",
  "system",
  "academy",
  "opportunities",
] as const satisfies readonly ActionPlanView[];

const SAFE_SLUG_PATTERN = /^[A-Za-z0-9_-]{1,160}$/;

export type ActionPlanPlanTab = "actions" | "solutions";

export type ActionPlanAppContext = {
  view: ActionPlanView;
  planTab?: ActionPlanPlanTab;
  systemId?: string;
  systemTab?: SystemDetailTab;
  solutionResourceSlug?: string;
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

function isActionPlanPlanTab(
  value: string | undefined,
): value is ActionPlanPlanTab {
  return value === "actions" || value === "solutions";
}

export function parseActionPlanAppContext(
  input: SearchInput,
): ActionPlanAppContext {
  const intent = readSearchValue(input, "intent");
  const requestedView = readSearchValue(input, "view");
  const requestedPlanTab = readSearchValue(input, "planTab");
  const intentView = intent === "solution-referral"
    ? "system"
    : intent === "opportunity" || intent === "opportunity-submit"
      ? "opportunities"
      : undefined;
  const legacyView = isActionPlanView(requestedView)
    ? requestedView
    : intentView ?? "plan";
  const view = legacyView === "system" ? "plan" : legacyView;
  const planTab = legacyView === "system"
    ? "solutions"
    : view === "plan" && isActionPlanPlanTab(requestedPlanTab)
      ? requestedPlanTab
      : undefined;
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

  return {
    view,
    ...(planTab ? { planTab } : {}),
    ...(systemId ? { systemId } : {}),
    ...(requestedSystemTab ? { systemTab: requestedSystemTab } : {}),
    ...(solutionResourceSlug ? { solutionResourceSlug } : {}),
    ...(academyContentSlug ? { academyContentSlug } : {}),
    ...(opportunityId ? { opportunityId } : {}),
  };
}

const CONTEXT_QUERY_KEYS = [
  "view",
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
  const view = input.context.view === "system" ? "plan" : input.context.view;
  const planTab = input.context.view === "system"
    ? "solutions"
    : view === "plan"
      ? input.context.planTab
      : undefined;

  params.set("view", view);
  if (planTab) params.set("planTab", planTab);

  if (view === "plan" && planTab === "solutions") {
    if (input.context.systemId) params.set("system", input.context.systemId);
    if (input.context.systemTab) params.set("systemTab", input.context.systemTab);
    if (input.context.solutionResourceSlug) {
      params.set("resource", input.context.solutionResourceSlug);
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
      planTab: "solutions",
      systemId: input.systemId,
      systemTab: input.systemTab ?? "solutions",
      ...(input.solutionResourceSlug
        ? { solutionResourceSlug: input.solutionResourceSlug }
        : {}),
    },
  });
}
