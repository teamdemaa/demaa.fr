export const OPPORTUNITY_STATUSES = ["draft", "open", "closed"] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export type PublicOpportunity = Readonly<{
  category: string;
  createdAt: string;
  expertiseId: string;
  expiresAt: string | null;
  geography: string | null;
  opportunityId: string;
  publishedAt: string | null;
  status: OpportunityStatus;
  summary: string;
  title: string;
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
  const expertiseId = string("expertiseId");

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(opportunityId)) {
    throw new TypeError(`${path}.opportunityId is invalid`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(expertiseId)) {
    throw new TypeError(`${path}.expertiseId is invalid`);
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
    category: string("category"),
    createdAt: string("createdAt"),
    expertiseId,
    expiresAt: nullableString("expiresAt"),
    geography: nullableString("geography"),
    opportunityId,
    publishedAt: nullableString("publishedAt"),
    status: status as OpportunityStatus,
    summary: string("summary"),
    title: string("title"),
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
