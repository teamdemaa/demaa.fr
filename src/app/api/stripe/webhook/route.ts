import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  grantStripePaymentCredits,
  upsertConfirmedStripePayment,
} from "@/lib/generations-db";
import {
  getStripeCredits,
  getStripeCustomerEmail,
  getStripeCustomerName,
  getStripeCustomFieldValue,
  getStripeMetadataList,
  getStripeOfferLabel,
  type StripeCheckoutSession,
} from "@/lib/stripe-server";

export const runtime = "nodejs";

const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

type StripeEvent = {
  id?: string;
  livemode?: boolean;
  type?: string;
  data?: {
    object?: StripeCheckoutSession;
  };
};

function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string
) {
  const elements = signatureHeader.split(",").map((part) => part.trim());
  const timestamp = elements.find((part) => part.startsWith("t="))?.slice(2);
  const signatures = elements
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const timestampSeconds = Number(timestamp);
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (
    !Number.isFinite(timestampSeconds) ||
    Math.abs(nowSeconds - timestampSeconds) > STRIPE_WEBHOOK_TOLERANCE_SECONDS
  ) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return signatures.some((signature) => {
    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(signature, "utf8");

    if (expected.length !== received.length) {
      return false;
    }

    return timingSafeEqual(expected, received);
  });
}

function verifyStripeSignatureWithSecrets(
  payload: string,
  signatureHeader: string,
  secrets: Array<string | undefined>
) {
  return secrets
    .filter((secret): secret is string => Boolean(secret))
    .some((secret) => verifyStripeSignature(payload, signatureHeader, secret));
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[stripe-webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 400 }
    );
  }

  const payload = await request.text();

  const isValidSignature = verifyStripeSignatureWithSecrets(payload, signature, [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_WEBHOOK_SECRET_TEST,
    process.env.STRIPE_TEST_WEBHOOK_SECRET,
  ]);

  if (!isValidSignature) {
    console.error("[stripe-webhook] Invalid Stripe signature");
    return NextResponse.json(
      { error: "Invalid Stripe signature." },
      { status: 400 }
    );
  }

  let event: StripeEvent;

  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    console.error("[stripe-webhook] Invalid JSON payload");
    return NextResponse.json(
      { error: "Invalid Stripe payload." },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const sessionId = session?.id || null;
    const email = session ? getStripeCustomerEmail(session) : null;
    const name = session ? getStripeCustomerName(session) : null;
    const amountTotal = session?.amount_total ?? null;
    const whatsappPhone = getStripeCustomFieldValue(session?.custom_fields, "whatsapp_phone");
    const offerLabel = session ? getStripeOfferLabel(session, "Offre Demaa") : "Offre Demaa";
    const offerCredits = session ? (getStripeCredits(session) ?? 0) : 0;
    const orderType = session?.metadata?.order_type || null;
    const cartSummary = session?.metadata?.cart_summary || null;
    const serviceSlugs = getStripeMetadataList(session?.metadata?.service_slugs, ",");
    const serviceNames = getStripeMetadataList(session?.metadata?.service_names, "|");
    const itemCount = Number(session?.metadata?.item_count);

    if (!event.id || !sessionId) {
      console.error("[stripe-webhook] checkout.session.completed missing ids", {
        eventId: event.id,
        sessionId,
      });
      return NextResponse.json(
        { error: "Invalid checkout.session.completed payload." },
        { status: 400 }
      );
    }

    try {
      console.info("[stripe-webhook] Processing checkout.session.completed", {
        eventId: event.id,
        sessionId,
        livemode: Boolean(event.livemode),
        email,
        whatsappPhone,
        amountTotal,
      });

      await upsertConfirmedStripePayment({
        stripeSessionId: sessionId,
        stripeEventId: event.id,
        email,
        customerName: name,
        amountTotal,
        currency: session?.currency ?? null,
        offerLabel,
        livemode: Boolean(event.livemode),
        paymentStatus: session?.payment_status ?? null,
        checkoutStatus: session?.status ?? null,
        orderType,
        cartSummary,
        serviceNames,
        serviceSlugs,
        itemCount: Number.isFinite(itemCount) ? itemCount : serviceSlugs.length,
      });

      if (email && offerCredits > 0) {
        const creditGrant = await grantStripePaymentCredits({
          stripeSessionId: sessionId,
          email,
          credits: offerCredits,
          offerLabel,
        });

        console.info("[stripe-webhook] Credit grant result", {
          eventId: event.id,
          sessionId,
          email,
          credits: offerCredits,
          result: creditGrant.reason,
        });
      }

      console.info("[stripe-webhook] Payment stored and credits handled", {
        eventId: event.id,
        sessionId,
        email,
        offerLabel,
      });
    } catch (error) {
      console.error("[stripe-webhook] Failed to process checkout.session.completed", {
        eventId: event.id,
        sessionId,
        error: error instanceof Error ? error.message : error,
      });

      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Stripe webhook processing failed.",
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
