import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const currentDir = dirname(fileURLToPath(import.meta.url));
const enterpriseAnnuairePath = resolve(currentDir, "../src/lib/enterprise-annuaire.json");
const collectionName = "enterprise_annuaire";

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
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
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

function loadEnterprises() {
  const raw = fs.readFileSync(enterpriseAnnuairePath, "utf8");
  const payload = JSON.parse(raw);

  if (!Array.isArray(payload?.enterprises)) {
    throw new Error("Invalid enterprise annuaire payload: expected enterprises array.");
  }

  const seenSlugs = new Set();

  for (const enterprise of payload.enterprises) {
    if (!enterprise?.slug || !enterprise?.name) {
      throw new Error("Invalid enterprise entry: every enterprise needs slug and name.");
    }

    if (seenSlugs.has(enterprise.slug)) {
      throw new Error(`Duplicate enterprise slug: ${enterprise.slug}`);
    }

    seenSlugs.add(enterprise.slug);
  }

  return payload.enterprises;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    only: null,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--only") {
      const value = args[index + 1];

      if (!value) {
        throw new Error("--only requires a comma-separated slug list.");
      }

      options.only = value.split(",").map((slug) => slug.trim()).filter(Boolean);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function comparable(value) {
  return JSON.stringify(value ?? null);
}

function getChangedFields(next, current) {
  if (!current) {
    return ["<new document>"];
  }

  const ignoredFields = new Set(["created_at", "updated_at", "sort_order"]);
  const fields = new Set([...Object.keys(next), ...Object.keys(current)]);
  const changed = [];

  for (const field of fields) {
    if (ignoredFields.has(field)) {
      continue;
    }

    if (comparable(next[field]) !== comparable(current[field])) {
      changed.push(field);
    }
  }

  return changed;
}

async function main() {
  loadEnvFile(resolve(currentDir, "../.env.local"));

  const options = parseArgs();
  const enterprises = loadEnterprises();
  const selectedSlugs = options.only ? new Set(options.only) : null;
  const selectedEnterprises = enterprises.filter((enterprise) =>
    selectedSlugs ? selectedSlugs.has(enterprise.slug) : true
  );

  if (selectedSlugs && selectedEnterprises.length !== selectedSlugs.size) {
    const foundSlugs = new Set(selectedEnterprises.map((enterprise) => enterprise.slug));
    const missing = [...selectedSlugs].filter((slug) => !foundSlugs.has(slug));
    throw new Error(`Unknown enterprise slug(s): ${missing.join(", ")}`);
  }

  const firestore = getFirestoreDb();
  const collection = firestore.collection(collectionName);
  const now = new Date().toISOString();
  const changes = [];

  for (const enterprise of selectedEnterprises) {
    const index = enterprises.findIndex((item) => item.slug === enterprise.slug);
    const docRef = collection.doc(enterprise.slug);
    const snapshot = await docRef.get();
    const current = snapshot.exists ? snapshot.data() : null;
    const next = {
      ...enterprise,
      sort_order: index,
      created_at: current?.created_at ?? now,
      updated_at: now,
    };
    const changedFields = getChangedFields(next, current);

    if (!changedFields.length) {
      continue;
    }

    changes.push({
      slug: enterprise.slug,
      changedFields,
      ref: docRef,
      data: next,
    });
  }

  if (options.dryRun) {
    console.log(
      JSON.stringify(
        {
          dryRun: true,
          collection: collectionName,
          changes: changes.map(({ slug, changedFields }) => ({ slug, changedFields })),
        },
        null,
        2
      )
    );
    return;
  }

  const batch = firestore.batch();

  for (const change of changes) {
    batch.set(change.ref, change.data);
  }

  if (changes.length) {
    await batch.commit();
  }

  console.log(
    JSON.stringify(
      {
        dryRun: false,
        collection: collectionName,
        synced: changes.length,
        slugs: changes.map((change) => change.slug),
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
