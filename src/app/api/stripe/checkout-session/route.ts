import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  isValidStripeSessionId,
  normalizeText,
} from "@/lib/api-security";
import {
  getStripeCartSummary,
  getStripeCredits,
  getStripeOfferLabel,
  isStripeSessionPaid,
  retrieveStripeCheckoutSession,
  type StripeCheckoutSession,
} from "@/lib/stripe-server";

export const runtime = "nodejs";

function getOfferLabel(session: StripeCheckoutSession) {
  return getStripeOfferLabel(session, "Offre Demaa");
}

function getCartSummary(session: StripeCheckoutSession) {
  return getStripeCartSummary(session, "Offre Demaa");
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, {
    keyPrefix: "stripe-session-lookup",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const sessionId = normalizeText(searchParams.get("session_id"), 120);

  if (!sessionId) {
    return NextResponse.json(
      { error: "session_id is required." },
      { status: 400 }
    );
  }

  if (!isValidStripeSessionId(sessionId)) {
    return NextResponse.json(
      { error: "session_id is invalid." },
      { status: 400 }
    );
  }

  const result = await retrieveStripeCheckoutSession(sessionId, {
    logPrefix: "[stripe-session-lookup]",
    missingSecretMessage: sessionId.startsWith("cs_test_")
      ? "La clé Stripe test est manquante. Ajoutez STRIPE_SECRET_KEY_TEST dans Vercel."
      : "STRIPE_SECRET_KEY is missing.",
  });

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status }
    );
  }

  const session = result.session;
  const credits = getStripeCredits(session);

  return NextResponse.json({
    paid:
      isStripeSessionPaid(session),
    paymentStatus: session.payment_status ?? null,
    status: session.status ?? null,
    credits,
    offerType: session.metadata?.offer_type ?? null,
    offerLabel: getOfferLabel(session),
    cartSummary: getCartSummary(session),
  });
}
