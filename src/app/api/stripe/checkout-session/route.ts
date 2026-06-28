import { NextResponse } from "next/server";
import {
  enforceRateLimit,
  isValidStripeSessionId,
  normalizeText,
} from "@/lib/api-security";
import { createAssistantAccessToken, resolveAssistantAccessToken } from "@/lib/assistant-access";
import { enforceAllowedHost } from "@/lib/request-guard";

export const runtime = "nodejs";

type StripeCheckoutSession = {
  status?: string | null;
  payment_status?: string | null;
  metadata?: {
    cart_summary?: string | null;
    credits?: string | null;
    offer_label?: string | null;
    offer_type?: string | null;
  } | null;
};

function getOfferLabel(session: StripeCheckoutSession) {
  if (session.metadata?.offer_label) return session.metadata.offer_label;
  return "Offre Demaa";
}

function getCartSummary(session: StripeCheckoutSession) {
  return session.metadata?.cart_summary || getOfferLabel(session);
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
  const blockedHost = enforceAllowedHost(request);
  if (blockedHost) return blockedHost;

  const limited = enforceRateLimit(request, {
    keyPrefix: "stripe-session-lookup",
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const sessionId = normalizeText(searchParams.get("session_id"), 120);
  const accessToken = normalizeText(searchParams.get("access_token"), 120);

  if (!sessionId && !accessToken) {
    return NextResponse.json(
      { error: "session_id or access_token is required." },
      { status: 400 }
    );
  }

  if (sessionId && !isValidStripeSessionId(sessionId)) {
    return NextResponse.json(
      { error: "session_id is invalid." },
      { status: 400 }
    );
  }

  const resolvedSessionId = sessionId || await resolveAssistantAccessToken(accessToken);

  if (!resolvedSessionId) {
    return NextResponse.json(
      { error: "Le lien d'acces assistant a expire." },
      { status: 401 }
    );
  }

  const secretKey = getStripeSecretKey(resolvedSessionId);

  if (!secretKey) {
    return NextResponse.json(
      {
        error: resolvedSessionId.startsWith("cs_test_")
          ? "La clé Stripe test est manquante. Ajoutez STRIPE_SECRET_KEY_TEST dans Vercel."
          : "STRIPE_SECRET_KEY is missing.",
      },
      { status: 500 }
    );
  }

  const stripeResponse = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(resolvedSessionId)}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Stripe-Version": "2026-02-25.clover",
      },
      cache: "no-store",
    }
  );

  if (!stripeResponse.ok) {
    console.error("Stripe session lookup error:", stripeResponse.status);

    return NextResponse.json(
      {
        error: "Impossible de vérifier cette session Stripe.",
      },
      { status: 502 }
    );
  }

  const session = (await stripeResponse.json()) as StripeCheckoutSession;
  const credits = session.metadata?.credits ? Number(session.metadata.credits) : null;
  const safeAccessToken = accessToken || await createAssistantAccessToken(resolvedSessionId);

  return NextResponse.json({
    accessToken: safeAccessToken,
    paid:
      session.payment_status === "paid" ||
      session.status === "complete",
    paymentStatus: session.payment_status ?? null,
    status: session.status ?? null,
    credits: Number.isFinite(credits) ? credits : null,
    offerType: session.metadata?.offer_type ?? null,
    offerLabel: getOfferLabel(session),
    cartSummary: getCartSummary(session),
  });
}
