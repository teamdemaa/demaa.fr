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

function getOfferLabel(amountTotal: number | null | undefined) {
  if (amountTotal === 65000) return "Pack de départ - 10 crédits";
  if (amountTotal === 98000) return "Pack intensif - 20 crédits";
  return "Offre Demaa";
}

export async function GET(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is missing." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id is required." },
      { status: 400 }
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
    const body = await stripeResponse.text().catch(() => "");
    console.error("Stripe session lookup error:", stripeResponse.status, body);

    return NextResponse.json(
      { error: "Impossible de verifier cette session Stripe." },
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
