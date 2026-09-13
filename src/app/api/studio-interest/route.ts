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

const PARTNERS_INTEREST_REQUEST_TYPE = "partners_interest_request";
const PARTNERS_INTEREST_CONSENT = {
  purpose: "partners_interest_contact",
  text: "J’accepte que Demaa utilise ces informations pour me recontacter au sujet de ce partenariat.",
  version: "partners-interest-contact-v1",
} as const;

type StudioInterestBody = {
  attribution?: unknown;
  companyActivity?: unknown;
  consent?: unknown;
  email?: unknown;
  idempotencyKey?: unknown;
  name?: unknown;
  phone?: unknown;
  problem?: unknown;
  website?: unknown;
};

function successResponse() {
  return NextResponse.json(
    { ok: true },
    {
      status: 202,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    },
  );
}

export async function POST(request: Request) {
  try {
    const blockedHost = enforceAllowedHost(request);
    if (blockedHost) return blockedHost;
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limited = await enforceRateLimit(request, {
      keyPrefix: "partners-interest",
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } = await readJsonBody<StudioInterestBody>(
      request,
      12 * 1024,
    );
    if (response) return response;

    const honeypot = normalizeText(body?.website, 200);
    if (honeypot) return successResponse();

    const companyActivity = normalizeText(body?.companyActivity, 160);
    const email = normalizeEmail(normalizeText(body?.email, 160));
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
    const name = normalizeText(body?.name, 160);
    const phone = normalizeText(body?.phone, 40);
    const problem = normalizeText(body?.problem, 4000, { multiline: true });

    if (!companyActivity || !isValidEmail(email) || !idempotencyKey || !name || !phone || !problem) {
      return NextResponse.json(
        { error: "Merci de présenter votre entreprise, puis de renseigner vos prénom et nom, votre email, votre téléphone et votre entreprise." },
        { status: 400 },
      );
    }
    if (problem.length < 20) {
      return NextResponse.json(
        { error: "Merci de présenter votre entreprise et votre projet en quelques phrases." },
        { status: 400 },
      );
    }
    if (body?.consent !== true) {
      return NextResponse.json(
        { error: "Votre accord est nécessaire pour que Demaa puisse vous recontacter." },
        { status: 400 },
      );
    }

    const context = await resolveLeadContext({
      source: "Demaa Partners - Demande de partenariat",
      sourceUrl: request.headers.get("referer"),
    });
    if (!context) {
      return NextResponse.json(
        { error: "La page d’origine est introuvable." },
        { status: 400 },
      );
    }

    const capturedAt = new Date().toISOString();
    await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: true, resend: false, slack: false },
      contact: { company: companyActivity, email, name, phone },
      consents: [{
        capturedAt,
        granted: true,
        purpose: PARTNERS_INTEREST_CONSENT.purpose,
        text: PARTNERS_INTEREST_CONSENT.text,
        version: PARTNERS_INTEREST_CONSENT.version,
      }],
      context,
      emoji: "🤝",
      fields: [
        { label: "Entreprise et projet", value: problem },
      ],
      idempotencyKey,
      requestType: PARTNERS_INTEREST_REQUEST_TYPE,
      title: `Demaa Partners - Demande de partenariat - ${companyActivity}`,
    });

    return successResponse();
  } catch (error) {
    logOperationalError("studio_interest.route.failed", error, {
      requestType: PARTNERS_INTEREST_REQUEST_TYPE,
    });
    return NextResponse.json(
      { error: "Impossible d’envoyer votre demande pour le moment. Merci de réessayer." },
      { status: 500 },
    );
  }
}
