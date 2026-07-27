import "client-only";

import { track } from "@vercel/analytics";
import { getCookieConsentPreferences } from "@/lib/cookie-consent";

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
  | "system_copy_form_failed"
  | "system_copy_form_opened"
  | "system_copy_form_submitted"
  | "system_search_selected";

export function trackSystemJourneyEvent(
  eventName: SystemJourneyEvent,
  input: {
    method?: string;
    position?: number;
    queryLength?: number;
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
