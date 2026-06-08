import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { sendSlackMessage, SlackMessageError } from "@/lib/slack";

type OpportunityAlertRequest = {
  sector?: unknown;
  keyword?: unknown;
  whatsapp?: unknown;
};

function normalizeValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as OpportunityAlertRequest | null;
    const sector = normalizeValue(body?.sector);
    const keyword = normalizeValue(body?.keyword);
    const whatsapp = normalizeValue(body?.whatsapp);

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
              `*Secteur* : ${sector}\n` +
              `*Mot-clé* : ${keyword || "_non renseigné_"}\n` +
              `*WhatsApp* : ${whatsapp}\n` +
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
