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
} from "@/lib/registry-contract-utils";

export const EXPERTISE_PLACEMENT_VISIBILITIES = ["selected", "hidden"] as const;

export type ExpertisePlacement = Readonly<{
  expertisePlacementId: string;
  expertiseId: string;
  systemSlug: string;
  rank: number;
  usage: string;
  fitRationale: string;
  fitConstraints: readonly string[];
  displayCategory: string;
  nameOverride?: string;
  descriptionOverride?: string;
  visibility: (typeof EXPERTISE_PLACEMENT_VISIBILITIES)[number];
  placementVersion: string;
}>;

const KEYS = [
  "expertisePlacementId",
  "expertiseId",
  "systemSlug",
  "rank",
  "usage",
  "fitRationale",
  "fitConstraints",
  "displayCategory",
  "nameOverride",
  "descriptionOverride",
  "visibility",
  "placementVersion",
] as const;

function optionalString(value: unknown, path: string) {
  return value === undefined ? undefined : parseString(value, path);
}

export function parseExpertisePlacement(
  input: unknown,
  path = "expertisePlacement",
): ExpertisePlacement {
  const record = parseRecord(input, path, KEYS);
  const expertiseId = parseSlug(record.expertiseId, `${path}.expertiseId`);
  const systemSlug = parseSlug(record.systemSlug, `${path}.systemSlug`);
  const expectedId = `${systemSlug}:${expertiseId}`;
  const expertisePlacementId = parseString(
    record.expertisePlacementId,
    `${path}.expertisePlacementId`,
  );
  if (expertisePlacementId !== expectedId) {
    throw new TypeError(`${path}.expertisePlacementId must equal ${expectedId}`);
  }
  return deepFreeze({
    expertisePlacementId,
    expertiseId,
    systemSlug,
    rank: parsePositiveInteger(record.rank, `${path}.rank`),
    usage: parseString(record.usage, `${path}.usage`),
    fitRationale: parseString(record.fitRationale, `${path}.fitRationale`),
    fitConstraints: parseStringArray(record.fitConstraints, `${path}.fitConstraints`),
    displayCategory: parseString(record.displayCategory, `${path}.displayCategory`),
    nameOverride: optionalString(record.nameOverride, `${path}.nameOverride`),
    descriptionOverride: optionalString(
      record.descriptionOverride,
      `${path}.descriptionOverride`,
    ),
    visibility: parseEnum(
      record.visibility,
      EXPERTISE_PLACEMENT_VISIBILITIES,
      `${path}.visibility`,
    ),
    placementVersion: parseVersion(
      record.placementVersion,
      `${path}.placementVersion`,
    ),
  });
}

export function parseExpertisePlacements(input: unknown) {
  const placements = parseArray(input, "expertisePlacements").map((entry, index) =>
    parseExpertisePlacement(entry, `expertisePlacements[${index}]`)
  );
  const ids = placements.map(({ expertisePlacementId }) => expertisePlacementId);
  if (new Set(ids).size !== ids.length) {
    throw new TypeError("expertisePlacements must not contain duplicate IDs");
  }
  return deepFreeze(placements);
}
