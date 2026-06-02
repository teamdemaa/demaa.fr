import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const currentDir = dirname(fileURLToPath(import.meta.url));
const enterpriseAnnuairePath = resolve(currentDir, "../src/lib/enterprise-annuaire.json");
const processTemplatesPath = resolve(currentDir, "../src/lib/system-process-templates.json");
const toolDirectoryPath = resolve(currentDir, "../src/lib/tool-directory.json");

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

function loadSystemProcessTemplates() {
  const raw = fs.readFileSync(processTemplatesPath, "utf8");
  const payload = JSON.parse(raw);

  if (!Array.isArray(payload?.templates)) {
    throw new Error("Invalid system process templates payload");
  }

  return payload.templates;
}

function loadToolDirectory() {
  const raw = fs.readFileSync(toolDirectoryPath, "utf8");
  const payload = JSON.parse(raw);

  if (!Array.isArray(payload?.tools)) {
    throw new Error("Invalid tool directory payload");
  }

  return payload.tools;
}

async function main() {
  loadEnvFile(resolve(currentDir, "../.env.local"));

  const enterprises = loadEnterpriseAnnuaire();
  const templates = loadSystemProcessTemplates();
  const tools = loadToolDirectory();
  const firestore = getFirestoreDb();
  const enterpriseCollection = firestore.collection("enterprise_annuaire");
  const templateCollection = firestore.collection("system_process_templates");
  const toolCollection = firestore.collection("tool_directory");
  const now = new Date().toISOString();

  for (const [index, template] of templates.entries()) {
    const docRef = templateCollection.doc(template.id);

    await docRef.set(
      {
        ...template,
        sort_order: typeof template.sort_order === "number" ? template.sort_order : index,
        updated_at: now,
      },
      { merge: true }
    );
  }

  for (const [index, tool] of tools.entries()) {
    const docRef = toolCollection.doc(tool.slug);

    await docRef.set(
      {
        ...tool,
        sort_order: index,
        updated_at: now,
      },
      { merge: true }
    );
  }

  for (const [index, enterprise] of enterprises.entries()) {
    const docRef = enterpriseCollection.doc(enterprise.slug);

    await docRef.set({
      ...enterprise,
      sort_order: index,
      updated_at: now,
    });
  }

  console.log(
    JSON.stringify(
      {
        migrated: {
          enterprises: enterprises.length,
          templates: templates.length,
          tools: tools.length,
        },
        collections: ["tool_directory", "system_process_templates", "enterprise_annuaire"],
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
