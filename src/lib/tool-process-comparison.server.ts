import "server-only";

import type { EnterpriseDefinition } from "@/lib/enterprise-annuaire";
import {
  getToolCapabilityComparisonReview,
  isReviewedGenericToolComparisonSystem,
} from "@/lib/tool-capability-comparison-data";
import {
  TOOL_PROCESS_COMPARISON_FEATURES,
  TOOL_PROCESS_COMPARISON_REVIEWS,
} from "@/lib/tool-process-comparison-data";
import {
  getGenericToolComparisonFeatures,
  type GenericToolComparisonFeature,
} from "@/lib/tool-feature-comparison-catalog";
import type {
  ToolCapabilityComparisonReview,
  ToolProcessComparisonCell,
  ToolProcessComparisonReview,
  ToolProcessComparisonView,
} from "@/lib/tool-process-comparison-contract";
import {
  getToolDirectoryItemBySlug,
  type ToolDirectoryItem,
} from "@/lib/tool-directory";
import { getCuratedToolRecommendationsForSystem } from "@/lib/system-tool-recommendations";
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";

function buildManualReviewIndex(
  reviews: readonly ToolProcessComparisonReview[],
): ReadonlyMap<string, ToolProcessComparisonReview> {
  const index = new Map<string, ToolProcessComparisonReview>();
  for (const review of reviews) {
    const key = `${review.systemSlug}::${review.resourceSlug}`;
    if (index.has(key)) {
      throw new Error(`Revue outil dupliquée ${key}`);
    }
    index.set(key, review);
  }
  return index;
}

const reviewBySystemAndResource = buildManualReviewIndex(
  TOOL_PROCESS_COMPARISON_REVIEWS,
);

const MIN_DOCUMENTED_FEATURE_ROWS = 8;
const MIN_DISCRIMINATING_FEATURE_ROWS = 4;
const MIN_DOCUMENTED_CELLS_PER_TOOL = 3;
const MAX_DIRECTORY_REVIEW_AGE_DAYS = 180;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

type ComparisonFeatureDefinition = Readonly<{
  featureId: string;
  capabilityId?: string;
  label: string;
  description?: string;
  matchTerms?: readonly string[];
}>;

function getFeatureDefinitions(
  enterprise: EnterpriseDefinition,
): readonly ComparisonFeatureDefinition[] | null {
  return (
    (enterprise.slug === "cabinet-comptable"
      ? TOOL_PROCESS_COMPARISON_FEATURES[enterprise.slug]
      : undefined) ??
    getGenericToolComparisonFeatures(enterprise.slug)
  );
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesTerm(text: string, term: string): boolean {
  const normalizedTerm = normalizeSearchText(term);
  if (!normalizedTerm) return false;
  if (normalizedTerm.includes(" ")) {
    return ` ${text} `.includes(` ${normalizedTerm} `);
  }

  const stem = (value: string) =>
    value.length >= 6 ? value.replace(/(?:es|s|x)$/, "") : value;
  const expected = stem(normalizedTerm);
  return text.split(" ").some((word) => stem(word) === expected);
}

function buildToolSearchTexts(tool: ToolDirectoryItem): {
  strong: string;
  contextual: string;
} {
  const strong = normalizeSearchText(
    [...tool.tags, ...(tool.keyFeatures ?? [])].join(" "),
  );
  const contextual = normalizeSearchText(
    [
      strong,
      tool.category,
      tool.description,
      tool.bestFor,
      ...(tool.idealFor ?? []),
    ].join(" "),
  );

  return { strong, contextual };
}

function resolveGenericFeatureCell(
  tool: ToolDirectoryItem,
  feature: GenericToolComparisonFeature,
): ToolProcessComparisonCell {
  const texts = buildToolSearchTexts(tool);
  if (feature.matchTerms.some((term) => includesTerm(texts.strong, term))) {
    return { status: "covered", evidenceIds: [] };
  }
  // Contextual prose is intentionally held to a higher bar than structured
  // tags/features. A broad single word ("planning", "terrain", "analyse"…)
  // is not enough to publish a partial capability.
  if (
    feature.matchTerms.some(
      (term) =>
        normalizeSearchText(term).includes(" ") &&
        includesTerm(texts.contextual, term),
    )
  ) {
    return {
      status: "configurable",
      evidenceIds: [],
      note: "Capacité mentionnée dans la documentation générale de l’outil, à confirmer selon l’offre.",
    };
  }
  return { status: "not_documented", evidenceIds: [] };
}

function resolveReviewedCapabilityCell(
  review: ToolCapabilityComparisonReview,
  capabilityId: string,
): ToolProcessComparisonCell {
  const capability = review.capabilities[capabilityId];
  if (!capability) return { status: "not_documented", evidenceIds: [] };

  return {
    status: capability.status,
    evidenceIds: capability.evidenceIds,
    note:
      capability.status === "configurable"
        ? capability.note ?? review.configurableNote
        : undefined,
  };
}

function parseDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const timestamp = Date.parse(`${value}T23:59:59.999Z`);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function hasReviewableDirectoryEvidence(
  tool: ToolDirectoryItem,
  now = new Date(),
): boolean {
  const nowTimestamp =
    parseDay(now.toISOString().slice(0, 10)) ?? now.getTime();
  const reviewedAt = tool.lastReviewedAt
    ? parseDay(tool.lastReviewedAt)
    : null;
  return Boolean(
    tool.sources?.length &&
      tool.sources.every((source) => source.startsWith("https://")) &&
      reviewedAt !== null &&
      reviewedAt <= nowTimestamp &&
      nowTimestamp - reviewedAt <= MAX_DIRECTORY_REVIEW_AGE_DAYS * DAY_IN_MS,
  );
}

function resolveComparisonSections(input: {
  enterprise: EnterpriseDefinition;
  sections: readonly RenderableSolutionSectionDto[];
}): readonly RenderableSolutionSectionDto[] {
  const software = input.sections.find((section) => section.section === "software");
  if (!software || software.placements.length >= 2) return input.sections;

  const existingSlugs = new Set(
    software.placements.map((placement) => placement.resource.resourceSlug),
  );
  const toolReferenceBySlug = new Map(
    (input.enterprise.toolRefs ?? []).map((reference) => [reference.slug, reference]),
  );
  const candidateSlugs = [
    ...(getCuratedToolRecommendationsForSystem(input.enterprise.slug) ?? []),
    ...(input.enterprise.toolRefs ?? []).map((reference) => reference.slug),
  ];
  const supplement = [...new Set(candidateSlugs)]
    .filter((slug) => !existingSlugs.has(slug))
    .map((slug) => ({ slug, tool: getToolDirectoryItemBySlug(slug) }))
    .find((candidate): candidate is { slug: string; tool: ToolDirectoryItem } =>
      Boolean(
        candidate.tool && hasReviewableDirectoryEvidence(candidate.tool),
      ),
    );
  if (!supplement) return input.sections;

  const reference = toolReferenceBySlug.get(supplement.slug);
  const tool = supplement.tool;
  const placement = {
    placementId: `${input.enterprise.slug}:${supplement.slug}:comparison`,
    systemSlug: input.enterprise.slug,
    rank: Math.max(...software.placements.map(({ rank }) => rank), 0) + 1,
    section: "software" as const,
    usage: reference?.usage ?? tool.bestFor,
    fitRationale: tool.description,
    fitConstraints: [] as const,
    resource: {
      resourceSlug: supplement.slug,
      resourceType: "software" as const,
      name: tool.name,
      description: tool.description,
      displayCategory: tool.category,
      interaction: {
        interactionMode: "external_link" as const,
        href: tool.url,
      },
    },
  };

  return input.sections.map((section) =>
    section.section === "software"
      ? { ...section, placements: [...section.placements, placement] }
      : section,
  );
}

function resolveFeatureCell(
  review: ToolProcessComparisonReview,
  featureId: string,
): ToolProcessComparisonCell {
  const feature = review.features[featureId];

  return {
    status: feature.status,
    evidenceIds: feature.evidenceIds,
    note:
      feature.status === "configurable"
        ? feature.note ?? review.configurableNote
        : undefined,
  };
}

export function auditToolComparisonViewQuality(
  comparison: ToolProcessComparisonView,
): string[] {
  const issues: string[] = [];
  const documentedRows = comparison.features.filter((feature) =>
    feature.cells.some((cell) => cell.status !== "not_documented"),
  ).length;
  const discriminatingRows = comparison.features.filter(
    (feature) => new Set(feature.cells.map((cell) => cell.status)).size > 1,
  ).length;
  if (documentedRows < MIN_DOCUMENTED_FEATURE_ROWS) {
    issues.push(
      `${comparison.systemSlug}: seulement ${documentedRows} fonctionnalités documentées sur ${comparison.features.length}`,
    );
  }
  if (discriminatingRows < MIN_DISCRIMINATING_FEATURE_ROWS) {
    issues.push(
      `${comparison.systemSlug}: seulement ${discriminatingRows} lignes discriminantes`,
    );
  }
  comparison.tools.forEach((tool, toolIndex) => {
    const documentedForTool = comparison.features.filter(
      (feature) => feature.cells[toolIndex]?.status !== "not_documented",
    ).length;
    if (documentedForTool < MIN_DOCUMENTED_CELLS_PER_TOOL) {
      issues.push(
        `${comparison.systemSlug}/${tool.resourceSlug}: seulement ${documentedForTool} fonctionnalités documentées`,
      );
    }
  });

  return issues;
}

function publishComparisonView(
  comparison: ToolProcessComparisonView,
  enforceQuality: boolean,
): ToolProcessComparisonView | null {
  if (enforceQuality && auditToolComparisonViewQuality(comparison).length) {
    return null;
  }
  return comparison;
}

export function auditToolProcessComparisonReview(input: {
  enterprise: EnterpriseDefinition;
  sections: readonly RenderableSolutionSectionDto[];
  now?: Date;
}): string[] {
  const { enterprise } = input;
  const sections = resolveComparisonSections(input);
  const features = getFeatureDefinitions(enterprise);
  const software = sections.find((section) => section.section === "software");
  const issues: string[] = [];

  if (!features?.length) return [`${enterprise.slug}: aucune fonctionnalité publiée`];
  if (!software || software.placements.length < 2) {
    return [`${enterprise.slug}: moins de deux outils actifs`];
  }

  const expectedFeatureIds = new Set(
    features.map((feature) => feature.featureId),
  );
  const now = input.now ?? new Date();
  const nowTimestamp =
    parseDay(now.toISOString().slice(0, 10)) ?? now.getTime();

  const hasManualReviews = enterprise.slug === "cabinet-comptable";
  const hasCapabilityReviews = isReviewedGenericToolComparisonSystem(
    enterprise.slug,
  );

  for (const placement of software.placements) {
    const resourceSlug = placement.resource.resourceSlug;
    const prefix = `${enterprise.slug}/${resourceSlug}`;
    if (!hasManualReviews) {
      const tool = getToolDirectoryItemBySlug(resourceSlug);
      if (!tool) {
        issues.push(`${prefix}: fiche outil absente`);
        continue;
      }
      if (!tool.sources?.length || tool.sources.some((source) => !source.startsWith("https://"))) {
        issues.push(`${prefix}: source HTTPS absente ou invalide`);
      }
      const reviewedAt = tool.lastReviewedAt
        ? parseDay(tool.lastReviewedAt)
        : null;
      if (reviewedAt === null) {
        issues.push(`${prefix}: date de revue absente ou invalide`);
      } else if (reviewedAt > nowTimestamp) {
        issues.push(`${prefix}: date de revue future ${tool.lastReviewedAt}`);
      } else if (
        nowTimestamp - reviewedAt > MAX_DIRECTORY_REVIEW_AGE_DAYS * DAY_IN_MS
      ) {
        issues.push(`${prefix}: revue trop ancienne ${tool.lastReviewedAt}`);
      }
      if (!hasCapabilityReviews) continue;

      const review = getToolCapabilityComparisonReview(resourceSlug);
      if (!review) {
        issues.push(`${prefix}: revue atomique absente`);
        continue;
      }

      const capabilityReviewedAt = parseDay(review.reviewedAt);
      const expiresAt = parseDay(review.expiresAt);
      if (
        capabilityReviewedAt === null ||
        expiresAt === null ||
        capabilityReviewedAt > expiresAt
      ) {
        issues.push(`${prefix}: dates de revue atomique invalides`);
      } else if (nowTimestamp > expiresAt) {
        issues.push(`${prefix}: revue atomique expirée depuis ${review.expiresAt}`);
      }

      const evidenceById = new Map(
        review.evidence.map((evidence) => [evidence.evidenceId, evidence]),
      );
      for (const evidence of review.evidence) {
        if (!evidence.sourceRef.startsWith("https://")) {
          issues.push(`${prefix}: source atomique non HTTPS ${evidence.evidenceId}`);
        }
        if (!evidence.claim.trim() || parseDay(evidence.capturedAt) === null) {
          issues.push(`${prefix}: preuve atomique incomplète ${evidence.evidenceId}`);
        }
      }

      for (const [capabilityId, capability] of Object.entries(
        review.capabilities,
      )) {
        if (!capability.evidenceIds.length) {
          issues.push(`${prefix}: preuve absente pour ${capabilityId}`);
        }
        if (
          capability.status === "configurable" &&
          !(capability.note ?? review.configurableNote)?.trim()
        ) {
          issues.push(`${prefix}: précision manquante pour ${capabilityId}`);
        }
        for (const evidenceId of capability.evidenceIds) {
          if (!evidenceById.has(evidenceId)) {
            issues.push(`${prefix}: preuve inconnue ${evidenceId}`);
          }
        }
      }
      continue;
    }

    const review = reviewBySystemAndResource.get(
      `${enterprise.slug}::${resourceSlug}`,
    );

    if (!review) {
      issues.push(`${prefix}: revue absente`);
      continue;
    }

    const reviewedAt = parseDay(review.reviewedAt);
    const expiresAt = parseDay(review.expiresAt);
    if (reviewedAt === null || expiresAt === null || reviewedAt > expiresAt) {
      issues.push(`${prefix}: dates de revue invalides`);
    } else if (nowTimestamp > expiresAt) {
      issues.push(`${prefix}: revue expirée depuis ${review.expiresAt}`);
    }

    const evidenceById = new Map(
      review.evidence.map((evidence) => [evidence.evidenceId, evidence]),
    );
    for (const evidence of review.evidence) {
      if (!evidence.sourceRef.startsWith("https://")) {
        issues.push(`${prefix}: source non HTTPS ${evidence.evidenceId}`);
      }
      if (!evidence.claim.trim() || parseDay(evidence.capturedAt) === null) {
        issues.push(`${prefix}: preuve incomplète ${evidence.evidenceId}`);
      }
    }

    for (const featureId of Object.keys(review.features)) {
      if (!expectedFeatureIds.has(featureId)) {
        issues.push(`${prefix}: fonctionnalité obsolète ${featureId}`);
      }
    }

    for (const feature of features) {
      const featureReview = review.features[feature.featureId];
      if (!featureReview) {
        issues.push(`${prefix}: fonctionnalité absente ${feature.featureId}`);
        continue;
      }

      if (
        featureReview.status === "configurable" &&
        !(featureReview.note ?? review.configurableNote)?.trim()
      ) {
        issues.push(`${prefix}: précision manquante pour ${feature.featureId}`);
      }

      if (featureReview.status !== "not_documented") {
        if (!featureReview.evidenceIds.length) {
          issues.push(`${prefix}: preuve absente pour ${feature.featureId}`);
        }
        for (const evidenceId of featureReview.evidenceIds) {
          if (!evidenceById.has(evidenceId)) {
            issues.push(`${prefix}: preuve inconnue ${evidenceId}`);
          }
        }
      }
    }
  }

  return issues;
}

export function buildToolProcessComparisonView(input: {
  enterprise: EnterpriseDefinition;
  systemName: string;
  sections: readonly RenderableSolutionSectionDto[];
  now?: Date;
  enforceQuality?: boolean;
}): ToolProcessComparisonView | null {
  const sections = resolveComparisonSections(input);
  if (auditToolProcessComparisonReview({ ...input, sections }).length) return null;

  const featureDefinitions = getFeatureDefinitions(input.enterprise);
  const software = sections.find((section) => section.section === "software");
  if (!featureDefinitions || !software) return null;

  const manualFeatures =
    input.enterprise.slug === "cabinet-comptable"
      ? TOOL_PROCESS_COMPARISON_FEATURES[input.enterprise.slug]
      : undefined;
  const enforceQuality = input.enforceQuality ?? true;

  if (!manualFeatures) {
    const hasCapabilityReviews = isReviewedGenericToolComparisonSystem(
      input.enterprise.slug,
    );
    if (enforceQuality && !hasCapabilityReviews) return null;

    const tools = software.placements.map((placement) => ({
      placement,
      directoryItem: getToolDirectoryItemBySlug(
        placement.resource.resourceSlug,
      )!,
      capabilityReview: getToolCapabilityComparisonReview(
        placement.resource.resourceSlug,
      ),
    }));
    const reviewedAt = tools
      .map(({ directoryItem, capabilityReview }) =>
        hasCapabilityReviews
          ? capabilityReview!.reviewedAt
          : directoryItem.lastReviewedAt!,
      )
      .toSorted()[0];

    return publishComparisonView({
      systemSlug: input.enterprise.slug,
      systemName: input.systemName,
      reviewedAt,
      tools: tools.map(({ placement, directoryItem, capabilityReview }) => ({
        resourceSlug: placement.resource.resourceSlug,
        name: placement.resource.name,
        positioning: hasCapabilityReviews
          ? capabilityReview!.positioning
          : directoryItem.category,
      })),
      features: featureDefinitions.map((feature) => ({
        featureId: feature.featureId,
        label: feature.label,
        description: feature.description,
        cells: tools.map(({ directoryItem, capabilityReview }) =>
          hasCapabilityReviews
            ? resolveReviewedCapabilityCell(
                capabilityReview!,
                (feature as GenericToolComparisonFeature).capabilityId,
              )
            : resolveGenericFeatureCell(
                directoryItem,
                feature as GenericToolComparisonFeature,
              ),
        ),
      })),
    }, enforceQuality);
  }

  const reviews = software.placements.map((placement) =>
    reviewBySystemAndResource.get(
      `${input.enterprise.slug}::${placement.resource.resourceSlug}`,
    )!,
  );

  return publishComparisonView({
    systemSlug: input.enterprise.slug,
    systemName: input.systemName,
    reviewedAt: reviews
      .map((review) => review.reviewedAt)
      .toSorted()[0],
    tools: software.placements.map((placement) => ({
      resourceSlug: placement.resource.resourceSlug,
      name: placement.resource.name,
      positioning: reviewBySystemAndResource.get(
        `${input.enterprise.slug}::${placement.resource.resourceSlug}`,
      )!.positioning,
    })),
    features: featureDefinitions.map((feature) => ({
      ...feature,
      cells: reviews.map((review) =>
        resolveFeatureCell(review, feature.featureId),
      ),
    })),
  }, enforceQuality);
}
