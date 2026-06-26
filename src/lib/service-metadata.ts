import type { Metadata } from "next";
import type { DemaaService } from "@/lib/service-catalog";

export function getServicePageMetadata(service: DemaaService): Metadata {
  const isAssistantPacks = service.slug === "assistant-polyvalent";
  const isAssistantLanding = service.slug === "recrutement-assistant-polyvalent";
  const isOrganisationLanding = service.slug === "organisation-automatisation";
  const shouldNoIndex = isAssistantLanding || isOrganisationLanding;
  const metadataTitle = isAssistantPacks
    ? "Assistant polyvalent - Packs 20h, 30h ou 40h - Demaa"
    : isAssistantLanding
    ? "Recrutement assistant polyvalent - Demaa"
    : isOrganisationLanding
      ? "Audit d'organisation pour TPE - Demaa"
      : `${service.name} - Annuaire services Demaa`;
  const canonicalPath = isOrganisationLanding
    ? "/organisation"
    : `/annuaire-services/${service.slug}`;
  const metadataDescription = isAssistantPacks
    ? "Choisissez un pack de 20h, 30h ou 40h pour déléguer l'administratif utile, le suivi et les tâches de coordination à 30 € de l'heure HT."
    : isAssistantLanding
    ? "Un accompagnement au recrutement d'un assistant polyvalent pour reprendre l'administratif utile avec une intégration plus claire et plus sereine."
    : isOrganisationLanding
      ? "Faites un audit d'organisation pour identifier les blocages, clarifier les priorités et repérer les besoins les plus utiles pour la suite."
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
