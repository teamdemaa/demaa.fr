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
  opportunityId: string;
  opportunityType: OpportunityType;
  publishedAt: string | null;
  startTiming: string | null;
  status: OpportunityStatus;
  summary: string;
  title: string;
  workMode: OpportunityWorkMode | null;
}>;

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
    opportunityId,
    opportunityType: opportunityType as OpportunityType,
    publishedAt: nullableString("publishedAt"),
    startTiming: nullableString("startTiming"),
    status: status as OpportunityStatus,
    summary: string("summary"),
    title: string("title"),
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
    && Number.isFinite(publishedAt)
    && publishedAt <= nowMs
    && (!Number.isFinite(expiresAt) || expiresAt > nowMs);
}
