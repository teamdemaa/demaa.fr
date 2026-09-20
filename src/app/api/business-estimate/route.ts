import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeIdempotencyKey, normalizeText, readJsonBody } from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { calculateBusinessValuation, normalizeBusinessValuationInput, type BusinessValuationResult } from "@/lib/business-valuation";

type BusinessEstimateBody = {
  attribution?: unknown;
  company?: unknown;
  email?: unknown;
  faxNumber?: unknown;
  idempotencyKey?: unknown;
  message?: unknown;
  name?: unknown;
  phone?: unknown;
  valuationInput?: unknown;
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
    const phone = normalizeText(body?.phone, 40);
    const valuationInput = body?.valuationInput === undefined ? null : normalizeBusinessValuationInput(body.valuationInput);
    if (body?.valuationInput !== undefined && !valuationInput) {
      return NextResponse.json({ error: "L’estimation jointe est invalide. Merci de la recalculer." }, { status: 400 });
    }
    if (!message || !name || !isValidEmail(email) || !phone || !company || !idempotencyKey) {
      return NextResponse.json({ error: "Merci de présenter brièvement votre entreprise, puis de renseigner vos prénom et nom, votre email, votre téléphone et le nom de votre entreprise." }, { status: 400 });
    }

    let valuation: BusinessValuationResult | null = null;
    try {
      valuation = valuationInput ? calculateBusinessValuation(valuationInput) : null;
    } catch {
      return NextResponse.json({ error: "L’estimation jointe est incomplète. Merci de la recalculer." }, { status: 400 });
    }
    const context = await resolveLeadContext({ source: "sini - Projet de vente", sourceUrl: request.headers.get("referer") });
    if (!context) return NextResponse.json({ error: "La page d’origine est introuvable." }, { status: 400 });

    await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: true, resend: false, slack: false },
      contact: { company, email, name, phone },
      context,
      emoji: "🏢",
      fields: [
        { label: "Entreprise", value: company },
        { label: "Projet de vente", value: message },
        ...(valuation ? [
          { label: "Activité retenue pour l’estimation", value: valuation.activityLabel },
          { label: "Méthode de valorisation", value: valuation.methodLabel },
          { label: "Fourchette indicative recalculée", value: `${formatCurrency(valuation.low)} à ${formatCurrency(valuation.high)} (centre ${formatCurrency(valuation.central)})` },
        ] : []),
      ],
      idempotencyKey,
      requestType: "business_sale_request",
      title: `Projet de vente - ${company}`,
    });
    return successResponse();
  } catch (error) {
    logOperationalError("business_sale.route.failed", error, { requestType: "business_sale_request" });
    return NextResponse.json({ error: "Impossible d’envoyer la demande pour le moment. Merci de réessayer." }, { status: 500 });
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}
