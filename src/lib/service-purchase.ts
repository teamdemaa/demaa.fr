import {
  ASSISTANT_SERVICE_SLUG,
  RECRUITMENT_ASSISTANT_SERVICE_SLUG,
  assistantServicePacks,
} from "@/lib/assistant-service-packs";
import { getDemaaServiceBySlug } from "@/lib/service-catalog";

export type PurchasableServiceConfig = {
  slug: string;
  serviceSlug: string;
  name: string;
  shortDescription: string;
  unitAmount: number;
  currency: "eur";
};

const purchasableServiceConfigs = [
  ...assistantServicePacks.map((pack) => ({
    slug: pack.slug,
    serviceSlug: ASSISTANT_SERVICE_SLUG,
    name: `Assistance facturation - ${pack.label}`,
    shortDescription: `${pack.summary} Tarif horaire : 30 € HT.`,
    unitAmount: pack.unitAmount,
    currency: "eur" as const,
  })),
  {
    slug: RECRUITMENT_ASSISTANT_SERVICE_SLUG,
    serviceSlug: RECRUITMENT_ASSISTANT_SERVICE_SLUG,
    name: "Recrutement assistante facturation",
    shortDescription:
      "Un accompagnement pour sélectionner, former et intégrer une assistante facturation avec méthode.",
    unitAmount: 500_00,
    currency: "eur" as const,
  },
  {
    slug: "marketing-vente",
    serviceSlug: "marketing-vente",
    name: getDemaaServiceBySlug("marketing-vente")?.name || "Système Marketing & Vente",
    shortDescription:
      getDemaaServiceBySlug("marketing-vente")?.shortDescription ||
      "Clarifier l'offre et structurer le suivi marketing et vente.",
    unitAmount: 750_00,
    currency: "eur" as const,
  },
  {
    slug: "organisation-equipes",
    serviceSlug: "organisation-equipes",
    name:
      getDemaaServiceBySlug("organisation-equipes")?.name ||
      "Organisation opérationnelle",
    shortDescription:
      getDemaaServiceBySlug("organisation-equipes")?.shortDescription ||
      "Structurer l'organisation interne et les responsabilités.",
    unitAmount: 850_00,
    currency: "eur" as const,
  },
  {
    slug: "site-web",
    serviceSlug: "site-web",
    name: getDemaaServiceBySlug("site-web")?.name || "Site web & visibilité digitale",
    shortDescription:
      getDemaaServiceBySlug("site-web")?.shortDescription ||
      "Les supports essentiels pour présenter l'entreprise.",
    unitAmount: 1350_00,
    currency: "eur" as const,
  },
  {
    slug: "previsionnel-financier",
    serviceSlug: "previsionnel-financier",
    name: getDemaaServiceBySlug("previsionnel-financier")?.name || "Prévisionnel financier",
    shortDescription:
      getDemaaServiceBySlug("previsionnel-financier")?.shortDescription ||
      "Un prévisionnel clair pour piloter vos chiffres.",
    unitAmount: 550_00,
    currency: "eur" as const,
  },
  {
    slug: "audit-conformite-fiscale",
    serviceSlug: "audit-conformite-fiscale",
    name:
      getDemaaServiceBySlug("audit-conformite-fiscale")?.name ||
      "Audit d'optimisation et conformité fiscale",
    shortDescription:
      getDemaaServiceBySlug("audit-conformite-fiscale")?.shortDescription ||
      "Un audit ciblé pour repérer risques et optimisations.",
    unitAmount: 850_00,
    currency: "eur" as const,
  },
] as const satisfies readonly PurchasableServiceConfig[];

const purchasableServiceConfigMap = new Map<string, PurchasableServiceConfig>(
  purchasableServiceConfigs.map((service) => [service.slug, service])
);

export function getPurchasableServiceConfig(slug: string) {
  return purchasableServiceConfigMap.get(slug) ?? null;
}

export function isPurchasableServiceSlug(slug: string) {
  return purchasableServiceConfigMap.has(slug);
}

export function getPurchasableServices() {
  return [...purchasableServiceConfigs];
}

export function formatPurchasableServicePrice(
  amount: number,
  currency: PurchasableServiceConfig["currency"] = "eur"
) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100);
}
