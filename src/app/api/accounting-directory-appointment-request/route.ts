import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeIdempotencyKey,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { getAccountingFirmBySlug, getAccountingFirms } from "@/lib/accounting-directory";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { resolveLeadAttribution } from "@/lib/lead-attribution-server";
import { resolveLeadContext } from "@/lib/lead-context";
import { submitLeadRequest } from "@/lib/lead-notifications";
import { enforceSameOrigin } from "@/lib/request-guard";
import { logOperationalError } from "@/lib/operational-log";

type AppointmentRequestBody = {
  attribution?: unknown;
  company?: {
    address?: unknown;
    category?: unknown;
    activity?: unknown;
    city?: unknown;
    legalForm?: unknown;
    name?: unknown;
    postalCode?: unknown;
    siren?: unknown;
    siret?: unknown;
  };
  email?: unknown;
  firstName?: unknown;
  idempotencyKey?: unknown;
  firmSlug?: unknown;
  firmSlugs?: unknown;
  firmNames?: unknown;
  lastName?: unknown;
  message?: unknown;
  phone?: unknown;
  recommendationRequest?: unknown;
  sourceUrl?: unknown;
  systemSlug?: unknown;
  website?: unknown;
};

function isValidPhone(phone: string) {
  if (!/^\+?[0-9\s().-]+$/.test(phone)) {
    return false;
  }

  const digitCount = phone.replace(/\D/g, "").length;
  return digitCount >= 8 && digitCount <= 15;
}

export async function POST(request: Request) {
  try {
    const blockedOrigin = enforceSameOrigin(request);
    if (blockedOrigin) return blockedOrigin;

    const limited = await enforceRateLimit(request, {
      keyPrefix: "accounting-directory-appointment",
      limit: 6,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } =
      await readJsonBody<AppointmentRequestBody>(request, 24 * 1024);
    if (response) return response;

    const honeypot = normalizeText(body?.website, 200);
    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    const firmSlug = normalizeText(body?.firmSlug, 120);
    const firmSlugs = Array.isArray(body?.firmSlugs)
      ? body.firmSlugs
          .map((value) => normalizeText(value, 120))
          .filter((value): value is string => Boolean(value))
      : [];
    const email = normalizeEmail(normalizeText(body?.email, 160));
    const idempotencyKey = normalizeIdempotencyKey(body?.idempotencyKey);
    const phone = normalizeText(body?.phone, 60);
    const firstName = normalizeText(body?.firstName, 100);
    const lastName = normalizeText(body?.lastName, 100);
    const systemSlug = normalizeText(body?.systemSlug, 160);
    const sourceUrl = normalizeText(body?.sourceUrl, 500);
    const recommendationRequest = body?.recommendationRequest === true;
    const message = normalizeText(body?.message, 2000, { multiline: true });
    const companyName = normalizeText(body?.company?.name, 160);
    const companyActivity = normalizeText(body?.company?.activity, 120);
    const companySiren = normalizeText(body?.company?.siren, 30);
    const companySiret = normalizeText(body?.company?.siret, 30);
    const companyAddress = normalizeText(body?.company?.address, 220);
    const companyPostalCode = normalizeText(body?.company?.postalCode, 20);
    const companyCity = normalizeText(body?.company?.city, 120);
    const companyLegalForm = normalizeText(body?.company?.legalForm, 120);
    const companyCategory = normalizeText(body?.company?.category, 80);
    const requestedSlugs = [...new Set([firmSlug, ...firmSlugs].filter(Boolean))];

    if (recommendationRequest) {
      if (!firstName || !lastName || !email || !phone || !systemSlug) {
        return NextResponse.json(
          {
            error: "Merci de remplir vos nom, prénom, téléphone et email.",
          },
          { status: 400 },
        );
      }

      if (!isValidEmail(email)) {
        return NextResponse.json({ error: "Merci de saisir un email valide." }, { status: 400 });
      }

      if (!isValidPhone(phone)) {
        return NextResponse.json(
          { error: "Merci de saisir un numéro de téléphone valide." },
          { status: 400 },
        );
      }

      const context = await resolveLeadContext({
        systemSlug,
        source: "Kit opérationnel — Accompagnement",
        sourceUrl: request.headers.get("referer") || sourceUrl,
      });

      if (!context) {
        return NextResponse.json({ error: "Activité introuvable." }, { status: 400 });
      }

      const lead = await submitLeadRequest({
        attribution: resolveLeadAttribution(request, body?.attribution),
        channels: { email: true, resend: true, slack: true },
        contact: { email, firstName, lastName, phone },
        context,
        emoji: "📗",
        idempotencyKey,
        requestType: "accounting_recommendation",
        title: "Trouver un comptable",
      });

      return NextResponse.json({ ok: true, leadId: lead.leadId });
    }

    if (requestedSlugs.length === 0 || !companyName || !email || !phone) {
      return NextResponse.json(
        {
          error:
            "Merci de remplir les informations principales pour demander une mise en relation.",
        },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Merci de saisir un email valide." },
        { status: 400 },
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { error: "Merci de saisir un numéro de téléphone valide." },
        { status: 400 },
      );
    }

    const requestedFirms =
      requestedSlugs.length === 1
        ? [await getAccountingFirmBySlug(requestedSlugs[0])]
        : (await getAccountingFirms()).filter((firm) =>
            requestedSlugs.includes(firm.slug)
          );
    const firms = requestedFirms.filter(
      (firm): firm is NonNullable<(typeof requestedFirms)[number]> => Boolean(firm)
    );

    if (!firms.length) {
      return NextResponse.json(
        { error: "Cabinet introuvable." },
        { status: 404 }
      );
    }

    const firmNames = firms.map((firm) => firm.name).join(", ");
    const firmCities = [...new Set(firms.map((firm) => firm.city).filter(Boolean))].join(", ");

    const context = await resolveLeadContext({
      source: "Annuaire experts-comptables",
      sourceUrl: request.headers.get("referer") || sourceUrl,
    });

    if (!context) {
      return NextResponse.json({ error: "Contexte de demande invalide." }, { status: 400 });
    }

    const lead = await submitLeadRequest({
      attribution: resolveLeadAttribution(request, body?.attribution),
      channels: { email: true, resend: true, slack: true },
      contact: { company: companyName, email, phone },
      context,
      emoji: "📗",
      idempotencyKey,
      fields: [
        { label: "Cabinet(s)", value: firmNames },
        { label: "Ville(s)", value: firmCities },
        { label: "SIREN", value: companySiren },
        { label: "SIRET", value: companySiret },
        { label: "Adresse", value: companyAddress },
        { label: "Code postal", value: companyPostalCode },
        { label: "Ville entreprise", value: companyCity },
        { label: "Secteur déclaré", value: companyActivity },
        { label: "Forme juridique", value: companyLegalForm },
        { label: "Catégorie", value: companyCategory },
        { label: "Contexte", value: message },
      ],
      requestType: "accounting_directory_introduction",
      title: "Demande annuaire expert-comptable",
    });

    return NextResponse.json({ ok: true, leadId: lead.leadId });
  } catch (error) {
    logOperationalError("lead.route.failed", error, {
      requestType: "accounting_request",
    });
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant l'envoi. Merci de réessayer dans quelques minutes.",
      },
      { status: 500 }
    );
  }
}
