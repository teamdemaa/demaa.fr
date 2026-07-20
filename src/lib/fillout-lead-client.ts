import "client-only";

import {
  getLeadAttributionPayload,
  trackLeadConversion,
} from "@/lib/lead-attribution-client";

export function recordFilloutLeadSubmission(input: {
  source: string;
  submissionUuid: string;
  systemSlug?: string | null;
}) {
  if (typeof window === "undefined") return;

  trackLeadConversion({
    requestType: "organisation_audit_booking",
    systemSlug: input.systemSlug,
  });

  void fetch("/api/fillout-submission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      attribution: getLeadAttributionPayload(),
      source: input.source,
      sourceUrl: window.location.href,
      submissionUuid: input.submissionUuid,
      systemSlug: input.systemSlug,
    }),
    keepalive: true,
  }).then((response) => {
    if (!response.ok) {
      console.error(`[fillout-lead] Trace serveur refusée (${response.status}).`);
    }
  }).catch(() => {
    console.error("[fillout-lead] Trace serveur indisponible.");
  });
}
