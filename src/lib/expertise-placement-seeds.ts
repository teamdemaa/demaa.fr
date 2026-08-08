import { enterpriseCatalog } from "@/lib/enterprise-annuaire";
import {
  parseExpertisePlacements,
  type ExpertisePlacement,
} from "@/lib/expertise-placement-contract";

const ACCOUNTANT_USAGE =
  "Confier votre comptabilité et vos obligations à un professionnel adapté à votre activité.";
const ACCOUNTANT_RATIONALE =
  "Le besoin dépend notamment de votre pays, de votre statut, de votre activité et de la taille de votre entreprise.";

export function buildExpertisePlacementSeeds(): readonly ExpertisePlacement[] {
  const accountantPlacements = enterpriseCatalog
    .filter(({ slug }) => slug !== "cabinet-comptable")
    .map(({ slug }) => ({
      expertisePlacementId: `${slug}:chartered-accountant`,
      expertiseId: "chartered-accountant",
      systemSlug: slug,
      rank: 1,
      usage: ACCOUNTANT_USAGE,
      fitRationale: ACCOUNTANT_RATIONALE,
      fitConstraints: [
        "Vérifier l’inscription professionnelle requise dans votre pays.",
        "Comparer le périmètre de mission, la disponibilité et le mode de facturation.",
      ],
      displayCategory: "Prestation réglementée",
      nameOverride: "Expert-comptable",
      descriptionOverride:
        "Un professionnel pour suivre votre comptabilité, vos obligations et vos décisions de gestion.",
      visibility: "selected" as const,
      placementVersion: "1.0.0",
    }));

  return parseExpertisePlacements([
    ...accountantPlacements,
    {
      expertisePlacementId: "cabinet-comptable:legal-services",
      expertiseId: "legal-services",
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
