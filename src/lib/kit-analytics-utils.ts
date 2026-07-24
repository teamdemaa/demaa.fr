export const KIT_ANALYTICS_PERIODS = [7, 30, 90] as const;

export type KitAnalyticsPeriod = (typeof KIT_ANALYTICS_PERIODS)[number];

export type KitOpenAttribution = {
  campaign: string | null;
  entryPath: string | null;
  medium: string | null;
  source: string;
};

const PARIS_TIME_ZONE = "Europe/Paris";

function cleanValue(value: string | null, maxLength = 180) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

export function buildKitTrackingUrl(systemSlug: string) {
  return `/api/kits/${encodeURIComponent(systemSlug)}/open`;
}

export function normalizeKitAnalyticsPeriod(
  value: string | string[] | undefined,
): KitAnalyticsPeriod {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  const period = Number(normalizedValue);

  return KIT_ANALYTICS_PERIODS.includes(period as KitAnalyticsPeriod)
    ? (period as KitAnalyticsPeriod)
    : 30;
}

export function getParisDateKey(input: Date | number | string = new Date()) {
  const date = input instanceof Date ? input : new Date(input);
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function shiftDateKey(dateKey: string, dayOffset: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + dayOffset, 12));

  return date.toISOString().slice(0, 10);
}

export function getPeriodStartDateKey(days: number, now: Date = new Date()) {
  return shiftDateKey(getParisDateKey(now), -(Math.max(1, days) - 1));
}

export function getDateKeysForPeriod(days: number, now: Date = new Date()) {
  const today = getParisDateKey(now);
  const start = getPeriodStartDateKey(days, now);
  const keys: string[] = [];

  for (let current = start; current <= today; current = shiftDateKey(current, 1)) {
    keys.push(current);
  }

  return keys;
}

export function resolveKitOpenAttribution(
  referrer: string | null,
  requestHost: string | null,
): KitOpenAttribution {
  if (!referrer) {
    return {
      campaign: null,
      entryPath: null,
      medium: null,
      source: "Accès direct / non attribué",
    };
  }

  try {
    const url = new URL(referrer);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported referrer protocol");
    }

    const utmSource = cleanValue(url.searchParams.get("utm_source"));
    const source = utmSource
      ?? (url.hostname.toLowerCase() !== requestHost?.toLowerCase()
        ? cleanValue(url.hostname.toLowerCase())
        : null)
      ?? "Accès direct / non attribué";

    return {
      campaign: cleanValue(url.searchParams.get("utm_campaign")),
      entryPath: cleanValue(url.pathname, 500),
      medium: cleanValue(url.searchParams.get("utm_medium")),
      source,
    };
  } catch {
    return {
      campaign: null,
      entryPath: null,
      medium: null,
      source: "Accès direct / non attribué",
    };
  }
}

export function shouldCountKitOpen(request: Request) {
  const purpose = request.headers.get("purpose") ?? request.headers.get("sec-purpose");
  const nextPrefetch = request.headers.get("next-router-prefetch");

  return purpose?.toLowerCase() !== "prefetch" && nextPrefetch !== "1";
}
