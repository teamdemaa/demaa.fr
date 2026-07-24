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
