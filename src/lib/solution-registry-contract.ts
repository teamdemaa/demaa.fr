import "server-only";

import {
  COMMERCIAL_RELATIONSHIPS,
  parseReviewMetadataFields,
  REGISTRY_PUBLICATION_STATUSES,
  REVIEW_FIELD_NAMES,
  validateReviewMetadata,
  type CommercialRelationship,
  type RegistryPublicationStatus,
  type ReviewMetadata,
} from "@/lib/recommendation-source-contract";
import {
  deepFreeze,
  parseArray,
  parseEnum,
  parsePositiveInteger,
  parseRecord,
  parseSlug,
  parseString,
  parseStringArray,
  parseVersion,
  validationError,
} from "@/lib/registry-contract-utils";
import type {
  PublishedSolutionPlacementDto,
  PublishedSolutionResourceDto,
  SolutionInteractionDto,
} from "@/lib/solution-registry-dto";

export const SOLUTION_RESOURCE_TYPES = ["tool", "software", "provider", "directory", "expertise"] as const;
export const SOLUTION_INTERACTION_MODES = [
  "external_link",
  "detail",
  "system_delivery",
  "referral_form",
] as const;
export const SOLUTION_SECTIONS = [
  "software",
  "services",
  "providers",
  "models",
  "networks",
] as const;
export const SOLUTION_EDITORIAL_STATUSES = ["selected", "hidden"] as const;

export type SolutionResourceType = (typeof SOLUTION_RESOURCE_TYPES)[number];
export type SolutionSection = (typeof SOLUTION_SECTIONS)[number];
export type SolutionEditorialStatus = (typeof SOLUTION_EDITORIAL_STATUSES)[number];
export type SolutionInteraction =
  | Readonly<{ interactionMode: "external_link"; href: string }>
  | Readonly<{ interactionMode: "detail"; href: string }>
  | Readonly<{ interactionMode: "system_delivery" }>
  | Readonly<{ interactionMode: "referral_form"; referralKey: string }>;

type BaseSolutionResource = ReviewMetadata & SolutionInteraction & Readonly<{
  resourceSlug: string;
  name: string;
  description: string;
  commercialRelationship: CommercialRelationship;
  status: RegistryPublicationStatus;
  resourceVersion: string;
  publicationBlockers: readonly string[];
}>;

export type SolutionResource =
  | (BaseSolutionResource & Readonly<{ resourceType: "tool" }>)
  | (BaseSolutionResource & Readonly<{ resourceType: "software" }>)
  | (BaseSolutionResource & Readonly<{ resourceType: "provider" }>)
  | (BaseSolutionResource & Readonly<{ resourceType: "directory" }>)
  | (BaseSolutionResource & Readonly<{ resourceType: "expertise" }>);

export type SolutionPlacement = ReviewMetadata & Readonly<{
  placementId: string;
  systemSlug: string;
  resourceSlug: string;
  rank: number;
  section: SolutionSection;
  usage: string;
  fitRationale: string;
  fitConstraints: readonly string[];
  editorialStatus: SolutionEditorialStatus;
  commercialRelationship: CommercialRelationship;
  status: RegistryPublicationStatus;
  placementVersion: string;
  publicationBlockers: readonly string[];
}>;

const RESOURCE_BASE_KEYS = [
  ...REVIEW_FIELD_NAMES, "resourceSlug", "resourceType", "name", "description",
  "interactionMode", "commercialRelationship", "status", "resourceVersion", "publicationBlockers",
] as const;
const PLACEMENT_KEYS = [
  ...REVIEW_FIELD_NAMES, "placementId", "systemSlug", "resourceSlug", "rank", "section",
  "usage", "fitRationale", "fitConstraints", "editorialStatus", "commercialRelationship", "status",
  "placementVersion", "publicationBlockers",
] as const;

function reviewInput(input: ReviewMetadata): ReviewMetadata {
  return {
    evidence: input.evidence,
    reviewer: input.reviewer,
    reviewedAt: input.reviewedAt,
    expiresAt: input.expiresAt,
  };
}

export function isSafeInteractionHref(href: unknown, mode: unknown): boolean {
  if (typeof href !== "string" || (mode !== "external_link" && mode !== "detail")) return false;
  if (/[\x00-\x20\x7f]/.test(href) || href.includes("\\")) return false;
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  if (mode === "detail") return isInternal;
  if (isInternal) return true;
  try {
    const url = new URL(href);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function parseSolutionResource(input: unknown, path = "solutionResource"): SolutionResource {
  const initial = parseRecord(input, path, [...RESOURCE_BASE_KEYS, "href", "referralKey"]);
  const interactionMode = parseEnum(initial.interactionMode, SOLUTION_INTERACTION_MODES, `${path}.interactionMode`);
  const interaction: SolutionInteraction = interactionMode === "system_delivery"
    ? (() => {
        parseRecord(input, path, RESOURCE_BASE_KEYS);
        return deepFreeze({ interactionMode });
      })()
    : interactionMode === "referral_form"
    ? (() => {
        parseRecord(input, path, [...RESOURCE_BASE_KEYS, "referralKey"]);
        return deepFreeze({
          interactionMode,
          referralKey: parseSlug(initial.referralKey, `${path}.referralKey`),
        });
      })()
    : (() => {
        parseRecord(input, path, [...RESOURCE_BASE_KEYS, "href"]);
        return deepFreeze({
          interactionMode,
          href: parseString(initial.href, `${path}.href`),
        });
      })();
  const resourceType = parseEnum(initial.resourceType, SOLUTION_RESOURCE_TYPES, `${path}.resourceType`);
  return deepFreeze({
    ...parseReviewMetadataFields(initial, path),
    ...interaction,
    resourceSlug: parseSlug(initial.resourceSlug, `${path}.resourceSlug`),
    resourceType,
    name: parseString(initial.name, `${path}.name`),
    description: parseString(initial.description, `${path}.description`),
    commercialRelationship: parseEnum(
      initial.commercialRelationship,
      COMMERCIAL_RELATIONSHIPS,
      `${path}.commercialRelationship`,
    ),
    status: parseEnum(initial.status, REGISTRY_PUBLICATION_STATUSES, `${path}.status`),
    resourceVersion: parseVersion(initial.resourceVersion, `${path}.resourceVersion`),
    publicationBlockers: parseStringArray(initial.publicationBlockers, `${path}.publicationBlockers`),
  });
}

export function parseSolutionPlacement(input: unknown, path = "solutionPlacement"): SolutionPlacement {
  const record = parseRecord(input, path, PLACEMENT_KEYS);
  return deepFreeze({
    ...parseReviewMetadataFields(record, path),
    placementId: parseString(record.placementId, `${path}.placementId`),
    systemSlug: parseSlug(record.systemSlug, `${path}.systemSlug`),
    resourceSlug: parseSlug(record.resourceSlug, `${path}.resourceSlug`),
    rank: parsePositiveInteger(record.rank, `${path}.rank`),
    section: parseEnum(record.section, SOLUTION_SECTIONS, `${path}.section`),
    usage: parseString(record.usage, `${path}.usage`),
    fitRationale: parseString(record.fitRationale, `${path}.fitRationale`),
    fitConstraints: parseStringArray(record.fitConstraints, `${path}.fitConstraints`),
    editorialStatus: parseEnum(
      record.editorialStatus,
      SOLUTION_EDITORIAL_STATUSES,
      `${path}.editorialStatus`,
    ),
    commercialRelationship: parseEnum(
      record.commercialRelationship,
      COMMERCIAL_RELATIONSHIPS,
      `${path}.commercialRelationship`,
    ),
    status: parseEnum(record.status, REGISTRY_PUBLICATION_STATUSES, `${path}.status`),
    placementVersion: parseVersion(record.placementVersion, `${path}.placementVersion`),
    publicationBlockers: parseStringArray(record.publicationBlockers, `${path}.publicationBlockers`),
  });
}

export function validateSolutionResource(input: unknown, now = new Date()): string[] {
  let resource: SolutionResource;
  try {
    resource = parseSolutionResource(input);
  } catch (error) {
    return [validationError(error)];
  }
  const errors = validateReviewMetadata(reviewInput(resource), {
    requireComplete: resource.status === "published",
    now,
  });
  if (
    resource.interactionMode !== "referral_form" &&
    resource.interactionMode !== "system_delivery" &&
    !isSafeInteractionHref(resource.href, resource.interactionMode)
  ) {
    errors.push(`${resource.interactionMode} requires a safe path or HTTPS URL`);
  }
  if (resource.status === "published") {
    if (resource.commercialRelationship === "unknown") errors.push("published solution requires a known commercial relationship");
    if (resource.publicationBlockers.length > 0) errors.push("published solution cannot have blockers");
  } else if (resource.status === "draft" && resource.publicationBlockers.length === 0) {
    errors.push("draft solution must expose publication blockers");
  }
  return errors;
}

export function validateSolutionPlacement(input: unknown, now = new Date()): string[] {
  let placement: SolutionPlacement;
  try {
    placement = parseSolutionPlacement(input);
  } catch (error) {
    return [validationError(error)];
  }
  const errors = validateReviewMetadata(reviewInput(placement), {
    requireComplete: placement.status === "published",
    now,
  });
  const expectedId = `${placement.systemSlug}:${placement.resourceSlug}:${placement.section}:${placement.rank}`;
  if (placement.placementId !== expectedId) errors.push("solution placement ID must match its semantic fields");
  if (placement.status === "published") {
    if (placement.commercialRelationship === "unknown") errors.push("published placement requires a known commercial relationship");
    if (placement.publicationBlockers.length > 0) errors.push("published placement cannot have blockers");
  } else if (placement.status === "draft" && placement.publicationBlockers.length === 0) {
    errors.push("draft placement must expose publication blockers");
  }
  return errors;
}

function toPublishedResourceDto(resource: SolutionResource): PublishedSolutionResourceDto | null {
  if (resource.status !== "published" || resource.commercialRelationship === "unknown") return null;
  const interaction: SolutionInteractionDto = resource.interactionMode === "system_delivery"
    ? { interactionMode: resource.interactionMode }
    : resource.interactionMode === "referral_form"
    ? { interactionMode: resource.interactionMode, referralKey: resource.referralKey }
    : { interactionMode: resource.interactionMode, href: resource.href };
  return deepFreeze({
    resourceSlug: resource.resourceSlug,
    resourceType: resource.resourceType,
    name: resource.name,
    description: resource.description,
    interaction,
    commercialRelationship: resource.commercialRelationship,
    resourceVersion: resource.resourceVersion,
  });
}

function parseKnownSystemSlugs(input: unknown, path: string): readonly string[] {
  const slugs = parseArray(input, path).map((entry, index) => parseSlug(entry, `${path}[${index}]`));
  if (new Set(slugs).size !== slugs.length) throw new TypeError(`${path} must not contain duplicates`);
  return deepFreeze(slugs);
}

function parseResourceSelectionEnvelope(input: unknown) {
  const record = parseRecord(input, "solutionResourceSelection", ["resources"]);
  return deepFreeze({
    resources: parseArray(record.resources, "solutionResourceSelection.resources"),
  });
}

function parseRegistryEnvelope(input: unknown) {
  const record = parseRecord(input, "solutionRegistries", ["knownSystemSlugs", "resources", "placements"]);
  return deepFreeze({
    knownSystemSlugs: parseKnownSystemSlugs(record.knownSystemSlugs, "solutionRegistries.knownSystemSlugs"),
    resources: parseArray(record.resources, "solutionRegistries.resources"),
    placements: parseArray(record.placements, "solutionRegistries.placements"),
  });
}

function parsePlacementSelectionEnvelope(input: unknown) {
  const record = parseRecord(input, "solutionPlacementSelection", [
    "systemSlug",
    "knownSystemSlugs",
    "resources",
    "placements",
  ]);
  return deepFreeze({
    systemSlug: parseSlug(record.systemSlug, "solutionPlacementSelection.systemSlug"),
    knownSystemSlugs: parseKnownSystemSlugs(
      record.knownSystemSlugs,
      "solutionPlacementSelection.knownSystemSlugs",
    ),
    resources: parseArray(record.resources, "solutionPlacementSelection.resources"),
    placements: parseArray(record.placements, "solutionPlacementSelection.placements"),
  });
}

function selectPublishedResourcesFromEntries(
  inputs: readonly unknown[],
  now: Date,
): readonly PublishedSolutionResourceDto[] {
  const selected = inputs.flatMap((input) => {
    if (validateSolutionResource(input, now).length > 0) return [];
    const resource = parseSolutionResource(input);
    const dto = toPublishedResourceDto(resource);
    return dto ? [dto] : [];
  });
  if (new Set(selected.map((resource) => resource.resourceSlug)).size !== selected.length) return deepFreeze([]);
  return deepFreeze(selected);
}

export function selectPublishedSolutionResources(
  input: unknown,
  now = new Date(),
): readonly PublishedSolutionResourceDto[] {
  try {
    const envelope = parseResourceSelectionEnvelope(input);
    return selectPublishedResourcesFromEntries(envelope.resources, now);
  } catch {
    return deepFreeze([]);
  }
}

export function selectPublishedSolutionPlacements(
  input: unknown,
  now = new Date(),
): readonly PublishedSolutionPlacementDto[] {
  let envelope: ReturnType<typeof parsePlacementSelectionEnvelope>;
  try {
    envelope = parsePlacementSelectionEnvelope(input);
  } catch {
    return deepFreeze([]);
  }
  if (!envelope.knownSystemSlugs.includes(envelope.systemSlug)) return deepFreeze([]);
  const resources = selectPublishedResourcesFromEntries(envelope.resources, now);
  const resourcesBySlug = new Map(resources.map((resource) => [resource.resourceSlug, resource]));
  const selected = envelope.placements.flatMap((entry) => {
    if (validateSolutionPlacement(entry, now).length > 0) return [];
    const placement = parseSolutionPlacement(entry);
    if (
      placement.systemSlug !== envelope.systemSlug ||
      placement.status !== "published" ||
      placement.editorialStatus !== "selected"
    ) return [];
    const resource = resourcesBySlug.get(placement.resourceSlug);
    if (!resource || resource.commercialRelationship !== placement.commercialRelationship) return [];
    if (
      placement.section === "software" &&
      resource.resourceType !== "software" &&
      resource.resourceType !== "tool"
    ) return [];
    if (
      placement.section === "providers" &&
      resource.resourceType !== "provider" &&
      resource.resourceType !== "expertise"
    ) return [];
    if (
      placement.section === "models" &&
      resource.resourceType !== "tool"
    ) return [];
    if (
      placement.section === "networks" &&
      resource.resourceType !== "directory"
    ) return [];
    return [deepFreeze({
      placementId: placement.placementId,
      systemSlug: placement.systemSlug,
      rank: placement.rank,
      section: placement.section,
      usage: placement.usage,
      fitRationale: placement.fitRationale,
      fitConstraints: [...placement.fitConstraints],
      placementVersion: placement.placementVersion,
      resource,
    })];
  });
  const rankKeys = selected.map((placement) => `${placement.section}:${placement.rank}`);
  const resourceSlugs = selected.map((placement) => placement.resource.resourceSlug);
  if (new Set(rankKeys).size !== rankKeys.length || new Set(resourceSlugs).size !== resourceSlugs.length) return deepFreeze([]);
  return deepFreeze(selected.sort((left, right) => left.rank - right.rank));
}

export function validateSolutionRegistries(input: unknown, now = new Date()): string[] {
  let envelope: ReturnType<typeof parseRegistryEnvelope>;
  try {
    envelope = parseRegistryEnvelope(input);
  } catch (error) {
    return [validationError(error)];
  }
  const errors: string[] = [];
  const parsedResources = envelope.resources.flatMap((entry, index) => {
    errors.push(...validateSolutionResource(entry, now).map((error) => `resources[${index}]: ${error}`));
    try {
      return [parseSolutionResource(entry, `resources[${index}]`)];
    } catch {
      return [];
    }
  });
  const resourceSlugs = parsedResources.map((resource) => resource.resourceSlug);
  if (new Set(resourceSlugs).size !== resourceSlugs.length) errors.push("solution resource slugs must be unique");
  const parsedPlacements = envelope.placements.flatMap((entry, index) => {
    errors.push(...validateSolutionPlacement(entry, now).map((error) => `placements[${index}]: ${error}`));
    try {
      return [parseSolutionPlacement(entry, `placements[${index}]`)];
    } catch {
      return [];
    }
  });
  const placementIds = parsedPlacements.map((placement) => placement.placementId);
  if (new Set(placementIds).size !== placementIds.length) errors.push("solution placement IDs must be unique");
  const ranks = new Set<string>();
  const placedResources = new Set<string>();
  for (const placement of parsedPlacements) {
    if (!envelope.knownSystemSlugs.includes(placement.systemSlug)) errors.push(`${placement.placementId}: unknown systemSlug`);
    const resource = parsedResources.find((candidate) => candidate.resourceSlug === placement.resourceSlug);
    if (!resource) errors.push(`${placement.placementId}: unknown resourceSlug`);
    if (resource && resource.commercialRelationship !== placement.commercialRelationship) {
      errors.push(`${placement.placementId}: commercial relationship differs from resource`);
    }
    if (
      resource &&
      placement.section === "software" &&
      resource.resourceType !== "software" &&
      resource.resourceType !== "tool"
    ) {
      errors.push(`${placement.placementId}: software section requires software or tool resource`);
    }
    if (
      resource &&
      placement.section === "providers" &&
      resource.resourceType !== "provider" &&
      resource.resourceType !== "expertise"
    ) {
      errors.push(`${placement.placementId}: providers section requires provider or expertise resources`);
    }
    if (
      resource &&
      placement.section === "models" &&
      resource.resourceType !== "tool"
    ) {
      errors.push(`${placement.placementId}: models section requires tool resources`);
    }
    if (
      resource &&
      placement.section === "networks" &&
      resource.resourceType !== "directory"
    ) {
      errors.push(`${placement.placementId}: networks section requires directory resources`);
    }
    if (
      placement.status === "published" &&
      (!resource || resource.status !== "published" || validateSolutionResource(resource, now).length > 0)
    ) {
      errors.push(`${placement.placementId}: published placement requires a valid published resource`);
    }
    const rankKey = `${placement.systemSlug}:${placement.section}:${placement.rank}`;
    if (ranks.has(rankKey)) errors.push(`${placement.placementId}: duplicate rank in section`);
    ranks.add(rankKey);
    const resourceKey = `${placement.systemSlug}:${placement.resourceSlug}`;
    if (placedResources.has(resourceKey)) errors.push(`${placement.placementId}: duplicate resource for system`);
    placedResources.add(resourceKey);
  }
  return errors;
}
