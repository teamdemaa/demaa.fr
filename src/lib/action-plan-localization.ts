import type { InterfaceLocaleCode, MarketCode } from "@/lib/international-context";
import {
  FRANCE_CONTEXT,
} from "@/lib/international-context";
import {
  actionPlanSystemOptions,
} from "@/lib/action-plan-system-catalog";
import {
  englishActionPlanSystemIds,
  englishActionPlanSystemOptions,
} from "@/lib/action-plan-system-projections";

export type ActionPlanContentLocaleCode = InterfaceLocaleCode;
export type ActionPlanCreationMarketCode = MarketCode;

export type ActionPlanGenerationContext = Readonly<{
  contentLocaleCode: ActionPlanContentLocaleCode;
  marketCodeAtCreation: ActionPlanCreationMarketCode;
  supportedSystemIds: readonly string[];
}>;

export { englishActionPlanSystemOptions };

export class InvalidActionPlanLocaleContextError extends Error {
  constructor() {
    super("invalid_action_plan_locale_context");
    this.name = "InvalidActionPlanLocaleContextError";
  }
}

export function parseActionPlanLocaleContext(input?: {
  contentLocaleCode?: unknown;
  marketCodeAtCreation?: unknown;
}) {
  const contentLocaleCode = input?.contentLocaleCode;
  const marketCodeAtCreation = input?.marketCodeAtCreation;
  if (
    (contentLocaleCode === "fr" || contentLocaleCode === "en")
    && (marketCodeAtCreation === "fr-fr" || marketCodeAtCreation === "global-en-beta")
  ) {
    return { contentLocaleCode, marketCodeAtCreation } as const;
  }
  return null;
}

export function normalizeActionPlanLocaleContext(input?: {
  contentLocaleCode?: unknown;
  marketCodeAtCreation?: unknown;
}) {
  return parseActionPlanLocaleContext(input) ?? {
    contentLocaleCode: FRANCE_CONTEXT.localeCode,
    marketCodeAtCreation: FRANCE_CONTEXT.marketCode,
  } as const;
}

export function resolveActionPlanLocaleContextForCreation(input?: {
  contentLocaleCode?: unknown;
  marketCodeAtCreation?: unknown;
}) {
  const hasExplicitContext = input?.contentLocaleCode !== undefined
    || input?.marketCodeAtCreation !== undefined;
  if (!hasExplicitContext) {
    return {
      contentLocaleCode: FRANCE_CONTEXT.localeCode,
      marketCodeAtCreation: FRANCE_CONTEXT.marketCode,
    } as const;
  }
  const parsed = parseActionPlanLocaleContext(input);
  if (!parsed) throw new InvalidActionPlanLocaleContextError();
  return parsed;
}

export function getActionPlanGenerationContext(input?: {
  contentLocaleCode?: unknown;
  marketCodeAtCreation?: unknown;
}): ActionPlanGenerationContext {
  const context = resolveActionPlanLocaleContextForCreation(input);
  const supportedSystemIds = context.contentLocaleCode === "en"
    ? englishActionPlanSystemIds
    : actionPlanSystemOptions.map(({ id }) => id);
  return { ...context, supportedSystemIds };
}

export function getActionPlanSystemOptionsForContext(
  context: Pick<ActionPlanGenerationContext, "contentLocaleCode" | "marketCodeAtCreation">,
) {
  const normalized = normalizeActionPlanLocaleContext(context);
  return normalized.contentLocaleCode === "en"
    ? englishActionPlanSystemOptions
    : actionPlanSystemOptions;
}

export function getLocalizedActionPlanPath(
  localeCode: ActionPlanContentLocaleCode,
  path: `/plans${string}`,
) {
  return localeCode === "en" ? `/en${path}` : path;
}
