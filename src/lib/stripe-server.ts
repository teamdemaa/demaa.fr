import "server-only";

export type StripeCheckoutSession = {
  id?: string;
  status?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  livemode?: boolean | null;
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
    cart_summary?: string | null;
    credits?: string | null;
    item_count?: string | null;
    offer_label?: string | null;
    offer_type?: string | null;
    order_type?: string | null;
    service_names?: string | null;
    service_slugs?: string | null;
  } | null;
};

type StripeErrorResponse = {
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
};

export function getStripeSecretKeyForSession(sessionId: string) {
  if (sessionId.startsWith("cs_test_")) {
    return (
      process.env.STRIPE_SECRET_KEY_TEST ||
      process.env.STRIPE_TEST_SECRET_KEY ||
      null
    );
  }

  return process.env.STRIPE_SECRET_KEY || null;
}

export function getDefaultStripeSecretKey() {
  return (
    process.env.STRIPE_SECRET_KEY ||
    process.env.STRIPE_SECRET_KEY_TEST ||
    process.env.STRIPE_TEST_SECRET_KEY ||
    null
  );
}

export function getStripeOfferLabel(session: StripeCheckoutSession, fallback: string) {
  return session.metadata?.offer_label || fallback;
}

export function getStripeCartSummary(session: StripeCheckoutSession, fallback: string) {
  return session.metadata?.cart_summary || getStripeOfferLabel(session, fallback);
}

export function getStripeCredits(session: StripeCheckoutSession) {
  const credits = Number(session.metadata?.credits);

  return Number.isFinite(credits) && credits > 0 ? credits : null;
}

export function getStripeCustomerEmail(session: StripeCheckoutSession) {
  return session.customer_details?.email || session.customer_email || null;
}

export function getStripeCustomerName(session: StripeCheckoutSession) {
  return session.customer_details?.name || null;
}

export function isStripeSessionPaid(session: StripeCheckoutSession) {
  return session.payment_status === "paid" || session.status === "complete";
}

export function getStripeMetadataList(value?: string | null, separator = ",") {
  if (!value) return [];

  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getStripeCustomFieldValue(
  customFields: StripeCheckoutSession["custom_fields"],
  key: string
) {
  return (
    customFields?.find((field) => field.key === key)?.text?.value?.trim() ||
    null
  );
}

export async function retrieveStripeCheckoutSession(
  sessionId: string,
  options: {
    logPrefix: string;
    missingSecretMessage: string;
  }
) {
  const secretKey = getStripeSecretKeyForSession(sessionId);

  if (!secretKey) {
    return {
      error: options.missingSecretMessage,
      status: 500,
    } as const;
  }

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

  if (!stripeResponse.ok) {
    const rawBody = await stripeResponse.text().catch(() => "");
    let parsedBody: StripeErrorResponse | null = null;

    try {
      parsedBody = rawBody ? (JSON.parse(rawBody) as StripeErrorResponse) : null;
    } catch {
      parsedBody = null;
    }

    const stripeMessage =
      parsedBody?.error?.message ||
      parsedBody?.error?.code ||
      parsedBody?.error?.type ||
      rawBody ||
      "Impossible de vérifier cette session Stripe.";

    console.error(`${options.logPrefix} Stripe lookup error:`, stripeResponse.status, stripeMessage);

    return {
      error: `Impossible de vérifier cette session Stripe. ${stripeMessage}`,
      status: 502,
    } as const;
  }

  return {
    session: (await stripeResponse.json()) as StripeCheckoutSession,
  } as const;
}
