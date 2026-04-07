import { createHash } from "node:crypto";
import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

interface CacheRow {
  result_json?: string;
}

interface PaymentRow {
  stripe_session_id: string;
  email_sent_at: string | null;
}

interface GenerationInput {
  email: string;
  prompt: string;
  result: unknown;
  sector?: string;
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
}

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function getFirebaseCredential() {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    return cert(JSON.parse(serviceAccountKey));
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (projectId && clientEmail && privateKey) {
    return cert({
      projectId,
      clientEmail,
      privateKey,
    });
  }

  return applicationDefault();
}

function getDatabase() {
  if (!getApps().length) {
    initializeApp({
      credential: getFirebaseCredential(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  return getFirestore();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getStableKey(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function getPromptKey(prompt: string) {
  return getStableKey(prompt);
}

async function saveLead(email: string, now: string) {
  const database = getDatabase();
  const normalizedEmail = normalizeEmail(email);
  const leadRef = database.collection("leads").doc(getStableKey(normalizedEmail));

  await database.runTransaction(async (transaction) => {
    const leadDoc = await transaction.get(leadRef);

    transaction.set(
      leadRef,
      {
        email: normalizedEmail,
        created_at: leadDoc.exists ? leadDoc.data()?.created_at || now : now,
        updated_at: now,
      },
      { merge: true }
    );
  });
}

export async function saveGeneration(input: GenerationInput) {
  const database = getDatabase();
  const now = new Date().toISOString();
  const email = normalizeEmail(input.email);

  await saveLead(email, now);

  await database.collection("generations").add({
    email,
    prompt: input.prompt,
    sector: input.sector?.trim() || null,
    result_json: JSON.stringify(input.result),
    created_at: now,
  });
}

export async function getGenerationCountByEmail(email: string) {
  const database = getDatabase();
  const snapshot = await database
    .collection("generations")
    .where("email", "==", normalizeEmail(email))
    .get();

  return snapshot.size;
}

export async function getCachedAssistantPlan(prompt: string) {
  const database = getDatabase();
  const cacheDoc = await database
    .collection("assistant_plan_cache")
    .doc(getPromptKey(prompt))
    .get();

  if (!cacheDoc.exists) {
    return null;
  }

  const cacheRow = cacheDoc.data() as CacheRow | undefined;

  if (!cacheRow?.result_json) {
    return null;
  }

  try {
    return JSON.parse(cacheRow.result_json);
  } catch {
    return null;
  }
}

export async function saveAssistantPlanCache(prompt: string, result: unknown) {
  const database = getDatabase();
  const now = new Date().toISOString();

  await database.collection("assistant_plan_cache").doc(getPromptKey(prompt)).set({
    prompt_key: getPromptKey(prompt),
    prompt_text: prompt,
    result_json: JSON.stringify(result),
    created_at: now,
    updated_at: now,
  });
}

export async function upsertConfirmedStripePayment(input: StripePaymentInput) {
  const database = getDatabase();
  const now = new Date().toISOString();
  const paymentRef = database.collection("stripe_payments").doc(input.stripeSessionId);

  await database.runTransaction(async (transaction) => {
    const paymentDoc = await transaction.get(paymentRef);

    transaction.set(
      paymentRef,
      {
        stripe_session_id: input.stripeSessionId,
        stripe_event_id: input.stripeEventId,
        email: input.email?.trim().toLowerCase() || null,
        customer_name: input.customerName?.trim() || null,
        amount_total: input.amountTotal ?? null,
        currency: input.currency?.trim().toLowerCase() || null,
        offer_label: input.offerLabel,
        livemode: input.livemode,
        payment_status: input.paymentStatus?.trim() || null,
        checkout_status: input.checkoutStatus?.trim() || null,
        created_at: paymentDoc.exists ? paymentDoc.data()?.created_at || now : now,
        updated_at: now,
      },
      { merge: true }
    );
  });
}

export async function getStripePaymentBySessionId(sessionId: string) {
  const database = getDatabase();
  const paymentDoc = await database.collection("stripe_payments").doc(sessionId).get();

  if (!paymentDoc.exists) {
    return undefined;
  }

  const payment = paymentDoc.data() as PaymentRow | undefined;

  return {
    stripe_session_id: payment?.stripe_session_id || sessionId,
    email_sent_at: payment?.email_sent_at || null,
  };
}

export async function markStripePaymentEmailSent(sessionId: string) {
  const database = getDatabase();
  const now = new Date().toISOString();

  await database.collection("stripe_payments").doc(sessionId).set(
    {
      email_sent_at: now,
      updated_at: now,
    },
    { merge: true }
  );
}
