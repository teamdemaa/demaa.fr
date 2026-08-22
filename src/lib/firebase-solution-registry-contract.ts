import "server-only";

import { createHash } from "node:crypto";
import {
  parseSolutionPlacement,
  parseSolutionResource,
  isSafeInteractionHref,
  validateSolutionRegistries,
  type SolutionPlacement,
  type SolutionResource,
} from "@/lib/solution-registry-contract";
import {
  deepFreeze,
  parseArray,
  parseEnum,
  parseRecord,
  parseSlug,
  parseString,
  parseVersion,
  validationError,
} from "@/lib/registry-contract-utils";

export const FIREBASE_SOLUTION_REVISION_STATUSES = [
  "draft",
  "published",
  "archived",
] as const;

export const FIREBASE_SOLUTION_REGISTRY_SCHEMA_VERSION = 1 as const;
export const FIREBASE_SOLUTION_REGISTRY_ACTIVE_POINTER =
  "solution_registry_config/active" as const;
export const FIREBASE_SOLUTION_REGISTRY_REVISIONS_COLLECTION =
  "solution_registry_revisions" as const;

// Corruption/payload guards only. Editorial selection is intentionally
// evidence-based and variable; neither value is a target to fill. Software
// alone needs room for a broader reviewed selection.
export const MAX_SOFTWARE_PLACEMENTS_PER_SYSTEM = 50 as const;
export const MAX_OTHER_SOLUTION_PLACEMENTS_PER_SECTION = 10 as const;

export type FirebaseSolutionRevisionStatus =
  (typeof FIREBASE_SOLUTION_REVISION_STATUSES)[number];

export type FirebaseSolutionPresentation = Readonly<{
  displayCategory: string;
  nameOverride?: string;
  hrefOverride?: string;
  ctaLabel?: string;
  descriptionOverride?: string;
  indicativePricing?: string;
  pricingCapturedAt?: string;
  pricingExpiresAt?: string;
  pricingSource?: string;
}>;

export type FirebaseSolutionResourceEntry = Readonly<{
  resource: SolutionResource;
}>;

export type FirebaseSolutionPlacementEntry = Readonly<{
  placement: SolutionPlacement;
  presentation: FirebaseSolutionPresentation;
}>;

export type FirebaseSolutionRegistryRevision = Readonly<{
  schemaVersion: typeof FIREBASE_SOLUTION_REGISTRY_SCHEMA_VERSION;
  revisionId: string;
  revisionStatus: FirebaseSolutionRevisionStatus;
  createdAt: string;
  createdBy: string;
  sourceFingerprint: string;
  knownSystemSlugs: readonly string[];
  resources: readonly FirebaseSolutionResourceEntry[];
  placements: readonly FirebaseSolutionPlacementEntry[];
}>;

const PRESENTATION_KEYS = [
  "displayCategory",
  "nameOverride",
  "hrefOverride",
  "ctaLabel",
  "descriptionOverride",
  "indicativePricing",
  "pricingCapturedAt",
  "pricingExpiresAt",
  "pricingSource",
] as const;

function parseOptionalString(value: unknown, path: string): string | undefined {
  return value === undefined ? undefined : parseString(value, path);
}

function parseIsoTimestamp(value: unknown, path: string): string {
  const timestamp = parseString(value, path);
  const parsed = Date.parse(timestamp);
  if (!Number.isFinite(parsed) || new Date(parsed).toISOString() !== timestamp) {
    throw new TypeError(`${path} must be an ISO timestamp`);
  }
  return timestamp;
}

function parsePresentation(
  input: unknown,
  path: string,
): FirebaseSolutionPresentation {
  const record = parseRecord(input, path, PRESENTATION_KEYS);
  const presentation = {
    displayCategory: parseString(record.displayCategory, `${path}.displayCategory`),
    nameOverride: parseOptionalString(record.nameOverride, `${path}.nameOverride`),
    hrefOverride: parseOptionalString(record.hrefOverride, `${path}.hrefOverride`),
    ctaLabel: parseOptionalString(record.ctaLabel, `${path}.ctaLabel`),
    descriptionOverride: parseOptionalString(
      record.descriptionOverride,
      `${path}.descriptionOverride`,
    ),
    indicativePricing: parseOptionalString(
      record.indicativePricing,
      `${path}.indicativePricing`,
    ),
    pricingCapturedAt: parseOptionalString(
      record.pricingCapturedAt,
      `${path}.pricingCapturedAt`,
    ),
    pricingExpiresAt: parseOptionalString(
      record.pricingExpiresAt,
      `${path}.pricingExpiresAt`,
    ),
    pricingSource: parseOptionalString(
      record.pricingSource,
      `${path}.pricingSource`,
    ),
  };

  const pricingFields = [
    presentation.indicativePricing,
    presentation.pricingCapturedAt,
    presentation.pricingExpiresAt,
    presentation.pricingSource,
  ];
  if (pricingFields.some(Boolean) && !pricingFields.every(Boolean)) {
    throw new TypeError(`${path} pricing fields must be complete`);
  }
  if (presentation.pricingCapturedAt) {
    parseIsoTimestamp(presentation.pricingCapturedAt, `${path}.pricingCapturedAt`);
    parseIsoTimestamp(presentation.pricingExpiresAt, `${path}.pricingExpiresAt`);
    if (
      Date.parse(presentation.pricingCapturedAt) >=
      Date.parse(presentation.pricingExpiresAt as string)
    ) {
      throw new TypeError(`${path} pricing capture must precede expiration`);
    }
  }

  return deepFreeze(
    Object.fromEntries(
      Object.entries(presentation).filter(([, value]) => value !== undefined),
    ) as FirebaseSolutionPresentation,
  );
}

export function parseFirebaseSolutionRegistryRevision(
  input: unknown,
): FirebaseSolutionRegistryRevision {
  const record = parseRecord(input, "firebaseSolutionRevision", [
    "schemaVersion",
    "revisionId",
    "revisionStatus",
    "createdAt",
    "createdBy",
    "sourceFingerprint",
    "knownSystemSlugs",
    "resources",
    "placements",
  ]);
  if (record.schemaVersion !== FIREBASE_SOLUTION_REGISTRY_SCHEMA_VERSION) {
    throw new TypeError("firebaseSolutionRevision.schemaVersion is invalid");
  }
  const knownSystemSlugs = parseArray(
    record.knownSystemSlugs,
    "firebaseSolutionRevision.knownSystemSlugs",
  ).map((entry, index) =>
    parseSlug(entry, `firebaseSolutionRevision.knownSystemSlugs[${index}]`),
  );
  if (new Set(knownSystemSlugs).size !== knownSystemSlugs.length) {
    throw new TypeError(
      "firebaseSolutionRevision.knownSystemSlugs must not contain duplicates",
    );
  }
  const resources = parseArray(
    record.resources,
    "firebaseSolutionRevision.resources",
  ).map((entry, index) => {
    const path = `firebaseSolutionRevision.resources[${index}]`;
    const wrapper = parseRecord(entry, path, ["resource"]);
    return deepFreeze({
      resource: parseSolutionResource(wrapper.resource, `${path}.resource`),
    });
  });
  const placements = parseArray(
    record.placements,
    "firebaseSolutionRevision.placements",
  ).map((entry, index) => {
    const path = `firebaseSolutionRevision.placements[${index}]`;
    const wrapper = parseRecord(entry, path, ["placement", "presentation"]);
    return deepFreeze({
      placement: parseSolutionPlacement(wrapper.placement, `${path}.placement`),
      presentation: parsePresentation(wrapper.presentation, `${path}.presentation`),
    });
  });

  return deepFreeze({
    schemaVersion: FIREBASE_SOLUTION_REGISTRY_SCHEMA_VERSION,
    revisionId: parseVersion(record.revisionId, "firebaseSolutionRevision.revisionId"),
    revisionStatus: parseEnum(
      record.revisionStatus,
      FIREBASE_SOLUTION_REVISION_STATUSES,
      "firebaseSolutionRevision.revisionStatus",
    ),
    createdAt: parseIsoTimestamp(record.createdAt, "firebaseSolutionRevision.createdAt"),
    createdBy: parseString(record.createdBy, "firebaseSolutionRevision.createdBy"),
    sourceFingerprint: parseString(
      record.sourceFingerprint,
      "firebaseSolutionRevision.sourceFingerprint",
    ),
    knownSystemSlugs: deepFreeze(knownSystemSlugs),
    resources: deepFreeze(resources),
    placements: deepFreeze(placements),
  });
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("non-finite registry number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`;
  }
  if (typeof value === "object" && value !== null) {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("registry values must be plain JSON objects");
    }
    return `{${Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(
        (value as Record<string, unknown>)[key],
      )}`)
      .join(",")}}`;
  }
  throw new TypeError("registry values must be JSON serializable");
}

export function fingerprintFirebaseSolutionRegistryRevision(
  input: unknown,
): string {
  const revision = parseFirebaseSolutionRegistryRevision(input);
  const payload = {
    ...revision,
    sourceFingerprint: "",
  };
  return createHash("sha256").update(canonicalJson(payload)).digest("hex");
}

export function validateFirebaseSolutionRegistryRevision(
  input: unknown,
  options: {
    expectedSystemSlugs: readonly string[];
    now?: Date;
    requirePublishedRevision?: boolean;
  },
): string[] {
  let revision: FirebaseSolutionRegistryRevision;
  try {
    revision = parseFirebaseSolutionRegistryRevision(input);
  } catch (error) {
    return [validationError(error)];
  }
  const now = options.now ?? new Date();
  const errors = validateSolutionRegistries(
    {
      knownSystemSlugs: revision.knownSystemSlugs,
      resources: revision.resources.map(({ resource }) => resource),
      placements: revision.placements.map(({ placement }) => placement),
    },
    now,
  );
  if (
    revision.knownSystemSlugs.length !== options.expectedSystemSlugs.length ||
    revision.knownSystemSlugs.some(
      (slug, index) => slug !== options.expectedSystemSlugs[index],
    )
  ) {
    errors.push("revision must cover the exact canonical system order");
  }
  if (options.requirePublishedRevision && revision.revisionStatus !== "published") {
    errors.push("active revision must be published");
  }
  if (Date.parse(revision.createdAt) > now.getTime()) {
    errors.push("revision createdAt must not be in the future");
  }
  if (!/^[a-f0-9]{64}$/.test(revision.sourceFingerprint)) {
    errors.push("revision sourceFingerprint must be a SHA-256 hex digest");
  } else {
    const actualFingerprint = fingerprintFirebaseSolutionRegistryRevision(revision);
    if (actualFingerprint !== revision.sourceFingerprint) {
      errors.push("revision sourceFingerprint does not match its content");
    }
  }

  const placementEntries = revision.placements;
  const resourcesBySlug = new Map(
    revision.resources.map(({ resource }) => [resource.resourceSlug, resource]),
  );
  for (const { placement, presentation } of placementEntries) {
    const resource = resourcesBySlug.get(placement.resourceSlug);
    if (
      resource?.interactionMode !== "system_delivery" &&
      resource?.interactionMode !== "referral_form" &&
      !presentation.ctaLabel
    ) {
      errors.push(`${placement.placementId}: presentation requires a CTA label`);
    }
    if (
      presentation.hrefOverride &&
      (!resource || !isSafeInteractionHref(
        presentation.hrefOverride,
        resource.interactionMode,
      ))
    ) {
      errors.push(`${placement.placementId}: presentation href override is unsafe`);
    }
  }
  for (const systemSlug of revision.knownSystemSlugs) {
    const systemPlacements = placementEntries.filter(
      ({ placement }) => placement.systemSlug === systemSlug,
    );
    const levierPlacements = systemPlacements.filter(
      ({ placement }) =>
        placement.resourceSlug === "levier" && placement.section === "models",
    );
    if (levierPlacements.length !== 1) {
      errors.push(`${systemSlug}: Levier must appear exactly once in Models`);
    }
    for (const section of ["software", "providers", "models", "networks"] as const) {
      const inSection = systemPlacements
        .filter(({ placement }) => placement.section === section)
        .sort((left, right) => left.placement.rank - right.placement.rank);
      const maximumPlacements = section === "software"
        ? MAX_SOFTWARE_PLACEMENTS_PER_SYSTEM
        : MAX_OTHER_SOLUTION_PLACEMENTS_PER_SECTION;
      if (inSection.length > maximumPlacements) {
        errors.push(
          `${systemSlug}:${section} must not exceed ${maximumPlacements} placements`,
        );
      }
      if (inSection.some(({ placement }, index) => placement.rank !== index + 1)) {
        errors.push(`${systemSlug}:${section} ranks must be contiguous`);
      }
    }
  }

  return errors;
}
