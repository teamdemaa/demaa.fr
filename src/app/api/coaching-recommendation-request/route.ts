import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { normalizeText, readJsonBody } from "@/lib/api-security";
import { requestCoachingRecommendation } from "@/lib/coaching-conversation.server";
import { requireCurrentCustomerIdentity } from "@/lib/customer-space-session.server";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { enforceServiceRequestRateLimit } from "@/lib/service-request-security.server";

export const runtime = "nodejs";

type RequestBody = {
  attribution?: unknown;
  company?: unknown;
  phone?: unknown;
  recommendationId?: unknown;
  website?: unknown;
};

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  Vary: "Cookie",
} as const;

function isValidPhone(phone: string) {
  return /^\+?[0-9\s().-]+$/.test(phone)
    && phone.replace(/\D/g, "").length >= 8
    && phone.replace(/\D/g, "").length <= 15;
}

export async function POST(request: Request) {
  try {
    const blockedHost = enforceAllowedHost(request);
    if (blockedHost) return blockedHost;
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const customer = await requireCurrentCustomerIdentity();
    if (customer.response) return customer.response;

    const limited = await enforceServiceRequestRateLimit(request, {
      identity: customer.identity.uid,
      limit: 6,
      scope: "email",
      windowMs: 60 * 60 * 1000,
    });
    if (limited) return limited;

    const { data, response } = await readJsonBody<RequestBody>(request, 8 * 1024);
    if (response) return response;
    if (normalizeText(data?.website, 200)) {
      return NextResponse.json({ ok: true }, { status: 202, headers: PRIVATE_NO_STORE_HEADERS });
    }

    const company = normalizeText(data?.company, 160);
    const phone = normalizeText(data?.phone, 60);
    const recommendationId = normalizeText(data?.recommendationId, 100);
    if (!company || !isValidPhone(phone) || !/^[a-f0-9-]{20,100}$/i.test(recommendationId)) {
      return NextResponse.json(
        { error: "Indiquez une entreprise et un numéro WhatsApp valides." },
        { status: 400, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const result = await requestCoachingRecommendation({
      recommendationId,
      uid: customer.identity.uid,
    });
    if (!result) {
      return NextResponse.json(
        { error: "Cette recommandation est introuvable." },
        { status: 404, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }
    if (!result.available) {
      return NextResponse.json(
        { error: "Cette mise en relation n’est plus disponible." },
        { status: 409, headers: PRIVATE_NO_STORE_HEADERS },
      );
    }

    const context = await resolveLeadContext({
      source: `Clarification - ${result.recommendation.name}`,
      sourceUrl: request.headers.get("referer"),
    });
    if (!context) {
      throw new Error("Unable to resolve recommendation lead context.");
    }
    const idempotencyKey = createHash("sha256")
      .update(`coaching-recommendation:${customer.identity.uid}:${recommendationId}`)
      .digest("hex");
    await submitLeadRequest({
      attribution: resolveLeadAttribution(request, data?.attribution),
      channels: { email: false, resend: false, slack: true },
      contact: { company, email: customer.identity.email, phone },
      context,
      emoji: "🤝",
      fields: [
        { label: "Prestation recommandée", value: result.recommendation.name },
        ...(result.recommendation.needLabel
          ? [{ label: "Besoin", value: result.recommendation.needLabel }]
          : []),
        { label: "Numéro WhatsApp", value: phone },
        { label: "Identifiant de recommandation", value: recommendationId },
      ],
      idempotencyKey,
      requestType: "coaching_recommendation_introduction",
      title: `Demande de mise en relation - ${result.recommendation.name}`,
    });
    logOperationalEvent("coaching.recommendation_requested", {
      created: result.created,
      recommendationId,
    });
    return NextResponse.json(
      { ok: true, recommendation: result.recommendation },
      { status: 202, headers: PRIVATE_NO_STORE_HEADERS },
    );
  } catch (error) {
    logOperationalError("coaching.recommendation_request_failed", error);
    return NextResponse.json(
      { error: "La demande n’a pas pu être envoyée. Merci de réessayer." },
      { status: 500, headers: PRIVATE_NO_STORE_HEADERS },
    );
  }
}
