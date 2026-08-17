import type { InterfaceLocaleCode, MarketCode } from "@/lib/international-context";
import {
  ENGLISH_BETA_CONTEXT,
  FRANCE_CONTEXT,
} from "@/lib/international-context";
import {
  actionPlanSystemOptions,
  type ActionPlanSystemOption,
} from "@/lib/action-plan-system-catalog";

export type ActionPlanContentLocaleCode = InterfaceLocaleCode;
export type ActionPlanCreationMarketCode = MarketCode;

export type ActionPlanGenerationContext = Readonly<{
  contentLocaleCode: ActionPlanContentLocaleCode;
  marketCodeAtCreation: ActionPlanCreationMarketCode;
  supportedSystemIds: readonly string[];
}>;

export const ENGLISH_ACTION_PLAN_SYSTEM_IDS = [
  "saas",
  "agence-web",
  "agence-marketing",
  "agence-seo",
  "agence-acquisition-paid-ads",
  "consultant-independant",
  "consultant-data-bi",
  "freelance",
  "studio-branding-design",
  "formation-en-ligne",
] as const;

const ENGLISH_SYSTEM_PROJECTIONS: Readonly<
  Record<(typeof ENGLISH_ACTION_PLAN_SYSTEM_IDS)[number], ActionPlanSystemOption>
> = {
  saas: {
    id: "saas",
    label: "SaaS",
    aliases: ["software as a service", "subscription software", "B2B SaaS"],
  },
  "agence-web": {
    id: "agence-web",
    label: "Web agency",
    aliases: ["website agency", "web development agency", "digital agency"],
  },
  "agence-marketing": {
    id: "agence-marketing",
    label: "Marketing agency",
    aliases: ["growth agency", "digital marketing agency", "marketing studio"],
  },
  "agence-seo": {
    id: "agence-seo",
    label: "SEO agency",
    aliases: ["search agency", "organic search agency", "SEO consultancy"],
  },
  "agence-acquisition-paid-ads": {
    id: "agence-acquisition-paid-ads",
    label: "Paid advertising agency",
    aliases: ["paid media agency", "PPC agency", "performance marketing agency"],
  },
  "consultant-independant": {
    id: "consultant-independant",
    label: "Independent consultant",
    aliases: ["solo consultant", "management consultant", "independent advisor"],
  },
  "consultant-data-bi": {
    id: "consultant-data-bi",
    label: "Data / BI consultant",
    aliases: ["data consultant", "business intelligence consultant", "analytics consultant"],
  },
  freelance: {
    id: "freelance",
    label: "B2B freelancer",
    aliases: ["independent professional", "B2B contractor", "solo freelancer"],
  },
  "studio-branding-design": {
    id: "studio-branding-design",
    label: "Branding / design studio",
    aliases: ["design studio", "branding studio", "creative studio"],
  },
  "formation-en-ligne": {
    id: "formation-en-ligne",
    label: "Online training business",
    aliases: ["online course business", "e-learning business", "training creator"],
  },
};

export const englishActionPlanSystemOptions = ENGLISH_ACTION_PLAN_SYSTEM_IDS.map(
  (id) => ENGLISH_SYSTEM_PROJECTIONS[id],
);

export function normalizeActionPlanLocaleContext(input?: {
  contentLocaleCode?: unknown;
  marketCodeAtCreation?: unknown;
}) {
  return input?.contentLocaleCode === "en"
    && input.marketCodeAtCreation === ENGLISH_BETA_CONTEXT.marketCode
    ? {
        contentLocaleCode: ENGLISH_BETA_CONTEXT.localeCode,
        marketCodeAtCreation: ENGLISH_BETA_CONTEXT.marketCode,
      } as const
    : {
        contentLocaleCode: FRANCE_CONTEXT.localeCode,
        marketCodeAtCreation: FRANCE_CONTEXT.marketCode,
      } as const;
}

export function getActionPlanGenerationContext(input?: {
  contentLocaleCode?: unknown;
  marketCodeAtCreation?: unknown;
}): ActionPlanGenerationContext {
  const context = normalizeActionPlanLocaleContext(input);
  const supportedSystemIds = context.contentLocaleCode === "en"
    ? ENGLISH_ACTION_PLAN_SYSTEM_IDS
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
