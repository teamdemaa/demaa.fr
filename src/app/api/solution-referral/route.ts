import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/api-security";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { enforceServiceRequestRateLimit } from "@/lib/service-request-security.server";
import { scheduleServiceSolutionDeliveries } from "@/lib/service-request-delivery-scheduler.server";
import { buildSolutionReferralSnapshot } from "@/lib/service-request-snapshots.server";
import {
  createSolutionReferral,
  RequestIdempotencyConflictError,
} from "@/lib/service-request-storage.server";
import { parseSolutionReferralPayload } from "@/lib/service-solution-request-contract";
import { getSolutionReferralDisclosure } from "@/lib/solution-referral-disclosures.server";
import { getExpertiseReferralDisclosure } from "@/lib/solution-referral-disclosures.server";
import { getExpertiseReferralContext } from "@/lib/expertise-solutions.server";
import {
  getPublishedSolutionPlacementsForSystem,
  getPublishedSolutionResourceBySlug,
} from "@/lib/solution-registry.server";

export const runtime = "nodejs";

const MARKETING_CONSENT_TEXT =
  "J’accepte de recevoir les conseils et actualités Demaa par e-mail.";
const MARKETING_CONSENT_VERSION = "solution-referrals-v1";

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

    let payload: ReturnType<typeof parseSolutionReferralPayload>;
    try {
      payload = parseSolutionReferralPayload(data);
    } catch {
      return NextResponse.json(
        { error: "Les informations envoyées sont invalides." },
        { status: 400 },
      );
    }

    let resource = getPublishedSolutionResourceBySlug(payload.resourceSlug);
    let placement = getPublishedSolutionPlacementsForSystem(payload.systemSlug)
      .find((candidate) => candidate.resource.resourceSlug === payload.resourceSlug);
    let disclosure = placement && resource
      ? getSolutionReferralDisclosure({
          commercialRelationship: resource.commercialRelationship,
          placementId: placement.placementId,
          resourceSlug: resource.resourceSlug,
        })
      : null;
    if (!resource || !placement || !disclosure) {
      const expertise = await getExpertiseReferralContext(
        payload.systemSlug,
        payload.resourceSlug,
      );
      if (expertise) {
        resource = expertise.resource;
        placement = expertise.placement;
        disclosure = getExpertiseReferralDisclosure({
          placementId: placement.placementId,
          resourceSlug: resource.resourceSlug,
        });
      }
    }
    if (
      !resource
      || !placement
      || !disclosure
      || resource.interaction.interactionMode !== "referral_form"
      || placement.resource.interaction.interactionMode !== "referral_form"
      || resource.commercialRelationship === "owned"
      || placement.resource.commercialRelationship !== resource.commercialRelationship
    ) {
      return NextResponse.json(
        { error: "Cette mise en relation n’est pas disponible." },
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

    const stored = await createSolutionReferral({
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
      solution: buildSolutionReferralSnapshot({ disclosure, placement, resource }),
      systemSlug: payload.systemSlug,
    });

    logOperationalEvent("solution_referral.scheduled", {
      duplicate: !stored.created,
      requestId: stored.id,
      resourceSlug: stored.record.solution.resource_slug,
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
    logOperationalError("solution_referral.route.failed", new Error("solution_referral_route_failed"));
    return NextResponse.json(
      { error: "La demande n’a pas pu être enregistrée. Merci de réessayer." },
      { status: 500 },
    );
  }
}
