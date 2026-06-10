import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  escapeSlackMrkdwn,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { actifyOpportunities } from "@/lib/actify-opportunities";
import { sendSlackMessage, SlackMessageError } from "@/lib/slack";

type ActifyInformationRequestBody = {
  email?: unknown;
  opportunityId?: unknown;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    const { data: body, response } =
      await readJsonBody<ActifyInformationRequestBody>(request);
    if (response) return response;

    const email = normalizeText(body?.email, 160).toLowerCase();
    const opportunityId = normalizeText(body?.opportunityId, 160);

    const limited = enforceRateLimit(
      request,
      {
        keyPrefix: "actify-information-request",
        limit: 5,
        windowMs: 10 * 60 * 1000,
      },
      email || undefined,
    );
    if (limited) return limited;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Merci de renseigner une adresse email valide." },
        { status: 400 },
      );
    }

    const opportunity = actifyOpportunities.find(
      (item) => item.source_id === opportunityId,
    );

    if (!opportunity) {
      return NextResponse.json(
        { error: "Cette annonce est introuvable." },
        { status: 404 },
      );
    }

    const payload = {
      text: `📩 Demande d'informations Actify`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: [
              `*Email* : ${escapeSlackMrkdwn(email)}`,
              `*Annonce* : ${escapeSlackMrkdwn(opportunity.title)}`,
              `*ID Actify* : ${escapeSlackMrkdwn(opportunity.source_id)}`,
              `*Référence* : ${escapeSlackMrkdwn(opportunity.reference || "non renseignée")}`,
              `*Ville* : ${escapeSlackMrkdwn(opportunity.city || "non renseignée")}`,
              `*Département* : ${escapeSlackMrkdwn(opportunity.department || "non renseigné")}`,
              `*Secteurs* : ${escapeSlackMrkdwn(opportunity.sectors.join(", ") || "non renseignés")}`,
              `*CA* : ${escapeSlackMrkdwn(opportunity.revenue_range || "non renseigné")}`,
              `*Effectif* : ${escapeSlackMrkdwn(opportunity.employee_count_range || "non renseigné")}`,
              `*Date limite* : ${escapeSlackMrkdwn(opportunity.deadline || "non renseignée")}`,
              `*Étude / contact* : ${escapeSlackMrkdwn(opportunity.contact_study_name || "non renseigné")}`,
              `*URL source* : ${escapeSlackMrkdwn(opportunity.source_url)}`,
            ].join("\n"),
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
  } catch (error: unknown) {
    console.error("Actify information request error →", error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue pendant l'envoi. Merci de réessayer dans quelques minutes.",
      },
      { status: error instanceof SlackMessageError ? error.statusCode : 500 },
    );
  }
}
