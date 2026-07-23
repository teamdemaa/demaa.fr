import type {
  LeadAttributionRecord,
  LeadAttributionSource,
  LeadAttributionTouch,
} from "@/lib/lead-attribution";
import type { LeadContact } from "@/lib/lead-storage";
import { isValidEmail, normalizeEmail } from "@/lib/email";

type FilloutEntry = {
  id?: unknown;
  name?: unknown;
  type?: unknown;
  value?: unknown;
};

export type ParsedFilloutSubmission = {
  attribution: LeadAttributionRecord;
  contact: LeadContact;
  formId: string | null;
  source: string;
  sourceUrl: string | null;
  submissionId: string;
  systemSlug: string | null;
};

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function cleanTimestamp(value: unknown) {
  const timestamp = cleanString(value, 50);
  return timestamp && Number.isFinite(Date.parse(timestamp))
    ? new Date(timestamp).toISOString()
    : new Date().toISOString();
}

function cleanPath(value: unknown) {
  const normalized = cleanString(value, 700);
  if (!normalized) return null;

  try {
    const url = new URL(normalized, "https://demaa.fr");
    if (url.origin !== "https://demaa.fr") return null;
    return `${url.pathname}${url.search}`.slice(0, 700);
  } catch {
    return null;
  }
}

function cleanHost(value: unknown) {
  const normalized = cleanString(value, 180)?.toLowerCase().replace(/^www\./, "");
  return normalized && /^[a-z0-9.-]+$/.test(normalized) ? normalized : null;
}

function normalizeLabel(value: unknown) {
  return cleanString(value, 200)
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() ?? "";
}

function extractScalar(value: unknown, maxLength: number): string | null {
  if (typeof value === "string" || typeof value === "number") {
    return cleanString(String(value), maxLength);
  }
  if (Array.isArray(value)) {
    const values = value
      .map((item) => extractScalar(item, maxLength))
      .filter((item): item is string => Boolean(item));
    return cleanString(values.join(", "), maxLength);
  }
  if (!value || typeof value !== "object") return null;

  const input = value as Record<string, unknown>;
  const fullName = cleanString(input.fullName, maxLength);
  if (fullName) return fullName;
  const composedName = [
    cleanString(input.firstName, Math.floor(maxLength / 2)),
    cleanString(input.lastName, Math.floor(maxLength / 2)),
  ].filter(Boolean).join(" ");
  if (composedName) return cleanString(composedName, maxLength);

  for (const key of ["email", "phone", "phoneNumber", "value"]) {
    const scalar = extractScalar(input[key], maxLength);
    if (scalar) return scalar;
  }
  return null;
}

function toEntries(value: unknown): FilloutEntry[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is FilloutEntry => Boolean(entry) && typeof entry === "object")
    : [];
}

function getParameterMap(entries: FilloutEntry[]) {
  const parameters = new Map<string, string>();
  for (const entry of entries) {
    const name = cleanString(entry.name, 120);
    const value = extractScalar(entry.value, 700);
    if (name && value) parameters.set(name.toLowerCase(), value);
  }
  return parameters;
}

function readParameter(parameters: Map<string, string>, name: string, maxLength: number) {
  return cleanString(parameters.get(name.toLowerCase()), maxLength);
}

function buildTouch(
  parameters: Map<string, string>,
  prefix: "first" | "last",
  capturedAt: string,
  fallbackPath: string,
): LeadAttributionTouch {
  return {
    capturedAt,
    landingPath:
      cleanPath(readParameter(parameters, `dem_${prefix}_landing`, 700))
      ?? fallbackPath,
    referrerHost: cleanHost(readParameter(parameters, `dem_${prefix}_referrer`, 180)),
    referrerUrl: null,
    utmCampaign: readParameter(parameters, `dem_${prefix}_campaign`, 255),
    utmContent: null,
    utmId: null,
    utmMedium: readParameter(parameters, `dem_${prefix}_medium`, 120),
    utmSource: readParameter(parameters, `dem_${prefix}_source`, 180),
    utmTerm: null,
    gclid: null,
    gbraid: null,
    wbraid: null,
    fbclid: null,
    liFatId: null,
    msclkid: null,
    ttclid: null,
  };
}

function buildSource(
  parameters: Map<string, string>,
  prefix: "first" | "last",
): LeadAttributionSource {
  const source = readParameter(parameters, `dem_${prefix}_source`, 180) ?? "direct";
  const medium = readParameter(parameters, `dem_${prefix}_medium`, 120) ?? "unknown";
  return {
    campaign: readParameter(parameters, `dem_${prefix}_campaign`, 255),
    confidence: source === "direct" && medium === "unknown" ? "unknown" : "deterministic",
    medium,
    source,
  };
}

function buildAttribution(input: {
  parameters: Map<string, string>;
  submissionId: string;
  submittedAt: string;
  timezone: string | null;
}) {
  const conversionPage = cleanPath(
    readParameter(input.parameters, "dem_conversion_page", 700),
  );
  const fallbackPath = conversionPage ?? "/annuaire-services/organisation";
  const analyticsValue = readParameter(input.parameters, "dem_analytics_allowed", 10);
  const marketingValue = readParameter(input.parameters, "dem_marketing_allowed", 10);
  const consentValue = readParameter(input.parameters, "dem_analytics_consent", 20);
  const analytics = analyticsValue === "true"
    || (analyticsValue === null && consentValue === "accepted");
  const marketing = marketingValue === "true";
  const status = analytics || marketing
    ? "accepted" as const
    : consentValue === "rejected"
      ? "rejected" as const
      : "pending" as const;

  return {
    consent: { analytics, marketing, status },
    conversion: {
      browser: null,
      city: null,
      country: null,
      device_type: null,
      os: null,
      page: conversionPage,
      region: null,
      request_id: `fillout:${input.submissionId}`,
      submitted_at: input.submittedAt,
      timezone: input.timezone,
    },
    first_source: buildSource(input.parameters, "first"),
    first_touch: buildTouch(input.parameters, "first", input.submittedAt, fallbackPath),
    last_source: buildSource(input.parameters, "last"),
    last_touch: buildTouch(input.parameters, "last", input.submittedAt, fallbackPath),
    storage: analytics ? "persistent" as const : "memory" as const,
    version: 1 as const,
  } satisfies LeadAttributionRecord;
}

function extractContact(questions: FilloutEntry[], scheduling: FilloutEntry[]) {
  const contact: LeadContact = {};
  let timezone: string | null = null;

  for (const entry of scheduling) {
    if (!entry.value || typeof entry.value !== "object") continue;
    const value = entry.value as Record<string, unknown>;
    const fullName = cleanString(value.fullName, 120);
    if (fullName) contact.name ??= fullName;
    const scheduledEmail = normalizeEmail(cleanString(value.email, 160) ?? "");
    if (scheduledEmail && isValidEmail(scheduledEmail)) contact.email ??= scheduledEmail;
    const schedulingTimezone = cleanString(value.timezone, 120);
    if (schedulingTimezone) timezone ??= schedulingTimezone;
  }

  for (const question of questions) {
    const label = normalizeLabel(question.name);
    const type = normalizeLabel(question.type);
    const value = extractScalar(question.value, 300);
    if (!value) continue;

    if (type.includes("email") || /(^|\b)e-?mail(\b|$)/.test(label)) {
      const email = normalizeEmail(value);
      if (isValidEmail(email)) contact.email ??= email;
      continue;
    }
    if (type.includes("phone") || /telephone|phone|whatsapp/.test(label)) {
      contact.phone ??= cleanString(value, 60);
      continue;
    }
    if (/entreprise|societe|company|organisation/.test(label)) {
      contact.company ??= cleanString(value, 120);
      continue;
    }
    if (/prenom|first name|given name/.test(label)) {
      contact.firstName ??= cleanString(value, 100);
      continue;
    }
    if (/nom de famille|last name|surname/.test(label)) {
      contact.lastName ??= cleanString(value, 100);
      continue;
    }
    if (/nom complet|full name|votre nom|^nom$|^name$/.test(label)) {
      contact.name ??= cleanString(value, 120);
    }
  }

  return { contact, timezone };
}

export function parseFilloutWebhookSubmission(value: unknown): ParsedFilloutSubmission | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const envelope = value as Record<string, unknown>;
  const raw = envelope.submission && typeof envelope.submission === "object"
    ? envelope.submission as Record<string, unknown>
    : envelope;
  const submissionId = cleanString(
    raw.submissionId ?? raw.submissionUuid ?? raw.submission_id,
    120,
  );

  if (!submissionId || !/^[A-Za-z0-9_-]{8,120}$/.test(submissionId)) return null;

  const formId = cleanString(raw.formId ?? envelope.formId, 120);
  const submittedAt = cleanTimestamp(raw.submissionTime ?? raw.submittedAt);
  const parameters = getParameterMap(toEntries(raw.urlParameters));
  const { contact, timezone } = extractContact(
    toEntries(raw.questions),
    toEntries(raw.scheduling),
  );
  const source = readParameter(parameters, "source", 120)
    ?? "Session stratégique Fillout";
  const sourceUrl = cleanPath(
    readParameter(parameters, "dem_conversion_page", 700)
      ?? readParameter(parameters, "dem_last_landing", 700)
      ?? readParameter(parameters, "dem_first_landing", 700),
  );

  return {
    attribution: buildAttribution({ parameters, submissionId, submittedAt, timezone }),
    contact,
    formId,
    source,
    sourceUrl: sourceUrl ? `https://demaa.fr${sourceUrl}` : null,
    submissionId,
    systemSlug: readParameter(parameters, "systemslug", 160),
  };
}
