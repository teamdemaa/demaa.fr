import "server-only";

import {
  getAccountingFirms,
  getAccountingFirmScore,
  type AccountingFirm,
} from "@/lib/accounting-directory";

const KEYWORDS_BY_SECTOR: Record<string, string[]> = {
  "Conseil & services aux entreprises": ["services", "conseil", "tpe", "pme"],
  "Tech & Digital": ["startup", "saas", "digital", "tech"],
  "BTP & services techniques": ["btp", "bâtiment", "chantier", "artisan", "travaux"],
  Immobilier: ["immobilier", "agence", "locatif", "syndic", "patrimoine"],
  "Hébergement & tourisme": ["hôtel", "tourisme", "hébergement", "restaurant"],
  Patrimoine: ["patrimoine", "gestion de patrimoine", "immobilier"],
  "Mobilité & logistique": ["transport", "logistique", "livraison", "flotte"],
  Restauration: ["restaurant", "restauration", "bar", "café", "traiteur"],
  "Commerce & retail": ["commerce", "retail", "boutique", "e-commerce", "magasin"],
  "Santé, bien-être & esthétique": ["santé", "médical", "paramédical", "esthétique", "beauté"],
  "Services aux particuliers": ["services", "particuliers", "aide à domicile", "ménage"],
  "Éducation & formation": ["formation", "organisme de formation", "éducation", "cfa"],
  "Industrie & production": ["industrie", "production", "atelier", "usine"],
  "Automobile & réparation": ["garage", "automobile", "réparation", "carrosserie"],
  "Associations & événements": ["association", "événement", "événementiel"],
};

const KEYWORDS_BY_SYSTEM: Record<string, string[]> = {
  saas: ["saas", "startup", "digital"],
  "cabinet-medical": ["santé", "médical"],
  restaurant: ["restaurant", "restauration"],
  "agence-immobiliere": ["immobilier", "agence immobilière"],
  batiment: ["bâtiment", "btp", "travaux"],
  boulangerie: ["commerce", "magasin", "retail"],
  "organisme-de-formation": ["formation", "organisme de formation", "qualiopi"],
};

function buildFirmSearchText(firm: AccountingFirm): string {
  return [
    firm.name,
    firm.description,
    firm.city,
    ...firm.regions,
    ...firm.industries,
    ...firm.services,
    ...firm.clientTypes,
    ...firm.tools,
  ]
    .join(" ")
    .toLowerCase();
}

function getKeywordScore(text: string, keywords: string[]): number {
  let score = 0;

  for (const keyword of keywords) {
    if (text.includes(keyword.toLowerCase())) {
      score += 18;
    }
  }

  return score;
}

export async function getRecommendedAccountingFirmsForSystem(
  systemSlug: string,
  sectorLabel: string,
  limit = 5,
): Promise<AccountingFirm[]> {
  const firms = await getAccountingFirms();
  const keywords = [
    ...(KEYWORDS_BY_SYSTEM[systemSlug] ?? []),
    ...(KEYWORDS_BY_SECTOR[sectorLabel] ?? []),
  ];

  return [...firms]
    .sort((left, right) => {
      const featuredDifference =
        (left.featuredRank ?? Number.MAX_SAFE_INTEGER) -
        (right.featuredRank ?? Number.MAX_SAFE_INTEGER);

      if (featuredDifference !== 0) {
        return featuredDifference;
      }

      const leftText = buildFirmSearchText(left);
      const rightText = buildFirmSearchText(right);
      const leftScore =
        getKeywordScore(leftText, keywords) +
        getAccountingFirmScore(left, { clientType: "TPE" });
      const rightScore =
        getKeywordScore(rightText, keywords) +
        getAccountingFirmScore(right, { clientType: "TPE" });

      if (rightScore !== leftScore) {
        return rightScore - leftScore;
      }

      return left.name.localeCompare(right.name, "fr");
    })
    .slice(0, limit);
}
