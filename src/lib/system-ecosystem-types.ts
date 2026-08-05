import type { AccountingFirm } from "@/lib/accounting-directory";
import type { DemaaFinanceItem } from "@/lib/finance-catalog";
import type { DemaaProNetwork } from "@/lib/pro-network-catalog";
import type { DemaaRecruitmentItem } from "@/lib/recruitment-catalog";
import type { DemaaService } from "@/lib/service-catalog";
import type { DemaaSupplier } from "@/lib/supplier-catalog";
import type { DemaaTraining } from "@/lib/training-catalog";

export type SystemEcosystemResourceType =
  | "accounting"
  | "finance"
  | "network"
  | "recruitment"
  | "service"
  | "supplier"
  | "training";

export type SystemEcosystemResource =
  | {
      type: "accounting";
      item: AccountingFirm;
    }
  | {
      type: "finance";
      item: DemaaFinanceItem;
    }
  | {
      type: "network";
      item: DemaaProNetwork;
    }
  | {
      type: "recruitment";
      item: DemaaRecruitmentItem;
    }
  | {
      type: "service";
      item: DemaaService;
    }
  | {
      type: "supplier";
      item: DemaaSupplier;
    }
  | {
      type: "training";
      item: DemaaTraining;
    };

export type SystemEcosystemGroupSlug =
  | "finances"
  | "protection"
  | "equipe"
  | "chantiers";

export type SystemEcosystemGroup = {
  slug: SystemEcosystemGroupSlug;
  title: string;
  resources: SystemEcosystemResource[];
};

const GENERIC_SOLUTION_CTA_RESOURCE_KEYS = new Set([
  "finance:qonto",
  "supplier:alan",
  "supplier:orus",
]);

export function getSystemEcosystemResourceCtaLabel(
  resource: SystemEcosystemResource,
) {
  const key = `${resource.type}:${resource.item.slug}`;

  if (GENERIC_SOLUTION_CTA_RESOURCE_KEYS.has(key)) {
    return "Découvrir la solution";
  }

  return "cta" in resource.item ? resource.item.cta : null;
}

export function getSystemEcosystemResourceIdentity(
  resource: SystemEcosystemResource,
) {
  const description =
    "shortDescription" in resource.item
      ? resource.item.shortDescription
      : resource.item.description;

  return {
    category:
      resource.type === "accounting"
        ? "Expert-comptable"
        : resource.item.category,
    description,
    name: resource.item.name,
    slug: resource.item.slug,
    type: resource.type,
  };
}
