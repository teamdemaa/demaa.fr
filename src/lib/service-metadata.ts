import type { Metadata } from "next";
import type { DemaaService } from "@/lib/service-catalog";

export function getServicePageMetadata(service: DemaaService): Metadata {
  const isAssistantPacks = service.slug === "assistante-facturation";
  const isAssistantLanding = service.slug === "recrutement-assistante-facturation";
  const isOrganisationLanding = service.slug === "organisation-automatisation";
  const shouldNoIndex = isAssistantLanding || isOrganisationLanding;
  const metadataTitle = isAssistantPacks
    ? "Assistance facturation - Forfaits mensuels Standard et Confort - Demaa"
    : isAssistantLanding
    ? "Recrutement assistante facturation - Demaa"
    : isOrganisationLanding
      ? "Session d’organisation offerte | Demaa"
      : `${service.name} - Annuaire services Demaa`;
  const canonicalPath = isOrganisationLanding
    ? "/annuaire-services/organisation"
    : `/annuaire-services/${service.slug}`;
  const metadataDescription = isAssistantPacks
    ? "Choisissez un forfait mensuel Standard ou Confort pour reprendre les factures fournisseurs, les factures clients et la transmission comptable, avec relances et reporting dans le forfait Confort."
    : isAssistantLanding
    ? "Un accompagnement au recrutement d'une assistante facturation pour reprendre devis, facturation, relances et transmission comptable avec une intégration plus claire et plus sereine."
    : isOrganisationLanding
      ? service.description
      : service.description;

  return {
    title: metadataTitle,
    description: metadataDescription,
    alternates: {
      canonical: canonicalPath,
    },
    robots: shouldNoIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      title: metadataTitle,
      description: metadataDescription,
      url: canonicalPath,
      siteName: "Demaa",
      locale: "fr_FR",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: metadataTitle,
      description: metadataDescription,
    },
  };
}
