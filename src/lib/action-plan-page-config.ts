import type { ActionPlanView } from "@/components/ActionPlanNavbar";
import {
  type InterfaceLocaleCode,
  type MarketCode,
} from "@/lib/international-context";
import { defineLocaleDictionary } from "@/lib/international-publication";
import { getLocalizedActionPlanPath } from "@/lib/action-plan-localization";

const marketViews = {
  "fr-fr": ["plan", "solutions", "academy", "opportunities"],
  "global-en-beta": ["plan", "solutions", "academy"],
} as const satisfies Readonly<Record<MarketCode, readonly ActionPlanView[]>>;

const localePublishedViews = {
  fr: ["plan", "solutions", "academy", "opportunities"],
  en: ["plan", "solutions", "academy"],
} as const satisfies Readonly<
  Record<InterfaceLocaleCode, readonly ActionPlanView[]>
>;

const marketCoachingAvailability = {
  "fr-fr": true,
  "global-en-beta": true,
} as const satisfies Readonly<Record<MarketCode, boolean>>;

const localePublishedCoaching = {
  fr: true,
  en: true,
} as const satisfies Readonly<Record<InterfaceLocaleCode, boolean>>;

const copy = defineLocaleDictionary({
  fr: {
    spaceLabel: "Votre espace",
    plansHeading: "Mes plans",
    newPlan: "Nouveau plan",
    noPlansHeading: "Aucun plan pour le moment",
    noPlansDescription:
      "Décrivez votre situation pour créer votre premier plan d’action enregistré.",
    createFirstPlan: "Créer mon premier plan",
    generating: "Génération en cours",
    failed: "À reprendre",
    updated: "Modifié le",
    backToPlans: "← Retour à mes plans",
    savedPlanHeading: "Mon plan d’action",
    signInToOpen: "Connectez-vous pour ouvrir ce plan.",
  },
  en: {
    spaceLabel: "Your space",
    plansHeading: "My plans",
    newPlan: "New plan",
    noPlansHeading: "No plans yet",
    noPlansDescription:
      "Describe your situation to create your first saved action plan.",
    createFirstPlan: "Create my first plan",
    generating: "Generating",
    failed: "Generation needs attention",
    updated: "Updated",
    backToPlans: "← Back to my plans",
    savedPlanHeading: "My action plan",
    signInToOpen: "Sign in to open this plan.",
  },
});

export function getActionPlanPageConfig(input: {
  localeCode: InterfaceLocaleCode;
  marketCode: MarketCode;
}) {
  const publishedViews = localePublishedViews[input.localeCode];
  const availableViews = marketViews[input.marketCode];
  const visibleViews = (availableViews as readonly ActionPlanView[]).filter(
    (view) => (publishedViews as readonly ActionPlanView[]).includes(view),
  );
  const showCoaching = marketCoachingAvailability[input.marketCode]
    && localePublishedCoaching[input.localeCode];

  return {
    copy: copy[input.localeCode],
    localeCode: input.localeCode,
    marketCode: input.marketCode,
    paths: {
      latest: getLocalizedActionPlanPath(input.localeCode, "/plans/latest"),
      new: getLocalizedActionPlanPath(input.localeCode, "/plans/new"),
      plans: getLocalizedActionPlanPath(input.localeCode, "/plans"),
      plan: (id: string) => getLocalizedActionPlanPath(
        input.localeCode,
        `/plans/${encodeURIComponent(id)}`,
      ),
    },
    showCoaching,
    visibleViews,
  } as const;
}

export function formatActionPlanUpdatedAt(input: {
  localeCode: InterfaceLocaleCode;
  value: string;
}) {
  const date = new Date(input.value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(
    input.localeCode === "en" ? "en-GB" : "fr-FR",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    },
  ).format(date);
}

export function constrainActionPlanView(
  view: ActionPlanView,
  visibleViews: readonly ActionPlanView[],
) {
  return visibleViews.includes(view) ? view : "plan";
}
