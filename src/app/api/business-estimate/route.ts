import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeIdempotencyKey, normalizeText, readJsonBody } from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

type BusinessEstimateBody = {
  attribution?: unknown;
  company?: unknown;
  email?: unknown;
  faxNumber?: unknown;
  idempotencyKey?: unknown;
  message?: unknown;
  name?: unknown;
  phone?: unknown;
};

function successResponse() {
  return NextResponse.json({ ok: true }, { status: 202, headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function POST(request: Request) {
  try {
    const blockedHost = enforceAllowedHost(request);
    if (blockedHost) return blockedHost;
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;
    const limited = await enforceRateLimit(request, { keyPrefix: "business-estimate", limit: 4, windowMs: 30 * 60 * 1000 });
    if (limited) return limited;
    const { data: body, response } = await readJsonBody<BusinessEstimateBody>(request, 12 * 1024);
    if (response) return response;
    if (normalizeText(body?.faxNumber, 200)) return successResponse();

    const company = normalizeText(body?.company, 160);
    const email = normalizeEmail(normalizeText(body?.email, 160));
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
    const message = normalizeText(body?.message, 1000, { multiline: true });
    const name = normalizeText(body?.name, 160);
    if (!name || !isValidEmail(email) || !idempotencyKey) {
      return NextResponse.json({ error: "Merci de renseigner vos prénom et nom ainsi qu’une adresse email valide." }, { status: 400 });
    }

    const context = await resolveLeadContext({ source: "Demaa - Première estimation", sourceUrl: request.headers.get("referer") });
    if (!context) return NextResponse.json({ error: "La page d’origine est introuvable." }, { status: 400 });

    await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: true, resend: false, slack: true },
      contact: { company: company || null, email, name, phone: normalizeText(body?.phone, 40) || null },
      context,
      emoji: "📊",
      fields: [
        { label: "Entreprise", value: company || "Non précisée" },
        { label: "Sujet à aborder", value: message || "À préciser pendant l’entretien" },
        { label: "Livrable promis", value: "Synthèse de première estimation avec fourchette indicative et éléments à préparer" },
      ],
      idempotencyKey,
      requestType: "business_estimate_request",
      title: `Première estimation - ${company || name}`,
    });
    return successResponse();
  } catch (error) {
    logOperationalError("business_estimate.route.failed", error, { requestType: "business_estimate_request" });
    return NextResponse.json({ error: "Impossible d’envoyer la demande pour le moment. Merci de réessayer." }, { status: 500 });
  }
}
