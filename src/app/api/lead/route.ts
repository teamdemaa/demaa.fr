import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { company, sector, email, phone, name, source, offer, details, toolPreferences } =
      await request.json();

    if (!company || !email || !name || !phone || !details) {
      return NextResponse.json(
        { error: "Merci de renseigner les champs obligatoires avant l'envoi." },
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
      text: `📬 Nouvelle demande Team Demaa`,
      blocks: [
        {
          type: "section",
          text: {
          type: "mrkdwn",
            text: `*Entreprise* : ${company}\n*Nom* : ${name || "_non renseigné_"}\n*Secteur* : ${sector || "_non renseigné_"}\n*Email* : ${email}\n*Téléphone* : ${phone || "_non renseigné_"}\n*Offre* : ${offer || "_non renseigné_"}\n*Préférences outils* : ${toolPreferences || "_non renseigné_"}\n*Besoin* : ${details || "_non renseigné_"}\n*Source* : ${source || "Modal"}`
          }
        },
        {
          type: "context",
          elements: [{ type: "mrkdwn", text: `⏰ ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}` }]
        }
      ]
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
  } catch (e: unknown) {
    console.error("Lead webhook error →", e);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant l'envoi. Merci de réessayer dans quelques minutes.",
      },
      { status: 500 }
    );
  }
}
