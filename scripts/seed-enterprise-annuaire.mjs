import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const currentDir = dirname(fileURLToPath(import.meta.url));
const enterpriseAnnuairePath = resolve(currentDir, "../src/lib/enterprise-annuaire.json");

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

function getFirestoreDb() {
  if (!getApps().length) {
    initializeApp({
      credential: getFirebaseCredential(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  return getFirestore();
}

function loadEnterpriseAnnuaire() {
  const raw = fs.readFileSync(enterpriseAnnuairePath, "utf8");
  const payload = JSON.parse(raw);

  if (!Array.isArray(payload?.enterprises)) {
    throw new Error("Invalid enterprise annuaire payload");
  }

  return payload.enterprises;
}

async function main() {
  loadEnvFile(resolve(currentDir, "../.env.local"));

  const enterprises = loadEnterpriseAnnuaire();
  const firestore = getFirestoreDb();
  const collection = firestore.collection("enterprise_annuaire");
  const now = new Date().toISOString();

  for (const [index, enterprise] of enterprises.entries()) {
    const docRef = collection.doc(enterprise.slug);

    await docRef.set(
      {
        ...enterprise,
        sort_order: index,
        created_at: now,
        updated_at: now,
      },
      { merge: true }
    );
  }

  console.log(
    JSON.stringify(
      {
        migrated: enterprises.length,
        collection: "enterprise_annuaire",
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
