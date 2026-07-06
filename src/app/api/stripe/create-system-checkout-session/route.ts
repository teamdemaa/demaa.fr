import { NextResponse } from "next/server";
import { enforceRateLimit, normalizeText, readJsonBody } from "@/lib/api-security";
import { enforceAllowedHost } from "@/lib/request-guard";
import { getCanonicalBaseUrl } from "@/lib/site-url";

export const runtime = "nodejs";

type CreateSystemCheckoutSessionBody = {
  sectorSlug?: unknown;
  sectorName?: unknown;
  pillarCount?: unknown;
  processCount?: unknown;
  documentCount?: unknown;
};

function getStripeSecretKey() {
  return (
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY_TEST ||
    process.env.STRIPE_TEST_SECRET_KEY ||
    null
  );
}

function normalizeCount(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
}

function isValidSectorSlug(value: string) {
  return /^[a-z0-9-]{2,120}$/.test(value);
}

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const limited = enforceRateLimit(request, {
    keyPrefix: "stripe-create-system-checkout-session",
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { data: body, response } =
    await readJsonBody<CreateSystemCheckoutSessionBody>(request, 12 * 1024);
  if (response) return response;

  const sectorSlug = normalizeText(body?.sectorSlug, 120);
  const sectorName = normalizeText(body?.sectorName, 160);
  const pillarCount = normalizeCount(body?.pillarCount);
  const processCount = normalizeCount(body?.processCount);
  const documentCount = normalizeCount(body?.documentCount);

  if (!sectorSlug || !sectorName || !isValidSectorSlug(sectorSlug)) {
    return NextResponse.json(
      { error: "Le métier sélectionné est invalide." },
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

  const origin = getCanonicalBaseUrl(request);
  const offerLabel = `Le système complet - ${sectorName}`;
  const cartSummary = `${offerLabel} · ${documentCount} documents associés`;
  const serviceNames = sectorName;
  const serviceSlugs = sectorSlug;

  const formData = new URLSearchParams({
    mode: "payment",
    success_url: `${origin}/api/customer-space/stripe-entry?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/systemes/${encodeURIComponent(sectorSlug)}`,
    "billing_address_collection": "auto",
    "phone_number_collection[enabled]": "true",
    "metadata[order_type]": "sector_system",
    "metadata[offer_label]": offerLabel,
    "metadata[cart_summary]": cartSummary,
    "metadata[service_names]": serviceNames,
    "metadata[service_slugs]": serviceSlugs,
    "metadata[item_count]": "1",
    "metadata[sector_slug]": sectorSlug,
    "metadata[sector_name]": sectorName,
    "metadata[pillar_count]": String(pillarCount),
    "metadata[process_count]": String(processCount),
    "metadata[document_count]": String(documentCount),
    "line_items[0][price_data][currency]": "eur",
    "line_items[0][price_data][product_data][name]": offerLabel,
    "line_items[0][price_data][product_data][description]": `Tous les documents a implementer pour mettre en place le systeme de ${sectorName}.`,
    "line_items[0][price_data][unit_amount]": "55000",
    "line_items[0][quantity]": "1",
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
    console.error("[stripe-create-system-checkout-session] Stripe error", {
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
