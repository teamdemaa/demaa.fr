export type SolutionResourceType = "software" | "provider" | "directory";
export type SolutionSection = "software" | "providers";
export type SolutionInteractionDto =
  | Readonly<{ interactionMode: "external_link"; href: string }>
  | Readonly<{ interactionMode: "detail"; href: string }>
  | Readonly<{ interactionMode: "referral_form"; referralKey: string }>;

export type PublishedSolutionResourceDto = Readonly<{
  resourceSlug: string;
  resourceType: SolutionResourceType;
  name: string;
  description: string;
  interaction: SolutionInteractionDto;
  commercialRelationship: "none" | "owned" | "affiliate" | "commercial_partner" | "paid_referral";
  resourceVersion: string;
}>;

export type PublishedSolutionPlacementDto = Readonly<{
  placementId: string;
  systemSlug: string;
  rank: number;
  section: SolutionSection;
  usage: string;
  fitRationale: string;
  fitConstraints: readonly string[];
  placementVersion: string;
  resource: PublishedSolutionResourceDto;
}>;
