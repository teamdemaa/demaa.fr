import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  escapeSlackMrkdwn,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { sendSlackMessage, SlackMessageError } from "@/lib/slack";

type SystemSetupRequestBody = {
  availability?: unknown;
  firstName?: unknown;
  sector?: unknown;
  whatsapp?: unknown;
};

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, {
      keyPrefix: "system-setup",
      limit: 8,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } = await readJsonBody<SystemSetupRequestBody>(request);
    if (response) return response;

    const firstName = normalizeText(body?.firstName, 80);
    const sector = normalizeText(body?.sector, 120);
    const whatsapp = normalizeText(body?.whatsapp, 60);
    const availability = normalizeText(body?.availability, 500, { multiline: true });

    if (!firstName || !sector || !whatsapp || !availability) {
      return NextResponse.json(
        { error: "Merci de renseigner tous les champs avant l'envoi." },
        { status: 400 }
      );
    }

    const payload = {
      text: "📌 Nouvelle demande système",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `*Prénom* : ${escapeSlackMrkdwn(firstName)}\n` +
              `*Secteur* : ${escapeSlackMrkdwn(sector)}\n` +
              `*WhatsApp* : ${escapeSlackMrkdwn(whatsapp)}\n` +
              `*Disponibilités* : ${escapeSlackMrkdwn(availability)}\n` +
              `*Source* : Audit de mon organisation`,
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
    console.error("System setup request error →", error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant l'envoi. Merci de réessayer dans quelques minutes.",
      },
      { status: error instanceof SlackMessageError ? error.statusCode : 500 }
    );
  }
}
