import { describe, expect, it } from "vitest";
import {
  buildFilloutAttributionParameters,
  resolveLeadAttributionSource,
  selectLastAttributionTouch,
  type LeadAttributionPayload,
  type LeadAttributionTouch,
} from "../src/lib/lead-attribution";

function touch(
  overrides: Partial<LeadAttributionTouch> = {},
): LeadAttributionTouch {
  return {
    capturedAt: "2026-07-20T10:00:00.000Z",
    fbclid: null,
    gbraid: null,
    gclid: null,
    landingPath: "/systemes/freelance",
    liFatId: null,
    msclkid: null,
    referrerHost: null,
    referrerUrl: null,
    ttclid: null,
    utmCampaign: null,
    utmContent: null,
    utmId: null,
    utmMedium: null,
    utmSource: null,
    utmTerm: null,
    wbraid: null,
    ...overrides,
  };
}

describe("lead attribution", () => {
  it("prioritizes deterministic paid click identifiers", () => {
    expect(resolveLeadAttributionSource(touch({ gclid: "test-click" }))).toEqual({
      campaign: null,
      confidence: "deterministic",
      medium: "paid_search",
      source: "google",
    });
  });

  it("recognizes an organic search referrer", () => {
    expect(resolveLeadAttributionSource(touch({ referrerHost: "www.google.fr" }))).toEqual({
      campaign: null,
      confidence: "inferred",
      medium: "organic",
      source: "google",
    });
  });

  it("keeps a returning external referrer as the latest acquisition", () => {
    const previous = touch({ utmSource: "linkedin", landingPath: "/" });
    const returningVisit = touch({ referrerHost: "google.fr" });

    expect(selectLastAttributionTouch({
      current: touch(),
      currentHost: "demaa.fr",
      first: returningVisit,
      previous,
    })).toBe(returningVisit);
  });

  it("flattens first and last touch for Fillout hidden parameters", () => {
    const payload: LeadAttributionPayload = {
      consent: { analytics: true, marketing: false, status: "accepted" },
      firstTouch: touch({
        landingPath: "/systemes/freelance?utm_source=linkedin",
        utmMedium: "social",
        utmSource: "linkedin",
      }),
      lastTouch: touch({
        landingPath: "/annuaire-services/organisation",
        referrerHost: "google.fr",
      }),
      storage: "persistent",
      version: 1,
    };

    expect(buildFilloutAttributionParameters(payload)).toMatchObject({
      dem_analytics_consent: "accepted",
      dem_first_medium: "social",
      dem_first_source: "linkedin",
      dem_last_medium: "organic",
      dem_last_source: "google",
    });
  });
});
