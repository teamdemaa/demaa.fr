import "server-only";

import type {
  LeadAttributionConsent,
  LeadAttributionPayload,
  LeadAttributionRecord,
  LeadAttributionSource,
  LeadAttributionTouch,
} from "@/lib/lead-attribution";

const CLICK_ID_KEYS = [
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "liFatId",
  "msclkid",
  "ttclid",
] as const;

const TRACKED_QUERY_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
  "li_fat_id",
  "msclkid",
  "ttclid",
] as const;

const SOCIAL_DOMAINS = [
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
] as const;

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function cleanTimestamp(value: unknown) {
  const normalized = cleanString(value, 40);
  return normalized && Number.isFinite(Date.parse(normalized))
    ? new Date(normalized).toISOString()
    : new Date().toISOString();
}

function cleanTrackedPath(value: unknown) {
  const normalized = cleanString(value, 700);
  if (!normalized) return null;

  try {
    const url = new URL(normalized, "https://demaa.fr");
    if (url.origin !== "https://demaa.fr") return null;

    const params = new URLSearchParams();
    for (const key of TRACKED_QUERY_KEYS) {
      const trackedValue = cleanString(url.searchParams.get(key), 255);
      if (trackedValue) params.set(key, trackedValue);
    }

    const query = params.toString();
    return `${url.pathname}${query ? `?${query}` : ""}`.slice(0, 700);
  } catch {
    return null;
  }
}

function cleanReferrerUrl(value: unknown) {
  const normalized = cleanString(value, 500);
  if (!normalized) return null;

  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return `${url.origin}${url.pathname}`.slice(0, 500);
  } catch {
    return null;
  }
}

function sanitizeTouch(value: unknown): LeadAttributionTouch | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const landingPath = cleanTrackedPath(input.landingPath);
  if (!landingPath) return null;

  const touch: LeadAttributionTouch = {
    capturedAt: cleanTimestamp(input.capturedAt),
    landingPath,
    referrerHost: cleanString(input.referrerHost, 180)?.toLowerCase() ?? null,
    referrerUrl: cleanReferrerUrl(input.referrerUrl),
    utmCampaign: cleanString(input.utmCampaign, 255),
    utmContent: cleanString(input.utmContent, 255),
    utmId: cleanString(input.utmId, 255),
    utmMedium: cleanString(input.utmMedium, 120),
    utmSource: cleanString(input.utmSource, 180),
    utmTerm: cleanString(input.utmTerm, 255),
    gclid: null,
    gbraid: null,
    wbraid: null,
    fbclid: null,
    liFatId: null,
    msclkid: null,
    ttclid: null,
  };

  for (const key of CLICK_ID_KEYS) {
    touch[key] = cleanString(input[key], 255);
  }

  return touch;
}

function sanitizeConsent(value: unknown): LeadAttributionConsent {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { analytics: false, marketing: false, status: "pending" };
  }

  const input = value as Record<string, unknown>;
  const analytics = input.analytics === true;
  const marketing = input.marketing === true;
  const status = analytics || marketing
    ? "accepted"
    : input.status === "rejected"
      ? "rejected"
      : "pending";

  return { analytics, marketing, status };
}

function sanitizePayload(value: unknown): LeadAttributionPayload {
  const input = value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

  return {
    consent: sanitizeConsent(input.consent),
    firstTouch: sanitizeTouch(input.firstTouch),
    lastTouch: sanitizeTouch(input.lastTouch),
    storage:
      input.storage === "persistent" && sanitizeConsent(input.consent).analytics
        ? "persistent"
        : "memory",
    version: 1,
  };
}

function resolveSource(touch: LeadAttributionTouch | null): LeadAttributionSource {
  if (!touch) {
    return { campaign: null, confidence: "unknown", medium: "unknown", source: "direct" };
  }

  if (touch.gclid || touch.gbraid || touch.wbraid) {
    return { campaign: touch.utmCampaign, confidence: "deterministic", medium: "paid_search", source: "google" };
  }
  if (touch.fbclid) {
    return { campaign: touch.utmCampaign, confidence: "deterministic", medium: "paid_social", source: "meta" };
  }
  if (touch.msclkid) {
    return { campaign: touch.utmCampaign, confidence: "deterministic", medium: "paid_search", source: "bing" };
  }
  if (touch.liFatId) {
    return { campaign: touch.utmCampaign, confidence: "deterministic", medium: "paid_social", source: "linkedin" };
  }
  if (touch.ttclid) {
    return { campaign: touch.utmCampaign, confidence: "deterministic", medium: "paid_social", source: "tiktok" };
  }
  if (touch.utmSource || touch.utmMedium || touch.utmCampaign) {
    return {
      campaign: touch.utmCampaign,
      confidence: "deterministic",
      medium: touch.utmMedium || "campaign",
      source: touch.utmSource || "campaign",
    };
  }

  const host = touch.referrerHost?.replace(/^www\./, "") ?? "";
  if (/^(google\.|bing\.|search\.yahoo\.|duckduckgo\.)/.test(host)) {
    const source = host.startsWith("google.")
      ? "google"
      : host.startsWith("bing.")
        ? "bing"
        : host.startsWith("duckduckgo.")
          ? "duckduckgo"
          : "yahoo";
    return { campaign: null, confidence: "inferred", medium: "organic", source };
  }
  if (SOCIAL_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    return { campaign: null, confidence: "inferred", medium: "social", source: host };
  }
  if (host && host !== "demaa.fr") {
    return { campaign: null, confidence: "inferred", medium: "referral", source: host };
  }

  return { campaign: null, confidence: "unknown", medium: "unknown", source: "direct" };
}

function decodeHeader(value: string | null, maxLength: number) {
  if (!value) return null;
  try {
    return cleanString(decodeURIComponent(value), maxLength);
  } catch {
    return cleanString(value, maxLength);
  }
}

function parseDevice(userAgent: string | null) {
  if (!userAgent) return { browser: null, deviceType: null, os: null };

  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /CriOS\//.test(userAgent)
        ? "Chrome iOS"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /FxiOS\//.test(userAgent)
            ? "Firefox iOS"
            : /Firefox\//.test(userAgent)
              ? "Firefox"
              : /Safari\//.test(userAgent)
                ? "Safari"
                : "Autre";
  const os = /iPhone|iPad|iPod/.test(userAgent)
    ? "iOS"
    : /Android/.test(userAgent)
      ? "Android"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : "Autre";
  const deviceType = /iPad|Tablet/.test(userAgent)
    ? "tablet"
    : /Mobi|Android|iPhone|iPod/.test(userAgent)
      ? "mobile"
      : "desktop";

  return { browser, deviceType, os };
}

function buildConversionPage(request: Request) {
  const referer = request.headers.get("referer");
  if (!referer) return null;

  try {
    const url = new URL(referer);
    if (!/^(www\.)?demaa\.fr$/.test(url.hostname)) return null;
    return cleanTrackedPath(`${url.pathname}${url.search}`);
  } catch {
    return null;
  }
}

export function resolveLeadAttribution(
  request: Request,
  value: unknown,
): LeadAttributionRecord {
  const payload = sanitizePayload(value);
  const device = parseDevice(request.headers.get("user-agent"));

  return {
    consent: payload.consent,
    conversion: {
      browser: device.browser,
      city: decodeHeader(request.headers.get("x-vercel-ip-city"), 120),
      country: cleanString(request.headers.get("x-vercel-ip-country"), 8),
      device_type: device.deviceType,
      os: device.os,
      page: buildConversionPage(request),
      region: decodeHeader(request.headers.get("x-vercel-ip-country-region"), 120),
      request_id: cleanString(request.headers.get("x-vercel-id"), 180),
      submitted_at: new Date().toISOString(),
      timezone: cleanString(request.headers.get("x-vercel-ip-timezone"), 120),
    },
    first_source: resolveSource(payload.firstTouch),
    first_touch: payload.firstTouch,
    last_source: resolveSource(payload.lastTouch),
    last_touch: payload.lastTouch,
    storage: payload.storage,
    version: 1,
  };
}

function formatSource(source: LeadAttributionSource) {
  if (source.confidence === "unknown") return "Accès direct / source masquée";
  return `${source.source} / ${source.medium}`;
}

export function buildAttributionDisplayFields(attribution: LeadAttributionRecord) {
  const sameSource =
    attribution.first_source.source === attribution.last_source.source &&
    attribution.first_source.medium === attribution.last_source.medium;
  const location = [
    attribution.conversion.country,
    attribution.conversion.region,
    attribution.conversion.city,
  ].filter(Boolean).join(" · ");
  const device = [
    attribution.conversion.device_type,
    attribution.conversion.browser,
    attribution.conversion.os,
  ].filter(Boolean).join(" · ");
  const consent = attribution.consent.status === "accepted"
    ? `Mesure ${attribution.consent.analytics ? "acceptée" : "refusée"} · Marketing ${attribution.consent.marketing ? "accepté" : "refusé"}`
    : attribution.consent.status === "rejected"
      ? "Traceurs optionnels refusés"
      : "Choix non exprimé";

  return [
    { label: sameSource ? "Acquisition" : "Première acquisition", value: formatSource(attribution.first_source) },
    ...(!sameSource ? [{ label: "Dernière acquisition", value: formatSource(attribution.last_source) }] : []),
    { label: "Campagne", value: attribution.last_source.campaign ?? attribution.first_source.campaign },
    { label: "Page d’entrée", value: attribution.first_touch?.landingPath },
    { label: "Référent initial", value: attribution.first_touch?.referrerUrl },
    { label: "Page de conversion", value: attribution.conversion.page },
    { label: "Localisation estimée", value: location || null },
    { label: "Appareil", value: device || null },
    { label: "Consentement", value: consent },
  ];
}
