import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  escapeSlackMrkdwn,
  isValidStripeSessionId,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import {
  getAssistantDelegationRequestBySessionId,
  saveAssistantDelegationRequest,
} from "@/lib/generations-db";
import { sendSlackMessage } from "@/lib/slack";
import {
  getStripeCartSummary,
  getStripeCredits,
  getStripeCustomerEmail,
  getStripeCustomerName,
  getStripeOfferLabel,
  isStripeSessionPaid,
  retrieveStripeCheckoutSession,
  type StripeCheckoutSession,
} from "@/lib/stripe-server";

export const runtime = "nodejs";

type DelegationRequestBody = {
  firstName?: unknown;
  lastName?: unknown;
  sessionId?: unknown;
  tasks?: unknown;
  whatsappPhone?: unknown;
};

function getOfferLabel(session: StripeCheckoutSession) {
  return getStripeOfferLabel(session, "Crédits assistant Demaa");
}

function getCartSummary(session: StripeCheckoutSession) {
  return getStripeCartSummary(session, "Crédits assistant Demaa");
}

function getAmountLabel(session: StripeCheckoutSession) {
  if (typeof session.amount_total !== "number") return "_non renseigné_";

  return `${(session.amount_total / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${(session.currency || "eur").toUpperCase()}`;
}

async function retrieveCheckoutSession(sessionId: string) {
  return retrieveStripeCheckoutSession(sessionId, {
    logPrefix: "[assistant-delegation-request]",
    missingSecretMessage:
      "Impossible de vérifier le paiement Stripe. La clé serveur est manquante.",
  });
}

export async function POST(request: Request) {
  const { data: body, response } =
    await readJsonBody<DelegationRequestBody>(request, 16 * 1024);
  if (response) return response;

  const firstName = normalizeText(body?.firstName, 80);
  const lastName = normalizeText(body?.lastName, 80);
  const sessionId = normalizeText(body?.sessionId, 120);
  const tasks = normalizeText(body?.tasks, 2500, { multiline: true });
  const whatsappPhone = normalizeText(body?.whatsappPhone, 60);

  const limited = await enforceRateLimit(
    request,
    {
      keyPrefix: "assistant-delegation",
      limit: 6,
      windowMs: 10 * 60 * 1000,
    },
    sessionId || undefined
  );
  if (limited) return limited;

  if (!sessionId) {
    return NextResponse.json(
      { error: "La session Stripe est manquante." },
      { status: 400 }
    );
  }

  if (!isValidStripeSessionId(sessionId)) {
    return NextResponse.json(
      { error: "La session Stripe est invalide." },
      { status: 400 }
    );
  }

  if (!tasks) {
    return NextResponse.json(
      { error: "Merci de détailler ce que vous voulez déléguer." },
      { status: 400 }
    );
  }

  if (!firstName) {
    return NextResponse.json(
      { error: "Merci d'indiquer votre prénom." },
      { status: 400 }
    );
  }

  if (!whatsappPhone) {
    return NextResponse.json(
      {
        error:
          "Merci d'indiquer votre WhatsApp pour que l'équipe Demaa puisse vous contacter.",
      },
      { status: 400 }
    );
  }

  const result = await retrieveCheckoutSession(sessionId);

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const session = result.session;
  const paid = isStripeSessionPaid(session);

  if (!paid) {
    return NextResponse.json(
      { error: "Le paiement Stripe n'est pas encore confirmé." },
      { status: 402 }
    );
  }

  const existingRequest =
    await getAssistantDelegationRequestBySessionId(sessionId);

  if (existingRequest?.slack_notified_at) {
    return NextResponse.json({ sent: true, duplicate: true });
  }

  const customerName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    getStripeCustomerName(session) ||
    null;
  const email = getStripeCustomerEmail(session);
  const offerLabel = getOfferLabel(session);
  const cartSummary = getCartSummary(session);
  const credits = getStripeCredits(session);
  const creditsLine = credits ? `\n*Crédits* : ${credits}` : "";

  await sendSlackMessage({
    text: "Nouvelle demande de delegation assistant Demaa",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
            text: `*Nouvelle demande assistant*\n*Sélection* : ${escapeSlackMrkdwn(cartSummary)}\n*Montant* : ${getAmountLabel(session)}${creditsLine}\n*Nom* : ${escapeSlackMrkdwn(customerName || "") || "_non renseigné_"}\n*Email Stripe* : ${escapeSlackMrkdwn(email || "") || "_non renseigné_"}\n*WhatsApp* : ${escapeSlackMrkdwn(whatsappPhone) || "_non renseigné_"}\n*Détail de ce que le client veut déléguer* :\n${escapeSlackMrkdwn(tasks)}\n*Action admin* : contacter le client sur WhatsApp sous 24h\n*Session Stripe* : ${sessionId}\n*Mode* : ${session.livemode ? "Live" : "Test"}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Recu le ${new Date().toLocaleString("fr-FR", {
              timeZone: "Europe/Paris",
            })}`,
          },
        ],
      },
    ],
  });

  await saveAssistantDelegationRequest({
    stripeSessionId: sessionId,
    email,
    customerName,
    whatsappPhone,
    offerLabel,
    credits,
    tasks,
    livemode: Boolean(session.livemode),
  });

  return NextResponse.json({ sent: true });
}
