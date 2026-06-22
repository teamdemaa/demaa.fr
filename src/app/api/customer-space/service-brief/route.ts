import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  CUSTOMER_SPACE_COOKIE,
  getEmailFromCustomerSessionToken,
} from "@/lib/customer-space-auth";
import {
  getStripePaymentBySessionId,
  markStripePaymentSlackNotified,
  saveServiceBundleBrief,
} from "@/lib/generations-db";
import {
  enforceRateLimit,
  escapeSlackMrkdwn,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { sendSlackMessage } from "@/lib/slack";

export const runtime = "nodejs";

type ServiceBriefBody = {
  brief?: unknown;
  sessionId?: unknown;
};

export async function POST(request: Request) {
  const { data: body, response } = await readJsonBody<ServiceBriefBody>(request, 16 * 1024);
  if (response) return response;

  const sessionId = normalizeText(body?.sessionId, 160);
  const brief = normalizeText(body?.brief, 2500, { multiline: true });

  const limited = enforceRateLimit(
    request,
    {
      keyPrefix: "customer-space-service-brief",
      limit: 8,
      windowMs: 10 * 60 * 1000,
    },
    sessionId || undefined
  );
  if (limited) return limited;

  if (!sessionId) {
    return NextResponse.json({ error: "La commande est manquante." }, { status: 400 });
  }

  if (!brief) {
    return NextResponse.json(
      { error: "Merci de préciser votre besoin pour lancer la prestation." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(CUSTOMER_SPACE_COOKIE)?.value || null;
  const email = await getEmailFromCustomerSessionToken(sessionToken);

  if (!email) {
    return NextResponse.json({ error: "Session expirée. Reconnectez-vous." }, { status: 401 });
  }

  const payment = await getStripePaymentBySessionId(sessionId);

  if (!payment) {
    return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });
  }

  if (payment.email?.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: "Accès refusé à cette commande." }, { status: 403 });
  }

  if (payment.order_type !== "service_bundle") {
    return NextResponse.json(
      { error: "Cette commande ne peut pas être complétée ici." },
      { status: 400 }
    );
  }

  const savedBrief = await saveServiceBundleBrief({
    stripeSessionId: sessionId,
    brief,
  });

  let slackNotifiedAt: string | null = null;

  try {
    await sendSlackMessage({
      text: "Nouveau brief service Demaa",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text:
              `*Nouveau brief service*\n` +
              `*Commande* : ${escapeSlackMrkdwn(payment.cart_summary || sessionId)}\n` +
              `*Services* : ${escapeSlackMrkdwn((payment.service_names || []).join(", ")) || "_non renseigné_"}\n` +
              `*Client* : ${escapeSlackMrkdwn(payment.customer_name || "") || "_non renseigné_"}\n` +
              `*Email* : ${escapeSlackMrkdwn(email)}\n` +
              `*Brief* :\n${escapeSlackMrkdwn(brief)}\n` +
              `*Session Stripe* : ${sessionId}`,
          },
        },
      ],
    });
    await markStripePaymentSlackNotified(sessionId);
    slackNotifiedAt = new Date().toISOString();
  } catch (error) {
    console.error("[customer-space-service-brief] Slack notification failed", error);
  }

  return NextResponse.json({
    saved: true,
    brief: savedBrief.brief,
    serviceBriefSubmittedAt: savedBrief.serviceBriefSubmittedAt,
    slackNotifiedAt,
  });
}
