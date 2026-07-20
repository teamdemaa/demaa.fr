import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { getDemaaServiceBySlug } from "@/lib/service-catalog";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";

type ServiceIntroductionRequestBody = {
  company?: unknown;
  details?: unknown;
  email?: unknown;
  name?: unknown;
  phone?: unknown;
  serviceName?: unknown;
  serviceSlug?: unknown;
  source?: unknown;
  sourceUrl?: unknown;
  systemSlug?: unknown;
};

function isValidPhone(phone: string) {
  if (!/^\+?[0-9\s().-]+$/.test(phone)) return false;
  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= 8 && digitCount <= 15;
}

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, {
      keyPrefix: "service-introduction",
      limit: 8,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } =
      await readJsonBody<ServiceIntroductionRequestBody>(request);
    if (response) return response;

    const name = normalizeText(body?.name, 120);
    const phone = normalizeText(body?.phone, 60);
    const email = normalizeEmail(normalizeText(body?.email, 160));
    const company = normalizeText(body?.company, 120);
    const details = normalizeText(body?.details, 1500, { multiline: true });
    const source = normalizeText(body?.source, 120);
    const sourceUrl = normalizeText(body?.sourceUrl, 500);
    const systemSlug = normalizeText(body?.systemSlug, 160);
    const serviceSlug = normalizeText(body?.serviceSlug, 120);
    const requestedServiceName = normalizeText(body?.serviceName, 160);
    const service = serviceSlug ? getDemaaServiceBySlug(serviceSlug) : null;
    const serviceName = service?.name ?? requestedServiceName;

    if (!name || !phone || !serviceName) {
      return NextResponse.json(
        { error: "Merci d'indiquer votre nom, votre téléphone et le service demandé." },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Merci de saisir un numéro de téléphone valide." }, { status: 400 });
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ error: "Merci de saisir un email valide." }, { status: 400 });
    }

    const context = await resolveLeadContext({
      systemSlug,
      source: source || "Service modal",
      sourceUrl,
    });

    if (!context) {
      return NextResponse.json({ error: "Le kit d’origine est introuvable." }, { status: 400 });
    }

    const lead = await submitLeadRequest({
      channels: { email: true, resend: Boolean(email), slack: true },
      contact: { company, email, name, phone },
      context,
      emoji: "🤝",
      fields: [
        { label: "Service", value: serviceName },
        { label: "Besoin", value: details },
      ],
      requestType: "service_introduction",
      title: `Demande d’accompagnement — ${serviceName}`,
    });

    return NextResponse.json({ ok: true, leadId: lead.leadId });
  } catch (error) {
    console.error("Service introduction request error →", error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant l'envoi. Merci de réessayer dans quelques minutes.",
      },
      { status: 500 }
    );
  }
}
