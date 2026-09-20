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
import { getRepriseOpportunity } from "@/lib/reprise-opportunities";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { getFormBrand, withFormSubjectBrand } from "@/lib/form-brand.server";

type RepriseInterestBody = {
  attribution?: unknown;
  company?: unknown;
  email?: unknown;
  faxNumber?: unknown;
  idempotencyKey?: unknown;
  message?: unknown;
  name?: unknown;
  opportunityId?: unknown;
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
    const limited = await enforceRateLimit(request, { keyPrefix: "reprise-interest", limit: 5, windowMs: 15 * 60 * 1000 });
    if (limited) return limited;

    const { data: body, response } = await readJsonBody<RepriseInterestBody>(request, 12 * 1024);
    if (response) return response;
    if (normalizeText(body?.faxNumber, 200)) return successResponse();

    const company = normalizeText(body?.company, 160);
    const email = normalizeEmail(normalizeText(body?.email, 160));
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
    const message = normalizeText(body?.message, 2000, { multiline: true });
    const name = normalizeText(body?.name, 160);
    const opportunityId = normalizeText(body?.opportunityId, 160);
    const phone = normalizeText(body?.phone, 40);
    const opportunity = getRepriseOpportunity(opportunityId);

    if (!message || !name || !isValidEmail(email) || !phone || !company || !idempotencyKey || !opportunity) {
      return NextResponse.json({ error: "Merci de présenter brièvement votre projet, puis de renseigner vos prénom et nom, votre email, votre téléphone et votre entreprise." }, { status: 400 });
    }

    const brand = getFormBrand(request);
    const context = await resolveLeadContext({
      source: `${brand === "sini" ? "sini" : "À reprendre"} - ${opportunity.activity}`,
      sourceUrl: request.headers.get("referer"),
    });
    if (!context) return NextResponse.json({ error: "L’opportunité est introuvable." }, { status: 400 });

    await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: true, resend: false, slack: false },
      contact: { company, email, name, phone },
      context,
      emoji: "🤝",
      fields: [
        { label: "Référence publique", value: opportunity.id },
        { label: "Activité", value: opportunity.activity },
        { label: "Localisation", value: opportunity.location },
        { label: "Entreprise du repreneur", value: company },
        { label: "Projet du repreneur", value: message },
        { label: "Traitement attendu", value: "Recontacter le repreneur, puis transmettre la demande au contact source" },
      ],
      idempotencyKey,
      notificationEmail: brand === "sini" ? "team@demaa.fr" : undefined,
      requestType: "reprise_interest",
      title: withFormSubjectBrand(brand, `Demande de mise en relation - ${opportunity.activity}`),
    });

    return successResponse();
  } catch (error) {
    logOperationalError("reprise_interest.route.failed", error, { requestType: "reprise_interest" });
    return NextResponse.json({ error: "Impossible d’envoyer la demande pour le moment. Merci de réessayer." }, { status: 500 });
  }
}
