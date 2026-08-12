import "server-only";

import { getDemaaProNetworkBySlug } from "@/lib/pro-network-catalog";
import { isSafeInteractionHref, type SolutionResource } from "@/lib/solution-registry-contract";
import { getDemaaSupplierBySlug } from "@/lib/supplier-catalog";
import { getToolDirectoryItemBySlug } from "@/lib/tool-directory";

type ResourcePresentation = Readonly<{
  ctaLabel: string;
  displayCategory: string;
  indicativePricing?: string;
  pricingReviewedAt?: string;
  pricingExpiresAt?: string;
  pricingSource?: string;
}>;

const RESOURCE_PRESENTATIONS: Readonly<Record<string, ResourcePresentation>> = {
  obat: {
    ctaLabel: "Voir l’outil",
    displayCategory: "Logiciel",
    indicativePricing: "À partir de 39 € HT/mois (paiement annuel)",
    pricingReviewedAt: "2026-08-04",
    pricingSource: "https://www.obat.fr/",
  },
  costructor: {
    ctaLabel: "Voir l’outil",
    displayCategory: "Logiciel",
    indicativePricing: "Gratuit, puis à partir de 12,50 € HT/mois (paiement annuel)",
    pricingReviewedAt: "2026-08-04",
    pricingSource: "https://costructor.co/",
  },
  progbat: {
    ctaLabel: "Voir l’outil",
    displayCategory: "Logiciel",
    indicativePricing: "À partir de 29 € HT/mois",
    pricingReviewedAt: "2026-08-04",
    pricingSource: "https://www.progbat.com/",
  },
  vertuoza: {
    ctaLabel: "Voir l’outil",
    displayCategory: "Logiciel",
    indicativePricing: "Tarif sur demande",
    pricingReviewedAt: "2026-08-04",
    pricingSource: "https://www.vertuoza.com/",
  },
  "point-p": {
    ctaLabel: "Voir le fournisseur",
    displayCategory: "Fournisseur de matériaux",
    indicativePricing: "Tarifs selon les matériaux, l’agence et les conditions du compte professionnel",
    pricingReviewedAt: "2026-08-04",
    pricingSource: "https://www.pointp.fr/",
  },
  "plateforme-du-batiment": {
    ctaLabel: "Voir le fournisseur",
    displayCategory: "Fournisseur réservé aux professionnels",
    indicativePricing: "Tarifs selon les produits et les conditions du compte professionnel",
    pricingReviewedAt: "2026-08-04",
    pricingSource: "https://www.laplateforme.com/",
  },
  kiloutou: {
    ctaLabel: "Voir le service de location",
    displayCategory: "Location de matériel",
    indicativePricing: "Tarif selon le matériel, la durée, l’agence et les services associés",
    pricingReviewedAt: "2026-08-04",
    pricingSource: "https://www.kiloutou.fr/",
  },
  wurth: {
    ctaLabel: "Voir le fournisseur",
    displayCategory: "Fournisseur d’outillage et de consommables",
    indicativePricing: "Tarifs selon les références et les conditions du compte professionnel",
    pricingReviewedAt: "2026-08-04",
    pricingSource: "https://eshop.wurth.fr/",
  },
  capeb: {
    ctaLabel: "Découvrir l’organisation",
    displayCategory: "Organisation professionnelle",
    indicativePricing: "Cotisation selon l’entreprise et la structure CAPEB locale",
    pricingReviewedAt: "2026-08-04",
    pricingSource: "https://www.capeb.fr/",
  },
};

const DEFAULT_PRESENTATIONS: Readonly<Record<SolutionResource["resourceType"], ResourcePresentation>> = {
  tool: { ctaLabel: "Voir l’outil", displayCategory: "Outil" },
  software: { ctaLabel: "Voir l’outil", displayCategory: "Logiciel" },
  provider: { ctaLabel: "Voir le fournisseur", displayCategory: "Fournisseur" },
  financing: { ctaLabel: "Voir le financement", displayCategory: "Financement" },
  aid: { ctaLabel: "Voir l’aide", displayCategory: "Aide et subvention" },
  directory: { ctaLabel: "Découvrir l’organisation", displayCategory: "Organisation professionnelle" },
  expertise: { ctaLabel: "Décrire mon besoin", displayCategory: "Prestation" },
};

export function getSolutionResourcePresentation(
  resource: SolutionResource,
  now = new Date(),
): ResourcePresentation {
  const presentation = RESOURCE_PRESENTATIONS[resource.resourceSlug]
    ?? DEFAULT_PRESENTATIONS[resource.resourceType];
  if (!presentation.indicativePricing) return presentation;

  const reviewedAt = Date.parse(presentation.pricingReviewedAt ?? "");
  const expiresAt = Date.parse(presentation.pricingExpiresAt ?? "");
  if (
    !Number.isFinite(now.getTime()) ||
    !Number.isFinite(reviewedAt) ||
    !Number.isFinite(expiresAt) ||
    reviewedAt > now.getTime() ||
    reviewedAt >= expiresAt ||
    expiresAt <= now.getTime()
  ) {
    return {
      ctaLabel: presentation.ctaLabel,
      displayCategory: presentation.displayCategory,
      pricingReviewedAt: presentation.pricingReviewedAt,
      pricingExpiresAt: presentation.pricingExpiresAt,
      pricingSource: presentation.pricingSource,
    };
  }
  return presentation;
}

export function resolveSolutionOfficialDestination(resource: SolutionResource): string | null {
  const href = resource.resourceType === "software" || resource.resourceType === "tool"
    ? getToolDirectoryItemBySlug(resource.resourceSlug)?.url
    : resource.resourceType === "provider"
    ? getDemaaSupplierBySlug(resource.resourceSlug)?.href
    : getDemaaProNetworkBySlug(resource.resourceSlug)?.href;

  return isSafeInteractionHref(href, "external_link") ? href ?? null : null;
}
