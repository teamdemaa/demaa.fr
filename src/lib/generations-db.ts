import { createHash } from "node:crypto";
import { normalizeEmail } from "@/lib/email";
import { getAdminFirestore } from "./firebase-admin";

interface AssistantDelegationRequestRow {
  created_at?: string | null;
  customer_name?: string | null;
  email?: string | null;
  livemode?: boolean | null;
  offer_label?: string | null;
  stripe_session_id?: string | null;
  tasks?: string | null;
  updated_at?: string | null;
  whatsapp_phone?: string | null;
  slack_notified_at?: string | null;
}

interface StripePaymentRow {
  amount_total?: number | null;
  cart_summary?: string | null;
  created_at?: string | null;
  currency?: string | null;
  offer_label?: string | null;
  order_type?: string | null;
  service_brief?: string | null;
  service_slugs?: string[] | null;
  stripe_session_id?: string | null;
  updated_at?: string | null;
}

interface MagicLinkRow {
  consumed_at?: string | null;
  email?: string | null;
  expires_at?: string | null;
}

interface CustomerSessionRow {
  email?: string | null;
  expires_at?: string | null;
}

interface SystemKitSequenceRow {
  created_at?: string | null;
  email?: string | null;
  first_name?: string | null;
  next_email_at?: string | null;
  sector?: string | null;
  sequence_completed_at?: string | null;
  sequence_last_email_sent_at?: string | null;
  sequence_step?: number | null;
  sequence_type?: string | null;
  source?: string | null;
  status?: string | null;
  system_name?: string | null;
  system_slug?: string | null;
  updated_at?: string | null;
}

function getStableKey(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function addDaysToIsoDate(fromIso: string, days: number) {
  const date = new Date(fromIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export async function getAssistantDelegationRequestsByEmail(email: string) {
  const database = getAdminFirestore();
  const normalizedEmail = normalizeEmail(email);
  const snapshot = await database
    .collection("assistant_delegation_requests")
    .where("email", "==", normalizedEmail)
    .get();

  return snapshot.docs
    .map((doc) => {
      const request = doc.data() as AssistantDelegationRequestRow | undefined;

      return {
        id: doc.id,
        createdAt: request?.created_at || null,
        customerName: request?.customer_name || null,
        email: request?.email || null,
        livemode: Boolean(request?.livemode),
        offerLabel: request?.offer_label || "Demande Demaa",
        slackNotifiedAt: request?.slack_notified_at || null,
        stripeSessionId: request?.stripe_session_id || doc.id,
        tasks: request?.tasks || null,
        updatedAt: request?.updated_at || null,
        whatsappPhone: request?.whatsapp_phone || null,
      };
    })
    .sort((a, b) => {
      const bDate = Date.parse(b.updatedAt || b.createdAt || "");
      const aDate = Date.parse(a.updatedAt || a.createdAt || "");
      return (Number.isFinite(bDate) ? bDate : 0) - (Number.isFinite(aDate) ? aDate : 0);
    });
}

export async function getStripePaymentsByEmail(email: string) {
  const database = getAdminFirestore();
  const normalizedEmail = normalizeEmail(email);
  const snapshot = await database
    .collection("stripe_payments")
    .where("email", "==", normalizedEmail)
    .get();

  return snapshot.docs
    .map((doc) => {
      const payment = doc.data() as StripePaymentRow | undefined;

      return {
        id: doc.id,
        amountTotal: payment?.amount_total ?? null,
        cartSummary: payment?.cart_summary || null,
        createdAt: payment?.created_at || null,
        currency: payment?.currency || "eur",
        offerLabel: payment?.offer_label || "Commande Demaa",
        orderType: payment?.order_type || null,
        serviceBrief: payment?.service_brief || null,
        serviceSlugs: payment?.service_slugs || [],
        stripeSessionId: payment?.stripe_session_id || doc.id,
        updatedAt: payment?.updated_at || null,
      };
    })
    .sort((a, b) => {
      const bDate = Date.parse(b.updatedAt || b.createdAt || "");
      const aDate = Date.parse(a.updatedAt || a.createdAt || "");
      return (Number.isFinite(bDate) ? bDate : 0) - (Number.isFinite(aDate) ? aDate : 0);
    });
}

export async function saveCustomerMagicLink(input: {
  email: string;
  expiresAt: string;
  tokenHash: string;
}) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();

  await database.collection("customer_magic_links").doc(input.tokenHash).set({
    email: normalizeEmail(input.email),
    expires_at: input.expiresAt,
    created_at: now,
    consumed_at: null,
  });
}

export async function consumeCustomerMagicLink(tokenHash: string) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();
  const linkRef = database.collection("customer_magic_links").doc(tokenHash);
  let email: string | null = null;

  await database.runTransaction(async (transaction) => {
    const linkDoc = await transaction.get(linkRef);
    const link = linkDoc.data() as MagicLinkRow | undefined;

    if (!linkDoc.exists || !link?.email || link.consumed_at) {
      return;
    }

    const expiresAt = Date.parse(link.expires_at || "");

    if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
      return;
    }

    email = normalizeEmail(link.email);
    transaction.set(linkRef, { consumed_at: now, updated_at: now }, { merge: true });
  });

  return email;
}

export async function saveCustomerSession(input: {
  email: string;
  expiresAt: string;
  sessionHash: string;
}) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();

  await database.collection("customer_sessions").doc(input.sessionHash).set({
    email: normalizeEmail(input.email),
    expires_at: input.expiresAt,
    created_at: now,
    updated_at: now,
  });
}

export async function getCustomerSessionEmail(sessionHash: string) {
  const database = getAdminFirestore();
  const sessionDoc = await database.collection("customer_sessions").doc(sessionHash).get();
  const session = sessionDoc.data() as CustomerSessionRow | undefined;

  if (!sessionDoc.exists || !session?.email) {
    return null;
  }

  const expiresAt = Date.parse(session.expires_at || "");

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return null;
  }

  return normalizeEmail(session.email);
}

export async function scheduleSystemKitSequence(input: {
  email: string;
  firstName: string;
  systemName: string;
  systemSlug: string;
}) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();
  const email = normalizeEmail(input.email);
  const subscriberRef = database.collection("system_kit_sequences").doc(getStableKey(email));

  await database.runTransaction(async (transaction) => {
    const subscriberDoc = await transaction.get(subscriberRef);

    transaction.set(
      subscriberRef,
      {
        email,
        first_name: input.firstName.trim(),
        sector: input.systemName.trim(),
        source: subscriberDoc.data()?.source || `systeme_kit_${input.systemSlug}`,
        status: "active",
        system_name: input.systemName.trim(),
        system_slug: input.systemSlug.trim(),
        sequence_type: "kit_systeme",
        sequence_step: 1,
        sequence_last_email_sent_at: now,
        next_email_at: addDaysToIsoDate(now, 7),
        sequence_completed_at: null,
        created_at: subscriberDoc.exists ? subscriberDoc.data()?.created_at || now : now,
        updated_at: now,
      },
      { merge: true }
    );
  });

  return { email };
}

export type SystemKitSequenceSubscriber = {
  collection: "abonnes" | "system_kit_sequences";
  id: string;
  email: string;
  firstName: string;
  systemName: string;
  systemSlug: string;
  sequenceStep: number;
};

export async function getDueSystemKitSequenceSubscribers(limit = 50) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();
  const [currentSnapshot, legacySnapshot] = await Promise.all([
    database.collection("system_kit_sequences").where("next_email_at", "<=", now).limit(limit).get(),
    database.collection("abonnes").where("next_email_at", "<=", now).limit(limit).get(),
  ]);
  const currentIds = new Set(currentSnapshot.docs.map((doc) => doc.id));
  const documents = [
    ...currentSnapshot.docs.map((doc) => ({ collection: "system_kit_sequences" as const, doc })),
    ...legacySnapshot.docs
      .filter((doc) => !currentIds.has(doc.id))
      .map((doc) => ({ collection: "abonnes" as const, doc })),
  ].slice(0, limit);

  return documents
    .map(({ collection, doc }) => {
      const subscriber = doc.data() as SystemKitSequenceRow | undefined;
      const isLegacyActive = collection === "abonnes" && subscriber?.status === "subscribed";
      const isCurrentActive = collection === "system_kit_sequences" && subscriber?.status === "active";

      if (
        subscriber?.sequence_type !== "kit_systeme" ||
        (!isLegacyActive && !isCurrentActive) ||
        !subscriber.email ||
        !subscriber.system_slug ||
        !subscriber.system_name
      ) {
        return null;
      }

      const sequenceStep = Number(subscriber.sequence_step ?? 0);

      if (!Number.isFinite(sequenceStep) || sequenceStep < 1) {
        return null;
      }

      return {
        collection,
        id: doc.id,
        email: normalizeEmail(subscriber.email),
        firstName: subscriber.first_name?.trim() || "",
        systemName: subscriber.system_name.trim(),
        systemSlug: subscriber.system_slug.trim(),
        sequenceStep,
      } satisfies SystemKitSequenceSubscriber;
    })
    .filter((subscriber): subscriber is SystemKitSequenceSubscriber => Boolean(subscriber));
}

export async function advanceSystemKitSequenceSubscriber(input: {
  collection?: "abonnes" | "system_kit_sequences";
  subscriberId: string;
  nextStep: number;
  completed: boolean;
}) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();

  const collection = input.collection ?? "system_kit_sequences";

  await database.collection(collection).doc(input.subscriberId).set(
    {
      sequence_step: input.nextStep,
      sequence_last_email_sent_at: now,
      next_email_at: input.completed ? null : addDaysToIsoDate(now, 7),
      status: input.completed ? "completed" : collection === "abonnes" ? "subscribed" : "active",
      sequence_completed_at: input.completed ? now : null,
      updated_at: now,
    },
    { merge: true }
  );
}
