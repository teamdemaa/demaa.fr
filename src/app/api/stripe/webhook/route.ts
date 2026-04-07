import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  getStripePaymentBySessionId,
  markStripePaymentEmailSent,
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

async function sendConfirmationEmail(input: {
  to: string;
  name?: string | null;
  offerLabel: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const templateId =
    process.env.RESEND_PAYMENT_TEMPLATE_ID?.trim() ||
    "b6eb8ed4-5d20-41dc-b4ca-47e0ff3a7fe0";

  if (!resendApiKey || !fromEmail) {
    throw new Error("Resend is not configured. Missing RESEND_API_KEY or RESEND_FROM_EMAIL.");
  }

  const html = `
    <div style="font-family: Arial, sans-serif; color: #191b30; line-height: 1.6;">
      <h1 style="font-size: 24px; margin-bottom: 12px;">Paiement bien reçu</h1>
      <p>Bonjour ${input.name || ""},</p>
      <p>Votre paiement pour <strong>${input.offerLabel}</strong> a bien été confirmé.</p>
      <p>Vous pouvez maintenant réserver votre créneau ici :</p>
      <p>
        <a href="https://teamdemaa.fillout.com/t/4QP8VeqUAaus" style="display:inline-block;background:#191b30;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:999px;">
          Prendre rendez-vous
        </a>
      </p>
      <p>À très vite,<br />Demaa</p>
    </div>
  `;

  const templatePayload = {
    from: fromEmail,
    to: [input.to],
    subject: `Paiement confirmé - ${input.offerLabel}`,
    template: {
      id: templateId,
      variables: {
        Credit: input.offerLabel,
        credit: input.offerLabel,
        OFFER_LABEL: input.offerLabel,
        FIRST_NAME: input.name || "",
        first_name: input.name || "",
        BOOKING_URL: "https://teamdemaa.fillout.com/t/4QP8VeqUAaus",
        booking_url: "https://teamdemaa.fillout.com/t/4QP8VeqUAaus",
      },
    },
  };

  const templateResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(templatePayload),
  });

  if (templateResponse.ok) {
    return;
  }

  const templateBody = await templateResponse.text().catch(() => "");
  console.error("Resend template email error:", templateResponse.status, templateBody);

  const fallbackResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [input.to],
      subject: `Paiement confirmé - ${input.offerLabel}`,
      html,
    }),
  });

  if (!fallbackResponse.ok) {
    const body = await fallbackResponse.text().catch(() => "");
    throw new Error(`Resend error ${fallbackResponse.status}: ${body || "unknown error"}`);
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

      const storedPayment = await getStripePaymentBySessionId(sessionId);

      if (!email) {
        console.warn("[stripe-webhook] No customer email found, skipping confirmation email", {
          eventId: event.id,
          sessionId,
        });
        return NextResponse.json({ received: true, emailSent: false });
      }

      if (storedPayment?.email_sent_at) {
        console.info("[stripe-webhook] Confirmation email already sent for session", {
          eventId: event.id,
          sessionId,
          emailSentAt: storedPayment.email_sent_at,
        });
        return NextResponse.json({ received: true, emailSent: true, duplicate: true });
      }

      await sendConfirmationEmail({
        to: email,
        name,
        offerLabel,
      });

      await markStripePaymentEmailSent(sessionId);

      console.info("[stripe-webhook] Confirmation email sent", {
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
