export type PartnerKeyCategory = "Finance & pilotage";

export type DemaaPartnerKey = {
  slug: string;
  name: string;
  category: PartnerKeyCategory;
  shortDescription: string;
  description: string;
  bestFor: string;
  tags: string[];
  icon: string;
  usefulFor: string[];
  href: string;
  cta: string;
};

export const partnerKeyCategories = ["Finance & pilotage"] as const satisfies readonly PartnerKeyCategory[];

export const demaaPartnerKeys = [
  {
    slug: "annuaire-experts-comptables",
    name: "Annuaire des experts-comptables",
    category: "Finance & pilotage",
    shortDescription: "Trouver un cabinet adapté à son activité, sa ville et ses enjeux.",
    description:
      "Un point d’entrée utile pour trouver un expert-comptable selon le contexte réel de l’entreprise: création, pilotage, paie, fiscalité ou structuration.",
    bestFor:
      "Les dirigeants qui veulent un partenaire financier fiable pour structurer, piloter ou sécuriser leur activité.",
    tags: ["Expert-comptable", "Pilotage", "Fiscalité", "Paie"],
    icon: "Calculator",
    usefulFor: ["Pilotage", "Création", "Fiscalité", "Structuration"],
    href: "/annuaire-experts-comptables",
    cta: "Voir l'annuaire",
  },
] satisfies readonly DemaaPartnerKey[];

export function getDemaaPartnerKeys(): DemaaPartnerKey[] {
  return [...demaaPartnerKeys];
}
