import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ASSISTANT_CREDITS = [250, 500, 750, 1000] as const;

type AssistantCredits = (typeof ASSISTANT_CREDITS)[number];

type CheckoutRequestBody = {
  credits?: unknown;
};

type StripeErrorResponse = {
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
};

function isAssistantCredits(value: unknown): value is AssistantCredits {
  return (
    typeof value === "number" &&
    ASSISTANT_CREDITS.includes(value as AssistantCredits)
  );
}

function getStripeSecretKey() {
  return (
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY_TEST ||
    process.env.STRIPE_TEST_SECRET_KEY ||
    null
  );
}

function getBaseUrl(request: Request) {
  const requestOrigin = new URL(request.url).origin;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (siteUrl && !siteUrl.includes("vercel.app")) {
    return siteUrl;
  }

  return requestOrigin;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CheckoutRequestBody | null;
  const credits = Number(body?.credits);

  if (!isAssistantCredits(credits)) {
    return NextResponse.json(
      { error: "Merci de choisir un montant de crédits valide." },
      { status: 400 }
    );
  }

  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    return NextResponse.json(
      {
        error:
          "Stripe n'est pas encore configuré. Ajoutez STRIPE_SECRET_KEY ou STRIPE_SECRET_KEY_TEST.",
      },
      { status: 500 }
    );
  }

  const baseUrl = getBaseUrl(request);
  const checkoutParams = new URLSearchParams({
    mode: "payment",
    success_url: `${baseUrl}/assistant/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/assistant#pricing`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": String(credits * 100),
    "line_items[0][price_data][product_data][name]": `${credits} crédits assistant Demaa`,
    "line_items[0][price_data][product_data][description]":
      "Crédits pour déléguer des tâches opérationnelles avec Demaa.",
    "metadata[offer_type]": "assistant",
    "metadata[credits]": String(credits),
    "metadata[offer_label]": `${credits} crédits assistant`,
    "custom_fields[0][key]": "first_name",
    "custom_fields[0][label][type]": "custom",
    "custom_fields[0][label][custom]": "Prénom",
    "custom_fields[0][type]": "text",
    "custom_fields[1][key]": "last_name",
    "custom_fields[1][label][type]": "custom",
    "custom_fields[1][label][custom]": "Nom",
    "custom_fields[1][type]": "text",
    billing_address_collection: "auto",
  });

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2026-02-25.clover",
    },
    body: checkoutParams,
    cache: "no-store",
  });

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
      "Impossible de créer la session Stripe.";

    console.error("[assistant-checkout] Stripe error:", stripeResponse.status, stripeMessage);

    return NextResponse.json({ error: stripeMessage }, { status: 502 });
  }

  const session = (await stripeResponse.json()) as { id?: string; url?: string | null };

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe n'a pas retourné d'URL de paiement." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    id: session.id ?? null,
    url: session.url,
  });
}
