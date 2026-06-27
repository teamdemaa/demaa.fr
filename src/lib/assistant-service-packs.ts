export const ASSISTANT_SERVICE_SLUG = "assistante-facturation";
export const LEGACY_ASSISTANT_SERVICE_SLUG = "assistant-polyvalent";
export const RECRUITMENT_ASSISTANT_SERVICE_SLUG =
  "recrutement-assistante-facturation";
export const LEGACY_RECRUITMENT_ASSISTANT_SERVICE_SLUG =
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
    slug: "assistante-facturation-20h",
    label: "Pack 20h",
    hours: 20,
    hourlyRateCents: ASSISTANT_HOURLY_RATE_CENTS,
    unitAmount: 600_00,
    summary: "20 heures pour devis, facturation, relances et suivi administratif.",
  },
  {
    slug: "assistante-facturation-30h",
    label: "Pack 30h",
    hours: 30,
    hourlyRateCents: ASSISTANT_HOURLY_RATE_CENTS,
    unitAmount: 900_00,
    summary: "30 heures pour devis, facturation, relances et suivi administratif.",
  },
  {
    slug: "assistante-facturation-40h",
    label: "Pack 40h",
    hours: 40,
    hourlyRateCents: ASSISTANT_HOURLY_RATE_CENTS,
    unitAmount: 1200_00,
    summary: "40 heures pour devis, facturation, relances et suivi administratif.",
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
