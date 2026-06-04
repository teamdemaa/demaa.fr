import { NextResponse } from "next/server";
import { sendSlackMessage, SlackMessageError } from "@/lib/slack";

export async function POST(request: Request) {
  try {
    const { company, sector, email, phone, name, source, offer, details, toolPreferences } =
      await request.json();

    if (!name || !phone || !details) {
      return NextResponse.json(
        { error: "Merci de renseigner les champs obligatoires avant l'envoi." },
        { status: 400 }
      );
    }

    const payload = {
      text: `📬 Nouvelle demande Team Demaa`,
      blocks: [
        {
          type: "section",
          text: {
          type: "mrkdwn",
            text: `*Nom* : ${name || "_non renseigné_"}\n*Email* : ${email || "_non renseigné_"}\n*Téléphone / WhatsApp* : ${phone || "_non renseigné_"}\n*Entreprise* : ${company || "_non renseigné_"}\n*Secteur* : ${sector || "_non renseigné_"}\n*Offre* : ${offer || "_non renseigné_"}\n*Préférences outils* : ${toolPreferences || "_non renseigné_"}\n*Besoin* : ${details || "_non renseigné_"}\n*Source* : ${source || "Modal"}`
          }
        },
        {
          type: "context",
          elements: [{ type: "mrkdwn", text: `⏰ ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}` }]
        }
      ]
    };

    await sendSlackMessage(payload);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    console.error("Lead webhook error →", e);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant l'envoi. Merci de réessayer dans quelques minutes.",
      },
      { status: e instanceof SlackMessageError ? e.statusCode : 500 }
    );
  }
}
