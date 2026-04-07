import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  grantStripePaymentCredits,
  getStripePaymentBySessionId,
  markStripePaymentSlackNotified,
  upsertConfirmedStripePayment,
} from "@/lib/generations-db";

export const runtime = "nodejs";

type StripeEvent = {
  id?: string;
  livemode?: boolean;
  type?: string;
  data?: {
    object?: {
      id?: string;
      status?: string | null;
      payment_status?: string | null;
      currency?: string | null;
      amount_total?: number | null;
      customer_email?: string | null;
      customer_details?: {
        email?: string | null;
        name?: string | null;
      } | null;
    };
  };
};

function getOfferLabel(amountTotal: number | null | undefined) {
  if (amountTotal === 65000) return "Automate - 10 crédits";
  if (amountTotal === 98000) return "Maestro - 20 crédits";
  return "Offre Demaa";
}

function getOfferCredits(amountTotal: number | null | undefined) {
  if (amountTotal === 65000) return 10;
  if (amountTotal === 98000) return 20;
  return 0;
}

function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string
) {
  const elements = signatureHeader.split(",").map((part) => part.trim());
  const timestamp = elements.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = elements
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return signatures.some((signature) => {
    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(signature, "utf8");

    if (expected.length !== received.length) {
      return false;
    }

    return timingSafeEqual(expected, received);
  });
}

async function sendPaymentSlackNotification(input: {
  amountTotal: number | null;
  currency: string | null;
  email: string | null;
  livemode: boolean;
  name?: string | null;
  offerLabel: string;
  sessionId: string;
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error("Slack is not configured. Missing SLACK_WEBHOOK_URL.");
  }

  const amount =
    typeof input.amountTotal === "number"
      ? `${(input.amountTotal / 100).toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} ${(input.currency || "eur").toUpperCase()}`
      : "_non renseigné_";

  const slackResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "💳 Nouveau paiement Demaa confirmé",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Paiement confirmé*\n*Offre* : ${input.offerLabel}\n*Montant* : ${amount}\n*Nom* : ${input.name || "_non renseigné_"}\n*Email* : ${input.email || "_non renseigné_"}\n*Session Stripe* : ${input.sessionId}\n*Mode* : ${input.livemode ? "Live" : "Test"}`,
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
    }),
  });

  if (!slackResponse.ok) {
    const body = await slackResponse.text().catch(() => "");
    throw new Error(`Slack error ${slackResponse.status}: ${body || "unknown error"}`);
  }
}

function verifyStripeSignatureWithSecrets(
  payload: string,
  signatureHeader: string,
  secrets: Array<string | undefined>
) {
  return secrets
    .filter((secret): secret is string => Boolean(secret))
    .some((secret) => verifyStripeSignature(payload, signatureHeader, secret));
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[stripe-webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 400 }
    );
  }

  const payload = await request.text();

  const isValidSignature = verifyStripeSignatureWithSecrets(payload, signature, [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_WEBHOOK_SECRET_TEST,
    process.env.STRIPE_TEST_WEBHOOK_SECRET,
  ]);

  if (!isValidSignature) {
    console.error("[stripe-webhook] Invalid Stripe signature");
    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 }
    );
  }

  const event = JSON.parse(payload) as StripeEvent;

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const sessionId = session?.id || null;
    const email =
      session?.customer_details?.email || session?.customer_email || null;
    const name = session?.customer_details?.name || null;
    const amountTotal = session?.amount_total ?? null;
    const offerLabel = getOfferLabel(amountTotal);
    const offerCredits = getOfferCredits(amountTotal);

    if (!event.id || !sessionId) {
      console.error("[stripe-webhook] checkout.session.completed missing ids", {
        eventId: event.id,
        sessionId,
      });
      return NextResponse.json(
        { error: "Invalid checkout.session.completed payload." },
        { status: 400 }
      );
    }

    try {
      console.info("[stripe-webhook] Processing checkout.session.completed", {
        eventId: event.id,
        sessionId,
        livemode: Boolean(event.livemode),
        email,
        amountTotal,
      });

      await upsertConfirmedStripePayment({
        stripeSessionId: sessionId,
        stripeEventId: event.id,
        email,
        customerName: name,
        amountTotal,
        currency: session?.currency ?? null,
        offerLabel,
        livemode: Boolean(event.livemode),
        paymentStatus: session?.payment_status ?? null,
        checkoutStatus: session?.status ?? null,
      });

      if (email && offerCredits > 0) {
        const creditGrant = await grantStripePaymentCredits({
          stripeSessionId: sessionId,
          email,
          credits: offerCredits,
          offerLabel,
        });

        console.info("[stripe-webhook] Credit grant result", {
          eventId: event.id,
          sessionId,
          email,
          credits: offerCredits,
          result: creditGrant.reason,
        });
      }

      const storedPayment = await getStripePaymentBySessionId(sessionId);

      if (storedPayment?.slack_notified_at) {
        console.info("[stripe-webhook] Slack payment notification already sent for session", {
          eventId: event.id,
          sessionId,
          slackNotifiedAt: storedPayment.slack_notified_at,
        });
        return NextResponse.json({ received: true, slackNotified: true, duplicate: true });
      }

      await sendPaymentSlackNotification({
        amountTotal,
        currency: session?.currency ?? null,
        email,
        livemode: Boolean(event.livemode),
        name,
        offerLabel,
        sessionId,
      });

      await markStripePaymentSlackNotified(sessionId);

      console.info("[stripe-webhook] Slack payment notification sent", {
        eventId: event.id,
        sessionId,
        email,
        offerLabel,
      });
    } catch (error) {
      console.error("[stripe-webhook] Failed to process checkout.session.completed", {
        eventId: event.id,
        sessionId,
        error: error instanceof Error ? error.message : error,
      });

      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Stripe webhook processing failed.",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
