import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeIdempotencyKey, normalizeText, readJsonBody } from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";

type BusinessEstimateBody = {
  activity?: unknown; attribution?: unknown; company?: unknown; email?: unknown; employees?: unknown;
  faxNumber?: unknown; idempotencyKey?: unknown; name?: unknown; phone?: unknown; profitability?: unknown;
  recurringRevenue?: unknown; region?: unknown; revenue?: unknown; saleHorizon?: unknown; saleReason?: unknown;
  websiteOrSiren?: unknown;
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

    const activity = normalizeText(body?.activity, 200);
    const company = normalizeText(body?.company, 160);
    const email = normalizeEmail(normalizeText(body?.email, 160));
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
    const name = normalizeText(body?.name, 160);
    const revenue = normalizeText(body?.revenue, 160);
    if (!activity || !company || !name || !revenue || !isValidEmail(email) || !idempotencyKey) {
      return NextResponse.json({ error: "Merci de renseigner votre nom, votre entreprise, son activité, son chiffre d’affaires et une adresse email valide." }, { status: 400 });
    }

    const context = await resolveLeadContext({ source: "À reprendre - Première estimation", sourceUrl: request.headers.get("referer") });
    if (!context) return NextResponse.json({ error: "La page d’origine est introuvable." }, { status: 400 });

    await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: true, resend: false, slack: true },
      contact: { company, email, name, phone: normalizeText(body?.phone, 40) || null },
      context,
      emoji: "📊",
      fields: [
        { label: "Activité", value: activity },
        { label: "Région", value: normalizeText(body?.region, 120) },
        { label: "Site ou SIREN", value: normalizeText(body?.websiteOrSiren, 200) },
        { label: "Chiffre d’affaires", value: revenue },
        { label: "EBE ou résultat", value: normalizeText(body?.profitability, 160) },
        { label: "Effectif", value: normalizeText(body?.employees, 120) },
        { label: "Revenus récurrents", value: normalizeText(body?.recurringRevenue, 160) },
        { label: "Horizon de vente", value: normalizeText(body?.saleHorizon, 80) },
        { label: "Motif de la vente", value: normalizeText(body?.saleReason, 1000, { multiline: true }) },
        { label: "Livrable promis", value: "Synthèse de première estimation avec fourchette indicative et éléments à préparer" },
      ],
      idempotencyKey,
      requestType: "business_estimate_request",
      title: `Première estimation - ${company}`,
    });
    return successResponse();
  } catch (error) {
    logOperationalError("business_estimate.route.failed", error, { requestType: "business_estimate_request" });
    return NextResponse.json({ error: "Impossible d’envoyer la demande pour le moment. Merci de réessayer." }, { status: 500 });
  }
}
