import fs from "node:fs";
import { createHash } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const SQLITE_PATH = "data/demaa.sqlite";
const ENV_PATH = ".env.local";

function loadEnvFile(path) {
  if (!fs.existsSync(path)) {
    return;
  }

  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    let value = rawValue.trim();

    if (value.startsWith('"') && value.endsWith('"')) {
      value = value
        .slice(1, -1)
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");
    }

    process.env[key] ||= value;
  }
}

function getStableKey(value) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getFirebaseCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
  }

  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
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

function getSqliteRows(sqlite) {
  const leads = sqlite
    .prepare("SELECT id, email, created_at FROM leads")
    .all();

  const generations = sqlite
    .prepare(
      `
        SELECT g.id, l.email, g.prompt, g.sector, g.result_json, g.created_at
        FROM generations g
        INNER JOIN leads l ON l.id = g.lead_id
      `
    )
    .all();

  const assistantPlanCache = sqlite
    .prepare(
      `
        SELECT prompt_key, prompt_text, result_json, created_at
        FROM assistant_plan_cache
      `
    )
    .all();

  const stripePayments = sqlite
    .prepare(
      `
        SELECT
          stripe_session_id,
          stripe_event_id,
          email,
          customer_name,
          amount_total,
          currency,
          offer_label,
          livemode,
          payment_status,
          checkout_status,
          email_sent_at,
          created_at,
          updated_at
        FROM stripe_payments
      `
    )
    .all();

  return {
    leads,
    generations,
    assistantPlanCache,
    stripePayments,
  };
}

async function migrateCollection({ rows, getRef, getData }) {
  let migrated = 0;

  for (const row of rows) {
    await getRef(row).set(getData(row), { merge: true });
    migrated += 1;
  }

  return migrated;
}

async function main() {
  loadEnvFile(ENV_PATH);

  if (!fs.existsSync(SQLITE_PATH)) {
    throw new Error(`SQLite database not found at ${SQLITE_PATH}`);
  }

  const sqlite = new DatabaseSync(SQLITE_PATH);
  const firestore = getDatabase();
  const rows = getSqliteRows(sqlite);
  const migratedAt = new Date().toISOString();

  const leads = await migrateCollection({
    rows: rows.leads,
    getRef: (lead) =>
      firestore.collection("leads").doc(getStableKey(normalizeEmail(lead.email))),
    getData: (lead) => ({
      email: normalizeEmail(lead.email),
      created_at: lead.created_at,
      updated_at: migratedAt,
      migrated_from: "sqlite",
      sqlite_id: lead.id,
    }),
  });

  const generations = await migrateCollection({
    rows: rows.generations,
    getRef: (generation) =>
      firestore.collection("generations").doc(`sqlite-${generation.id}`),
    getData: (generation) => ({
      email: normalizeEmail(generation.email),
      prompt: generation.prompt,
      sector: generation.sector || null,
      result_json: generation.result_json,
      created_at: generation.created_at,
      updated_at: migratedAt,
      migrated_from: "sqlite",
      sqlite_id: generation.id,
    }),
  });

  const assistantPlanCache = await migrateCollection({
    rows: rows.assistantPlanCache,
    getRef: (cache) =>
      firestore.collection("assistant_plan_cache").doc(cache.prompt_key),
    getData: (cache) => ({
      prompt_key: cache.prompt_key,
      prompt_text: cache.prompt_text,
      result_json: cache.result_json,
      created_at: cache.created_at,
      updated_at: migratedAt,
      migrated_from: "sqlite",
    }),
  });

  const stripePayments = await migrateCollection({
    rows: rows.stripePayments,
    getRef: (payment) =>
      firestore.collection("stripe_payments").doc(payment.stripe_session_id),
    getData: (payment) => ({
      stripe_session_id: payment.stripe_session_id,
      stripe_event_id: payment.stripe_event_id,
      email: payment.email ? normalizeEmail(payment.email) : null,
      customer_name: payment.customer_name || null,
      amount_total: payment.amount_total ?? null,
      currency: payment.currency?.trim().toLowerCase() || null,
      offer_label: payment.offer_label,
      livemode: Boolean(payment.livemode),
      payment_status: payment.payment_status || null,
      checkout_status: payment.checkout_status || null,
      email_sent_at: payment.email_sent_at || null,
      created_at: payment.created_at,
      updated_at: payment.updated_at || migratedAt,
      migrated_from: "sqlite",
    }),
  });

  sqlite.close();

  console.log(
    JSON.stringify(
      {
        migrated: {
          leads,
          generations,
          assistant_plan_cache: assistantPlanCache,
          stripe_payments: stripePayments,
        },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
