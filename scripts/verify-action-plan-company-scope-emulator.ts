import assert from "node:assert/strict";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const EMULATOR_PROJECT_ID = "demo-demaa-company-scope";

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  throw new Error("FIRESTORE_EMULATOR_HOST is required; remote Firestore is forbidden.");
}
if (process.env.GCLOUD_PROJECT && process.env.GCLOUD_PROJECT !== EMULATOR_PROJECT_ID) {
  throw new Error("The emulator project ID is not the expected disposable project.");
}
if (getApps().length === 0) initializeApp({ projectId: EMULATOR_PROJECT_ID });

const database = getFirestore();
const {
  beginActionPlanGeneration,
  completeActionPlanGeneration,
  createOwnedActionPlanForIdentity,
  deleteActionPlanForAccess,
  failActionPlanGeneration,
  getActionPlanGenerationForAccess,
  getActionPlanIndexForIdentity,
  getActionPlanForAccess,
  getOwnedActionPlansForIdentity,
  resumeActionPlanGenerationForAccess,
  updateActionPlanWorkspaceForAccess,
} = await import("@/lib/action-plan-storage.server");
const {
  buildCompanyMembershipId,
  buildDefaultCompanyId,
} = await import("@/lib/company-membership.server");
const { actionPlanSystemOptions } = await import("@/lib/action-plan-system-catalog");
const { createActionPlanWorkspaceState } = await import("@/lib/action-plan-workspace");

const systemId = actionPlanSystemOptions[0]?.id;
assert.ok(systemId, "The E2E fixture requires one action-plan system.");

const plan = {
  version: "2" as const,
  summary: "Un plan de vérification entreprise.",
  systemId,
  systemReason: "Ce système sert la recette d'isolation.",
  weeklyActions: [1, 2, 3].map((index) => ({
    id: `action-${index}` as `action-${1 | 2 | 3}`,
    title: `Action ${index}`,
    objective: "Vérifier le parcours persistant.",
    channelOrTool: "Plan Demaa",
    steps: ["Préparer.", "Vérifier."],
    readyToUse: null,
    strategyPillar: "alignement" as const,
  })),
  strategy: {
    alignment: {
      headline: "Alignement",
      desiredCompany: "Une entreprise claire.",
      boundariesAndValues: "Une limite claire.",
      prioritiesAndTradeoffs: "Une priorité claire.",
    },
    positioning: {
      headline: "Positionnement",
      preciseCustomer: "Un client précis.",
      importantProblem: "Un problème précis.",
      evidenceAndAlternatives: "Une preuve précise.",
    },
    offer: {
      headline: "Offre",
      promisedOutcome: "Un résultat précis.",
      scope: "Un périmètre précis.",
      priceCommitmentAndRisk: "Un engagement précis.",
    },
    promotion: {
      headline: "Promotion",
      attract: "Attirer utilement.",
      facilitatePurchase: "Faciliter la décision.",
      retainAndStrengthen: "Renforcer la relation.",
    },
  },
  assumptions: ["La recette utilise uniquement l'émulateur."],
};

const owner = {
  uid: "e2e-owner-uid",
  email: "owner@example.test",
  provider: "password" as const,
};
const outsider = {
  uid: "e2e-outsider-uid",
  email: "outsider@example.test",
  provider: "password" as const,
};

const created = await createOwnedActionPlanForIdentity(owner, { plan });
const companyId = buildDefaultCompanyId(owner.uid);
const membershipId = buildCompanyMembershipId(companyId, owner.uid);
const [company, membership, stored] = await Promise.all([
  database.collection("companies").doc(companyId).get(),
  database.collection("company_memberships").doc(membershipId).get(),
  database.collection("action_plans").doc(created.id).get(),
]);
assert.equal(company.get("status"), "active");
assert.equal(company.get("display_name"), null);
assert.equal(membership.get("role"), "owner");
assert.equal(membership.get("status"), "active");
assert.equal(stored.get("company_id"), companyId);

assert.deepEqual(
  (await getOwnedActionPlansForIdentity(owner)).map((item) => item.id),
  [created.id],
);
assert.deepEqual(await getOwnedActionPlansForIdentity(outsider), []);
assert.equal(await getActionPlanForAccess({ id: created.id, uid: outsider.uid }), null);

const workspaceState = createActionPlanWorkspaceState(created.plan);
const updated = await updateActionPlanWorkspaceForAccess({
  uid: owner.uid,
  id: created.id,
  expectedRevision: 1,
  title: "Plan entreprise E2E",
  workspaceState,
});
assert.equal(updated?.revision, 2);
assert.equal(updated?.title, "Plan entreprise E2E");

await membership.ref.set({ status: "suspended" }, { merge: true });
assert.equal(await getActionPlanForAccess({ id: created.id, uid: owner.uid }), null);
assert.equal(await updateActionPlanWorkspaceForAccess({
  uid: owner.uid,
  id: created.id,
  expectedRevision: 2,
  workspaceState,
}), null);
assert.equal(await deleteActionPlanForAccess({
  uid: owner.uid,
  id: created.id,
  expectedRevision: 2,
}), null);

await membership.ref.set({ status: "active" }, { merge: true });
const deleted = await deleteActionPlanForAccess({
  uid: owner.uid,
  id: created.id,
  expectedRevision: 2,
});
assert.equal(deleted?.revision, 3);
assert.deepEqual(await getOwnedActionPlansForIdentity(owner), []);

const generation = await beginActionPlanGeneration({
  identity: owner,
  requestId: "e2e-generation-request-active",
  situation: "Je veux structurer le suivi commercial et les priorités de mon entreprise.",
});
assert.equal(generation.kind, "claimed");
if (generation.kind !== "claimed") throw new Error("The E2E generation was not claimed.");
assert.equal(
  (await getActionPlanIndexForIdentity(owner))[0]?.status,
  "generating",
);
assert.equal(
  (await database.collection("action_plans").doc(generation.claim.id).get()).get("plan"),
  null,
);
const generatedPlan = await completeActionPlanGeneration({
  identity: owner,
  claim: generation.claim,
  plan,
  generation: {
    model: "e2e-model",
    durationMs: 100,
    inputTokens: 10,
    outputTokens: 20,
    totalTokens: 30,
    requestCount: 1,
    repairCount: 0,
  },
});
assert.equal(generatedPlan?.id, generation.claim.id);
assert.equal(
  (await getActionPlanGenerationForAccess({ id: generation.claim.id, uid: owner.uid }))?.status,
  "active",
);
assert.equal(
  await getActionPlanGenerationForAccess({ id: generation.claim.id, uid: outsider.uid }),
  null,
);

const failedGeneration = await beginActionPlanGeneration({
  identity: owner,
  requestId: "e2e-generation-request-failed",
  situation: "Je veux reprendre une génération interrompue sans créer un second plan.",
});
assert.equal(failedGeneration.kind, "claimed");
if (failedGeneration.kind !== "claimed") throw new Error("The failed E2E generation was not claimed.");
await failActionPlanGeneration({
  identity: owner,
  claim: failedGeneration.claim,
  errorCode: "e2e_provider_failure",
});
assert.equal(
  (await getActionPlanGenerationForAccess({ id: failedGeneration.claim.id, uid: owner.uid }))?.status,
  "failed",
);
assert.equal(
  await resumeActionPlanGenerationForAccess({
    identity: outsider,
    id: failedGeneration.claim.id,
  }),
  null,
);
const resumedGeneration = await resumeActionPlanGenerationForAccess({
  identity: owner,
  id: failedGeneration.claim.id,
});
assert.equal(resumedGeneration?.kind, "claimed");
if (!resumedGeneration || resumedGeneration.kind !== "claimed") {
  throw new Error("The persisted E2E generation was not resumed.");
}
assert.equal(
  (await completeActionPlanGeneration({
    identity: owner,
    claim: resumedGeneration.claim,
    plan,
  }))?.id,
  failedGeneration.claim.id,
);

await membership.ref.set({ status: "suspended" }, { merge: true });
assert.deepEqual(await getActionPlanIndexForIdentity(owner), []);
assert.equal(
  await getActionPlanGenerationForAccess({ id: generation.claim.id, uid: owner.uid }),
  null,
);

console.log(JSON.stringify({
  mode: "firestore-emulator-e2e",
  projectId: EMULATOR_PROJECT_ID,
  companyCreated: true,
  ownerMembershipCreated: true,
  ownerReadWriteDelete: true,
  outsiderDenied: true,
  persistentGenerationLifecycle: true,
  failedGenerationVisible: true,
  persistedGenerationResumedWithoutBrowserDraft: true,
  suspendedMembershipDenied: true,
}, null, 2));
