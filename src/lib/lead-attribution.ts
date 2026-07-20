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
