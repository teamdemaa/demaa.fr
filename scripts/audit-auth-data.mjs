import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

function getAdminApp() {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Configuration Firebase Admin absente.");
  }

  return initializeApp({
    credential: cert({ clientEmail, privateKey, projectId }),
    projectId,
  });
}

async function countCollection(database, name) {
  const result = await database.collection(name).count().get();
  return result.data().count;
}

async function readIdentityPlatformConfig(app) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const credential = app.options.credential;
  if (!projectId || !credential) {
    throw new Error("Configuration Firebase Admin absente.");
  }
  const token = await credential.getAccessToken();
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${encodeURIComponent(projectId)}/config`,
    {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "X-Goog-User-Project": projectId,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Lecture de la configuration Firebase impossible (${response.status}).`);
  }
  const config = await response.json();
  return {
    anonymousEnabled: config.signIn?.anonymous?.enabled === true,
    authorizedDomains: Array.isArray(config.authorizedDomains)
      ? config.authorizedDomains
      : [],
    emailPasswordEnabled: config.signIn?.email?.enabled === true,
    emailEnumerationProtection: config.emailPrivacyConfig?.enableImprovedEmailPrivacy === true,
    passwordPolicy: {
      enforcementState: config.passwordPolicyConfig?.enforcementState ?? "OFF",
      minLength: config.passwordPolicyConfig?.constraints?.minLength ?? null,
    },
  };
}

async function main() {
  const app = getAdminApp();
  const database = getFirestore(app);
  const identityPlatform = await readIdentityPlatformConfig(app);
  const collectionNames = [
    "customer_sessions",
    "customer_magic_links",
    "action_plans",
    "companies",
    "company_memberships",
    "coaching_conversations",
    "coaching_message_drafts",
    "customer_coaching_access",
    "customer_accompaniment_benefits",
    "customer_subscriptions",
    "opportunity_submission_drafts",
    "service_solution_requests",
    "stripe_webhook_events",
  ];

  const entries = await Promise.all(
    collectionNames.map(async (name) => [name, await countCollection(database, name)]),
  );
  const pendingClaims = await database
    .collection("action_plans")
    .where("status", "==", "pending_claim")
    .count()
    .get();
  let authAudit;
  try {
    const authUsers = await getAuth(app).listUsers(1);
    authAudit = {
      configured: true,
      hasMoreThanOneUser: Boolean(authUsers.pageToken),
      userCountAtLeast: authUsers.users.length,
    };
  } catch (error) {
    authAudit = {
      configured: false,
      errorCode: typeof error === "object" && error && "code" in error
        ? String(error.code)
        : "unknown",
    };
  }

  console.log(JSON.stringify({
    auth: authAudit,
    collections: Object.fromEntries(entries),
    identityPlatform,
    pendingActionPlans: pendingClaims.data().count,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
