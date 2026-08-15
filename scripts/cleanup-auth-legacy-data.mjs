import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const EXPECTED_PROJECT_ID = "demaa-dde32";
const COLLECTIONS = [
  "customer_sessions",
  "customer_magic_links",
  "action_plans",
  "coaching_conversations",
  "coaching_message_drafts",
];

function getAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId !== EXPECTED_PROJECT_ID || !clientEmail || !privateKey) {
    throw new Error("Le projet Firebase ou ses identifiants ne correspondent pas à Demaa.");
  }
  return initializeApp({
    credential: cert({ clientEmail, privateKey, projectId }),
    projectId,
  });
}

async function main() {
  if (!process.argv.includes(`--confirm=${EXPECTED_PROJECT_ID}`)) {
    throw new Error(`Ajoutez --confirm=${EXPECTED_PROJECT_ID} pour autoriser la suppression.`);
  }

  const app = getAdminApp();
  const authUsers = await getAuth(app).listUsers(1);
  if (authUsers.users.length > 0 || authUsers.pageToken) {
    throw new Error("Suppression annulée : Firebase Authentication contient un utilisateur.");
  }

  const database = getFirestore(app);
  const deleted = {};
  for (const collectionName of COLLECTIONS) {
    const snapshot = await database.collection(collectionName).get();
    const writer = database.bulkWriter();
    for (const document of snapshot.docs) writer.delete(document.ref);
    await writer.close();
    deleted[collectionName] = snapshot.size;
  }

  console.log(JSON.stringify({ deleted, projectId: EXPECTED_PROJECT_ID }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
