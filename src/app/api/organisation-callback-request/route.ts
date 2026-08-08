import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

type OrganisationCallbackRequestBody = {
  attribution?: unknown;
  email?: unknown;
  firstName?: unknown;
  idempotencyKey?: unknown;
  need?: unknown;
  phone?: unknown;
  source?: unknown;
  systemSlug?: unknown;
  website?: unknown;
};

function isValidPhone(phone: string) {
  if (!/^\+?[0-9\s().-]+$/.test(phone)) return false;
  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= 8 && digitCount <= 15;
}

function successResponse() {
  return NextResponse.json(
    { ok: true },
    { status: 202, headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
}

export async function POST(request: Request) {
  try {
    const blockedHost = enforceAllowedHost(request);
    if (blockedHost) return blockedHost;
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limited = await enforceRateLimit(request, {
      keyPrefix: "organisation-callback-request",
      limit: 8,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } = await readJsonBody<OrganisationCallbackRequestBody>(
      request,
      8 * 1024,
    );
    if (response) return response;

    const website = normalizeText(body?.website, 200);
    if (website) return successResponse();

    const firstName = normalizeText(body?.firstName, 80);
    const phone = normalizeText(body?.phone, 60);
    const email = normalizeEmail(normalizeText(body?.email, 160));
    const need = normalizeText(body?.need, 1200, { multiline: true });
    const systemSlug = normalizeText(body?.systemSlug, 160);
    const source = normalizeText(body?.source, 160);
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);

    if (!firstName || !phone || !email || !need || !systemSlug) {
      return NextResponse.json(
        { error: "Merci de renseigner vos coordonnées et ce que vous souhaitez améliorer." },
        { status: 400 },
      );
    }
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Merci de saisir un numéro de téléphone valide." },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Merci de renseigner une adresse e-mail valide." },
        { status: 400 },
      );
    }

    const context = await resolveLeadContext({
      source: source || "Système métier - Demande de rappel",
      sourceUrl: request.headers.get("referer"),
      systemSlug,
    });
    if (!context) {
      return NextResponse.json(
        { error: "Le système d’origine est introuvable." },
        { status: 400 },
      );
    }

    await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: true, resend: false, slack: true },
      contact: { email, name: firstName, phone },
      context,
      emoji: "📞",
      fields: [{ label: "Besoin à clarifier", value: need }],
      idempotencyKey,
      requestType: "organisation_callback_request",
      title: "Demande de rappel - Organisation",
    });

    return successResponse();
  } catch (error) {
    logOperationalError("organisation_callback_request.route.failed", error, {
      requestType: "organisation_callback_request",
    });
    return NextResponse.json(
      { error: "Impossible d’envoyer votre demande pour le moment. Merci de réessayer." },
      { status: 500 },
    );
  }
}
