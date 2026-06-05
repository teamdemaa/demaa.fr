import { getToolDirectorySlug, type ToolDirectoryItem } from "@/lib/tool-directory";

export type ToolPricingPlan = {
  name: string;
  price: string;
  detail?: string;
};

export type ToolPricingInfo = {
  summary: string;
  plans: ToolPricingPlan[];
  note?: string;
  sourceLabel?: string;
  sourceUrl?: string;
};

const pricingBySlug: Record<string, ToolPricingInfo> = {
  airtable: {
    summary: "Gratuit pour démarrer, puis facturation par siège pour les équipes.",
    plans: [
      {
        name: "Gratuit",
        price: "0 $",
        detail: "Pour démarrer avec des besoins légers.",
      },
      {
        name: "Team",
        price: "20 $ / utilisateur / mois",
        detail: "Tarif annuel indiqué par Airtable.",
      },
      {
        name: "Business",
        price: "45 $ / utilisateur / mois",
        detail: "Tarif annuel indiqué par Airtable.",
      },
      {
        name: "Enterprise Scale",
        price: "Sur devis",
        detail: "Pour les organisations avec besoins avancés.",
      },
    ],
    note: "Airtable facture les utilisateurs avec droits d’édition sur les plans payants. Les tarifs peuvent évoluer.",
    sourceLabel: "Airtable Pricing",
    sourceUrl: "https://airtable.com/pricing",
  },
};

export function getToolPricingInfo(tool: ToolDirectoryItem): ToolPricingInfo {
  const slug = getToolDirectorySlug(tool);
  const pricing = pricingBySlug[slug];

  if (pricing) {
    return pricing;
  }

  if (tool.pricingHint === "Freemium") {
    return {
      summary: "Un plan gratuit ou une version d’essai existe généralement, avec des limites selon l’usage.",
      plans: [
        { name: "Entrée", price: "Freemium" },
        { name: "Payant", price: "À vérifier" },
      ],
      sourceLabel: "Site officiel",
      sourceUrl: tool.url,
    };
  }

  if (tool.pricingHint === "Gratuit") {
    return {
      summary: "Cet outil est gratuit sur Demaa.",
      plans: [{ name: "Gratuit", price: "0 €" }],
      sourceLabel: "Ouvrir l'outil",
      sourceUrl: tool.url,
    };
  }

  return {
    summary: "Outil principalement payant, à comparer selon le nombre d’utilisateurs et le périmètre.",
    plans: [{ name: "Payant", price: "À vérifier" }],
    sourceLabel: "Site officiel",
    sourceUrl: tool.url,
  };
}
