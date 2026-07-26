import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const currentDir = dirname(fileURLToPath(import.meta.url));
const shouldApply = process.argv.includes("--apply");
const legacyEnterpriseFields = [
  "processes",
  "operationProcesses",
  "processExamples",
];
const expectedTemplateCount = 12;
const expectedEnterpriseCount = 115;

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

function inspectLegacyEnterpriseFields(snapshot) {
  const documents = [];
  let fieldCount = 0;

  for (const document of snapshot.docs) {
    const data = document.data();
    const fields = legacyEnterpriseFields.filter((field) =>
      Object.prototype.hasOwnProperty.call(data, field),
    );

    if (fields.length) {
      documents.push({ id: document.id, fields });
      fieldCount += fields.length;
    }
  }

  return { documents, fieldCount };
}

async function main() {
  loadEnvFile(resolve(currentDir, "../.env.local"));

  const firestore = getFirestoreDb();
  const enterpriseCollection = firestore.collection("enterprise_annuaire");
  const templateCollection = firestore.collection("system_process_templates");
  const [enterpriseSnapshot, templateSnapshot] = await Promise.all([
    enterpriseCollection.get(),
    templateCollection.get(),
  ]);
  const legacyBefore = inspectLegacyEnterpriseFields(enterpriseSnapshot);

  if (enterpriseSnapshot.size !== expectedEnterpriseCount) {
    throw new Error(
      `Sécurité: ${enterpriseSnapshot.size} entreprises trouvées, ${expectedEnterpriseCount} attendues.`,
    );
  }

  if (shouldApply && templateSnapshot.size !== expectedTemplateCount) {
    throw new Error(
      `Sécurité: ${templateSnapshot.size} anciens modèles trouvés, ${expectedTemplateCount} attendus.`,
    );
  }

  const plan = {
    mode: shouldApply ? "apply" : "dry-run",
    enterpriseDocuments: enterpriseSnapshot.size,
    enterpriseDocumentsToClean: legacyBefore.documents.length,
    legacyFieldsToDelete: legacyBefore.fieldCount,
    templateDocumentsToDelete: templateSnapshot.size,
  };

  if (!shouldApply) {
    console.log(JSON.stringify({ plan }, null, 2));
    return;
  }

  const batch = firestore.batch();

  for (const { id, fields } of legacyBefore.documents) {
    const deletions = Object.fromEntries(
      fields.map((field) => [field, FieldValue.delete()]),
    );
    batch.update(enterpriseCollection.doc(id), deletions);
  }

  for (const document of templateSnapshot.docs) {
    batch.delete(document.ref);
  }

  await batch.commit();

  const [enterpriseAfter, templatesAfter] = await Promise.all([
    enterpriseCollection.get(),
    templateCollection.get(),
  ]);
  const legacyAfter = inspectLegacyEnterpriseFields(enterpriseAfter);

  if (templatesAfter.size !== 0 || legacyAfter.fieldCount !== 0) {
    throw new Error(
      `Vérification échouée: ${templatesAfter.size} modèles et ${legacyAfter.fieldCount} champs hérités subsistent.`,
    );
  }

  console.log(
    JSON.stringify(
      {
        plan,
        verified: {
          enterpriseDocuments: enterpriseAfter.size,
          enterpriseDocumentsClean: enterpriseAfter.size - legacyAfter.documents.length,
          legacyFieldsRemaining: legacyAfter.fieldCount,
          templateDocumentsRemaining: templatesAfter.size,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
