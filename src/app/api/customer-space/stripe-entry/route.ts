import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  isValidStripeSessionId,
  normalizeText,
} from "@/lib/api-security";
import {
  CUSTOMER_SPACE_COOKIE,
  createCustomerSession,
  getCustomerCookieOptions,
} from "@/lib/customer-space-auth";
import { upsertConfirmedStripePayment } from "@/lib/generations-db";
import {
  getStripeCustomerEmail,
  getStripeMetadataList,
  isStripeSessionPaid,
  retrieveStripeCheckoutSession,
} from "@/lib/stripe-server";

export const runtime = "nodejs";

async function retrieveCheckoutSession(sessionId: string) {
  const result = await retrieveStripeCheckoutSession(sessionId, {
    logPrefix: "[customer-space-stripe-entry]",
    missingSecretMessage: "La clé Stripe serveur est manquante.",
  });

  return "session" in result ? result.session : null;
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, {
    keyPrefix: "customer-stripe-entry",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const url = new URL(request.url);
  const sessionId = normalizeText(url.searchParams.get("session_id"), 120);

  if (sessionId && !isValidStripeSessionId(sessionId)) {
    return NextResponse.redirect(new URL("/mon-espace?error=acces", request.url));
  }

  const session = sessionId ? await retrieveCheckoutSession(sessionId) : null;
  const paid = session ? isStripeSessionPaid(session) : false;
  const email = session ? getStripeCustomerEmail(session) : null;

  if (!session || !paid || !email) {
    return NextResponse.redirect(new URL("/mon-espace?error=acces", request.url));
  }

  await upsertConfirmedStripePayment({
    stripeSessionId: sessionId,
    stripeEventId: `stripe-entry-${sessionId}`,
    email,
    customerName: null,
    amountTotal: session.amount_total ?? null,
    currency: session.currency ?? null,
    offerLabel: session.metadata?.offer_label || "Commande Demaa",
    livemode: Boolean(session.livemode),
    paymentStatus: session.payment_status ?? null,
    checkoutStatus: session.status ?? null,
    orderType: session.metadata?.order_type || null,
    cartSummary: session.metadata?.cart_summary || null,
    serviceNames: getStripeMetadataList(session.metadata?.service_names, "|"),
    serviceSlugs: getStripeMetadataList(session.metadata?.service_slugs, ","),
    itemCount: Number(session.metadata?.item_count || 0) || null,
  });

  const sessionToken = await createCustomerSession(email);
  const response = NextResponse.redirect(new URL("/mon-espace?paid=1", request.url));

  response.cookies.set(
    CUSTOMER_SPACE_COOKIE,
    sessionToken,
    getCustomerCookieOptions()
  );

  return response;
}
