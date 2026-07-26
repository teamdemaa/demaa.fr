import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeSecretKey() {
  return (
    process.env.STRIPE_SECRET_KEY?.trim() ||
    process.env.STRIPE_SECRET_KEY_TEST?.trim() ||
    null
  );
}

export function getStripeWebhookSecret() {
  return (
    process.env.STRIPE_WEBHOOK_SECRET?.trim() ||
    process.env.STRIPE_WEBHOOK_SECRET_TEST?.trim() ||
    null
  );
}

export function isStripeCheckoutConfigured() {
  return Boolean(getStripeSecretKey());
}

export function getStripeClient() {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    throw new Error("Stripe secret key is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      appInfo: {
        name: "Demaa",
        version: "0.1.0",
      },
    });
  }

  return stripeClient;
}
