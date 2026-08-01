import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { getPublishedServiceOfferV2BySlug } from "@/lib/service-catalog-v2";
import { deliverServiceRequestNotifications } from "@/lib/service-request-notifications.server";
import { createServiceRequest } from "@/lib/service-request-storage.server";
import { parseServiceRequestPayload } from "@/lib/service-solution-request-contract";

export const runtime = "nodejs";

const MARKETING_CONSENT_TEXT =
  "J’accepte de recevoir les conseils et actualités Demaa par e-mail.";
const MARKETING_CONSENT_VERSION = "service-requests-v1";

function emailRateLimitKey(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

function response(status = 202) {
  const result = NextResponse.json({ ok: true }, { status });
  result.headers.set("Cache-Control", "private, no-store, max-age=0");
  return result;
}

export async function POST(request: Request) {
  try {
    const blockedHost = enforceAllowedHost(request);
    if (blockedHost) return blockedHost;
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limitedByIp = await enforceRateLimit(request, {
      keyPrefix: "service-request-ip",
      limit: 8,
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

    const limitedByEmail = await enforceRateLimit(
      request,
      {
        keyPrefix: "service-request-email",
        limit: 4,
        windowMs: 60 * 60 * 1000,
      },
      emailRateLimitKey(payload.email),
    );
    if (limitedByEmail) return limitedByEmail;

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

    const operator = service.operatorType === "demaa" ? "Demaa" : "ODEMA";
    const stored = await createServiceRequest({
      attribution: resolveLeadAttribution(request, payload.attribution),
      company: payload.company,
      email: payload.email,
      firstName: payload.firstName,
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
      service: {
        billing_party: operator,
        contracting_party: operator,
        offer_version: service.offerVersion,
        operator_type: service.operatorType,
        pricing: service.pricing,
        service_name: service.title,
        service_slug: service.slug,
        transparency: `La prestation est contractée et facturée par ${operator}.`,
      },
      systemSlug: payload.systemSlug,
    });

    await deliverServiceRequestNotifications({
      record: stored.record,
      requestId: stored.id,
    });
    logOperationalEvent("service_request.accepted", {
      duplicate: !stored.created,
      requestId: stored.id,
      serviceSlug: stored.record.service.service_slug,
      systemSlug: stored.record.system_slug,
    });
    return response();
  } catch (error) {
    logOperationalError("service_request.route.failed", error);
    return NextResponse.json(
      { error: "La demande n’a pas pu être enregistrée. Merci de réessayer." },
      { status: 500 },
    );
  }
}
