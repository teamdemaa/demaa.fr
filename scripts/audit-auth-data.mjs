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

async function auditActionPlanCompanyScope(database) {
  const [companies, memberships, actionPlans] = await Promise.all([
    database.collection("companies").select("status").get(),
    database.collection("company_memberships")
      .select("company_id", "member_uid", "role", "status")
      .get(),
    database.collection("action_plans")
      .select("company_id", "owner_uid", "status")
      .get(),
  ]);
  const activeCompanyIds = new Set(
    companies.docs
      .filter((document) => document.data().status === "active")
      .map((document) => document.id),
  );
  const activeOwnerMemberships = new Set(
    memberships.docs.flatMap((document) => {
      const data = document.data();
      return data.status === "active"
        && data.role === "owner"
        && typeof data.company_id === "string"
        && typeof data.member_uid === "string"
        ? [`${data.company_id}\u0000${data.member_uid}`]
        : [];
    }),
  );
  const relevantActionPlans = actionPlans.docs.filter(
    (document) => document.data().status !== "deleted",
  );
  const statuses = Object.fromEntries(
    ["active", "generating", "failed", "deleted"].map((status) => [
      status,
      actionPlans.docs.filter((document) => document.data().status === status).length,
    ]),
  );
  const knownStatuses = Object.values(statuses).reduce((total, count) => total + count, 0);

  return {
    actionPlanStatuses: {
      ...statuses,
      unexpected: actionPlans.size - knownStatuses,
    },
    activeMembershipWithoutActiveCompany: memberships.docs.filter((document) => {
      const data = document.data();
      return data.status === "active"
        && (typeof data.company_id !== "string" || !activeCompanyIds.has(data.company_id));
    }).length,
    planWithMissingActiveCompany: relevantActionPlans.filter((document) => {
      const companyId = document.data().company_id;
      return typeof companyId !== "string" || !activeCompanyIds.has(companyId);
    }).length,
    planWithoutActiveOwnerMembership: relevantActionPlans.filter((document) => {
      const data = document.data();
      return typeof data.company_id !== "string"
        || typeof data.owner_uid !== "string"
        || !activeOwnerMemberships.has(`${data.company_id}\u0000${data.owner_uid}`);
    }).length,
  };
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
  const googleResponse = await fetch(
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${encodeURIComponent(projectId)}/defaultSupportedIdpConfigs/google.com`,
    {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "X-Goog-User-Project": projectId,
      },
    },
  );
  if (!googleResponse.ok && googleResponse.status !== 404) {
    throw new Error(`Lecture du fournisseur Google impossible (${googleResponse.status}).`);
  }
  const google = googleResponse.ok ? await googleResponse.json() : null;
  const passwordPolicyConfig = config.passwordPolicyConfig;
  const passwordPolicyVersion = Array.isArray(passwordPolicyConfig?.passwordPolicyVersions)
    ? passwordPolicyConfig.passwordPolicyVersions[0]
    : null;
  const configuredMinLength = passwordPolicyVersion?.customStrengthOptions?.minPasswordLength;
  const passwordPolicyEnforcementState =
    passwordPolicyConfig?.passwordPolicyEnforcementState ?? "OFF";
  return {
    anonymousEnabled: config.signIn?.anonymous?.enabled === true,
    authorizedDomains: Array.isArray(config.authorizedDomains)
      ? config.authorizedDomains
      : [],
    emailPasswordEnabled: config.signIn?.email?.enabled === true,
    emailEnumerationProtection: config.emailPrivacyConfig?.enableImprovedEmailPrivacy === true,
    googleClientConfigured: typeof google?.clientId === "string" && google.clientId.length > 0,
    googleEnabled: google?.enabled === true,
    passwordPolicy: {
      effectiveMinLength: configuredMinLength ?? 6,
      enforcementState: passwordPolicyEnforcementState,
      minLength: configuredMinLength ?? null,
      source: passwordPolicyEnforcementState === "ENFORCE"
        ? "custom_enforced"
        : "firebase_default",
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
    "company_monthly_metrics",
    "company_strategies",
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
  const companyScope = await auditActionPlanCompanyScope(database);
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
    companyScope,
    identityPlatform,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
