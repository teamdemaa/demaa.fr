export type LeadAttributionConsent = {
  analytics: boolean;
  marketing: boolean;
  status: "accepted" | "pending" | "rejected";
};

export type LeadAttributionTouch = {
  capturedAt: string;
  landingPath: string;
  referrerHost: string | null;
  referrerUrl: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmId: string | null;
  utmMedium: string | null;
  utmSource: string | null;
  utmTerm: string | null;
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  fbclid: string | null;
  liFatId: string | null;
  msclkid: string | null;
  ttclid: string | null;
};

export type LeadAttributionPayload = {
  consent: LeadAttributionConsent;
  firstTouch: LeadAttributionTouch | null;
  lastTouch: LeadAttributionTouch | null;
  storage: "memory" | "persistent";
  version: 1;
};

export type LeadAttributionSource = {
  campaign: string | null;
  confidence: "deterministic" | "inferred" | "unknown";
  medium: string;
  source: string;
};

export type LeadAttributionRecord = {
  consent: LeadAttributionConsent;
  conversion: {
    browser: string | null;
    city: string | null;
    country: string | null;
    device_type: string | null;
    os: string | null;
    page: string | null;
    region: string | null;
    request_id: string | null;
    submitted_at: string;
    timezone: string | null;
  };
  first_source: LeadAttributionSource;
  first_touch: LeadAttributionTouch | null;
  last_source: LeadAttributionSource;
  last_touch: LeadAttributionTouch | null;
  storage: "memory" | "persistent";
  version: 1;
};

const SOCIAL_DOMAINS = [
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "tiktok.com",
  "twitter.com",
  "x.com",
] as const;

export function resolveLeadAttributionSource(
  touch: LeadAttributionTouch | null,
): LeadAttributionSource {
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

function hasLeadAcquisitionSignal(
  touch: LeadAttributionTouch,
  currentHost: string,
) {
  const normalizedCurrentHost = currentHost.toLowerCase().replace(/^www\./, "");
  const referrerHost = touch.referrerHost?.toLowerCase().replace(/^www\./, "");
  const hasExternalReferrer = Boolean(
    referrerHost && referrerHost !== normalizedCurrentHost,
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

export function selectLastAttributionTouch(input: {
  current: LeadAttributionTouch;
  currentHost: string;
  first: LeadAttributionTouch;
  previous: LeadAttributionTouch;
}) {
  if (hasLeadAcquisitionSignal(input.current, input.currentHost)) {
    return input.current;
  }

  if (hasLeadAcquisitionSignal(input.first, input.currentHost)) {
    return input.first;
  }

  return input.previous;
}

export function buildFilloutAttributionParameters(
  attribution: LeadAttributionPayload,
) {
  const firstSource = resolveLeadAttributionSource(attribution.firstTouch);
  const lastSource = resolveLeadAttributionSource(attribution.lastTouch);

  return {
    dem_analytics_consent: attribution.consent.status,
    dem_attribution_version: String(attribution.version),
    dem_first_campaign: firstSource.campaign ?? undefined,
    dem_first_landing: attribution.firstTouch?.landingPath ?? undefined,
    dem_first_medium: firstSource.medium,
    dem_first_referrer: attribution.firstTouch?.referrerHost ?? undefined,
    dem_first_source: firstSource.source,
    dem_last_campaign: lastSource.campaign ?? undefined,
    dem_last_landing: attribution.lastTouch?.landingPath ?? undefined,
    dem_last_medium: lastSource.medium,
    dem_last_referrer: attribution.lastTouch?.referrerHost ?? undefined,
    dem_last_source: lastSource.source,
  };
}
