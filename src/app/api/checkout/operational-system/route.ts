import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  normalizeText,
  readJsonBody,
} from "@/lib/api-security";
import { enterpriseToSystem } from "@/lib/enterprise-annuaire";
import { getEnterpriseBySlug } from "@/lib/enterprise-annuaire-server";
import {
  getOperationalSystemProductName,
  OPERATIONAL_SYSTEM_OFFER,
} from "@/lib/operational-system-offer";
import { hasPaidOperationalSystemAsset } from "@/lib/paid-operational-system-assets.server";
import { enforceAllowedHost, enforceSameOrigin } from "@/lib/request-guard";
import { getCanonicalBaseUrl } from "@/lib/site-url";
import { getStripeClient } from "@/lib/stripe.server";

export const runtime = "nodejs";

type CheckoutBody = {
  systemSlug?: unknown;
};

function isValidSystemSlug(value: string) {
  return /^[a-z0-9-]{2,120}$/.test(value);
}

export async function POST(request: Request) {
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;
  const blockedOrigin = enforceSameOrigin(request);
  if (blockedOrigin) return blockedOrigin;

  const limited = await enforceRateLimit(request, {
    keyPrefix: "operational-system-checkout",
    limit: 12,
    windowMs: 10 * 60 * 1_000,
  });
  if (limited) return limited;

  const { data: body, response } = await readJsonBody<CheckoutBody>(
    request,
    2 * 1_024,
  );
  if (response) return response;

  const systemSlug = normalizeText(body?.systemSlug, 120);

  if (!isValidSystemSlug(systemSlug)) {
    return NextResponse.json(
      { error: "Le système sélectionné est invalide." },
      { status: 400 },
    );
  }

  if (!hasPaidOperationalSystemAsset(systemSlug)) {
    return NextResponse.json(
      { error: "Ce système n’est pas encore disponible à l’achat." },
      { status: 404 },
    );
  }

  const enterprise = await getEnterpriseBySlug(systemSlug);

  if (!enterprise) {
    return NextResponse.json(
      { error: "Le système sélectionné est introuvable." },
      { status: 404 },
    );
  }

  const systemName = enterpriseToSystem(enterprise).name || enterprise.name;
  const baseUrl = getCanonicalBaseUrl(request);
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_creation: "always",
    locale: "fr",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: OPERATIONAL_SYSTEM_OFFER.currency,
          unit_amount: OPERATIONAL_SYSTEM_OFFER.priceCents,
          product_data: {
            name: getOperationalSystemProductName(systemName),
            description:
              "Google Sheet modifiable livré automatiquement après paiement.",
          },
        },
      },
    ],
    metadata: {
      orderType: "operational_system",
      systemName,
      systemSlug,
    },
    payment_intent_data: {
      metadata: {
        orderType: "operational_system",
        systemName,
        systemSlug,
      },
    },
    success_url: `${baseUrl}/commande/systeme-operationnel/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/kit-operationnel/${encodeURIComponent(systemSlug)}`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe n’a pas retourné de page de paiement." },
      { status: 502 },
    );
  }

  return NextResponse.json({ url: session.url });
}
