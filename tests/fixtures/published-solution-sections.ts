import type { PublishedSolutionPlacementDto } from "@/lib/solution-registry-dto";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";

const externalPlacement = {
  placementId: "cabinet-comptable:qonto:software:1",
  systemSlug: "cabinet-comptable",
  rank: 1,
  section: "software",
  usage: "Centraliser les paiements et les justificatifs.",
  fitRationale: "La solution couvre le besoin de suivi quotidien.",
  fitConstraints: ["Vérifier le périmètre fonctionnel avant abonnement."],
  placementVersion: "fixture.1",
  resource: {
    resourceSlug: "qonto",
    resourceType: "software",
    name: "Qonto",
    description: "Compte professionnel et gestion financière.",
    interaction: {
      interactionMode: "external_link",
      href: "https://qonto.com/fr",
    },
    commercialRelationship: "none",
    resourceVersion: "fixture.1",
  },
} as const satisfies PublishedSolutionPlacementDto;

const levierPlacement = {
  ...externalPlacement,
  placementId: "cabinet-comptable:levier:software:1",
  resource: {
    ...externalPlacement.resource,
    resourceSlug: "levier",
    resourceType: "tool",
    name: "Levier",
    description: "Tableau de pilotage opérationnel",
    interaction: {
      interactionMode: "system_delivery",
    },
    commercialRelationship: "owned",
    resourceVersion: "levier.v1",
  },
} as const satisfies PublishedSolutionPlacementDto;

const ownedPlacement = {
  ...externalPlacement,
  placementId: "cabinet-comptable:demaa-pilotage:software:2",
  rank: 2,
  resource: {
    ...externalPlacement.resource,
    resourceSlug: "demaa-pilotage",
    name: "Demaa Pilotage",
    commercialRelationship: "owned",
  },
} as const satisfies PublishedSolutionPlacementDto;

const detailPlacement = {
  ...externalPlacement,
  placementId: "cabinet-comptable:prestataire-facturation:providers:1",
  rank: 1,
  section: "providers",
  resource: {
    ...externalPlacement.resource,
    resourceSlug: "prestataire-facturation",
    resourceType: "provider",
    name: "Prestataire Facturation",
    interaction: {
      interactionMode: "detail",
      href: "/solutions/prestataire-facturation",
    },
    commercialRelationship: "commercial_partner",
  },
} as const satisfies PublishedSolutionPlacementDto;

const referralPlacement = {
  ...detailPlacement,
  placementId: "cabinet-comptable:partenaire-referral:providers:2",
  rank: 2,
  resource: {
    ...detailPlacement.resource,
    resourceSlug: "partenaire-referral",
    name: "Partenaire Referral",
    interaction: {
      interactionMode: "referral_form",
      referralKey: "partenaire-referral",
    },
    commercialRelationship: "paid_referral",
  },
} as const satisfies PublishedSolutionPlacementDto;

export const publishedSolutionSectionsFixture = [
  {
    section: "software",
    placements: [externalPlacement, ownedPlacement],
  },
  {
    section: "providers",
    placements: [detailPlacement],
  },
] satisfies readonly RenderableSolutionSectionDto[];

export const publishedLevierSolutionSectionsFixture = [
  {
    section: "software",
    placements: [levierPlacement],
  },
] satisfies readonly RenderableSolutionSectionDto[];

export const publishedSolutionSectionsWithReferralFixture = [
  {
    section: "software",
    placements: [externalPlacement, ownedPlacement],
  },
  {
    section: "providers",
    placements: [detailPlacement, referralPlacement],
  },
] as const;
