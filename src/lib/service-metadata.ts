import type { Metadata } from "next";
import type { DemaaService } from "@/lib/service-catalog";

export function getServicePageMetadata(service: DemaaService): Metadata {
  const isAssistantLanding = service.slug === "assistant-polyvalent";
  const isOrganisationLanding = service.slug === "organisation-automatisation";
  const metadataTitle = isAssistantLanding
    ? `${service.name} - Demaa`
    : isOrganisationLanding
      ? "Organisation et automatisation pour TPE - Demaa"
      : `${service.name} - Annuaire services Demaa`;
  const canonicalPath = isOrganisationLanding
    ? "/organisation-automatisation"
    : `/annuaire-services/${service.slug}`;
  const metadataDescription = isOrganisationLanding
    ? "Organisez votre entreprise avec les bons systèmes, process et automatisations pour mieux piloter l'activité, déléguer plus sereinement et soutenir une croissance durable."
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
