import { createHash } from "node:crypto";
import { normalizeEmail } from "@/lib/email";
import { getAdminFirestore } from "./firebase-admin";

interface PaymentRow {
  stripe_session_id: string;
  cart_summary?: string | null;
  customer_name?: string | null;
  email_sent_at: string | null;
  email?: string | null;
  order_type?: string | null;
  service_names?: string[] | null;
  slack_notified_at?: string | null;
}

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
  checkout_status?: string | null;
  created_at?: string | null;
  currency?: string | null;
  customer_name?: string | null;
  email?: string | null;
  item_count?: number | null;
  livemode?: boolean | null;
  offer_label?: string | null;
  order_type?: string | null;
  payment_status?: string | null;
  slack_notified_at?: string | null;
  service_brief?: string | null;
  service_brief_submitted_at?: string | null;
  service_names?: string[] | null;
  service_slugs?: string[] | null;
  stripe_session_id?: string | null;
  updated_at?: string | null;
  assistant_tasks?: string | null;
  assistant_tasks_submitted_at?: string | null;
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

interface AssistantAccessTokenRow {
  consumed_at?: string | null;
  expires_at?: string | null;
  stripe_session_id?: string | null;
}

interface StripePaymentInput {
  stripeSessionId: string;
  stripeEventId: string;
  email?: string | null;
  customerName?: string | null;
  amountTotal?: number | null;
  currency?: string | null;
  offerLabel: string;
  livemode: boolean;
  paymentStatus?: string | null;
  checkoutStatus?: string | null;
  orderType?: string | null;
  cartSummary?: string | null;
  serviceNames?: string[] | null;
  serviceSlugs?: string[] | null;
  itemCount?: number | null;
}

interface StripeCreditGrantInput {
  stripeSessionId: string;
  email: string;
  credits: number;
  offerLabel: string;
}

interface NewsletterSubscriberInput {
  firstName: string;
  sector: string;
  email: string;
  source?: string;
}

interface PartnerOffersSubscriberRow {
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

interface AssistantDelegationRequestInput {
  stripeSessionId: string;
  email?: string | null;
  customerName?: string | null;
  whatsappPhone?: string | null;
  offerLabel: string;
  credits?: number | null;
  tasks: string;
  livemode: boolean;
}

function getStableKey(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function normalizeStringList(values?: string[] | null) {
  if (!Array.isArray(values)) return [];

  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function addDaysToIsoDate(fromIso: string, days: number) {
  const date = new Date(fromIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

export async function upsertConfirmedStripePayment(input: StripePaymentInput) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();
  const paymentRef = database.collection("stripe_payments").doc(input.stripeSessionId);

  await database.runTransaction(async (transaction) => {
    const paymentDoc = await transaction.get(paymentRef);

    transaction.set(
      paymentRef,
      {
        stripe_session_id: input.stripeSessionId,
        stripe_event_id: paymentDoc.exists
          ? paymentDoc.data()?.stripe_event_id || input.stripeEventId
          : input.stripeEventId,
        email: input.email?.trim().toLowerCase() || null,
        customer_name: input.customerName?.trim() || null,
        amount_total: input.amountTotal ?? null,
        currency: input.currency?.trim().toLowerCase() || null,
        offer_label: input.offerLabel,
        livemode: input.livemode,
        payment_status: input.paymentStatus?.trim() || null,
        checkout_status: input.checkoutStatus?.trim() || null,
        order_type: input.orderType?.trim() || null,
        cart_summary: input.cartSummary?.trim() || null,
        service_names: normalizeStringList(input.serviceNames),
        service_slugs: normalizeStringList(input.serviceSlugs),
        item_count:
          typeof input.itemCount === "number" && Number.isFinite(input.itemCount)
            ? input.itemCount
            : normalizeStringList(input.serviceSlugs).length || null,
        created_at: paymentDoc.exists ? paymentDoc.data()?.created_at || now : now,
        updated_at: now,
      },
      { merge: true }
    );
  });
}

export async function getStripePaymentBySessionId(sessionId: string) {
  const database = getAdminFirestore();
  const paymentDoc = await database.collection("stripe_payments").doc(sessionId).get();

  if (!paymentDoc.exists) {
    return undefined;
  }

  const payment = paymentDoc.data() as PaymentRow | undefined;

  return {
    stripe_session_id: payment?.stripe_session_id || sessionId,
    cart_summary: payment?.cart_summary || null,
    customer_name: payment?.customer_name || null,
    email_sent_at: payment?.email_sent_at || null,
    email: payment?.email || null,
    order_type: payment?.order_type || null,
    service_names: payment?.service_names || [],
    slack_notified_at: payment?.slack_notified_at || null,
  };
}

export async function markStripePaymentSlackNotified(sessionId: string) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();

  await database.collection("stripe_payments").doc(sessionId).set(
    {
      slack_notified_at: now,
      updated_at: now,
    },
    { merge: true }
  );
}

export async function getAssistantDelegationRequestBySessionId(sessionId: string) {
  const database = getAdminFirestore();
  const requestDoc = await database
    .collection("assistant_delegation_requests")
    .doc(sessionId)
    .get();

  if (!requestDoc.exists) {
    return undefined;
  }

  const request = requestDoc.data() as AssistantDelegationRequestRow | undefined;

  return {
    slack_notified_at: request?.slack_notified_at || null,
  };
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
        assistantTasks: payment?.assistant_tasks || null,
        assistantTasksSubmittedAt: payment?.assistant_tasks_submitted_at || null,
        cartSummary: payment?.cart_summary || null,
        checkoutStatus: payment?.checkout_status || null,
        createdAt: payment?.created_at || null,
        currency: payment?.currency || "eur",
        customerName: payment?.customer_name || null,
        email: payment?.email || null,
        itemCount: payment?.item_count ?? null,
        livemode: Boolean(payment?.livemode),
        offerLabel: payment?.offer_label || "Commande Demaa",
        orderType: payment?.order_type || null,
        paymentStatus: payment?.payment_status || null,
        slackNotifiedAt: payment?.slack_notified_at || null,
        serviceBrief: payment?.service_brief || null,
        serviceBriefSubmittedAt: payment?.service_brief_submitted_at || null,
        serviceNames: payment?.service_names || [],
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

export async function saveAssistantAccessToken(input: {
  stripeSessionId: string;
  tokenHash: string;
  expiresAt: string;
}) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();

  await database.collection("assistant_access_tokens").doc(input.tokenHash).set({
    stripe_session_id: input.stripeSessionId,
    expires_at: input.expiresAt,
    created_at: now,
    consumed_at: null,
    updated_at: now,
  });
}

export async function getAssistantAccessTokenSessionId(tokenHash: string) {
  const database = getAdminFirestore();
  const tokenDoc = await database.collection("assistant_access_tokens").doc(tokenHash).get();
  const token = tokenDoc.data() as AssistantAccessTokenRow | undefined;

  if (!tokenDoc.exists || !token?.stripe_session_id) {
    return null;
  }

  const expiresAt = Date.parse(token.expires_at || "");

  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return null;
  }

  return token.stripe_session_id.trim() || null;
}

export async function saveAssistantDelegationRequest(
  input: AssistantDelegationRequestInput
) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();
  const requestRef = database
    .collection("assistant_delegation_requests")
    .doc(input.stripeSessionId);

  await database.runTransaction(async (transaction) => {
    const requestDoc = await transaction.get(requestRef);

    transaction.set(
      requestRef,
      {
        stripe_session_id: input.stripeSessionId,
        email: input.email?.trim().toLowerCase() || null,
        customer_name: input.customerName?.trim() || null,
        whatsapp_phone: input.whatsappPhone?.trim() || null,
        offer_label: input.offerLabel,
        credits: input.credits ?? null,
        tasks: input.tasks.trim(),
        livemode: input.livemode,
        slack_notified_at: now,
        created_at: requestDoc.exists ? requestDoc.data()?.created_at || now : now,
        updated_at: now,
      },
      { merge: true }
    );

    transaction.set(
      database.collection("stripe_payments").doc(input.stripeSessionId),
      {
        assistant_tasks: input.tasks.trim(),
        assistant_tasks_submitted_at: now,
        slack_notified_at: now,
        updated_at: now,
      },
      { merge: true }
    );
  });
}

export async function grantStripePaymentCredits(input: StripeCreditGrantInput) {
  const credits = Number(input.credits);

  if (!Number.isFinite(credits) || credits <= 0) {
    return { granted: false, reason: "invalid_credits" };
  }

  const database = getAdminFirestore();
  const now = new Date().toISOString();
  const email = normalizeEmail(input.email);
  const userCreditRef = database.collection("user_credits").doc(getStableKey(email));
  const creditTransactionRef = database
    .collection("credit_transactions")
    .doc(`stripe_${input.stripeSessionId}`);

  let granted = false;

  await database.runTransaction(async (transaction) => {
    const creditTransactionDoc = await transaction.get(creditTransactionRef);

    if (creditTransactionDoc.exists) {
      return;
    }

    const userCreditDoc = await transaction.get(userCreditRef);
    const currentBalance = Number(userCreditDoc.data()?.balance ?? 0);
    const nextBalance = (Number.isFinite(currentBalance) ? currentBalance : 0) + credits;

    transaction.set(
      userCreditRef,
      {
        email,
        balance: nextBalance,
        created_at: userCreditDoc.exists ? userCreditDoc.data()?.created_at || now : now,
        updated_at: now,
      },
      { merge: true }
    );

    transaction.set(creditTransactionRef, {
      email,
      amount: credits,
      balance_after: nextBalance,
      direction: "credit",
      reason: "stripe_purchase",
      stripe_session_id: input.stripeSessionId,
      offer_label: input.offerLabel,
      created_at: now,
    });

    transaction.set(
      database.collection("stripe_payments").doc(input.stripeSessionId),
      {
        credits_granted: credits,
        credits_granted_at: now,
        updated_at: now,
      },
      { merge: true }
    );

    granted = true;
  });

  return {
    granted,
    credits,
    reason: granted ? "granted" : "already_granted",
  };
}

export async function getCreditBalanceByEmail(email: string) {
  const database = getAdminFirestore();
  const normalizedEmail = normalizeEmail(email);
  const userCreditDoc = await database
    .collection("user_credits")
    .doc(getStableKey(normalizedEmail))
    .get();

  if (!userCreditDoc.exists) {
    return 0;
  }

  const balance = Number(userCreditDoc.data()?.balance ?? 0);

  return Number.isFinite(balance) ? balance : 0;
}

export async function saveNewsletterSubscriber(input: NewsletterSubscriberInput) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();
  const email = normalizeEmail(input.email);
  const subscriberId = getStableKey(email);
  const subscriberRef = database.collection("abonnes").doc(subscriberId);

  await database.runTransaction(async (transaction) => {
    const subscriberDoc = await transaction.get(subscriberRef);

    transaction.set(
      subscriberRef,
      {
        email,
        first_name: input.firstName.trim(),
        sector: input.sector.trim(),
        source: input.source?.trim() || "newsletter",
        status: "subscribed",
        newsletter_opt_in: true,
        newsletter_opt_in_at: now,
        newsletter_topics: ["mini-cours", "offres-partenaires"],
        resend_sync_status: "pending",
        created_at: subscriberDoc.exists ? subscriberDoc.data()?.created_at || now : now,
        updated_at: now,
      },
      { merge: true }
    );
  });

  return { email, subscriberId };
}

export async function updateNewsletterResendSyncStatus(input: {
  subscriberId: string;
  status: "sent" | "failed" | "skipped";
  error?: string | null;
}) {
  const now = new Date().toISOString();

  await getAdminFirestore().collection("abonnes").doc(input.subscriberId).set(
    {
      resend_sync_status: input.status,
      resend_synced_at: input.status === "sent" ? now : null,
      resend_sync_error: input.error?.slice(0, 500) || null,
      updated_at: now,
    },
    { merge: true },
  );
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
      const subscriber = doc.data() as PartnerOffersSubscriberRow | undefined;
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

export async function saveServiceBundleBrief(input: {
  stripeSessionId: string;
  brief: string;
}) {
  const database = getAdminFirestore();
  const now = new Date().toISOString();

  await database.collection("stripe_payments").doc(input.stripeSessionId).set(
    {
      service_brief: input.brief.trim(),
      service_brief_submitted_at: now,
      updated_at: now,
    },
    { merge: true }
  );

  return {
    brief: input.brief.trim(),
    serviceBriefSubmittedAt: now,
  };
}
