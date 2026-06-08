import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  grantStripePaymentCredits,
  upsertConfirmedStripePayment,
} from "@/lib/generations-db";

export const runtime = "nodejs";

const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 5 * 60;

type StripeEvent = {
  id?: string;
  livemode?: boolean;
  type?: string;
  data?: {
    object?: {
      id?: string;
      status?: string | null;
      payment_status?: string | null;
      currency?: string | null;
      amount_total?: number | null;
      customer_email?: string | null;
      customer_details?: {
        email?: string | null;
        name?: string | null;
      } | null;
      custom_fields?: Array<{
        key?: string | null;
        text?: {
          value?: string | null;
        } | null;
      }> | null;
      metadata?: {
        credits?: string | null;
        offer_label?: string | null;
        offer_type?: string | null;
      } | null;
    };
  };
};

type StripeSessionMetadata = NonNullable<
  NonNullable<NonNullable<StripeEvent["data"]>["object"]>["metadata"]
>;

function getOfferLabel(input: {
  amountTotal: number | null | undefined;
  metadata?: StripeSessionMetadata | null;
}) {
  if (input.metadata?.offer_label) return input.metadata.offer_label;
  return "Offre Demaa";
}

function getOfferCredits(metadata?: StripeSessionMetadata | null) {
  const credits = Number(metadata?.credits);

  return Number.isFinite(credits) && credits > 0 ? credits : 0;
}

function getCustomFieldValue(
  customFields: NonNullable<
    NonNullable<NonNullable<StripeEvent["data"]>["object"]>["custom_fields"]
  > | null | undefined,
  key: string
) {
  return (
    customFields?.find((field) => field.key === key)?.text?.value?.trim() ||
    null
  );
}

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

  const event = JSON.parse(payload) as StripeEvent;

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const sessionId = session?.id || null;
    const email =
      session?.customer_details?.email || session?.customer_email || null;
    const name = session?.customer_details?.name || null;
    const amountTotal = session?.amount_total ?? null;
    const whatsappPhone = getCustomFieldValue(session?.custom_fields, "whatsapp_phone");
    const offerLabel = getOfferLabel({
      amountTotal,
      metadata: session?.metadata,
    });
    const offerCredits = getOfferCredits(session?.metadata);

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
