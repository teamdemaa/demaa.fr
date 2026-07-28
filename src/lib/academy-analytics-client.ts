import "client-only";

import { track } from "@vercel/analytics";
import { getCookieConsentPreferences } from "@/lib/cookie-consent";

type AcademyEventName =
  | "academy_filter_selected"
  | "academy_player_started"
  | "academy_video_card_opened";

export function trackAcademyEvent(
  eventName: AcademyEventName,
  input: { category?: string; queryLength?: number; videoSlug?: string },
) {
  if (typeof window === "undefined") return;
  if (!getCookieConsentPreferences()?.analytics) return;

  const properties = {
    category: input.category?.slice(0, 80) || "none",
    query_length: input.queryLength ?? 0,
    video_slug: input.videoSlug?.slice(0, 120) || "none",
  };

  try {
    track(eventName, properties);
    window.gtag?.("event", eventName, properties);
  } catch {
    // Analytics must never block navigation or playback.
  }
}
