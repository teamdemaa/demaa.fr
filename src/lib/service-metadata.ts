import type { Metadata } from "next";
import type { DemaaService } from "@/lib/service-catalog";

export function getServicePageMetadata(service: DemaaService): Metadata {
  const isAssistantLanding = service.slug === "assistant-polyvalent";
  const isOrganisationLanding = service.slug === "organisation-automatisation";
  const metadataTitle = isAssistantLanding
    ? "Déléguez à un assistant de confiance - Demaa"
    : isOrganisationLanding
      ? "Audit d'organisation pour TPE - Demaa"
      : `${service.name} - Annuaire services Demaa`;
  const canonicalPath = isOrganisationLanding
    ? "/organisation"
    : `/annuaire-services/${service.slug}`;
  const metadataDescription = isAssistantLanding
    ? "Demaa vous aide à déléguer l'administratif à une personne de confiance, formée et cadrée pour reprendre efficacement ce qui vous ralentit au quotidien."
    : isOrganisationLanding
      ? "Faites un audit d'organisation pour identifier les blocages, clarifier les priorités et repérer les besoins les plus utiles pour la suite."
      : service.description;

  return {
    title: metadataTitle,
    description: metadataDescription,
    alternates: {
      canonical: canonicalPath,
    },
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
