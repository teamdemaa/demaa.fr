import "server-only";

import type Stripe from "stripe";
import { getAdminFirestore } from "@/lib/firebase-admin";

const SUBSCRIPTIONS_COLLECTION = "customer_subscriptions";
const WEBHOOK_EVENTS_COLLECTION = "stripe_webhook_events";
const ACTIVE_STATUSES = new Set<Stripe.Subscription.Status>(["active", "trialing"]);

type StoredCoachBusinessSubscription = {
  cancel_at_period_end?: unknown;
  current_period_end?: unknown;
  offer?: unknown;
  status?: unknown;
  stripe_customer_id?: unknown;
  stripe_subscription_id?: unknown;
};

export type CoachBusinessSubscription = Readonly<{
  active: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  customerId: string | null;
  status: Stripe.Subscription.Status | "none";
  subscriptionId: string | null;
}>;

function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseStatus(value: unknown): Stripe.Subscription.Status | "none" {
  const status = cleanString(value, 40) as Stripe.Subscription.Status;
  return [
    "active",
    "canceled",
    "incomplete",
    "incomplete_expired",
    "past_due",
    "paused",
    "trialing",
    "unpaid",
  ].includes(status) ? status : "none";
}

function parseStoredSubscription(
  value: StoredCoachBusinessSubscription | undefined,
): CoachBusinessSubscription {
  const status = parseStatus(value?.status);
  const offer = cleanString(value?.offer, 40);
  const isCoachBusiness = offer === "coach_business";
  return {
    active: isCoachBusiness && status !== "none" && ACTIVE_STATUSES.has(status),
    cancelAtPeriodEnd: value?.cancel_at_period_end === true,
    currentPeriodEnd: cleanString(value?.current_period_end, 40) || null,
    customerId: cleanString(value?.stripe_customer_id, 120) || null,
    status: isCoachBusiness ? status : "none",
    subscriptionId: cleanString(value?.stripe_subscription_id, 120) || null,
  };
}

export async function getCoachBusinessSubscriptionForUid(uid: string) {
  const normalizedUid = cleanString(uid, 160);
  if (!normalizedUid) return parseStoredSubscription(undefined);
  const snapshot = await getAdminFirestore()
    .collection(SUBSCRIPTIONS_COLLECTION)
    .doc(normalizedUid)
    .get();
  return parseStoredSubscription(
    snapshot.data() as StoredCoachBusinessSubscription | undefined,
  );
}

export async function hasActiveCoachBusinessSubscription(uid: string) {
  return (await getCoachBusinessSubscriptionForUid(uid)).active;
}

function getStripeId(value: string | { id: string } | null) {
  return typeof value === "string" ? value : value?.id || "";
}

export async function projectCoachBusinessSubscription(input: {
  eventId: string;
  eventType: string;
  subscription: Stripe.Subscription;
  uidOverride?: string;
}) {
  const uid = cleanString(
    input.uidOverride || input.subscription.metadata.firebaseUid,
    160,
  );
  const offer = cleanString(input.subscription.metadata.offer, 40);
  if (!uid || offer !== "coach_business") {
    throw new Error("Stripe subscription metadata is invalid.");
  }

  const eventId = cleanString(input.eventId, 160);
  if (!eventId) throw new Error("Stripe event ID is missing.");

  const database = getAdminFirestore();
  const subscriptionReference = database
    .collection(SUBSCRIPTIONS_COLLECTION)
    .doc(uid);
  const eventReference = database
    .collection(WEBHOOK_EVENTS_COLLECTION)
    .doc(eventId);
  const now = new Date().toISOString();
  const currentPeriodEndSeconds = Math.max(
    0,
    ...input.subscription.items.data.map((item) => item.current_period_end),
  );
  const currentPeriodEnd = currentPeriodEndSeconds > 0
    ? new Date(currentPeriodEndSeconds * 1000).toISOString()
    : null;

  return database.runTransaction(async (transaction) => {
    const existingEvent = await transaction.get(eventReference);
    if (existingEvent.exists) return { duplicate: true, uid } as const;

    transaction.set(subscriptionReference, {
      cancel_at_period_end: input.subscription.cancel_at_period_end,
      current_period_end: currentPeriodEnd,
      offer: "coach_business",
      status: input.subscription.status,
      stripe_customer_id: getStripeId(input.subscription.customer),
      stripe_subscription_id: input.subscription.id,
      updated_at: now,
    }, { merge: true });
    transaction.create(eventReference, {
      event_type: cleanString(input.eventType, 120),
      processed_at: now,
      subscription_id: input.subscription.id,
      uid,
    });

    return { duplicate: false, uid } as const;
  });
}
