import { NextResponse } from "next/server";
import { enforceRateLimit, readJsonBody } from "@/lib/api-security";
import { getPurchasableServices } from "@/lib/service-purchase";

export const runtime = "nodejs";

type CreateCheckoutSessionBody = {
  serviceSlugs?: unknown;
};

function getStripeSecretKey() {
  return (
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY_TEST ||
    process.env.STRIPE_TEST_SECRET_KEY ||
    null
  );
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, {
    keyPrefix: "stripe-create-checkout-session",
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data: body, response } =
    await readJsonBody<CreateCheckoutSessionBody>(request, 12 * 1024);
  if (response) return response;

  const inputSlugs = Array.isArray(body?.serviceSlugs)
    ? body.serviceSlugs.filter((value): value is string => typeof value === "string")
    : [];

  const uniqueSlugs = [...new Set(inputSlugs)].slice(0, 10);
  const purchasableServices = getPurchasableServices().filter((service) =>
    uniqueSlugs.includes(service.slug)
  );

  if (purchasableServices.length === 0) {
    return NextResponse.json(
      { error: "Aucun service payable n'a été sélectionné." },
      { status: 400 }
    );
  }

  if (purchasableServices.length !== uniqueSlugs.length) {
    return NextResponse.json(
      { error: "Un ou plusieurs services sélectionnés ne sont pas disponibles." },
      { status: 400 }
    );
  }

  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    return NextResponse.json(
      { error: "La clé Stripe serveur est manquante." },
      { status: 500 }
    );
  }

  const origin = new URL(request.url).origin;
  const cartSummary = purchasableServices.map((service) => service.name).join(" · ");
  const serviceNames = purchasableServices.map((service) => service.name).join("|");
  const serviceSlugs = purchasableServices.map((service) => service.slug).join(",");
  const offerLabel =
    purchasableServices.length > 1
      ? `${purchasableServices.length} services Demaa`
      : purchasableServices[0]?.name || "Service Demaa";

  const formData = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/api/customer-space/stripe-entry?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/annuaire-services`,
    "billing_address_collection": "auto",
    "phone_number_collection[enabled]": "true",
    "metadata[order_type]": "service_bundle",
    "metadata[offer_label]": offerLabel,
    "metadata[cart_summary]": cartSummary,
    "metadata[service_names]": serviceNames,
    "metadata[service_slugs]": serviceSlugs,
    "metadata[item_count]": String(purchasableServices.length),
  });

  purchasableServices.forEach((service, index) => {
    formData.append(
      `line_items[${index}][price_data][currency]`,
      service.currency
    );
    formData.append(
      `line_items[${index}][price_data][product_data][name]`,
      service.name
    );
    formData.append(
      `line_items[${index}][price_data][product_data][description]`,
      service.shortDescription
    );
    formData.append(
      `line_items[${index}][price_data][unit_amount]`,
      String(service.unitAmount)
    );
    formData.append(`line_items[${index}][quantity]`, "1");
  });

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2026-02-25.clover",
    },
    body: formData.toString(),
    cache: "no-store",
  });

  const rawBody = await stripeResponse.text().catch(() => "");

  if (!stripeResponse.ok) {
    console.error("[stripe-create-checkout-session] Stripe error", {
      status: stripeResponse.status,
      body: rawBody,
    });

    return NextResponse.json(
      { error: "Impossible de créer la session de paiement pour le moment." },
      { status: 502 }
    );
  }

  let payload: { url?: string | null } | null = null;

  try {
    payload = rawBody ? (JSON.parse(rawBody) as { url?: string | null }) : null;
  } catch {
    payload = null;
  }

  if (!payload?.url) {
    return NextResponse.json(
      { error: "Stripe n'a pas renvoyé d'URL de paiement." },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: payload.url });
}
