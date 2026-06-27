import type { Metadata } from "next";
import type { DemaaService } from "@/lib/service-catalog";

export function getServicePageMetadata(service: DemaaService): Metadata {
  const isAssistantPacks = service.slug === "assistante-facturation";
  const isAssistantLanding = service.slug === "recrutement-assistante-facturation";
  const isOrganisationLanding = service.slug === "organisation-automatisation";
  const shouldNoIndex = isAssistantLanding || isOrganisationLanding;
  const metadataTitle = isAssistantPacks
    ? "Assistance facturation - Packs 20h, 30h ou 40h - Demaa"
    : isAssistantLanding
    ? "Recrutement assistante facturation - Demaa"
    : isOrganisationLanding
      ? "Audit d'organisation pour TPE - Demaa"
      : `${service.name} - Annuaire services Demaa`;
  const canonicalPath = isOrganisationLanding
    ? "/organisation"
    : `/annuaire-services/${service.slug}`;
  const metadataDescription = isAssistantPacks
    ? "Choisissez un pack de 20h, 30h ou 40h pour reprendre devis, facturation, relances et transmission comptable à 30 € de l'heure HT."
    : isAssistantLanding
    ? "Un accompagnement au recrutement d'une assistante facturation pour reprendre devis, facturation, relances et transmission comptable avec une intégration plus claire et plus sereine."
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
