import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { projectCoachBusinessSubscription } from "@/lib/coach-business-subscription.server";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import {
  getCoachBusinessStripePriceIds,
  getStripeClient,
  getStripeWebhookSecret,
  subscriptionUsesCoachBusinessStripePrice,
} from "@/lib/stripe.server";

export const runtime = "nodejs";

async function getSubscriptionFromCheckoutSession(session: Stripe.Checkout.Session) {
  const subscriptionId = typeof session.subscription === "string"
    ? session.subscription
    : session.subscription?.id;
  if (!subscriptionId || session.metadata?.offer !== "coach_business") return null;
  return getStripeClient().subscriptions.retrieve(subscriptionId);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = getStripeWebhookSecret();
  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Configuration webhook Stripe manquante." },
      { status: 503 },
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch (error) {
    logOperationalError("stripe.webhook.signature_invalid", error);
    return NextResponse.json({ error: "Signature Stripe invalide." }, { status: 400 });
  }

  try {
    let subscription: Stripe.Subscription | null = null;
    let uidOverride: string | undefined;

    if (
      event.type === "customer.subscription.created"
      || event.type === "customer.subscription.updated"
      || event.type === "customer.subscription.deleted"
    ) {
      subscription = await getStripeClient().subscriptions.retrieve(event.data.object.id);
    } else if (
      event.type === "checkout.session.completed"
      || event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object;
      subscription = await getSubscriptionFromCheckoutSession(session);
      uidOverride = session.client_reference_id || session.metadata?.firebaseUid || undefined;
    }

    if (subscription && subscription.metadata.offer === "coach_business") {
      const coachBusinessPriceIds = getCoachBusinessStripePriceIds();
      if (coachBusinessPriceIds.size === 0) {
        throw new Error("Coach business Stripe Price IDs are not configured.");
      }
      if (!subscriptionUsesCoachBusinessStripePrice(subscription, coachBusinessPriceIds)) {
        logOperationalEvent("stripe.coach_business_subscription_ignored", {
          eventType: event.type,
          reason: "unexpected_price",
          subscriptionId: subscription.id,
        });
        return NextResponse.json({ received: true });
      }
      const result = await projectCoachBusinessSubscription({
        eventId: event.id,
        eventType: event.type,
        subscription,
        uidOverride,
      });
      logOperationalEvent("stripe.coach_business_subscription_projected", {
        duplicate: result.duplicate,
        eventType: event.type,
        uid: result.uid,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logOperationalError("stripe.coach_business_webhook_failed", error, {
      eventId: event.id,
      eventType: event.type,
    });
    return NextResponse.json(
      { error: "Le webhook Stripe n’a pas pu être traité." },
      { status: 500 },
    );
  }
}
