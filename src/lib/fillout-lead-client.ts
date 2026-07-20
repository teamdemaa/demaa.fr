import "client-only";

import {
  trackLeadConversion,
} from "@/lib/lead-attribution-client";

export function recordFilloutLeadSubmission(input: {
  systemSlug?: string | null;
}) {
  if (typeof window === "undefined") return;

  trackLeadConversion({
    requestType: "organisation_audit_booking",
    systemSlug: input.systemSlug,
  });
}
