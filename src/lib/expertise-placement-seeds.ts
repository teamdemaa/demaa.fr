import {
  parseExpertisePlacements,
  type ExpertisePlacement,
} from "@/lib/expertise-placement-contract";

export const RETIRED_UNIVERSAL_EXPERTISE_ID = "chartered-accountant" as const;

export function buildExpertisePlacementSeeds(): readonly ExpertisePlacement[] {
  return parseExpertisePlacements([
    {
      expertisePlacementId: "cabinet-comptable:legal-formalist",
      expertiseId: "legal-formalist",
      systemSlug: "cabinet-comptable",
      rank: 1,
      usage:
        "Déléguer les formalités et les travaux juridiques récurrents selon le périmètre défini par le cabinet.",
      fitRationale:
        "Cette prestation aide le cabinet à absorber la charge juridique sans la confondre avec son cœur de mission comptable.",
      fitConstraints: [
        "Définir précisément les actes couverts et la responsabilité de chaque intervenant.",
        "Vérifier la confidentialité, la sous-traitance et les règles applicables dans votre pays.",
      ],
      displayCategory: "Prestation juridique",
      nameOverride: "Délégation et formalités juridiques",
      descriptionOverride:
        "Un professionnel pour prendre en charge les formalités et certains travaux juridiques de votre cabinet.",
      visibility: "selected",
      placementVersion: "1.0.0",
    },
  ]);
}

export function assertNoRetiredUniversalExpertisePlacements(
  placements: readonly ExpertisePlacement[],
) {
  const retired = placements.filter(
    ({ expertiseId }) => expertiseId === RETIRED_UNIVERSAL_EXPERTISE_ID,
  );
  if (retired.length > 0) {
    throw new Error(
      `Le seed réseau ne doit jamais recréer les ${retired.length} placements universels ${RETIRED_UNIVERSAL_EXPERTISE_ID}.`,
    );
  }
}
