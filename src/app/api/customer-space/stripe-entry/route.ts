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

export const runtime = "nodejs";

type StripeCheckoutSession = {
  id?: string;
  amount_total?: number | null;
  currency?: string | null;
  livemode?: boolean | null;
  metadata?: {
    offer_label?: string | null;
  } | null;
  status?: string | null;
  payment_status?: string | null;
  customer_email?: string | null;
  customer_details?: {
    email?: string | null;
  } | null;
};

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

async function retrieveCheckoutSession(sessionId: string) {
  const secretKey = getStripeSecretKey(sessionId);

  if (!secretKey) return null;

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

  if (!stripeResponse.ok) return null;

  return (await stripeResponse.json()) as StripeCheckoutSession;
}

export async function GET(request: Request) {
  const limited = enforceRateLimit(request, {
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
  const paid =
    session?.payment_status === "paid" ||
    session?.status === "complete";
  const email =
    session?.customer_details?.email ||
    session?.customer_email ||
    null;

  if (!paid || !email) {
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
  });

  const sessionToken = await createCustomerSession(email);
  const response = NextResponse.redirect(new URL("/mon-espace", request.url));

  response.cookies.set(
    CUSTOMER_SPACE_COOKIE,
    sessionToken,
    getCustomerCookieOptions()
  );

  return response;
}
