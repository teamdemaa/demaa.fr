import "client-only";

import { track } from "@vercel/analytics";
import { getCookieConsentPreferences } from "@/lib/cookie-consent";
import type {
  LeadAttributionPayload,
  LeadAttributionTouch,
} from "@/lib/lead-attribution";

const ATTRIBUTION_STORAGE_KEY = "demaa-lead-attribution";
const ATTRIBUTION_LIFETIME_MS = 90 * 24 * 60 * 60 * 1000;
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

type StoredAttribution = {
  expiresAt: string;
  firstTouch: LeadAttributionTouch;
  lastTouch: LeadAttributionTouch;
  version: 1;
};

let memoryAttribution: StoredAttribution | null = null;
let initialTouch: LeadAttributionTouch | null = null;

function cleanValue(value: string | null, maxLength = 255) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function buildTrackedPath(url: URL) {
  const params = new URLSearchParams();

  for (const key of TRACKED_QUERY_KEYS) {
    const value = cleanValue(url.searchParams.get(key));
    if (value) params.set(key, value);
  }

  const query = params.toString();
  return `${url.pathname}${query ? `?${query}` : ""}`.slice(0, 700);
}

function buildSafeReferrer(value: string) {
  if (!value) return { host: null, url: null };

  try {
    const referrer = new URL(value);
    if (referrer.protocol !== "http:" && referrer.protocol !== "https:") {
      return { host: null, url: null };
    }

    return {
      host: cleanValue(referrer.hostname.toLowerCase(), 180),
      url: cleanValue(`${referrer.origin}${referrer.pathname}`, 500),
    };
  } catch {
    return { host: null, url: null };
  }
}

function buildTouch(options: { includeReferrer: boolean }): LeadAttributionTouch {
  const url = new URL(window.location.href);
  const referrer = options.includeReferrer
    ? buildSafeReferrer(document.referrer)
    : { host: null, url: null };

  return {
    capturedAt: new Date().toISOString(),
    landingPath: buildTrackedPath(url),
    referrerHost: referrer.host,
    referrerUrl: referrer.url,
    utmSource: cleanValue(url.searchParams.get("utm_source")),
    utmMedium: cleanValue(url.searchParams.get("utm_medium")),
    utmCampaign: cleanValue(url.searchParams.get("utm_campaign")),
    utmContent: cleanValue(url.searchParams.get("utm_content")),
    utmTerm: cleanValue(url.searchParams.get("utm_term")),
    utmId: cleanValue(url.searchParams.get("utm_id")),
    gclid: cleanValue(url.searchParams.get("gclid")),
    gbraid: cleanValue(url.searchParams.get("gbraid")),
    wbraid: cleanValue(url.searchParams.get("wbraid")),
    fbclid: cleanValue(url.searchParams.get("fbclid")),
    liFatId: cleanValue(url.searchParams.get("li_fat_id")),
    msclkid: cleanValue(url.searchParams.get("msclkid")),
    ttclid: cleanValue(url.searchParams.get("ttclid")),
  };
}

function getInitialTouch() {
  initialTouch ??= buildTouch({ includeReferrer: true });
  return initialTouch;
}

function hasAcquisitionSignal(touch: LeadAttributionTouch) {
  const currentHost = window.location.hostname.toLowerCase();
  const hasExternalReferrer = Boolean(
    touch.referrerHost && touch.referrerHost !== currentHost,
  );

  return Boolean(
    touch.utmSource ||
      touch.utmMedium ||
      touch.utmCampaign ||
      touch.gclid ||
      touch.gbraid ||
      touch.wbraid ||
      touch.fbclid ||
      touch.liFatId ||
      touch.msclkid ||
      touch.ttclid ||
      hasExternalReferrer,
  );
}

function readStoredAttribution() {
  const rawValue = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const value = JSON.parse(rawValue) as StoredAttribution;
    if (
      value.version !== 1 ||
      !value.firstTouch ||
      !value.lastTouch ||
      !Number.isFinite(Date.parse(value.expiresAt)) ||
      Date.parse(value.expiresAt) <= Date.now()
    ) {
      window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
      return null;
    }

    return value;
  } catch {
    window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    return null;
  }
}

function persistAttribution(value: StoredAttribution) {
  window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(value));
}

function buildCurrentAttribution() {
  const preferences = getCookieConsentPreferences();
  const canPersist = preferences?.analytics === true;
  const first = getInitialTouch();
  const current = buildTouch({ includeReferrer: false });
  const stored = canPersist ? readStoredAttribution() : null;
  const base = stored ?? memoryAttribution ?? {
    expiresAt: new Date(Date.now() + ATTRIBUTION_LIFETIME_MS).toISOString(),
    firstTouch: first,
    lastTouch: first,
    version: 1 as const,
  };

  const next: StoredAttribution = {
    ...base,
    expiresAt: new Date(Date.now() + ATTRIBUTION_LIFETIME_MS).toISOString(),
    lastTouch: hasAcquisitionSignal(current) ? current : base.lastTouch,
  };

  memoryAttribution = next;
  if (canPersist) persistAttribution(next);

  return {
    consent: {
      analytics: preferences?.analytics ?? false,
      marketing: preferences?.marketing ?? false,
      status: preferences
        ? preferences.analytics || preferences.marketing
          ? "accepted" as const
          : "rejected" as const
        : "pending" as const,
    },
    firstTouch: next.firstTouch,
    lastTouch: next.lastTouch,
    storage: canPersist ? "persistent" as const : "memory" as const,
    version: 1 as const,
  } satisfies LeadAttributionPayload;
}

function resolveClientSource(touch: LeadAttributionTouch | null) {
  if (!touch) return "direct";
  if (touch.gclid || touch.gbraid || touch.wbraid) return "google_ads";
  if (touch.fbclid) return "meta_ads";
  if (touch.msclkid) return "bing_ads";
  if (touch.liFatId) return "linkedin_ads";
  if (touch.ttclid) return "tiktok_ads";
  return touch.utmSource || touch.referrerHost || "direct";
}

export function initializeLeadAttribution() {
  if (typeof window === "undefined") return null;
  return buildCurrentAttribution();
}

export function clearPersistedLeadAttribution() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
  memoryAttribution = null;
  initialTouch = null;
}

export function getLeadAttributionPayload() {
  if (typeof window === "undefined") return null;
  return buildCurrentAttribution();
}

export function trackLeadConversion(input: {
  requestType: string;
  systemSlug?: string | null;
}) {
  if (typeof window === "undefined") return;

  const preferences = getCookieConsentPreferences();
  const attribution = buildCurrentAttribution();
  const source = resolveClientSource(attribution.lastTouch);
  const safeProperties = {
    request_type: input.requestType.slice(0, 120),
    source: source.slice(0, 180),
    system_slug: input.systemSlug?.slice(0, 120) || "none",
  };

  if (preferences?.analytics) {
    try {
      track("lead_submitted", safeProperties);
      window.gtag?.("event", "generate_lead", safeProperties);
    } catch {
      // Attribution stored with the lead remains authoritative if analytics is unavailable.
    }
  }

  if (preferences?.marketing) {
    window.fbq?.("track", "Lead", {
      content_category: safeProperties.request_type,
      content_name: safeProperties.system_slug,
    });
  }
}
