import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { deliverSolutionReferralNotifications } from "@/lib/service-request-notifications.server";
import { createSolutionReferral } from "@/lib/service-request-storage.server";
import { parseSolutionReferralPayload } from "@/lib/service-solution-request-contract";
import { getSolutionReferralDisclosure } from "@/lib/solution-referral-disclosures.server";
import {
  getPublishedSolutionPlacementsForSystem,
  getPublishedSolutionResourceBySlug,
} from "@/lib/solution-registry.server";

export const runtime = "nodejs";

const MARKETING_CONSENT_TEXT =
  "J’accepte de recevoir les conseils et actualités Demaa par e-mail.";
const MARKETING_CONSENT_VERSION = "solution-referrals-v1";

function emailRateLimitKey(email: string) {
  return createHash("sha256").update(email).digest("hex");
}

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

    const limitedByIp = await enforceRateLimit(request, {
      keyPrefix: "solution-referral-ip",
      limit: 8,
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

    const limitedByEmail = await enforceRateLimit(
      request,
      {
        keyPrefix: "solution-referral-email",
        limit: 4,
        windowMs: 60 * 60 * 1000,
      },
      emailRateLimitKey(payload.email),
    );
    if (limitedByEmail) return limitedByEmail;

    const resource = getPublishedSolutionResourceBySlug(payload.resourceSlug);
    const placement = getPublishedSolutionPlacementsForSystem(payload.systemSlug)
      .find((candidate) => candidate.resource.resourceSlug === payload.resourceSlug);
    const disclosure = getSolutionReferralDisclosure(payload.resourceSlug);
    if (
      !resource
      || !placement
      || !disclosure
      || resource.interaction.interactionMode !== "referral_form"
      || placement.resource.interaction.interactionMode !== "referral_form"
      || resource.commercialRelationship === "owned"
    ) {
      return NextResponse.json(
        { error: "Cette mise en relation n’est pas disponible." },
        { status: 404 },
      );
    }

    const stored = await createSolutionReferral({
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
      solution: {
        billing_party: disclosure.billingParty,
        commercial_relationship: resource.commercialRelationship,
        contracting_party: disclosure.contractingParty,
        placement_id: placement.placementId,
        placement_version: placement.placementVersion,
        resource_name: resource.name,
        resource_slug: resource.resourceSlug,
        resource_version: resource.resourceVersion,
        section: placement.section,
        transparency: disclosure.transparency,
      },
      systemSlug: payload.systemSlug,
    });

    await deliverSolutionReferralNotifications({
      record: stored.record,
      requestId: stored.id,
    });
    logOperationalEvent("solution_referral.accepted", {
      duplicate: !stored.created,
      requestId: stored.id,
      resourceSlug: stored.record.solution.resource_slug,
      systemSlug: stored.record.system_slug,
    });
    return response();
  } catch (error) {
    logOperationalError("solution_referral.route.failed", error);
    return NextResponse.json(
      { error: "La demande n’a pas pu être enregistrée. Merci de réessayer." },
      { status: 500 },
    );
  }
}
