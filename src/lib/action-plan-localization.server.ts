import "server-only";

import { isEnglishBetaEnabled } from "@/lib/english-beta.server";
import {
  getActionPlanGenerationContext,
  InvalidActionPlanLocaleContextError,
  type ActionPlanContentLocaleCode,
  type ActionPlanCreationMarketCode,
} from "@/lib/action-plan-localization";

export { InvalidActionPlanLocaleContextError };

export class UnavailableActionPlanLocaleError extends Error {
  constructor() {
    super("action_plan_locale_unavailable");
    this.name = "UnavailableActionPlanLocaleError";
  }
}

export function authorizeActionPlanGenerationContext(input?: {
  contentLocaleCode?: ActionPlanContentLocaleCode;
  marketCodeAtCreation?: ActionPlanCreationMarketCode;
}) {
  const context = getActionPlanGenerationContext(input);
  if (context.contentLocaleCode === "en" && !isEnglishBetaEnabled()) {
    throw new UnavailableActionPlanLocaleError();
  }
  return {
    contentLocaleCode: context.contentLocaleCode,
    marketCodeAtCreation: context.marketCodeAtCreation,
  };
}
