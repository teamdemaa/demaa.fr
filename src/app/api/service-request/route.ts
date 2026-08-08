import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api-security";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { getPublishedServiceOfferV2BySlug } from "@/lib/service-catalog-v2";
import { enforceServiceRequestRateLimit } from "@/lib/service-request-security.server";
import { scheduleServiceSolutionDeliveries } from "@/lib/service-request-delivery-scheduler.server";
import { buildServiceRequestSnapshot } from "@/lib/service-request-snapshots.server";
import {
  createServiceRequest,
  RequestIdempotencyConflictError,
} from "@/lib/service-request-storage.server";
import { parseServiceRequestPayload } from "@/lib/service-solution-request-contract";

export const runtime = "nodejs";

const MARKETING_CONSENT_TEXT =
  "J’accepte de recevoir les conseils et actualités Demaa par e-mail.";
const MARKETING_CONSENT_VERSION = "service-requests-v1";

function response() {
  const result = NextResponse.json({ ok: true }, { status: 202 });
  result.headers.set("Cache-Control", "private, no-store, max-age=0");
  return result;
}

export async function POST(request: Request) {
  try {
    const blockedHost = enforceAllowedHost(request);
    if (blockedHost) return blockedHost;
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limitedByIp = await enforceServiceRequestRateLimit(request, {
      limit: 8,
      scope: "ip",
      windowMs: 10 * 60 * 1000,
    });
    if (limitedByIp) return limitedByIp;

    const { data, response: invalidBody } = await readJsonBody<unknown>(
      request,
      12 * 1024,
    );
    if (invalidBody) return invalidBody;

    let payload: ReturnType<typeof parseServiceRequestPayload>;
    try {
      payload = parseServiceRequestPayload(data);
    } catch {
      return NextResponse.json(
        { error: "Les informations envoyées sont invalides." },
        { status: 400 },
      );
    }

    const service = getPublishedServiceOfferV2BySlug(payload.serviceSlug);
    if (!service) {
      return NextResponse.json(
        { error: "Cette prestation n’est pas disponible." },
        { status: 404 },
      );
    }

    if (payload.systemSlug && !(await getEnterpriseBySlug(payload.systemSlug))) {
      return NextResponse.json(
        { error: "Le système sélectionné est introuvable." },
        { status: 404 },
      );
    }

    const limitedByEmail = await enforceServiceRequestRateLimit(request, {
      identity: payload.email,
      limit: 4,
      scope: "email",
      windowMs: 60 * 60 * 1000,
    });
    if (limitedByEmail) return limitedByEmail;

    const stored = await createServiceRequest({
      attribution: resolveLeadAttribution(request, payload.attribution),
      company: payload.company,
      email: payload.email,
      firstName: payload.firstName,
      fingerprintAttribution: payload.attribution,
      idempotencyKey: payload.idempotencyKey,
      marketingConsent: payload.marketingConsent
        ? {
            captured_at: new Date().toISOString(),
            granted: true,
            text: MARKETING_CONSENT_TEXT,
            version: MARKETING_CONSENT_VERSION,
          }
        : null,
      need: payload.need,
      service: buildServiceRequestSnapshot(service),
      systemSlug: payload.systemSlug,
    });

    logOperationalEvent("service_request.scheduled", {
      duplicate: !stored.created,
      requestId: stored.id,
      serviceSlug: stored.record.service.service_slug,
      systemSlug: stored.record.system_slug,
    });
    scheduleServiceSolutionDeliveries();
    return response();
  } catch (error) {
    if (error instanceof RequestIdempotencyConflictError) {
      return NextResponse.json(
        { error: "Cette clé de requête a déjà été utilisée avec d’autres informations." },
        { status: 409 },
      );
    }
    logOperationalError("service_request.route.failed", new Error("service_request_route_failed"));
    return NextResponse.json(
      { error: "La demande n’a pas pu être enregistrée. Merci de réessayer." },
      { status: 500 },
    );
  }
}
