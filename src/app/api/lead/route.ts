import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  escapeSlackMrkdwn,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { sendSlackMessage, SlackMessageError } from "@/lib/slack";

type LeadRequestBody = {
  company?: unknown;
  details?: unknown;
  email?: unknown;
  name?: unknown;
  offer?: unknown;
  phone?: unknown;
  sector?: unknown;
  source?: unknown;
  toolPreferences?: unknown;
};

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, {
      keyPrefix: "lead",
      limit: 8,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } = await readJsonBody<LeadRequestBody>(request);
    if (response) return response;

    const company = normalizeText(body?.company, 120);
    const sector = normalizeText(body?.sector, 120);
    const email = normalizeText(body?.email, 160);
    const phone = normalizeText(body?.phone, 60);
    const name = normalizeText(body?.name, 120);
    const source = normalizeText(body?.source, 120);
    const offer = normalizeText(body?.offer, 160);
    const details = normalizeText(body?.details, 2000, { multiline: true });
    const toolPreferences = normalizeText(body?.toolPreferences, 500, {
      multiline: true,
    });

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
            text: `*Nom* : ${escapeSlackMrkdwn(name) || "_non renseigné_"}\n*Email* : ${escapeSlackMrkdwn(email) || "_non renseigné_"}\n*Téléphone / WhatsApp* : ${escapeSlackMrkdwn(phone) || "_non renseigné_"}\n*Entreprise* : ${escapeSlackMrkdwn(company) || "_non renseigné_"}\n*Secteur* : ${escapeSlackMrkdwn(sector) || "_non renseigné_"}\n*Offre* : ${escapeSlackMrkdwn(offer) || "_non renseigné_"}\n*Préférences outils* : ${escapeSlackMrkdwn(toolPreferences) || "_non renseigné_"}\n*Besoin* : ${escapeSlackMrkdwn(details) || "_non renseigné_"}\n*Source* : ${escapeSlackMrkdwn(source) || "Modal"}`
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
