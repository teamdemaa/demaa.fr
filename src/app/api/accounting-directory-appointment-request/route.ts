import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  escapeSlackMrkdwn,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { getAccountingFirmBySlug, getAccountingFirms } from "@/lib/accounting-directory";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { sendSlackMessage, SlackMessageError } from "@/lib/slack";

type AppointmentRequestBody = {
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
  firmSlug?: unknown;
  firmSlugs?: unknown;
  firmNames?: unknown;
  lastName?: unknown;
  message?: unknown;
  phone?: unknown;
  recommendationRequest?: unknown;
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
    const limited = enforceRateLimit(request, {
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
    const phone = normalizeText(body?.phone, 60);
    const firstName = normalizeText(body?.firstName, 100);
    const lastName = normalizeText(body?.lastName, 100);
    const systemSlug = normalizeText(body?.systemSlug, 160);
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

      const enterprise = await getEnterpriseBySlug(systemSlug);

      if (!enterprise) {
        return NextResponse.json({ error: "Activité introuvable." }, { status: 400 });
      }

      await sendSlackMessage({
        text: "📗 Nouvelle demande de recommandation expert-comptable",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                `*Nom* : ${escapeSlackMrkdwn(lastName)}\n` +
                `*Prénom* : ${escapeSlackMrkdwn(firstName)}\n` +
                `*Téléphone* : ${escapeSlackMrkdwn(phone)}\n` +
                `*Email* : ${escapeSlackMrkdwn(email)}\n` +
                `*Activité / kit* : ${escapeSlackMrkdwn(enterprise.name)}\n` +
                `*Slug du kit* : ${escapeSlackMrkdwn(systemSlug)}\n` +
                `*Secteur automatique* : ${escapeSlackMrkdwn(enterprise.sectorLabel)}`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `⏰ ${new Date().toLocaleString("fr-FR", {
                  timeZone: "Europe/Paris",
                })}`,
              },
            ],
          },
        ],
      });

      return NextResponse.json({ ok: true });
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

    const payload = {
      text: "📗 Nouvelle demande annuaire expert-comptable",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `*Cabinet(s)* : ${escapeSlackMrkdwn(firmNames)}\n` +
              `*Ville(s)* : ${escapeSlackMrkdwn(firmCities || "_non renseigné_")}\n` +
              `*Téléphone / WhatsApp* : ${escapeSlackMrkdwn(phone)}\n` +
              `*Email* : ${escapeSlackMrkdwn(email)}\n` +
              `*Entreprise* : ${escapeSlackMrkdwn(companyName)}\n` +
              `*SIREN* : ${escapeSlackMrkdwn(companySiren || "_non renseigné_")}\n` +
              `*SIRET* : ${escapeSlackMrkdwn(companySiret || "_non renseigné_")}\n` +
              `*Adresse* : ${escapeSlackMrkdwn(companyAddress || "_non renseigné_")}\n` +
              `*Code postal* : ${escapeSlackMrkdwn(companyPostalCode || "_non renseigné_")}\n` +
              `*Ville entreprise* : ${escapeSlackMrkdwn(companyCity || "_non renseigné_")}\n` +
              `*Secteur d'activité* : ${escapeSlackMrkdwn(companyActivity || "_non renseigné_")}\n` +
              `*Forme juridique* : ${escapeSlackMrkdwn(companyLegalForm || "_non renseigné_")}\n` +
              `*Catégorie* : ${escapeSlackMrkdwn(companyCategory || "_non renseigné_")}\n` +
              `*Contexte* : ${escapeSlackMrkdwn(message || "_non renseigné_")}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `⏰ ${new Date().toLocaleString("fr-FR", {
                timeZone: "Europe/Paris",
              })}`,
            },
          ],
        },
      ],
    };

    await sendSlackMessage(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Accounting directory appointment request error →", error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant l'envoi. Merci de réessayer dans quelques minutes.",
      },
      { status: error instanceof SlackMessageError ? error.statusCode : 500 }
    );
  }
}
