import {
  getDemaaServiceBySlug,
  type DemaaService,
  type DemaaServiceSlug,
} from "@/lib/service-catalog";

export type PurchasableServiceConfig = {
  slug: DemaaServiceSlug;
  unitAmount: number;
  currency: "eur";
};

const purchasableServiceConfigs = [
  {
    slug: "assistant-polyvalent",
    unitAmount: 500_00,
    currency: "eur",
  },
  {
    slug: "marketing-vente",
    unitAmount: 750_00,
    currency: "eur",
  },
  {
    slug: "organisation-equipes",
    unitAmount: 850_00,
    currency: "eur",
  },
  {
    slug: "site-web",
    unitAmount: 1350_00,
    currency: "eur",
  },
  {
    slug: "previsionnel-financier",
    unitAmount: 550_00,
    currency: "eur",
  },
  {
    slug: "audit-conformite-fiscale",
    unitAmount: 850_00,
    currency: "eur",
  },
] as const satisfies readonly PurchasableServiceConfig[];

const purchasableServiceConfigMap = new Map<string, PurchasableServiceConfig>(
  purchasableServiceConfigs.map((service) => [service.slug, service])
);

export type PurchasableService = DemaaService & PurchasableServiceConfig;

export function getPurchasableServiceConfig(slug: string) {
  return purchasableServiceConfigMap.get(slug) ?? null;
}

export function isPurchasableServiceSlug(slug: string) {
  return purchasableServiceConfigMap.has(slug);
}

export function getPurchasableServices(): PurchasableService[] {
  const services: PurchasableService[] = [];

  for (const config of purchasableServiceConfigs) {
    const service = getDemaaServiceBySlug(config.slug);

    if (!service) continue;

    services.push({
      ...service,
      ...config,
    });
  }

  return services;
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
