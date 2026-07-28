import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("client-only", () => ({}));

const mocks = vi.hoisted(() => ({
  getCookieConsentPreferences: vi.fn(),
  track: vi.fn(),
}));

vi.mock("@vercel/analytics", () => ({
  track: mocks.track,
}));

vi.mock("@/lib/cookie-consent", () => ({
  getCookieConsentPreferences: mocks.getCookieConsentPreferences,
}));

import {
  trackSystemEcosystemEvent,
  trackSystemJourneyEvent,
} from "@/lib/kit-analytics-client";

describe("system journey analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("window", {
      gtag: vi.fn(),
    });
  });

  it("does not emit events without analytics consent", () => {
    mocks.getCookieConsentPreferences.mockReturnValue({
      analytics: false,
      marketing: false,
    });

    trackSystemJourneyEvent("system_search_selected", {
      method: "click",
      position: 2,
      queryLength: 9,
      systemSlug: "restaurant",
    });
    trackSystemEcosystemEvent("system_ecosystem_tab_opened", {
      systemSlug: "restaurant",
    });

    expect(mocks.track).not.toHaveBeenCalled();
  });

  it("emits only non-personal funnel properties after consent", () => {
    mocks.getCookieConsentPreferences.mockReturnValue({
      analytics: true,
      marketing: false,
    });

    trackSystemJourneyEvent("system_search_selected", {
      method: "keyboard",
      position: 1,
      queryLength: 18,
      systemSlug: "plomberie-chauffage",
    });

    expect(mocks.track).toHaveBeenCalledWith("system_search_selected", {
      method: "keyboard",
      position: 1,
      query_length: 18,
      status_code: 0,
      system_slug: "plomberie-chauffage",
    });
  });

  it("gates ecosystem events and exposes only canonical slugs and positions", () => {
    mocks.getCookieConsentPreferences.mockReturnValue({
      analytics: true,
      marketing: false,
    });

    trackSystemEcosystemEvent("system_ecosystem_resource_opened", {
      groupSlug: "protection",
      position: 2,
      resourceSlug: "orus",
      resourceType: "supplier",
      systemSlug: "batiment",
    });

    expect(mocks.track).toHaveBeenCalledWith(
      "system_ecosystem_resource_opened",
      {
        group_slug: "protection",
        position: 2,
        resource_slug: "orus",
        resource_type: "supplier",
        system_slug: "batiment",
      },
    );
  });
});
