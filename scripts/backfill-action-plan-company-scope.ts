import { getAdminFirestore } from "@/lib/firebase-admin";
import {
  ACTION_PLAN_COMPANY_SCOPE_MIGRATION_VERSION,
  buildActionPlanCompanyScopeMigrationPlan,
} from "@/lib/action-plan-company-scope-migration.server";
import { ACTION_PLANS_COLLECTION } from "@/lib/action-plan-storage.server";
import {
  COMPANIES_COLLECTION,
  COMPANY_MEMBERSHIPS_COLLECTION,
  ensureDefaultCompanyForIdentity,
  getDefaultCompanyIdentity,
} from "@/lib/company-membership.server";

const argument = (prefix: string) =>
  process.argv.find((entry) => entry.startsWith(prefix))?.slice(prefix.length);

const apply = process.argv.includes("--apply");
const database = getAdminFirestore();
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
if (!projectId) {
  throw new Error("FIREBASE_PROJECT_ID or GCLOUD_PROJECT is required, including in dry-run mode.");
}

async function readPlan() {
  const snapshot = await database.collection(ACTION_PLANS_COLLECTION).get();
  const candidates = await Promise.all(snapshot.docs.map(async (document) => {
    const data = document.data();
    const ownerUid = typeof data.owner_uid === "string" ? data.owner_uid.trim() : "";
    if (!ownerUid || ownerUid.length > 160) {
      return { id: document.id, data, company: null, membership: null };
    }

    const identity = getDefaultCompanyIdentity(ownerUid);
    const [companySnapshot, membershipSnapshot] = await Promise.all([
      database.collection(COMPANIES_COLLECTION).doc(identity.companyId).get(),
      database.collection(COMPANY_MEMBERSHIPS_COLLECTION).doc(identity.membershipId).get(),
    ]);
    return {
      id: document.id,
      data,
      company: companySnapshot.exists ? companySnapshot.data() || null : null,
      membership: membershipSnapshot.exists ? membershipSnapshot.data() || null : null,
    };
  }));
  return buildActionPlanCompanyScopeMigrationPlan(
    candidates,
  );
}

const before = await readPlan();
if (!apply) {
  console.log(JSON.stringify({
    mode: "dry-run",
    projectId,
    version: before.version,
    fingerprint: before.fingerprint,
    total: before.total,
    counts: before.counts,
    ...(process.argv.includes("--details") ? { items: before.items } : {}),
  }, null, 2));
  process.exit(0);
}

if (process.env.FIRESTORE_EMULATOR_HOST) {
  if (argument("--confirm-project=") !== projectId) {
    throw new Error("The exact emulator project ID must be confirmed.");
  }
} else if (argument("--confirm-project=") !== projectId) {
  throw new Error("The exact Firebase project ID must be confirmed.");
}
if (argument("--confirm-fingerprint=") !== before.fingerprint) {
  throw new Error("The exact dry-run fingerprint must be confirmed.");
}
if (Number(argument("--confirm-pending=")) !== before.counts.pending) {
  throw new Error("The exact pending document count must be confirmed.");
}
if (
  before.counts.conflict > 0
  || before.counts.invalid_scope > 0
  || before.counts.invalid_owner > 0
) {
  throw new Error(
    "Conflicting, invalidly scoped or ownerless plans must be resolved before applying the backfill.",
  );
}

let writesCommitted = 0;
for (const item of before.items) {
  if (item.status !== "pending" || !item.ownerUid || !item.expectedCompanyId) continue;

  await ensureDefaultCompanyForIdentity({
    uid: item.ownerUid,
    email: `${item.ownerUid}@migration.invalid`,
    provider: "password",
  });

  const reference = database.collection(ACTION_PLANS_COLLECTION).doc(item.id);
  await database.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference);
    if (!snapshot.exists) throw new Error(`Action plan ${item.id} disappeared during migration.`);
    const current = buildActionPlanCompanyScopeMigrationPlan([{
      id: item.id,
      data: snapshot.data() || {},
      company: null,
      membership: null,
    }]).items[0];
    if (
      !current
      || current.status !== "pending"
      || current.ownerUid !== item.ownerUid
      || current.expectedCompanyId !== item.expectedCompanyId
    ) {
      throw new Error(`Action plan ${item.id} changed after the dry-run.`);
    }

    transaction.set(reference, {
      company_id: item.expectedCompanyId,
      ...(item.createdByUid ? {} : { created_by_uid: item.ownerUid }),
      ...(item.updatedByUid ? {} : { updated_by_uid: item.ownerUid }),
      company_scope_migration_version: ACTION_PLAN_COMPANY_SCOPE_MIGRATION_VERSION,
      company_scope_migrated_at: new Date().toISOString(),
    }, { merge: true });
  });
  writesCommitted += 1;
}

const after = await readPlan();
if (
  after.counts.pending !== 0
  || after.counts.conflict !== 0
  || after.counts.invalid_scope !== 0
  || after.counts.invalid_owner !== 0
) {
  throw new Error("The post-backfill verification did not produce a fully scoped collection.");
}

console.log(JSON.stringify({
  mode: "apply",
  projectId,
  beforeFingerprint: before.fingerprint,
  afterFingerprint: after.fingerprint,
  writesCommitted,
  counts: after.counts,
}, null, 2));
