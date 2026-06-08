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

export const runtime = "nodejs";

type DelegationRequestBody = {
  firstName?: unknown;
  lastName?: unknown;
  sessionId?: unknown;
  tasks?: unknown;
  whatsappPhone?: unknown;
};

type StripeCheckoutSession = {
  id?: string;
  status?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  livemode?: boolean;
  customer_email?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
  } | null;
  custom_fields?: Array<{
    key?: string | null;
    text?: {
      value?: string | null;
    } | null;
  }> | null;
  metadata?: {
    cart_summary?: string | null;
    credits?: string | null;
    offer_label?: string | null;
    offer_type?: string | null;
  } | null;
};

type StripeErrorResponse = {
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
};

function getStripeSecretKey(sessionId: string) {
  const isTestSession = sessionId.startsWith("cs_test_");

  if (isTestSession) {
    return (
      process.env.STRIPE_SECRET_KEY_TEST ||
      process.env.STRIPE_TEST_SECRET_KEY ||
      null
    );
  }

  return process.env.STRIPE_SECRET_KEY || null;
}

function getOfferLabel(session: StripeCheckoutSession) {
  if (session.metadata?.offer_label) return session.metadata.offer_label;
  return "Crédits assistant Demaa";
}

function getCartSummary(session: StripeCheckoutSession) {
  return session.metadata?.cart_summary || getOfferLabel(session);
}

function getCredits(session: StripeCheckoutSession) {
  const credits = Number(session.metadata?.credits);
  return Number.isFinite(credits) && credits > 0 ? credits : null;
}

function getAmountLabel(session: StripeCheckoutSession) {
  if (typeof session.amount_total !== "number") return "_non renseigné_";

  return `${(session.amount_total / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${(session.currency || "eur").toUpperCase()}`;
}

async function retrieveCheckoutSession(sessionId: string) {
  const secretKey = getStripeSecretKey(sessionId);

  if (!secretKey) {
    return {
      error:
        "Impossible de vérifier le paiement Stripe. La clé serveur est manquante.",
      status: 500,
    } as const;
  }

  const stripeResponse = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Stripe-Version": "2026-02-25.clover",
      },
      cache: "no-store",
    }
  );

  if (!stripeResponse.ok) {
    const rawBody = await stripeResponse.text().catch(() => "");
    let parsedBody: StripeErrorResponse | null = null;

    try {
      parsedBody = rawBody ? (JSON.parse(rawBody) as StripeErrorResponse) : null;
    } catch {
      parsedBody = null;
    }

    const stripeMessage =
      parsedBody?.error?.message ||
      parsedBody?.error?.code ||
      parsedBody?.error?.type ||
      rawBody ||
      "Impossible de vérifier cette session Stripe.";

    console.error(
      "[assistant-delegation-request] Stripe lookup error:",
      stripeResponse.status,
      stripeMessage
    );

    return {
      error: `Impossible de vérifier cette session Stripe. ${stripeMessage}`,
      status: 502,
    } as const;
  }

  return {
    session: (await stripeResponse.json()) as StripeCheckoutSession,
  } as const;
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

  const limited = enforceRateLimit(
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
  const paid = session.payment_status === "paid" || session.status === "complete";

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
    session.customer_details?.name ||
    null;
  const email = session.customer_details?.email || session.customer_email || null;
  const offerLabel = getOfferLabel(session);
  const cartSummary = getCartSummary(session);
  const credits = getCredits(session);
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
