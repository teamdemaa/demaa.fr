export const TOOL_PROCESS_COMPARISON_STATUSES = [
  "covered",
  "configurable",
  "not_documented",
] as const;

export type ToolProcessComparisonStatus =
  (typeof TOOL_PROCESS_COMPARISON_STATUSES)[number];

export type ToolProcessComparisonEvidence = Readonly<{
  evidenceId: string;
  sourceRef: string;
  claim: string;
  capturedAt: string;
}>;

export type ToolFeatureComparisonReview = Readonly<{
  status: ToolProcessComparisonStatus;
  evidenceIds: readonly string[];
  note?: string;
}>;

export type ToolProcessComparisonReview = Readonly<{
  systemSlug: string;
  resourceSlug: string;
  positioning: string;
  reviewedAt: string;
  expiresAt: string;
  configurableNote?: string;
  evidence: readonly ToolProcessComparisonEvidence[];
  features: Readonly<Record<string, ToolFeatureComparisonReview>>;
}>;

/**
 * Revue réutilisable d'un outil, indépendante d'un métier. Les clés de
 * `capabilities` sont les identifiants atomiques du catalogue de
 * fonctionnalités (par exemple `orders` ou `payroll_declarations`).
 */
export type ToolCapabilityComparisonReview = Readonly<{
  resourceSlug: string;
  positioning: string;
  reviewedAt: string;
  expiresAt: string;
  configurableNote?: string;
  evidence: readonly ToolProcessComparisonEvidence[];
  capabilities: Readonly<Record<string, ToolFeatureComparisonReview>>;
}>;

export type ToolProcessComparisonCell = Readonly<{
  status: ToolProcessComparisonStatus;
  evidenceIds: readonly string[];
  note?: string;
}>;

export type ToolProcessComparisonView = Readonly<{
  systemSlug: string;
  systemName: string;
  reviewedAt: string;
  tools: readonly Readonly<{
    resourceSlug: string;
    name: string;
    positioning: string;
  }>[];
  features: readonly Readonly<{
    featureId: string;
    label: string;
    description?: string;
    cells: readonly ToolProcessComparisonCell[];
  }>[];
}>;
