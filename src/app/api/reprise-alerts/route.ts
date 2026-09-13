import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import { getRepriseAlertMatches, parseRepriseAlertCriteria } from "@/lib/reprise-alerts";
import { deliverRepriseAlertCreationNotifications } from "@/lib/reprise-alert-delivery-worker.server";
import { createRepriseAlert } from "@/lib/reprise-alert-storage.server";
import { repriseOpportunities } from "@/lib/reprise-opportunities";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { getCanonicalBaseUrl } from "@/lib/site-url";

export const runtime = "nodejs";

type CreateRepriseAlertBody = {
  criteria?: unknown;
  email?: unknown;
  idempotencyKey?: unknown;
  website?: unknown;
};

export async function POST(request: Request) {
  try {
    const blockedHost = enforceAllowedHost(request);
    if (blockedHost) return blockedHost;
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;
    const limited = await enforceRateLimit(request, { keyPrefix: "reprise-alert", limit: 5, windowMs: 15 * 60 * 1000 });
    if (limited) return limited;

    const { data: body, response } = await readJsonBody<CreateRepriseAlertBody>(request, 10 * 1024);
    if (response) return response;
    if (normalizeText(body?.website, 160)) {
      return NextResponse.json({ ok: true, matchIds: [] }, { status: 202 });
    }

    const criteria = parseRepriseAlertCriteria(body?.criteria);
    const email = normalizeEmail(normalizeText(body?.email, 160));
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
    if (!criteria || !isValidEmail(email) || !idempotencyKey) {
      return NextResponse.json({ error: "Vérifiez les critères et votre adresse email." }, { status: 400 });
    }

    const alert = await createRepriseAlert({ criteria, email, idempotencyKey });
    const currentMatches = getRepriseAlertMatches(repriseOpportunities, criteria);
    const matchIds = currentMatches.map((opportunity) => opportunity.id);
    const notificationResults = await deliverRepriseAlertCreationNotifications({
      accessToken: alert.accessToken,
      alertId: alert.id,
      baseUrl: getCanonicalBaseUrl(request),
      criteria,
      currentMatches,
      email,
    });

    logOperationalEvent("reprise_alert.created", {
      alertId: alert.id,
      duplicate: !alert.created,
      matches: matchIds.length,
      notificationFailures: notificationResults.filter((delivery) => delivery.status === "failed").length,
    });
    return NextResponse.json({ ok: true, matchIds }, {
      status: 202,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    logOperationalError("reprise_alert.route_failed", error);
    return NextResponse.json({ error: "Impossible de créer l’alerte pour le moment." }, { status: 500 });
  }
}
