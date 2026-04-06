import { NextResponse } from "next/server";

export const runtime = "nodejs";

type StripeCheckoutSession = {
  status?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
  } | null;
};

type StripeErrorResponse = {
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
};

function getOfferLabel(amountTotal: number | null | undefined) {
  if (amountTotal === 65000) return "Pack de départ - 10 crédits";
  if (amountTotal === 98000) return "Pack intensif - 20 crédits";
  return "Offre Demaa";
}

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id is required." },
      { status: 400 }
    );
  }

  const secretKey = getStripeSecretKey(sessionId);

  if (!secretKey) {
    return NextResponse.json(
      {
        error: sessionId.startsWith("cs_test_")
          ? "La clé Stripe test est manquante. Ajoutez STRIPE_SECRET_KEY_TEST dans Vercel."
          : "STRIPE_SECRET_KEY is missing.",
      },
      { status: 500 }
    );
  }

  const stripeResponse = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
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
      null;

    console.error("Stripe session lookup error:", stripeResponse.status, stripeMessage);

    return NextResponse.json(
      {
        error: stripeMessage
          ? `Impossible de vérifier cette session Stripe. ${stripeMessage}`
          : "Impossible de vérifier cette session Stripe.",
      },
      { status: 502 }
    );
  }

  const session = (await stripeResponse.json()) as StripeCheckoutSession;
  const email =
    session.customer_details?.email || session.customer_email || null;
  const name = session.customer_details?.name || null;
  const amountTotal = session.amount_total ?? null;

  return NextResponse.json({
    paid:
      session.payment_status === "paid" ||
      session.status === "complete",
    paymentStatus: session.payment_status ?? null,
    status: session.status ?? null,
    email,
    name,
    amountTotal,
    currency: session.currency ?? "eur",
    offerLabel: getOfferLabel(amountTotal),
  });
}
