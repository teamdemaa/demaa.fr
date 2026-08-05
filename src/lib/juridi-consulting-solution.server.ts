import "server-only";

import type {
  SolutionPlacement,
  SolutionResource,
} from "@/lib/solution-registry-contract";

const JURIDI_CONSULTING_REVIEW = {
  evidence: [
    {
      evidenceId: "juridi-consulting-partners-offer-2026-08-05",
      sourceRef: "https://juridiconsulting.com/partenaires",
      claim:
        "La page officielle présente une offre de sous-traitance confidentielle, avec intervention en marque blanche, destinée aux avocats, experts-comptables et notaires.",
      evidenceType: "official_product_page" as const,
      capturedAt: "2026-08-05T00:00:00.000Z",
    },
  ],
  reviewer: "Master Demaa",
  reviewedAt: "2026-08-05T00:00:00.000Z",
  expiresAt: "2027-02-05T00:00:00.000Z",
} as const;

export const JURIDI_CONSULTING_SOLUTION_RESOURCE = {
  ...JURIDI_CONSULTING_REVIEW,
  resourceSlug: "juridi-consulting",
  resourceType: "provider",
  name: "JuridiConsulting",
  description:
    "Sous-traitance confidentielle des formalités d’entreprise, avec intervention en marque blanche si nécessaire.",
  interactionMode: "referral_form",
  referralKey: "juridi-consulting",
  commercialRelationship: "none",
  status: "published",
  resourceVersion: "juridi-consulting.v1",
  publicationBlockers: [],
} as const satisfies SolutionResource;

type JuridiPlacementInput = Readonly<{
  systemSlug: "cabinet-comptable" | "cabinet-davocat" | "notaire";
  usage: string;
  fitRationale: string;
  fitConstraints: readonly string[];
}>;

function juridiPlacement(input: JuridiPlacementInput): SolutionPlacement {
  const rank = 1;
  return {
    ...JURIDI_CONSULTING_REVIEW,
    placementId: `${input.systemSlug}:juridi-consulting:providers:${rank}`,
    systemSlug: input.systemSlug,
    resourceSlug: "juridi-consulting",
    rank,
    section: "providers",
    usage: input.usage,
    fitRationale: input.fitRationale,
    fitConstraints: input.fitConstraints,
    editorialStatus: "selected",
    commercialRelationship: "none",
    status: "published",
    placementVersion: "juridi-consulting.v1",
    publicationBlockers: [],
  };
}

export const JURIDI_CONSULTING_SOLUTION_PLACEMENTS: readonly SolutionPlacement[] = [
  juridiPlacement({
    systemSlug: "cabinet-comptable",
    usage:
      "Déléguer les créations, modifications, dépôts de comptes et cessations des clients du cabinet.",
    fitRationale:
      "L’offre vise explicitement les experts-comptables et peut intervenir confidentiellement ou en marque blanche.",
    fitConstraints: [
      "Valider le périmètre, les délais, la confidentialité et les modalités de marque blanche avant la première mission.",
    ],
  }),
  juridiPlacement({
    systemSlug: "cabinet-davocat",
    usage:
      "Confier l’exécution administrative et le dépôt des formalités d’entreprise suivies par le cabinet.",
    fitRationale:
      "L’offre vise les avocats et permet de déléguer les formalités tout en conservant le conseil juridique au cabinet.",
    fitConstraints: [
      "Limiter l’intervention aux formalités administratives et au secrétariat juridique prévus par le prestataire.",
    ],
  }),
  juridiPlacement({
    systemSlug: "notaire",
    usage:
      "Externaliser les formalités administratives d’entreprise compatibles avec l’organisation de l’étude.",
    fitRationale:
      "L’offre cite explicitement les notaires parmi les professionnels pouvant déléguer leurs formalités.",
    fitConstraints: [
      "Confirmer avec le prestataire le périmètre délégable et le cadre de confidentialité de l’étude.",
    ],
  }),
];
