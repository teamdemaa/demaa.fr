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
  trackCopyableModelEvent,
  trackSystemEcosystemEvent,
  trackSystemJourneyEvent,
  trackSystemSolutionEvent,
  trackToolOutboundClick,
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

  it("emits only the five non-PII Solution properties after consent", () => {
    mocks.getCookieConsentPreferences.mockReturnValue({
      analytics: true,
      marketing: false,
    });

    trackSystemSolutionEvent("system_solution_resource_opened", {
      rank: 2,
      resourceSlug: "costructor",
      resourceType: "software",
      section: "software",
      systemSlug: "batiment",
    });

    expect(mocks.track).toHaveBeenCalledWith(
      "system_solution_resource_opened",
      {
        rank: 2,
        resource_slug: "costructor",
        resource_type: "software",
        section: "software",
        system_slug: "batiment",
      },
    );
    expect(Object.keys(mocks.track.mock.calls[0]?.[1] ?? {}).sort()).toEqual([
      "rank",
      "resource_slug",
      "resource_type",
      "section",
      "system_slug",
    ]);
  });

  it("gates tool outbound clicks and emits only bounded attribution properties", () => {
    mocks.getCookieConsentPreferences.mockReturnValue({
      analytics: false,
      marketing: false,
    });

    trackToolOutboundClick({
      surface: "action_recommendation",
      systemSlug: "cabinet-comptable",
      toolSlug: "pennylane",
    });
    expect(mocks.track).not.toHaveBeenCalled();

    mocks.getCookieConsentPreferences.mockReturnValue({
      analytics: true,
      marketing: false,
    });
    trackToolOutboundClick({
      surface: "action_recommendation",
      systemSlug: "cabinet-comptable",
      toolSlug: "pennylane",
    });

    expect(mocks.track).toHaveBeenCalledWith("tool_outbound_clicked", {
      campaign: "solutions",
      surface: "action_recommendation",
      system_slug: "cabinet-comptable",
      tool_slug: "pennylane",
    });
    expect(Object.keys(mocks.track.mock.calls[0]?.[1] ?? {}).sort()).toEqual([
      "campaign",
      "surface",
      "system_slug",
      "tool_slug",
    ]);
  });

  it("refuses identifiers that are not canonical slugs", () => {
    mocks.getCookieConsentPreferences.mockReturnValue({
      analytics: true,
      marketing: false,
    });

    trackToolOutboundClick({
      surface: "tool_detail",
      toolSlug: "person@example.com",
    });

    expect(mocks.track).not.toHaveBeenCalled();
  });

  it("measures the copyable-model funnel without personal data", () => {
    mocks.getCookieConsentPreferences.mockReturnValue({
      analytics: true,
      marketing: false,
    });

    trackCopyableModelEvent("copyable_model_copy_clicked", {
      modelSlug: "interventions-et-chantiers",
      platform: "airtable",
      surface: "model_detail",
    });

    expect(mocks.track).toHaveBeenCalledWith("copyable_model_copy_clicked", {
      model_slug: "interventions-et-chantiers",
      platform: "airtable",
      surface: "model_detail",
    });
  });
});
