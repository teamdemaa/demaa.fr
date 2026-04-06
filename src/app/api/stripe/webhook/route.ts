import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type StripeEvent = {
  type?: string;
  data?: {
    object?: {
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
  if (amountTotal === 65000) return "Pack de départ - 10 crédits";
  if (amountTotal === 98000) return "Pack intensif - 20 crédits";
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

  if (!resendApiKey || !fromEmail) {
    console.warn("Resend not configured, skipping custom confirmation email.");
    return;
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

  const response = await fetch("https://api.resend.com/emails", {
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

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("Resend email error:", response.status, body);
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 400 }
    );
  }

  const payload = await request.text();

  if (!verifyStripeSignature(payload, signature, webhookSecret)) {
    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 }
    );
  }

  const event = JSON.parse(payload) as StripeEvent;

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const email =
      session?.customer_details?.email || session?.customer_email || null;
    const name = session?.customer_details?.name || null;
    const amountTotal = session?.amount_total ?? null;

    if (email) {
      await sendConfirmationEmail({
        to: email,
        name,
        offerLabel: getOfferLabel(amountTotal),
      });
    }
  }

  return NextResponse.json({ received: true });
}
