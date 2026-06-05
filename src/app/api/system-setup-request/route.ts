import { NextResponse } from "next/server";
import { sendSlackMessage, SlackMessageError } from "@/lib/slack";

export async function POST(request: Request) {
  try {
    const { firstName, sector, whatsapp, availability } = await request.json();

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
              `*Prénom* : ${firstName}\n` +
              `*Secteur* : ${sector}\n` +
              `*WhatsApp* : ${whatsapp}\n` +
              `*Disponibilités* : ${availability}\n` +
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
