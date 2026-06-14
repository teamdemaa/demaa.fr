import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  escapeSlackMrkdwn,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import { savePartnerOffersSubscriber } from "@/lib/generations-db";
import { sendSlackMessage, SlackMessageError } from "@/lib/slack";

type PartnerOffersRequestBody = {
  email?: unknown;
  firstName?: unknown;
  sector?: unknown;
  source?: unknown;
};

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, {
      keyPrefix: "partner_offers",
      limit: 10,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } =
      await readJsonBody<PartnerOffersRequestBody>(request);
    if (response) return response;

    const normalizedFirstName = normalizeText(body?.firstName, 80);
    const normalizedSector = normalizeText(body?.sector, 120);
    const normalizedEmail = normalizeEmail(normalizeText(body?.email, 160));
    const normalizedSource = normalizeText(body?.source, 120) || "partner_offers_page";

    if (!normalizedFirstName || !normalizedSector || !normalizedEmail) {
      return NextResponse.json(
        { error: "Merci de renseigner votre prénom, votre secteur et votre email." },
        { status: 400 }
      );
    }

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: "Merci de renseigner une adresse email valide." },
        { status: 400 }
      );
    }

    await savePartnerOffersSubscriber({
      firstName: normalizedFirstName,
      sector: normalizedSector,
      email: normalizedEmail,
      source: normalizedSource,
    });

    await sendSlackMessage({
      text: "Nouvelle inscription offres partenaires Demaa",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `*Offres partenaires Demaa*\n` +
              `*Prénom* : ${escapeSlackMrkdwn(normalizedFirstName)}\n` +
              `*Secteur* : ${escapeSlackMrkdwn(normalizedSector)}\n` +
              `*Email* : ${escapeSlackMrkdwn(normalizedEmail)}\n` +
              `*Source* : ${escapeSlackMrkdwn(normalizedSource)}`,
          },
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `⏰ ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}`,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Partner offers subscription error:", error);

    return NextResponse.json(
      {
        error:
          "Impossible de vous inscrire pour le moment. Merci de réessayer dans quelques minutes.",
      },
      { status: error instanceof SlackMessageError ? error.statusCode : 500 }
    );
  }
}
