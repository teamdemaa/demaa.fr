import "client-only";

import {
  trackLeadConversion,
} from "@/lib/lead-attribution-client";

export function recordFilloutLeadSubmission(input: {
  requestType?: string;
  systemSlug?: string | null;
}) {
  if (typeof window === "undefined") return;

  trackLeadConversion({
    requestType: input.requestType ?? "organisation_session_booking",
    systemSlug: input.systemSlug,
  });
}
