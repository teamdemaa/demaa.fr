import {
  getDemaaRecruitmentItemBySlug,
  type DemaaRecruitmentItem,
  type DemaaRecruitmentSlug,
} from "@/lib/recruitment-catalog";

const MAX_RECRUITMENT_ITEMS_PER_SYSTEM = 5;
const MAX_RECRUITMENT_ITEMS_PER_GROUP = 4;

export type GroupedRecommendedRecruitmentItems = {
  alternance: DemaaRecruitmentItem[];
  recrutement: DemaaRecruitmentItem[];
};

const DEFAULT_RECRUITMENT_ORDER = [
  "france-travail-pro",
  "hellowork-recruteur",
  "side-recrutement-flexible",
  "la-bonne-alternance",
  "randstad-recruteurs",
] satisfies DemaaRecruitmentSlug[];

const RECRUITMENT_RECOMMENDATIONS_BY_SECTOR: Record<string, readonly DemaaRecruitmentSlug[]> = {
  "BTP & services techniques": [
    "side-recrutement-flexible",
    "france-travail-pro",
    "hellowork-recruteur",
    "la-bonne-alternance",
    "randstad-recruteurs",
  ],
  "Hébergement & tourisme": [
    "side-recrutement-flexible",
    "france-travail-pro",
    "hellowork-recruteur",
    "la-bonne-alternance",
    "randstad-recruteurs",
  ],
  "Mobilité & logistique": [
    "side-recrutement-flexible",
    "france-travail-pro",
    "hellowork-recruteur",
    "randstad-recruteurs",
    "la-bonne-alternance",
  ],
  Restauration: [
    "side-recrutement-flexible",
    "france-travail-pro",
    "hellowork-recruteur",
    "la-bonne-alternance",
    "randstad-recruteurs",
  ],
  "Commerce & retail": [
    "side-recrutement-flexible",
    "france-travail-pro",
    "hellowork-recruteur",
    "la-bonne-alternance",
    "randstad-recruteurs",
  ],
  "Services aux particuliers": [
    "side-recrutement-flexible",
    "france-travail-pro",
    "hellowork-recruteur",
    "la-bonne-alternance",
    "randstad-recruteurs",
  ],
  "Industrie & production": [
    "side-recrutement-flexible",
    "france-travail-pro",
    "randstad-recruteurs",
    "hellowork-recruteur",
    "la-bonne-alternance",
  ],
  "Automobile & réparation": [
    "side-recrutement-flexible",
    "france-travail-pro",
    "hellowork-recruteur",
    "randstad-recruteurs",
    "la-bonne-alternance",
  ],
};

function getRecruitmentGroup(item: DemaaRecruitmentItem): keyof GroupedRecommendedRecruitmentItems {
  return item.family === "Alternance" ? "alternance" : "recrutement";
}

function getOrderedRecommendedRecruitmentItemsForSystem(
  sectorLabel: string,
): DemaaRecruitmentItem[] {
  const slugs = RECRUITMENT_RECOMMENDATIONS_BY_SECTOR[sectorLabel] ?? DEFAULT_RECRUITMENT_ORDER;
  const seen = new Set<string>();
  const items: DemaaRecruitmentItem[] = [];

  for (const slug of [...slugs, ...DEFAULT_RECRUITMENT_ORDER]) {
    if (seen.has(slug)) continue;
    const item = getDemaaRecruitmentItemBySlug(slug);
    if (!item) continue;
    items.push(item);
    seen.add(slug);
  }

  return items;
}

export function getGroupedRecommendedRecruitmentItemsForSystem(
  sectorLabel: string,
  limitPerGroup = MAX_RECRUITMENT_ITEMS_PER_GROUP,
): GroupedRecommendedRecruitmentItems {
  const grouped: GroupedRecommendedRecruitmentItems = {
    alternance: [],
    recrutement: [],
  };

  for (const item of getOrderedRecommendedRecruitmentItemsForSystem(sectorLabel)) {
    const group = getRecruitmentGroup(item);

    if (grouped[group].length >= limitPerGroup) {
      continue;
    }

    grouped[group].push(item);

    if (
      grouped.alternance.length >= limitPerGroup &&
      grouped.recrutement.length >= limitPerGroup
    ) {
      break;
    }
  }

  return grouped;
}

export function getRecommendedRecruitmentItemsForSystem(
  sectorLabel: string,
  limit = MAX_RECRUITMENT_ITEMS_PER_SYSTEM,
): DemaaRecruitmentItem[] {
  const grouped = getGroupedRecommendedRecruitmentItemsForSystem(
    sectorLabel,
    Math.max(limit, MAX_RECRUITMENT_ITEMS_PER_GROUP),
  );

  return [...grouped.alternance, ...grouped.recrutement].slice(0, limit);
}
