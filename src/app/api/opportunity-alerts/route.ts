import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  escapeSlackMrkdwn,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { sendSlackMessage, SlackMessageError } from "@/lib/slack";

type OpportunityAlertRequest = {
  sector?: unknown;
  keyword?: unknown;
  whatsapp?: unknown;
};

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, {
      keyPrefix: "opportunity-alerts",
      limit: 8,
      windowMs: 10 * 60 * 1000,
    });
    if (limited) return limited;

    const { data: body, response } =
      await readJsonBody<OpportunityAlertRequest>(request);
    if (response) return response;

    const sector = normalizeText(body?.sector, 120);
    const keyword = normalizeText(body?.keyword, 120);
    const whatsapp = normalizeText(body?.whatsapp, 60);

    if (!sector || !whatsapp) {
      return NextResponse.json(
        { error: "Merci d'indiquer un secteur et un WhatsApp." },
        { status: 400 }
      );
    }

    const database = getAdminFirestore();
    const createdAt = FieldValue.serverTimestamp();

    await database.collection("opportunity_alerts").add({
      sector,
      keyword: keyword || null,
      whatsapp,
      status: "active",
      source: "Page Opportunités",
      created_at: createdAt,
    });

    await sendSlackMessage({
      text: "🔔 Nouvelle alerte opportunités",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
              text:
                `*Nouvelle alerte opportunités*\n` +
                `*Secteur* : ${escapeSlackMrkdwn(sector)}\n` +
                `*Mot-clé* : ${escapeSlackMrkdwn(keyword) || "_non renseigné_"}\n` +
                `*WhatsApp* : ${escapeSlackMrkdwn(whatsapp)}\n` +
                `*Source* : Page Opportunités`,
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
  } catch (error) {
    console.error("Opportunity alert request error →", error);
    return NextResponse.json(
      {
        error:
          "Impossible d'activer l'alerte pour le moment. Merci de réessayer dans quelques minutes.",
      },
      { status: error instanceof SlackMessageError ? error.statusCode : 500 }
    );
  }
}
