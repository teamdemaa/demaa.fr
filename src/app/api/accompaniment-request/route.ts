import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeIdempotencyKey, normalizeText, readJsonBody } from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { logOperationalError } from "@/lib/operational-log";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { getFormBrand, withFormSubjectBrand } from "@/lib/form-brand.server";

type AccompanimentRequestBody = { attribution?: unknown; company?: unknown; email?: unknown; faxNumber?: unknown; idempotencyKey?: unknown; message?: unknown; name?: unknown; phone?: unknown };

function successResponse() {
  return NextResponse.json({ ok: true }, { status: 202, headers: { "Cache-Control": "private, no-store, max-age=0" } });
}

export async function POST(request: Request) {
  try {
    const blockedHost = enforceAllowedHost(request);
    if (blockedHost) return blockedHost;
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;
    const limited = await enforceRateLimit(request, { keyPrefix: "accompaniment-request", limit: 4, windowMs: 30 * 60 * 1000 });
    if (limited) return limited;
    const { data: body, response } = await readJsonBody<AccompanimentRequestBody>(request, 12 * 1024);
    if (response) return response;
    if (normalizeText(body?.faxNumber, 200)) return successResponse();

    const company = normalizeText(body?.company, 160);
    const email = normalizeEmail(normalizeText(body?.email, 160));
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
    const message = normalizeText(body?.message, 1200, { multiline: true });
    const name = normalizeText(body?.name, 160);
    const phone = normalizeText(body?.phone, 40);
    if (!message || !name || !isValidEmail(email) || !phone || !company || !idempotencyKey) return NextResponse.json({ error: "Merci de décrire votre priorité, puis de renseigner vos prénom et nom, votre email, votre téléphone et votre entreprise." }, { status: 400 });

    const brand = getFormBrand(request);
    const context = await resolveLeadContext({ source: brand === "sini" ? "sini - Transmission" : "Demaa - Transmission", sourceUrl: request.headers.get("referer") });
    if (!context) return NextResponse.json({ error: "La page d’origine est introuvable." }, { status: 400 });
    await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: true, resend: false, slack: false },
      contact: { company, email, name, phone },
      context,
      emoji: "⚙️",
      fields: [{ label: "Priorité décrite", value: message }, { label: "Préparation", value: "Structuration du fonctionnement prioritaire avant transmission" }],
      idempotencyKey,
      notificationEmail: brand === "sini" ? "team@demaa.fr" : undefined,
      requestType: "accompaniment_request",
      title: withFormSubjectBrand(brand, `Préparation à la transmission - ${company}`),
    });
    return successResponse();
  } catch (error) {
    logOperationalError("accompaniment_request.route.failed", error, { requestType: "accompaniment_request" });
    return NextResponse.json({ error: "Impossible d’envoyer la demande pour le moment. Merci de réessayer." }, { status: 500 });
  }
}
