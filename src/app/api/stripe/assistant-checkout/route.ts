import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CHECKOUT_OFFERS = [
  {
    credits: 250,
    unitAmount: 25000,
    offerType: "assistant",
    offerLabel: "250 crédits assistant",
    productName: "250 crédits assistant Demaa",
    productDescription: "Crédits pour déléguer des tâches opérationnelles avec Demaa.",
    successPath: "/assistant/success",
    cancelPath: "/assistant#pricing",
  },
  {
    credits: 500,
    unitAmount: 50000,
    offerType: "assistant",
    offerLabel: "500 crédits assistant",
    productName: "500 crédits assistant Demaa",
    productDescription: "Crédits pour déléguer des tâches opérationnelles avec Demaa.",
    successPath: "/assistant/success",
    cancelPath: "/assistant#pricing",
  },
  {
    credits: 750,
    unitAmount: 75000,
    offerType: "assistant",
    offerLabel: "750 crédits assistant",
    productName: "750 crédits assistant Demaa",
    productDescription: "Crédits pour déléguer des tâches opérationnelles avec Demaa.",
    successPath: "/assistant/success",
    cancelPath: "/assistant#pricing",
  },
  {
    credits: 1000,
    unitAmount: 100000,
    offerType: "assistant",
    offerLabel: "1000 crédits assistant",
    productName: "1000 crédits assistant Demaa",
    productDescription: "Crédits pour déléguer des tâches opérationnelles avec Demaa.",
    successPath: "/assistant/success",
    cancelPath: "/assistant#pricing",
  },
] as const;

type CheckoutOffer = (typeof CHECKOUT_OFFERS)[number];

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

function getCheckoutOffer(credits: number): CheckoutOffer | null {
  return CHECKOUT_OFFERS.find((offer) => offer.credits === credits) ?? null;
}

function getStripeSecretKey() {
  return (
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY_TEST ||
    process.env.STRIPE_TEST_SECRET_KEY ||
    null
  );
}

function getStripePublishableKey() {
  return (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST ||
    process.env.STRIPE_PUBLISHABLE_KEY_TEST ||
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
  const offer = Number.isFinite(credits) ? getCheckoutOffer(credits) : null;

  if (!offer) {
    return NextResponse.json(
      { error: "Merci de choisir un montant de crédits valide." },
      { status: 400 }
    );
  }

  const secretKey = getStripeSecretKey();
  const publishableKey = getStripePublishableKey();

  if (!secretKey) {
    return NextResponse.json(
      {
        error:
          "Stripe n'est pas encore configuré. Ajoutez STRIPE_SECRET_KEY ou STRIPE_SECRET_KEY_TEST.",
      },
      { status: 500 }
    );
  }

  if (!publishableKey) {
    return NextResponse.json(
      {
        error:
          "Stripe Checkout intégré n'est pas encore configuré. Ajoutez STRIPE_PUBLISHABLE_KEY ou STRIPE_PUBLISHABLE_KEY_TEST.",
      },
      { status: 500 }
    );
  }

  const baseUrl = getBaseUrl(request);
  const checkoutParams = new URLSearchParams({
    mode: "payment",
    ui_mode: "embedded",
    return_url: `${baseUrl}${offer.successPath}?session_id={CHECKOUT_SESSION_ID}`,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][unit_amount]": String(offer.unitAmount),
    "line_items[0][price_data][product_data][name]": offer.productName,
    "line_items[0][price_data][product_data][description]":
      offer.productDescription,
    "metadata[offer_type]": offer.offerType,
    "metadata[credits]": String(offer.credits),
    "metadata[offer_label]": offer.offerLabel,
    "custom_fields[0][key]": "first_name",
    "custom_fields[0][label][type]": "custom",
    "custom_fields[0][label][custom]": "Prénom",
    "custom_fields[0][type]": "text",
    "custom_fields[1][key]": "last_name",
    "custom_fields[1][label][type]": "custom",
    "custom_fields[1][label][custom]": "Nom",
    "custom_fields[1][type]": "text",
    "custom_fields[2][key]": "whatsapp_phone",
    "custom_fields[2][label][type]": "custom",
    "custom_fields[2][label][custom]": "Téléphone WhatsApp",
    "custom_fields[2][optional]": "false",
    "custom_fields[2][type]": "text",
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

  const session = (await stripeResponse.json()) as {
    client_secret?: string | null;
    id?: string;
  };

  if (!session.client_secret) {
    return NextResponse.json(
      { error: "Stripe n'a pas retourné de client secret Checkout." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    id: session.id ?? null,
    clientSecret: session.client_secret,
    publishableKey,
  });
}
