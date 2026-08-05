import "server-only";

import { ACCOUNTING_RECOMMENDATION } from "@/lib/accounting-recommendation";
import type { AccountingFirm } from "@/lib/accounting-directory";
import { getRecommendedFinanceForSystem } from "@/lib/finance-recommendations";
import { generatedAccountingDirectoryFirms } from "@/lib/generated-accounting-directory-firms";
import { getRecommendedProNetworksForSystem } from "@/lib/pro-network-recommendations";
import { getRecommendedRecruitmentItemsForSystem } from "@/lib/recruitment-recommendations";
import { getRecommendedServicesForSystem } from "@/lib/service-recommendations";
import { getDemaaSupplierBySlug } from "@/lib/supplier-catalog";
import { getRecommendedSuppliersForSystem } from "@/lib/supplier-recommendations";
import type {
  SystemEcosystemGroup,
  SystemEcosystemResource,
} from "@/lib/system-ecosystem-types";
import { getRecommendedTrainingsForSystem } from "@/lib/training-recommendations";

const PROTECTION_SERVICE_SLUGS = new Set([
  "audit-conformite-fiscale",
  "creation-societe",
  "modification-societe",
]);

const PROTECTION_TRAINING_FAMILIES = new Set([
  "Réglementaire",
  "Sécurité & terrain",
  "Qualité & conformité",
]);

function accountingResource(
  firms: AccountingFirm[],
): SystemEcosystemResource | null {
  const firm = firms.find(
    (candidate) => candidate.slug === ACCOUNTING_RECOMMENDATION.firmSlug,
  );

  return firm ? { type: "accounting", item: firm } : null;
}

function compactResources(
  resources: Array<SystemEcosystemResource | null | undefined>,
) {
  const seen = new Set<string>();

  return resources.filter((resource): resource is SystemEcosystemResource => {
    if (!resource) return false;

    const key = `${resource.type}:${resource.item.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildSystemEcosystemGroups(input: {
  systemSlug: string;
  sectorLabel: string;
}): SystemEcosystemGroup[] {
  const firms = generatedAccountingDirectoryFirms;
  const financeItems = getRecommendedFinanceForSystem(input.systemSlug);
  const networks = getRecommendedProNetworksForSystem(input.systemSlug);
  const recruitmentItems = getRecommendedRecruitmentItemsForSystem(
    input.sectorLabel,
    3,
  );
  const services = getRecommendedServicesForSystem(input.systemSlug);
  const suppliers = getRecommendedSuppliersForSystem(
    input.systemSlug,
    input.sectorLabel,
  );
  const trainings = getRecommendedTrainingsForSystem(
    input.systemSlug,
    input.sectorLabel,
    6,
  );

  const protectionService = services.find((service) =>
    PROTECTION_SERVICE_SLUGS.has(service.slug),
  );
  const protectionTraining = trainings.find((training) =>
    PROTECTION_TRAINING_FAMILIES.has(training.family),
  );
  const insurance =
    suppliers.find((supplier) => supplier.category === "Assurance") ??
    getDemaaSupplierBySlug("orus");
  const teamProtection = getDemaaSupplierBySlug("alan");
  const chantierSuppliers =
    input.sectorLabel === "BTP & services techniques"
      ? suppliers
          .filter(
            (supplier) =>
              supplier.family === "Équipement & exploitation" &&
              supplier.usefulFor.some((label) =>
                /bâtiment|chantier|artisan/i.test(label),
              ),
          )
          .slice(0, 4)
      : [];

  const groups: SystemEcosystemGroup[] = [
    {
      slug: "finances",
      title: "Gérer mes finances",
      resources: compactResources([
        accountingResource(firms),
        ...financeItems.slice(0, 2).map(
          (item) => ({ type: "finance", item }) as const,
        ),
      ]),
    },
    {
      slug: "protection",
      title: "Sécuriser mon activité",
      resources: compactResources([
        insurance ? { type: "supplier", item: insurance } : null,
        protectionService
          ? { type: "service", item: protectionService }
          : null,
        protectionTraining
          ? { type: "training", item: protectionTraining }
          : null,
        networks[0] ? { type: "network", item: networks[0] } : null,
      ]),
    },
    {
      slug: "equipe",
      title: "Recruter et protéger mon équipe",
      resources: compactResources([
        teamProtection ? { type: "supplier", item: teamProtection } : null,
        ...recruitmentItems.slice(0, 2).map(
          (item) => ({ type: "recruitment", item }) as const,
        ),
      ]),
    },
    {
      slug: "chantiers",
      title: "Équiper mes chantiers",
      resources: compactResources(
        chantierSuppliers.map(
          (item) => ({ type: "supplier", item }) as const,
        ),
      ),
    },
  ];

  return groups.filter((group) => group.resources.length > 0);
}
