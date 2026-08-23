export const OPPORTUNITY_STATUSES = ["draft", "open", "closed"] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export const OPPORTUNITY_TYPES = [
  "mission",
  "sous-traitance",
  "partenariat",
  "reprise-transmission",
  "collaboration",
  "autre",
] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export const OPPORTUNITY_WORK_MODES = ["remote", "onsite", "hybrid"] as const;
export type OpportunityWorkMode = (typeof OPPORTUNITY_WORK_MODES)[number];

export const OPPORTUNITY_INGESTION_MODES = [
  "direct_submission",
  "authorized_feed",
  "external_discovery",
  "authorized_crawl",
] as const;
export type OpportunityIngestionMode = (typeof OPPORTUNITY_INGESTION_MODES)[number];

export const OPPORTUNITY_WORK_MODE_LABELS: Readonly<Record<OpportunityWorkMode, string>> = {
  remote: "À distance",
  onsite: "Sur site",
  hybrid: "Hybride",
};

export const OPPORTUNITY_TYPE_LABELS: Readonly<Record<OpportunityType, string>> = {
  mission: "Mission",
  "sous-traitance": "Sous-traitance",
  partenariat: "Partenariat",
  "reprise-transmission": "Reprise ou transmission",
  collaboration: "Collaboration",
  autre: "Autre",
};

export const OPPORTUNITY_INGESTION_MODE_LABELS: Readonly<Record<OpportunityIngestionMode, string>> = {
  direct_submission: "Soumission directe",
  authorized_feed: "Flux partenaire autorisé",
  external_discovery: "Découverte externe",
  authorized_crawl: "Collecte automatisée autorisée",
};

export const ANNOUNCEMENT_FILTERS = [
  "Toutes",
  "Reprises",
  "Missions et partenariats",
] as const;
export type AnnouncementFilter = (typeof ANNOUNCEMENT_FILTERS)[number];

const ANNOUNCEMENT_FILTER_BY_TYPE: Readonly<
  Partial<Record<OpportunityType, Exclude<AnnouncementFilter, "Toutes">>>
> = {
  "reprise-transmission": "Reprises",
  mission: "Missions et partenariats",
  "sous-traitance": "Missions et partenariats",
  collaboration: "Missions et partenariats",
  partenariat: "Missions et partenariats",
};

export function announcementFilterForType(
  type: OpportunityType,
): Exclude<AnnouncementFilter, "Toutes"> | null {
  return ANNOUNCEMENT_FILTER_BY_TYPE[type] ?? null;
}

export type PublicOpportunity = Readonly<{
  cadence: string | null;
  category: string;
  companyName: string | null;
  compensation: string | null;
  createdAt: string;
  domainLabel?: string | null;
  expertiseId: string | null;
  expiresAt: string | null;
  expectations: readonly string[];
  geography: string | null;
  ingestionMode: OpportunityIngestionMode | null;
  opportunityId: string;
  opportunityType: OpportunityType;
  publishedAt: string | null;
  sourceKind: string | null;
  sourceName: string | null;
  sourcePublishedAt: string | null;
  sourceRemovedAt: string | null;
  sourceUrl: string | null;
  startTiming: string | null;
  status: OpportunityStatus;
  summary: string;
  title: string;
  verifiedAt: string | null;
  workMode: OpportunityWorkMode | null;
}>;

function isExternallySourced(ingestionMode: OpportunityIngestionMode | null) {
  return ingestionMode !== null && ingestionMode !== "direct_submission";
}

export function parseOpportunity(
  input: unknown,
  path = "opportunity",
): PublicOpportunity {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError(`${path} must be an object`);
  }
  const entry = input as Record<string, unknown>;
  const string = (key: string) => typeof entry[key] === "string"
    ? (entry[key] as string).trim()
    : "";
  const nullableString = (key: string) => entry[key] === null
    ? null
    : string(key) || null;
  const status = string("status");
  const opportunityId = string("opportunityId");
  const expertiseId = nullableString("expertiseId");
  const opportunityType = string("opportunityType") || "mission";
  const workMode = nullableString("workMode");
  const ingestionMode = nullableString("ingestionMode");
  const sourceUrl = nullableString("sourceUrl");
  const sourceName = nullableString("sourceName");
  const verifiedAt = nullableString("verifiedAt");
  const expectations = entry.expectations === undefined
    ? []
    : Array.isArray(entry.expectations)
      ? entry.expectations.map((value) => typeof value === "string" ? value.trim() : "")
        .filter(Boolean)
      : null;

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(opportunityId)) {
    throw new TypeError(`${path}.opportunityId is invalid`);
  }
  if (expertiseId && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(expertiseId)) {
    throw new TypeError(`${path}.expertiseId is invalid`);
  }
  if (!(OPPORTUNITY_TYPES as readonly string[]).includes(opportunityType)) {
    throw new TypeError(`${path}.opportunityType is invalid`);
  }
  if (
    workMode
    && !(OPPORTUNITY_WORK_MODES as readonly string[]).includes(workMode)
  ) {
    throw new TypeError(`${path}.workMode is invalid`);
  }
  if (
    ingestionMode
    && !(OPPORTUNITY_INGESTION_MODES as readonly string[]).includes(ingestionMode)
  ) {
    throw new TypeError(`${path}.ingestionMode is invalid`);
  }
  if (sourceUrl && !sourceUrl.startsWith("https://")) {
    throw new TypeError(`${path}.sourceUrl must be HTTPS`);
  }
  if (
    !expectations
    || expectations.length > 4
    || expectations.some((expectation) => expectation.length > 180)
  ) {
    throw new TypeError(`${path}.expectations is invalid`);
  }
  if (!(OPPORTUNITY_STATUSES as readonly string[]).includes(status)) {
    throw new TypeError(`${path}.status is invalid`);
  }
  if (!string("title") || !string("summary") || !string("category")) {
    throw new TypeError(`${path} requires title, summary and category`);
  }
  if (!Number.isFinite(Date.parse(string("createdAt")))) {
    throw new TypeError(`${path}.createdAt is invalid`);
  }
  if (
    status === "open"
    && isExternallySourced(ingestionMode as OpportunityIngestionMode | null)
    && (!sourceName || !sourceUrl || !verifiedAt)
  ) {
    throw new TypeError(
      `${path} requires sourceName, sourceUrl and verifiedAt to publish an externally sourced announcement`,
    );
  }

  return {
    cadence: nullableString("cadence"),
    category: string("category"),
    companyName: nullableString("companyName"),
    compensation: nullableString("compensation"),
    createdAt: string("createdAt"),
    domainLabel: nullableString("domainLabel"),
    expertiseId,
    expiresAt: nullableString("expiresAt"),
    expectations,
    geography: nullableString("geography"),
    ingestionMode: ingestionMode as OpportunityIngestionMode | null,
    opportunityId,
    opportunityType: opportunityType as OpportunityType,
    publishedAt: nullableString("publishedAt"),
    sourceKind: nullableString("sourceKind"),
    sourceName,
    sourcePublishedAt: nullableString("sourcePublishedAt"),
    sourceRemovedAt: nullableString("sourceRemovedAt"),
    sourceUrl,
    startTiming: nullableString("startTiming"),
    status: status as OpportunityStatus,
    summary: string("summary"),
    title: string("title"),
    verifiedAt,
    workMode: workMode as OpportunityWorkMode | null,
  };
}

export function isPublicOpenOpportunity(
  opportunity: PublicOpportunity,
  now = new Date(),
) {
  const nowMs = now.getTime();
  const publishedAt = Date.parse(opportunity.publishedAt ?? "");
  const expiresAt = Date.parse(opportunity.expiresAt ?? "");
  return opportunity.status === "open"
    && !opportunity.sourceRemovedAt
    && Number.isFinite(publishedAt)
    && publishedAt <= nowMs
    && (!Number.isFinite(expiresAt) || expiresAt > nowMs);
}
