import "server-only";

import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function isProductionDeployment() {
  return process.env.VERCEL_ENV === "production";
}

export function isExpectedCoachBusinessStripePrice(
  price: Stripe.Price,
  expectedIds: ReadonlySet<string>,
) {
  return expectedIds.has(price.id)
    && price.active
    && price.type === "recurring"
    && price.currency === "eur"
    && (price.unit_amount === 35_000 || price.unit_amount === 55_000)
    && price.recurring?.interval === "month"
    && price.recurring.interval_count === 1
    && price.livemode === isProductionDeployment();
}

export function subscriptionUsesCoachBusinessStripePrice(
  subscription: Stripe.Subscription,
  expectedIds: ReadonlySet<string>,
) {
  return subscription.items.data.some((item) => expectedIds.has(item.price.id));
}

export function getStripeSecretKey() {
  return isProductionDeployment()
    ? process.env.STRIPE_SECRET_KEY?.trim() || null
    : process.env.STRIPE_SECRET_KEY_TEST?.trim()
      || process.env.STRIPE_SECRET_KEY?.trim()
      || null;
}

export function getStripeWebhookSecret() {
  return isProductionDeployment()
    ? process.env.STRIPE_WEBHOOK_SECRET?.trim() || null
    : process.env.STRIPE_WEBHOOK_SECRET_TEST?.trim()
      || process.env.STRIPE_WEBHOOK_SECRET?.trim()
      || null;
}

export function getCoachBusinessStripePriceIds() {
  const value = isProductionDeployment()
    ? process.env.STRIPE_COACH_BUSINESS_PRICE_IDS?.trim() || ""
    : process.env.STRIPE_COACH_BUSINESS_PRICE_IDS_TEST?.trim()
      || process.env.STRIPE_COACH_BUSINESS_PRICE_IDS?.trim()
      || "";
  return new Set(value.split(",").map((entry) => entry.trim()).filter(Boolean));
}

export function getStripeClient() {
  const secretKey = getStripeSecretKey();
  if (!secretKey) throw new Error("Stripe secret key is not configured.");

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      appInfo: { name: "Demaa", version: "0.1.0" },
      typescript: true,
    });
  }

  return stripeClient;
}
