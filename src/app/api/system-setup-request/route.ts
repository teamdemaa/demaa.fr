import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { firstName, sector, whatsapp, availability } = await request.json();

    if (!firstName || !sector || !whatsapp || !availability) {
      return NextResponse.json(
        { error: "Merci de renseigner tous les champs avant l'envoi." },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.SLACK_WEBHOOK_URL;

    if (!webhookUrl) {
      console.error("SLACK_WEBHOOK_URL not set");
      return NextResponse.json(
        {
          error:
            "Le formulaire est temporairement indisponible. Merci de réessayer dans quelques minutes.",
        },
        { status: 500 }
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
              `*Source* : Navbar - Mettre en place un système`,
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

    const slackResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!slackResponse.ok) {
      const slackBody = await slackResponse.text().catch(() => "");
      console.error("Slack webhook error:", slackResponse.status, slackBody);

      return NextResponse.json(
        {
          error:
            "Impossible d'envoyer votre demande pour le moment. Merci de réessayer dans quelques minutes.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("System setup request error →", error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant l'envoi. Merci de réessayer dans quelques minutes.",
      },
      { status: 500 }
    );
  }
}
