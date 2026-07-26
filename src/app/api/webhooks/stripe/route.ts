import { NextResponse } from "next/server";
import { fulfillOperationalSystemOrder } from "@/lib/operational-system-orders.server";
import { logOperationalError, logOperationalEvent } from "@/lib/operational-log";
import {
  getStripeClient,
  getStripeWebhookSecret,
} from "@/lib/stripe.server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = getStripeWebhookSecret();

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Configuration webhook Stripe manquante." },
      { status: 503 },
    );
  }

  let event;

  try {
    event = getStripeClient().webhooks.constructEvent(
      await request.text(),
      signature,
      webhookSecret,
    );
  } catch (error) {
    logOperationalError("stripe.webhook.signature_invalid", error);
    return NextResponse.json(
      { error: "Signature Stripe invalide." },
      { status: 400 },
    );
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    try {
      const result = await fulfillOperationalSystemOrder(event.data.object);

      if (!result.fulfilled || !result.emailSent) {
        throw new Error(
          !result.fulfilled
            ? `Order fulfillment rejected: ${result.reason}`
            : "Delivery email was not sent.",
        );
      }

      logOperationalEvent("operational_system.order_fulfilled", {
        stripeSessionId: event.data.object.id,
        systemSlug: result.systemSlug,
      });
    } catch (error) {
      logOperationalError("operational_system.order_fulfillment_failed", error, {
        stripeSessionId: event.data.object.id,
      });
      return NextResponse.json(
        { error: "La livraison de la commande a échoué." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
