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
  custom_fields?: Array<{
    key?: string | null;
    text?: {
      value?: string | null;
    } | null;
  }> | null;
  metadata?: {
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

function getCustomFieldValue(
  customFields: StripeCheckoutSession["custom_fields"],
  key: string
) {
  return (
    customFields?.find((field) => field.key === key)?.text?.value?.trim() ||
    null
  );
}

function getOfferLabel(session: StripeCheckoutSession) {
  if (session.metadata?.offer_label) return session.metadata.offer_label;
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
  const firstName = getCustomFieldValue(session.custom_fields, "first_name");
  const lastName = getCustomFieldValue(session.custom_fields, "last_name");
  const whatsappPhone = getCustomFieldValue(session.custom_fields, "whatsapp_phone");
  const credits = session.metadata?.credits ? Number(session.metadata.credits) : null;

  return NextResponse.json({
    paid:
      session.payment_status === "paid" ||
      session.status === "complete",
    paymentStatus: session.payment_status ?? null,
    status: session.status ?? null,
    email,
    name,
    firstName,
    lastName,
    whatsappPhone,
    amountTotal,
    currency: session.currency ?? "eur",
    credits: Number.isFinite(credits) ? credits : null,
    offerType: session.metadata?.offer_type ?? null,
    offerLabel: getOfferLabel(session),
  });
}
