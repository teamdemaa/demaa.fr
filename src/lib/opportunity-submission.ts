import {
  OPPORTUNITY_TYPES,
  OPPORTUNITY_WORK_MODES,
  type OpportunityType,
  type OpportunityWorkMode,
} from "@/lib/opportunity-contract";

export const OPPORTUNITY_SUBMISSION_DRAFT_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export type OpportunitySubmissionFields = Readonly<{
  cadence: string | null;
  category: string;
  companyName: string | null;
  compensation: string | null;
  expectations: readonly string[];
  expiresAt: string | null;
  geography: string | null;
  opportunityType: OpportunityType;
  startTiming: string | null;
  summary: string;
  title: string;
  workMode: OpportunityWorkMode | null;
}>;

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.replace(/\r\n?/g, "\n").trim().slice(0, maxLength)
    : "";
}

export function isOpportunitySubmissionDraftToken(
  value: unknown,
): value is string {
  return typeof value === "string"
    && OPPORTUNITY_SUBMISSION_DRAFT_TOKEN_PATTERN.test(value);
}

export function parseOpportunitySubmissionFields(
  input: unknown,
): OpportunitySubmissionFields | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const entry = input as Record<string, unknown>;
  const title = cleanText(entry.title, 140);
  const summary = cleanText(entry.summary, 700);
  const category = cleanText(entry.category, 100);
  const opportunityType = cleanText(entry.opportunityType, 40) || "mission";
  const workMode = cleanText(entry.workMode, 30) || null;
  const expectationsInput = Array.isArray(entry.expectations)
    ? entry.expectations
    : typeof entry.expectations === "string"
      ? entry.expectations.split(/\r?\n/)
      : [];
  const expectations = expectationsInput
    .map((value) => cleanText(value, 180))
    .filter(Boolean)
    .slice(0, 4);
  const expiresAtRaw = cleanText(entry.expiresAt, 40);
  const expiresAt = expiresAtRaw
    ? new Date(`${expiresAtRaw}T23:59:59.999Z`).toISOString()
    : null;

  if (
    title.length < 5
    || summary.length < 30
    || !category
    || !OPPORTUNITY_TYPES.includes(opportunityType as OpportunityType)
    || (workMode && !OPPORTUNITY_WORK_MODES.includes(workMode as OpportunityWorkMode))
    || (expiresAtRaw && !Number.isFinite(Date.parse(expiresAt ?? "")))
  ) return null;

  return {
    cadence: cleanText(entry.cadence, 140) || null,
    category,
    companyName: cleanText(entry.companyName, 140) || null,
    compensation: cleanText(entry.compensation, 140) || null,
    expectations,
    expiresAt,
    geography: cleanText(entry.geography, 100) || null,
    opportunityType: opportunityType as OpportunityType,
    startTiming: cleanText(entry.startTiming, 140) || null,
    summary,
    title,
    workMode: workMode as OpportunityWorkMode | null,
  };
}
