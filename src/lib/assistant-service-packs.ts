export const ASSISTANT_SERVICE_SLUG = "assistante-facturation";
export const RECRUITMENT_ASSISTANT_SERVICE_SLUG =
  "recrutement-assistante-facturation";

export type AssistantPack = {
  slug: string;
  label: string;
  unitAmount: number;
  summary: string;
  supplierInvoicesPerMonth: number;
  customerInvoicesPerMonth: number;
  includesClientRelances: boolean;
  includesMonthlyReporting: boolean;
};

export const assistantServicePacks = [
  {
    slug: "assistante-facturation-standard",
    label: "Standard",
    unitAmount: 350_00,
    summary:
      "Collecte WhatsApp des factures fournisseurs, émission des factures clients et transmission comptable / outil.",
    supplierInvoicesPerMonth: 50,
    customerInvoicesPerMonth: 5,
    includesClientRelances: false,
    includesMonthlyReporting: false,
  },
  {
    slug: "assistante-facturation-confort",
    label: "Confort",
    unitAmount: 600_00,
    summary:
      "Collecte WhatsApp des factures fournisseurs, émission des factures clients, transmission comptable / outil, relances clients et reporting mensuel.",
    supplierInvoicesPerMonth: 100,
    customerInvoicesPerMonth: 15,
    includesClientRelances: true,
    includesMonthlyReporting: true,
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
