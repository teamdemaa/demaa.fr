import type { LeadAttributionPayload } from "@/lib/lead-attribution";
import {
  deepFreeze,
  isPlainRecord,
  parseRecord,
  parseSlug,
} from "@/lib/registry-contract-utils";
import { isValidEmail, normalizeEmail } from "@/lib/email";

const REQUEST_COMMON_KEYS = [
  "attribution",
  "company",
  "email",
  "firstName",
  "idempotencyKey",
  "marketingConsent",
  "need",
  "systemSlug",
] as const;
const SERVICE_REQUEST_KEYS = [...REQUEST_COMMON_KEYS, "serviceSlug"] as const;
const SOLUTION_REFERRAL_KEYS = [...REQUEST_COMMON_KEYS, "resourceSlug"] as const;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9:_-]{8,160}$/;
const PERSONAL_EMAIL_DOMAINS = new Set([
  "aol.com",
  "gmail.com",
  "hotmail.com",
  "hotmail.fr",
  "icloud.com",
  "live.com",
  "live.fr",
  "outlook.com",
  "outlook.fr",
  "proton.me",
  "protonmail.com",
  "yahoo.com",
  "yahoo.fr",
]);
const attributionEncoder = new TextEncoder();

export type ServiceRequestPayload = Readonly<{
  attribution?: LeadAttributionPayload;
  company: string;
  email: string;
  firstName: string;
  idempotencyKey: string;
  marketingConsent: boolean;
  need: string;
  serviceSlug: string;
  systemSlug: string | null;
}>;

export type SolutionReferralPayload = Readonly<{
  attribution?: LeadAttributionPayload;
  company: string;
  email: string;
  firstName: string;
  idempotencyKey: string;
  marketingConsent: boolean;
  need: string;
  resourceSlug: string;
  systemSlug: string;
}>;

function normalizeRequiredText(
  value: unknown,
  path: string,
  maxLength: number,
  multiline = false,
) {
  if (typeof value !== "string") throw new TypeError(`${path} must be a string`);
  const normalized = multiline
    ? value.replace(/\r\n?/g, "\n").trim()
    : value.replace(/\s+/g, " ").trim();
  if (!normalized) throw new TypeError(`${path} must not be empty`);
  if (normalized.length > maxLength) {
    throw new TypeError(`${path} must be at most ${maxLength} characters`);
  }
  return normalized;
}

function parseProfessionalEmail(value: unknown) {
  const email = normalizeEmail(normalizeRequiredText(value, "request.email", 160));
  if (!isValidEmail(email)) throw new TypeError("request.email must be valid");
  const domain = email.split("@")[1] ?? "";
  if (PERSONAL_EMAIL_DOMAINS.has(domain)) {
    throw new TypeError("request.email must be a professional email address");
  }
  return email;
}

function parseIdempotencyKey(value: unknown) {
  const key = normalizeRequiredText(value, "request.idempotencyKey", 160);
  if (!IDEMPOTENCY_KEY_PATTERN.test(key)) {
    throw new TypeError("request.idempotencyKey is invalid");
  }
  return key;
}

function assertBoundedJson(value: unknown, path: string, depth = 0): void {
  if (depth > 6) throw new TypeError(`${path} is too deeply nested`);
  if (
    value === null
    || typeof value === "boolean"
    || (typeof value === "number" && Number.isFinite(value))
  ) return;
  if (typeof value === "string") {
    if (value.length > 1000) throw new TypeError(`${path} contains an oversized string`);
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > 50) throw new TypeError(`${path} contains too many entries`);
    value.forEach((entry, index) => assertBoundedJson(entry, `${path}[${index}]`, depth + 1));
    return;
  }
  if (!isPlainRecord(value)) throw new TypeError(`${path} must contain JSON data only`);
  const keys = Object.keys(value);
  if (keys.length > 50) throw new TypeError(`${path} contains too many fields`);
  for (const key of keys) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      throw new TypeError(`${path} contains an unsafe field`);
    }
    assertBoundedJson(value[key], `${path}.${key}`, depth + 1);
  }
}

function parseAttribution(value: unknown): LeadAttributionPayload | undefined {
  if (value === undefined) return undefined;
  assertBoundedJson(value, "request.attribution");
  const bytes = attributionEncoder.encode(JSON.stringify(value)).byteLength;
  if (bytes > 6 * 1024) throw new TypeError("request.attribution is too large");
  return deepFreeze(value as LeadAttributionPayload);
}

function parseMarketingConsent(value: unknown) {
  if (value === undefined) return false;
  if (typeof value !== "boolean") {
    throw new TypeError("request.marketingConsent must be a boolean");
  }
  return value;
}

function parseOptionalSystemSlug(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  return parseSlug(value, "request.systemSlug");
}

function parseCommon(record: Record<string, unknown>) {
  return {
    attribution: parseAttribution(record.attribution),
    company: normalizeRequiredText(record.company, "request.company", 160),
    email: parseProfessionalEmail(record.email),
    firstName: normalizeRequiredText(record.firstName, "request.firstName", 80),
    idempotencyKey: parseIdempotencyKey(record.idempotencyKey),
    marketingConsent: parseMarketingConsent(record.marketingConsent),
    need: normalizeRequiredText(record.need, "request.need", 2000, true),
  };
}

export function parseServiceRequestPayload(input: unknown): ServiceRequestPayload {
  const record = parseRecord(input, "request", SERVICE_REQUEST_KEYS);
  return deepFreeze({
    ...parseCommon(record),
    serviceSlug: parseSlug(record.serviceSlug, "request.serviceSlug"),
    systemSlug: parseOptionalSystemSlug(record.systemSlug),
  });
}

export function parseSolutionReferralPayload(input: unknown): SolutionReferralPayload {
  const record = parseRecord(input, "request", SOLUTION_REFERRAL_KEYS);
  const systemSlug = parseOptionalSystemSlug(record.systemSlug);
  if (!systemSlug) throw new TypeError("request.systemSlug is required");
  return deepFreeze({
    ...parseCommon(record),
    resourceSlug: parseSlug(record.resourceSlug, "request.resourceSlug"),
    systemSlug,
  });
}
