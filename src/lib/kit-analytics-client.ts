import "client-only";

import { track } from "@vercel/analytics";
import { getCookieConsentPreferences } from "@/lib/cookie-consent";
import {
  TOOL_OUTBOUND_CAMPAIGN,
  type ToolOutboundSurface,
} from "@/lib/tool-outbound-attribution";

const SAFE_ANALYTICS_SLUG = /^[A-Za-z0-9_-]{1,120}$/;

export function trackKitOpen(input: {
  kitName: string;
  kitSlug: string;
}) {
  if (typeof window === "undefined") return;

  const preferences = getCookieConsentPreferences();
  if (!preferences?.analytics) return;

  const properties = {
    kit_name: input.kitName.slice(0, 160),
    kit_slug: input.kitSlug.slice(0, 120),
  };

  try {
    track("kit_open", properties);
    window.gtag?.("event", "kit_open", properties);
  } catch {
    // The server-side redirect counter remains authoritative.
  }
}

type SystemJourneyEvent =
  | "guide_waitlist_form_failed"
  | "guide_waitlist_form_opened"
  | "guide_waitlist_form_submitted"
  | "system_copy_form_failed"
  | "system_copy_form_opened"
  | "system_copy_form_submitted"
  | "system_resource_opened"
  | "system_search_selected";

type SystemEcosystemEvent =
  | "system_ecosystem_rail_navigated"
  | "system_ecosystem_resource_closed"
  | "system_ecosystem_resource_cta_clicked"
  | "system_ecosystem_resource_opened"
  | "system_ecosystem_tab_opened";

type SystemSolutionEvent =
  | "system_solution_resource_cta_clicked"
  | "system_solution_resource_opened";

type CopyableModelEvent =
  | "copyable_model_copy_clicked"
  | "copyable_model_customization_opened"
  | "copyable_model_opened"
  | "copyable_model_preview_opened";

export function trackCopyableModelEvent(
  eventName: CopyableModelEvent,
  input: {
    modelSlug: string;
    platform: "airtable" | "google-drive" | "google-sheets";
    surface: "catalogue" | "model_detail" | "model_preview";
  },
) {
  if (typeof window === "undefined") return;
  if (!SAFE_ANALYTICS_SLUG.test(input.modelSlug)) return;

  const preferences = getCookieConsentPreferences();
  if (!preferences?.analytics) return;

  const properties = {
    model_slug: input.modelSlug,
    platform: input.platform,
    surface: input.surface,
  };

  try {
    track(eventName, properties);
    window.gtag?.("event", eventName, properties);
  } catch {
    // La copie et la demande d'adaptation restent disponibles sans mesure.
  }
}

export function trackSystemJourneyEvent(
  eventName: SystemJourneyEvent,
  input: {
    method?: string;
    position?: number;
    queryLength?: number;
    resourceSlug?: string;
    statusCode?: number;
    systemSlug: string;
  },
) {
  if (typeof window === "undefined") return;

  const preferences = getCookieConsentPreferences();
  if (!preferences?.analytics) return;

  const properties = {
    method: input.method?.slice(0, 40) || "none",
    position: input.position ?? -1,
    query_length: input.queryLength ?? 0,
    ...(input.resourceSlug
      ? { resource_slug: input.resourceSlug.slice(0, 120) }
      : {}),
    status_code: input.statusCode ?? 0,
    system_slug: input.systemSlug.slice(0, 120),
  };

  try {
    track(eventName, properties);
    window.gtag?.("event", eventName, properties);
  } catch {
    // The delivery record remains authoritative for successful requests.
  }
}

export function trackSystemEcosystemEvent(
  eventName: SystemEcosystemEvent,
  input: {
    groupSlug?: string;
    position?: number;
    resourceSlug?: string;
    resourceType?: string;
    systemSlug: string;
  },
) {
  if (typeof window === "undefined") return;

  const preferences = getCookieConsentPreferences();
  if (!preferences?.analytics) return;

  const properties = {
    group_slug: input.groupSlug?.slice(0, 80) || "none",
    position: input.position ?? -1,
    resource_slug: input.resourceSlug?.slice(0, 120) || "none",
    resource_type: input.resourceType?.slice(0, 40) || "none",
    system_slug: input.systemSlug.slice(0, 120),
  };

  try {
    track(eventName, properties);
    window.gtag?.("event", eventName, properties);
  } catch {
    // Les parcours restent utilisables même si la mesure est indisponible.
  }
}

export function trackSystemSolutionEvent(
  eventName: SystemSolutionEvent,
  input: {
    rank: number;
    resourceSlug: string;
    resourceType: string;
    section: string;
    systemSlug: string;
  },
) {
  if (typeof window === "undefined") return;

  const preferences = getCookieConsentPreferences();
  if (!preferences?.analytics) return;

  const properties = {
    rank: input.rank,
    resource_slug: input.resourceSlug.slice(0, 120),
    resource_type: input.resourceType.slice(0, 40),
    section: input.section.slice(0, 40),
    system_slug: input.systemSlug.slice(0, 120),
  };

  try {
    track(eventName, properties);
    window.gtag?.("event", eventName, properties);
  } catch {
    // Les parcours restent utilisables même si la mesure est indisponible.
  }
}

export function trackToolOutboundClick(input: {
  surface: ToolOutboundSurface;
  systemSlug?: string;
  toolSlug: string;
}) {
  if (typeof window === "undefined") return;
  if (!SAFE_ANALYTICS_SLUG.test(input.toolSlug)) return;
  if (input.systemSlug && !SAFE_ANALYTICS_SLUG.test(input.systemSlug)) return;

  const preferences = getCookieConsentPreferences();
  if (!preferences?.analytics) return;

  const properties = {
    campaign: TOOL_OUTBOUND_CAMPAIGN,
    surface: input.surface,
    system_slug: input.systemSlug || "none",
    tool_slug: input.toolSlug,
  };

  try {
    track("tool_outbound_clicked", properties);
    window.gtag?.("event", "tool_outbound_clicked", properties);
  } catch {
    // Un échec de mesure ne doit jamais empêcher l'ouverture de l'outil.
  }
}
