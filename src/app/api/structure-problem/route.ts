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
import {
  STRUCTURE_PROBLEM_REQUEST_TYPE,
  STRUCTURE_PUBLICATION_CONSENT,
} from "@/lib/structure-newsletter-contract";

type StructureProblemBody = {
  attribution?: unknown;
  companyActivity?: unknown;
  consent?: unknown;
  email?: unknown;
  faxNumber?: unknown;
  idempotencyKey?: unknown;
  problem?: unknown;
  professionalPage?: unknown;
  voice?: unknown;
};

function normalizeProfessionalPage(value: unknown) {
  const rawValue = normalizeText(value, 500);
  if (!rawValue) return "";

  try {
    const url = new URL(rawValue);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    url.hash = "";
    return url.toString().slice(0, 500);
  } catch {
    return "";
  }
}

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
      keyPrefix: "structure-problem",
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } = await readJsonBody<StructureProblemBody>(
      request,
      12 * 1024,
    );
    if (response) return response;

    const honeypot = normalizeText(body?.faxNumber, 200);
    if (honeypot) return successResponse();

    const companyActivity = normalizeText(body?.companyActivity, 160);
    const email = normalizeEmail(normalizeText(body?.email, 160));
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
    const problem = normalizeText(body?.problem, 4000, { multiline: true });
    const professionalPage = normalizeProfessionalPage(body?.professionalPage);
    const consentGranted = body?.consent === true;

    if (
      !companyActivity ||
      !email ||
      !idempotencyKey ||
      !problem ||
      !professionalPage
    ) {
      return NextResponse.json(
        { error: "Merci de renseigner votre entreprise, votre site, votre problématique et votre adresse e-mail." },
        { status: 400 },
      );
    }
    if (problem.length < 20) {
      return NextResponse.json(
        { error: "Merci de décrire votre problématique en quelques phrases." },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Merci de renseigner une adresse e-mail valide." },
        { status: 400 },
      );
    }
    if (!consentGranted) {
      return NextResponse.json(
        { error: "Votre accord est nécessaire pour proposer ce cas à Structure." },
        { status: 400 },
      );
    }
    if (body?.voice != null) {
      return NextResponse.json(
        { error: "Le message vocal n’est pas encore disponible." },
        { status: 400 },
      );
    }

    const context = await resolveLeadContext({
      source: "Newsletter Structure - Proposition de problématique",
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
        purpose: STRUCTURE_PUBLICATION_CONSENT.purpose,
        text: STRUCTURE_PUBLICATION_CONSENT.text,
        version: STRUCTURE_PUBLICATION_CONSENT.version,
      }],
      context,
      emoji: "🧭",
      fields: [
        { label: "Site ou page professionnelle", value: professionalPage },
        { label: "Problématique", value: problem },
        { label: "Publication autorisée", value: "Oui, après contact préalable" },
        { label: "Traitement garanti", value: "Non" },
      ],
      idempotencyKey,
      requestType: STRUCTURE_PROBLEM_REQUEST_TYPE,
      title: "Proposition de problématique - Structure",
    });

    return successResponse();
  } catch (error) {
    logOperationalError("structure_problem.route.failed", error, {
      requestType: STRUCTURE_PROBLEM_REQUEST_TYPE,
    });
    return NextResponse.json(
      { error: "Impossible d’envoyer votre problématique pour le moment. Merci de réessayer." },
      { status: 500 },
    );
  }
}
