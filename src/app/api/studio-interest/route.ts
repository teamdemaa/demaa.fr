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

const STUDIO_INTEREST_REQUEST_TYPE = "studio_interest_request";
const STUDIO_INTEREST_CONSENT = {
  purpose: "studio_interest_contact",
  text: "J’accepte que Demaa utilise ces informations pour me recontacter au sujet de ce besoin métier.",
  version: "studio-interest-contact-v1",
} as const;

type StudioInterestBody = {
  attribution?: unknown;
  companyActivity?: unknown;
  consent?: unknown;
  currentSolution?: unknown;
  email?: unknown;
  idempotencyKey?: unknown;
  marketEvidence?: unknown;
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
      keyPrefix: "studio-interest",
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
    const currentSolution = normalizeText(body?.currentSolution, 1500, { multiline: true });
    const email = normalizeEmail(normalizeText(body?.email, 160));
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
    const marketEvidence = normalizeText(body?.marketEvidence, 1500, { multiline: true });
    const problem = normalizeText(body?.problem, 4000, { multiline: true });

    if (!companyActivity || !isValidEmail(email) || !idempotencyKey || !problem) {
      return NextResponse.json(
        { error: "Merci de renseigner votre entreprise, votre adresse e-mail et le besoin métier." },
        { status: 400 },
      );
    }
    if (problem.length < 20) {
      return NextResponse.json(
        { error: "Merci de décrire le besoin métier en quelques phrases." },
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
      source: "Demaa Studio - Besoin métier",
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
      channels: { email: false, resend: false, slack: true },
      contact: { company: companyActivity, email },
      consents: [{
        capturedAt,
        granted: true,
        purpose: STUDIO_INTEREST_CONSENT.purpose,
        text: STUDIO_INTEREST_CONSENT.text,
        version: STUDIO_INTEREST_CONSENT.version,
      }],
      context,
      emoji: "💡",
      fields: [
        { label: "Besoin métier", value: problem },
        { label: "Gestion actuelle", value: currentSolution || "Non précisée" },
        { label: "Besoin partagé dans le secteur", value: marketEvidence || "Non précisé" },
      ],
      idempotencyKey,
      requestType: STUDIO_INTEREST_REQUEST_TYPE,
      title: "Demaa Studio - Nouveau besoin métier",
    });

    return successResponse();
  } catch (error) {
    logOperationalError("studio_interest.route.failed", error, {
      requestType: STUDIO_INTEREST_REQUEST_TYPE,
    });
    return NextResponse.json(
      { error: "Impossible d’envoyer votre demande pour le moment. Merci de réessayer." },
      { status: 500 },
    );
  }
}
