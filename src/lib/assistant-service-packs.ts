export const ASSISTANT_SERVICE_SLUG = "assistant-polyvalent";
export const RECRUITMENT_ASSISTANT_SERVICE_SLUG =
  "recrutement-assistant-polyvalent";

export type AssistantPack = {
  slug: string;
  label: string;
  hours: number;
  hourlyRateCents: number;
  unitAmount: number;
  summary: string;
};

const ASSISTANT_HOURLY_RATE_CENTS = 30_00;

export const assistantServicePacks = [
  {
    slug: "assistant-polyvalent-20h",
    label: "Pack 20h",
    hours: 20,
    hourlyRateCents: ASSISTANT_HOURLY_RATE_CENTS,
    unitAmount: 600_00,
    summary: "20 heures d'appui administratif et opérationnel.",
  },
  {
    slug: "assistant-polyvalent-30h",
    label: "Pack 30h",
    hours: 30,
    hourlyRateCents: ASSISTANT_HOURLY_RATE_CENTS,
    unitAmount: 900_00,
    summary: "30 heures d'appui administratif et opérationnel.",
  },
  {
    slug: "assistant-polyvalent-40h",
    label: "Pack 40h",
    hours: 40,
    hourlyRateCents: ASSISTANT_HOURLY_RATE_CENTS,
    unitAmount: 1200_00,
    summary: "40 heures d'appui administratif et opérationnel.",
  },
] as const satisfies readonly AssistantPack[];

const assistantPackMap = new Map<string, AssistantPack>(
  assistantServicePacks.map((pack) => [pack.slug, pack])
);

export function getAssistantPackBySlug(slug: string) {
  return assistantPackMap.get(slug) ?? null;
}

export function isAssistantPackSlug(slug: string) {
  return assistantPackMap.has(slug);
}
