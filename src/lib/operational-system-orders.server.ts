import "server-only";

import type Stripe from "stripe";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { getOperationalSystemProductName, OPERATIONAL_SYSTEM_OFFER } from "@/lib/operational-system-offer";
import { sendOperationalSystemDeliveryEmail } from "@/lib/operational-system-delivery-email.server";
import { getPaidOperationalSystemCopyUrl } from "@/lib/paid-operational-system-assets.server";

type PaidOperationalSystemSession = Stripe.Checkout.Session & {
  metadata: {
    orderType: "operational_system";
    systemName: string;
    systemSlug: string;
  };
};

export function isPaidOperationalSystemSession(
  session: Stripe.Checkout.Session,
): session is PaidOperationalSystemSession {
  return (
    session.payment_status === "paid" &&
    session.amount_total === OPERATIONAL_SYSTEM_OFFER.priceCents &&
    session.currency === OPERATIONAL_SYSTEM_OFFER.currency &&
    session.metadata?.orderType === "operational_system" &&
    Boolean(session.metadata.systemName) &&
    Boolean(session.metadata.systemSlug)
  );
}

async function storePaidOrder(session: PaidOperationalSystemSession, email: string) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();
  const orderRef = database.collection("operational_system_orders").doc(session.id);

  await orderRef.set(
    {
      amount_total: session.amount_total,
      created_at: new Date(session.created * 1_000).toISOString(),
      currency: session.currency,
      customer_email: email,
      order_type: "operational_system",
      payment_status: session.payment_status,
      stripe_session_id: session.id,
      system_name: session.metadata.systemName,
      system_slug: session.metadata.systemSlug,
      updated_at: now,
    },
    { merge: true },
  );
}

async function markDeliveryEmailSent(sessionId: string) {
  const now = new Date().toISOString();
  await getAdminFirestore()
    .collection("operational_system_orders")
    .doc(sessionId)
    .set(
      {
        delivery_email_sent_at: now,
        updated_at: now,
      },
      { merge: true },
    );
}

export async function fulfillOperationalSystemOrder(
  session: Stripe.Checkout.Session,
) {
  if (!isPaidOperationalSystemSession(session)) {
    return { fulfilled: false as const, reason: "invalid_payment" as const };
  }

  const copyUrl = getPaidOperationalSystemCopyUrl(session.metadata.systemSlug);
  const email =
    session.customer_details?.email?.trim().toLowerCase() ||
    session.customer_email?.trim().toLowerCase() ||
    null;

  if (!copyUrl) {
    return { fulfilled: false as const, reason: "missing_asset" as const };
  }

  if (!email) {
    return { fulfilled: false as const, reason: "missing_email" as const };
  }

  await storePaidOrder(session, email);
  const emailResult = await sendOperationalSystemDeliveryEmail({
    copyUrl,
    email,
    sessionId: session.id,
    systemName: session.metadata.systemName,
  });

  if (emailResult.sent) {
    await markDeliveryEmailSent(session.id);
  }

  return {
    fulfilled: true as const,
    copyUrl,
    email,
    emailSent: emailResult.sent,
    productName: getOperationalSystemProductName(session.metadata.systemName),
    systemName: session.metadata.systemName,
    systemSlug: session.metadata.systemSlug,
  };
}
