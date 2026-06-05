import { NextResponse } from "next/server";
import { getAssistantPack } from "@/lib/assistant-packs";

export const runtime = "nodejs";

type CheckoutRequestBody = {
  items?: Array<{
    packId?: unknown;
    quantity?: unknown;
  }>;
};

type CheckoutItem = {
  packId: string;
  quantity: number;
};

type StripeErrorResponse = {
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
};

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

function normalizeCheckoutItems(body: CheckoutRequestBody | null) {
  const rawItems = Array.isArray(body?.items) ? body.items : [];
  const itemsByPack = new Map<string, number>();

  for (const item of rawItems) {
    const packId = typeof item.packId === "string" ? item.packId.trim() : "";
    const quantity = Number(item.quantity ?? 1);

    if (!packId || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return null;
    }

    if (!getAssistantPack(packId)) {
      return null;
    }

    const nextQuantity = (itemsByPack.get(packId) ?? 0) + quantity;

    if (nextQuantity > 20) {
      return null;
    }

    itemsByPack.set(packId, nextQuantity);
  }

  const items = Array.from(itemsByPack.entries()).map(([packId, quantity]) => ({
    packId,
    quantity,
  }));

  if (items.length === 0 || items.length > 10) {
    return null;
  }

  return items satisfies CheckoutItem[];
}

function getCartSummary(items: CheckoutItem[]) {
  return items
    .map((item) => {
      const details = getAssistantPack(item.packId);

      if (!details) return null;

      const label = `${details.offer.title} - ${details.pack.label}`;
      return item.quantity > 1 ? `${label} x${item.quantity}` : label;
    })
    .filter((item): item is string => Boolean(item))
    .join("; ");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CheckoutRequestBody | null;
  const items = normalizeCheckoutItems(body);

  if (!items) {
    return NextResponse.json(
      { error: "Merci de choisir au moins un pack assistant valide." },
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
  const cartSummary = getCartSummary(items);
  const checkoutParams = new URLSearchParams({
    mode: "payment",
    success_url: `${baseUrl}/assistant/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/deleguer`,
    "metadata[offer_type]": "assistant_packs",
    "metadata[offer_label]": cartSummary.slice(0, 500),
    "metadata[cart_summary]": cartSummary.slice(0, 500),
    "metadata[item_count]": String(items.reduce((total, item) => total + item.quantity, 0)),
    billing_address_collection: "auto",
  });

  items.forEach((item, index) => {
    const details = getAssistantPack(item.packId);

    if (!details) return;

    checkoutParams.set(`line_items[${index}][quantity]`, String(item.quantity));
    checkoutParams.set(`line_items[${index}][price_data][currency]`, "eur");
    checkoutParams.set(
      `line_items[${index}][price_data][unit_amount]`,
      String(details.pack.amount * 100)
    );
    checkoutParams.set(
      `line_items[${index}][price_data][product_data][name]`,
      `${details.offer.title} - ${details.pack.label}`
    );
    checkoutParams.set(
      `line_items[${index}][price_data][product_data][description]`,
      `${details.pack.detail}. ${details.offer.description}`
    );
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
    url?: string | null;
  };

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe n'a pas retourné d'URL Checkout." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    id: session.id ?? null,
    clientSecret: session.client_secret ?? null,
    label: cartSummary,
    publishableKey: null,
    url: session.url,
  });
}
