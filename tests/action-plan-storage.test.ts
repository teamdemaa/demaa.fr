import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LegacyV2ActionPlan } from "@/lib/action-plan-contract";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import { createActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import { createManualActionPlan } from "@/lib/action-plan-manual";

vi.mock("server-only", () => ({}));

type StoredDocument = Record<string, unknown>;

const firestore = vi.hoisted(() => {
  const documents = new Map<string, StoredDocument>();
  function snapshot(path: string) {
    const data = documents.get(path);
    return { id: path.split("/").at(-1) || "", exists: Boolean(data), data: () => data };
  }
  function ref(path: string) {
    return {
      path,
      async create(value: StoredDocument) {
        if (documents.has(path)) throw new Error("already exists");
        documents.set(path, structuredClone(value));
      },
      async get() { return snapshot(path); },
      async set(value: StoredDocument, options?: { merge?: boolean }) {
        const previous = options?.merge ? documents.get(path) || {} : {};
        documents.set(path, structuredClone({ ...previous, ...value }));
      },
    };
  }
  const database = {
    collection(name: string) {
      return {
        doc(id: string) { return ref(`${name}/${id}`); },
        where(field: string, operator: string, value: unknown) {
          if (operator !== "==") throw new Error(`unsupported operator ${operator}`);
          return { async get() {
            const docs = [...documents.entries()]
              .filter(([path, document]) => path.startsWith(`${name}/`) && document[field] === value)
              .map(([path]) => snapshot(path));
            return { docs };
          } };
        },
      };
    },
    async runTransaction<T>(operation: (transaction: {
      get(reference: ReturnType<typeof ref>): Promise<ReturnType<typeof snapshot>>;
      set(reference: ReturnType<typeof ref>, value: StoredDocument, options?: { merge?: boolean }): void;
    }) => Promise<T>) {
      const writes: Array<{ reference: ReturnType<typeof ref>; value: StoredDocument; options?: { merge?: boolean } }> = [];
      const result = await operation({
        get: async (reference) => snapshot(reference.path),
        set: (reference, value, options) => writes.push({ reference, value, options }),
      });
      for (const write of writes) await write.reference.set(write.value, write.options);
      return result;
    },
  };
  return { database, documents };
});

vi.mock("@/lib/firebase-admin", () => ({ getAdminFirestore: () => firestore.database }));
vi.mock("@/lib/operational-maintenance", () => ({
  getLeadRetentionExpiry: () => "2029-08-10T00:00:00.000Z",
}));

import {
  ActionPlanGenerationRequestConflictError,
  ActionPlanRevisionConflictError,
  beginActionPlanGeneration,
  beginExistingBlankActionPlanGeneration,
  completeActionPlanGeneration,
  createOwnedActionPlanForIdentity,
  deleteActionPlanForAccess,
  failActionPlanGeneration,
  getActionPlanIndexForIdentity,
  getActionPlanGenerationForAccess,
  getActionPlanForAccess,
  getActionPlanWorkspacePageForIdentity,
  getOwnedActionPlansForIdentity,
  resumeActionPlanGenerationForAccess,
  updateActionPlanWorkspaceForAccess,
} from "@/lib/action-plan-storage.server";
import {
  buildCompanyMembershipId,
  buildDefaultCompanyId,
  ensureDefaultCompanyForIdentity,
} from "@/lib/company-membership.server";

const systemId = actionPlanSystemOptions[0]?.id;
if (!systemId) throw new Error("Missing action plan system fixture.");

function identity(uid: string, email = `${uid}@example.com`) {
  return { email, provider: "password" as const, uid };
}

function actionPlan(summary = "Un plan concret pour reprendre la main."): LegacyV2ActionPlan {
  return {
    version: "2",
    summary,
    systemId,
    systemReason: "Ce système correspond à l'activité décrite.",
    weeklyActions: [1, 2, 3].map((index) => ({
      id: `action-${index}` as `action-${1 | 2 | 3}`,
      title: `Action ${index}`,
      objective: "Obtenir un résultat concret cette semaine.",
      channelOrTool: "Téléphone et document de suivi",
      steps: ["Préparer les informations utiles.", "Réaliser puis noter le résultat."],
      readyToUse: null,
      strategyPillar: "alignement" as const,
    })),
    strategy: {
      alignment: {
        headline: "Choisir un cap réaliste",
        desiredCompany: "Une entreprise claire et pilotable.",
        boundariesAndValues: "Préserver la qualité et le temps du dirigeant.",
        prioritiesAndTradeoffs: "Traiter la priorité avant d'ajouter de nouveaux sujets.",
      },
      positioning: {
        headline: "Clarifier le client servi",
        preciseCustomer: "Le client dont le besoin est le plus urgent.",
        importantProblem: "Un problème concret et coûteux.",
        evidenceAndAlternatives: "Valider la situation dans les échanges existants.",
      },
      offer: {
        headline: "Rendre l'offre lisible",
        promisedOutcome: "Un résultat compréhensible.",
        scope: "Un périmètre précis.",
        priceCommitmentAndRisk: "Un engagement adapté au risque perçu.",
      },
      promotion: {
        headline: "Créer une relation utile",
        attract: "Partager une information directement utile.",
        facilitatePurchase: "Rendre la prochaine étape simple.",
        retainAndStrengthen: "Tenir les promesses et demander un retour.",
      },
    },
    assumptions: ["Le dirigeant peut consacrer deux heures au plan cette semaine."],
  };
}

describe("company-scoped action plan persistence", () => {
  beforeEach(() => firestore.documents.clear());

  it("anchors new plans to the active default company with UID audit fields", async () => {
    const created = await createOwnedActionPlanForIdentity(identity("owner-uid"), {
      plan: actionPlan(),
    });
    const stored = firestore.documents.get(`action_plans/${created.id}`);
    expect(stored).toMatchObject({
      company_id: expect.stringMatching(/^cmp_/),
      owner_uid: "owner-uid",
      created_by_uid: "owner-uid",
      updated_by_uid: "owner-uid",
      status: "active",
      content_locale_code: "fr",
      market_code_at_creation: "fr-fr",
    });
    expect(firestore.documents.get(`companies/${stored?.company_id}`)).toMatchObject({
      status: "active",
      created_by_uid: "owner-uid",
    });
    expect(stored).not.toHaveProperty("owner_email");
    expect(stored).not.toHaveProperty("pending_owner_email");
    expect(stored).not.toHaveProperty("temporary_access_token_hash");
  });

  it("creates a durable generation before the AI result and reuses the active lease", async () => {
    const now = new Date("2026-08-15T20:00:00.000Z");
    const first = await beginActionPlanGeneration({
      identity: identity("owner-uid"),
      requestId: "generation-request-1234",
      situation: "Je dois clarifier mes priorités commerciales cette semaine.",
      now,
    });
    expect(first.kind).toBe("claimed");
    if (first.kind !== "claimed") throw new Error("Expected a generation claim.");
    expect(firestore.documents.get(`action_plans/${first.claim.id}`)).toMatchObject({
      status: "generating",
      attempt_count: 1,
      owner_uid: "owner-uid",
      plan: null,
    });

    await expect(beginActionPlanGeneration({
      identity: identity("owner-uid"),
      requestId: "generation-request-1234",
      situation: "Je dois clarifier mes priorités commerciales cette semaine.",
      now: new Date("2026-08-15T20:01:00.000Z"),
    })).resolves.toMatchObject({
      kind: "existing",
      state: { status: "generating", id: first.claim.id, attemptCount: 1 },
    });
    await expect(getActionPlanIndexForIdentity(identity("owner-uid"))).resolves.toEqual([
      expect.objectContaining({
        id: first.claim.id,
        status: "generating",
        title: "Plan en cours de création",
      }),
    ]);
  });

  it("stores English generation context and keeps it in the company-wide index", async () => {
    const started = await beginActionPlanGeneration({
      contentLocaleCode: "en",
      identity: identity("english-owner"),
      marketCodeAtCreation: "global-en-beta",
      requestId: "english-generation-1234",
      situation: "Our SaaS is growing but every retention decision still depends on me.",
    });
    expect(started).toMatchObject({
      kind: "claimed",
      claim: {
        contentLocaleCode: "en",
        marketCodeAtCreation: "global-en-beta",
      },
    });
    if (started.kind !== "claimed") throw new Error("Expected English generation claim.");
    expect(firestore.documents.get(`action_plans/${started.claim.id}`)).toMatchObject({
      content_locale_code: "en",
      market_code_at_creation: "global-en-beta",
      title: "Plan being created",
    });
    await expect(getActionPlanIndexForIdentity(identity("english-owner"))).resolves.toEqual([
      expect.objectContaining({ contentLocaleCode: "en", id: started.claim.id }),
    ]);
  });

  it("rejects an idempotency key reused with another situation", async () => {
    await beginActionPlanGeneration({
      identity: identity("owner-uid"),
      requestId: "generation-request-1234",
      situation: "Je dois clarifier mes priorités commerciales cette semaine.",
    });
    await expect(beginActionPlanGeneration({
      identity: identity("owner-uid"),
      requestId: "generation-request-1234",
      situation: "Je dois maintenant réorganiser complètement mon équipe.",
    })).rejects.toBeInstanceOf(ActionPlanGenerationRequestConflictError);
  });

  it("activates only the claimed generation and exposes it to its company", async () => {
    const started = await beginActionPlanGeneration({
      identity: identity("owner-uid"),
      requestId: "generation-request-1234",
      situation: "Je dois clarifier mes priorités commerciales cette semaine.",
    });
    if (started.kind !== "claimed") throw new Error("Expected a generation claim.");
    const completed = await completeActionPlanGeneration({
      identity: identity("owner-uid"),
      claim: started.claim,
      title: "Clarifier les priorités commerciales",
      plan: actionPlan(),
      generation: {
        model: "test-model",
        durationMs: 1200,
        inputTokens: 100,
        outputTokens: 200,
        totalTokens: 300,
        requestCount: 1,
        repairCount: 0,
      },
    });
    expect(completed).toMatchObject({
      id: started.claim.id,
      title: "Clarifier les priorités commerciales",
      generation: { model: "test-model", durationMs: 1200, totalTokens: 300 },
    });
    await expect(getActionPlanGenerationForAccess({
      id: started.claim.id,
      uid: "owner-uid",
    })).resolves.toMatchObject({ status: "active", id: started.claim.id });
    await expect(getActionPlanGenerationForAccess({
      id: started.claim.id,
      uid: "other-uid",
    })).resolves.toBeNull();
    await expect(getActionPlanIndexForIdentity(identity("owner-uid"))).resolves.toEqual([
      expect.objectContaining({ id: started.claim.id, status: "active" }),
    ]);
  });

  it("marks a failed attempt and allows the same request to retry", async () => {
    const started = await beginActionPlanGeneration({
      identity: identity("owner-uid"),
      requestId: "generation-request-1234",
      situation: "Je dois clarifier mes priorités commerciales cette semaine.",
    });
    if (started.kind !== "claimed") throw new Error("Expected a generation claim.");
    await expect(failActionPlanGeneration({
      identity: identity("owner-uid"),
      claim: started.claim,
      errorCode: "provider_failed",
    })).resolves.toMatchObject({ status: "failed", attemptCount: 1, canRetry: true });
    await expect(getActionPlanIndexForIdentity(identity("owner-uid"))).resolves.toEqual([
      expect.objectContaining({ id: started.claim.id, status: "failed" }),
    ]);
    await expect(beginActionPlanGeneration({
      identity: identity("owner-uid"),
      requestId: "generation-request-1234",
      situation: "Je dois clarifier mes priorités commerciales cette semaine.",
    })).resolves.toMatchObject({ kind: "claimed" });
  });

  it("loads the requested plan and the complete company index through one page contract", async () => {
    const owner = identity("owner-uid");
    const active = await createOwnedActionPlanForIdentity(owner, {
      plan: actionPlan("Plan actif"),
      title: "Plan actif",
    });
    const started = await beginActionPlanGeneration({
      identity: owner,
      requestId: "generation-request-page-index",
      situation: "Je dois préparer un second plan sans perdre le premier.",
    });
    if (started.kind !== "claimed") throw new Error("Expected a generation claim.");
    await failActionPlanGeneration({
      identity: owner,
      claim: started.claim,
      errorCode: "provider_failed",
    });

    await expect(getActionPlanWorkspacePageForIdentity(owner, active.id)).resolves.toMatchObject({
      generationState: {
        status: "active",
        id: active.id,
        actionPlan: { title: "Plan actif" },
      },
      plans: expect.arrayContaining([
        expect.objectContaining({ id: active.id, status: "active" }),
        expect.objectContaining({ id: started.claim.id, status: "failed" }),
      ]),
    });
  });

  it("resumes an expired generation from Firestore without a browser draft", async () => {
    const started = await beginActionPlanGeneration({
      identity: identity("owner-uid"),
      requestId: "generation-request-1234",
      situation: "Je dois clarifier mes priorités commerciales cette semaine.",
      now: new Date("2026-08-15T20:00:00.000Z"),
    });
    if (started.kind !== "claimed") throw new Error("Expected a generation claim.");

    await expect(resumeActionPlanGenerationForAccess({
      identity: identity("owner-uid"),
      id: started.claim.id,
      now: new Date("2026-08-15T20:04:00.000Z"),
    })).resolves.toMatchObject({
      kind: "claimed",
      claim: {
        id: started.claim.id,
        situation: "Je dois clarifier mes priorités commerciales cette semaine.",
      },
    });
    expect(firestore.documents.get(`action_plans/${started.claim.id}`)).toMatchObject({
      status: "generating",
      attempt_count: 2,
      updated_by_uid: "owner-uid",
    });
  });

  it("converts an existing blank plan into the same durable generation lifecycle", async () => {
    const owner = identity("owner-uid");
    const manualPlan = createManualActionPlan();
    const created = await createOwnedActionPlanForIdentity(owner, {
      plan: manualPlan,
      title: "Plan croissance",
    });

    const started = await beginExistingBlankActionPlanGeneration({
      identity: owner,
      id: created.id,
      expectedRevision: created.revision,
      situation: "Je dois structurer le suivi commercial de mon entreprise cette semaine.",
      now: new Date("2026-08-15T20:00:00.000Z"),
    });
    expect(started).toMatchObject({
      kind: "claimed",
      claim: { id: created.id, title: "Plan croissance" },
    });
    if (!started || started.kind !== "claimed") throw new Error("Expected a generation claim.");
    expect(firestore.documents.get(`action_plans/${created.id}`)).toMatchObject({
      status: "generating",
      attempt_count: 1,
      generation_target_title: "Plan croissance",
    });

    await expect(completeActionPlanGeneration({
      identity: owner,
      claim: started.claim,
      title: "Titre généré à ignorer",
      plan: actionPlan(),
    })).resolves.toMatchObject({
      id: created.id,
      title: "Plan croissance",
    });
    expect(firestore.documents.get(`action_plans/${created.id}`)).toMatchObject({
      status: "active",
      generation_target_title: null,
      title: "Plan croissance",
    });
  });

  it("refuses to resume another company generation", async () => {
    const started = await beginActionPlanGeneration({
      identity: identity("owner-uid"),
      requestId: "generation-request-1234",
      situation: "Je dois clarifier mes priorités commerciales cette semaine.",
      now: new Date("2026-08-15T20:00:00.000Z"),
    });
    if (started.kind !== "claimed") throw new Error("Expected a generation claim.");

    await expect(resumeActionPlanGenerationForAccess({
      identity: identity("other-uid"),
      id: started.claim.id,
      now: new Date("2026-08-15T20:04:00.000Z"),
    })).resolves.toBeNull();
  });

  it("isolates read access between Firebase UIDs even with the same email", async () => {
    const created = await createOwnedActionPlanForIdentity(
      identity("owner-uid", "shared@example.com"),
      { plan: actionPlan() },
    );
    await expect(getActionPlanForAccess({ id: created.id, uid: "owner-uid" }))
      .resolves.toMatchObject({ id: created.id });
    await expect(getActionPlanForAccess({ id: created.id, uid: "other-uid" }))
      .resolves.toBeNull();
    await ensureDefaultCompanyForIdentity(identity("other-uid", "shared@example.com"));
    await expect(getOwnedActionPlansForIdentity(identity("other-uid", "shared@example.com")))
      .resolves.toEqual([]);
  });

  it("lists by company scope and never falls back to a legacy owner field", async () => {
    const created = await createOwnedActionPlanForIdentity(identity("owner-uid"), {
      plan: actionPlan(),
    });
    firestore.documents.set("action_plans/legacy-owner-plan", {
      ...firestore.documents.get(`action_plans/${created.id}`),
      company_id: null,
      owner_uid: "owner-uid",
    });
    firestore.documents.set("action_plans/foreign-company-plan", {
      ...firestore.documents.get(`action_plans/${created.id}`),
      company_id: buildDefaultCompanyId("other-uid"),
      owner_uid: "owner-uid",
    });

    await expect(getOwnedActionPlansForIdentity(identity("owner-uid")))
      .resolves.toEqual([expect.objectContaining({ id: created.id })]);
    await expect(getActionPlanForAccess({ id: "legacy-owner-plan", uid: "owner-uid" }))
      .resolves.toBeNull();
  });

  it("uses membership rather than the legacy owner field after company scoping", async () => {
    const created = await createOwnedActionPlanForIdentity(identity("owner-uid"), {
      plan: actionPlan(),
    });
    const path = `action_plans/${created.id}`;
    firestore.documents.set(path, {
      ...firestore.documents.get(path),
      owner_uid: "historical-owner-value",
    });

    await expect(getActionPlanForAccess({ id: created.id, uid: "owner-uid" }))
      .resolves.toMatchObject({ id: created.id });
    await expect(getActionPlanForAccess({ id: created.id, uid: "historical-owner-value" }))
      .resolves.toBeNull();
  });

  it("blocks every plan operation when the membership is suspended", async () => {
    const created = await createOwnedActionPlanForIdentity(identity("owner-uid"), {
      plan: actionPlan(),
    });
    const companyId = buildDefaultCompanyId("owner-uid");
    const membershipId = buildCompanyMembershipId(companyId, "owner-uid");
    const membershipPath = `company_memberships/${membershipId}`;
    firestore.documents.set(membershipPath, {
      ...firestore.documents.get(membershipPath),
      status: "suspended",
    });
    const workspace = createActionPlanWorkspaceState(created.plan);

    await expect(getOwnedActionPlansForIdentity(identity("owner-uid")))
      .rejects.toThrow("active company context is unavailable");
    await expect(getActionPlanForAccess({ id: created.id, uid: "owner-uid" }))
      .resolves.toBeNull();
    await expect(updateActionPlanWorkspaceForAccess({
      uid: "owner-uid",
      id: created.id,
      expectedRevision: 1,
      workspaceState: workspace,
    })).resolves.toBeNull();
    await expect(deleteActionPlanForAccess({
      uid: "owner-uid",
      id: created.id,
      expectedRevision: 1,
    })).resolves.toBeNull();
  });

  it("updates with optimistic revisions and rejects another UID", async () => {
    const created = await createOwnedActionPlanForIdentity(identity("owner-uid"), {
      plan: actionPlan(),
    });
    const workspace = createActionPlanWorkspaceState(created.plan);
    await expect(updateActionPlanWorkspaceForAccess({
      uid: "other-uid",
      id: created.id,
      expectedRevision: 1,
      workspaceState: workspace,
    })).resolves.toBeNull();
    await expect(updateActionPlanWorkspaceForAccess({
      uid: "owner-uid",
      id: created.id,
      expectedRevision: 1,
      title: "Plan équipe",
      workspaceState: workspace,
    })).resolves.toMatchObject({ revision: 2, title: "Plan équipe" });
    await expect(updateActionPlanWorkspaceForAccess({
      uid: "owner-uid",
      id: created.id,
      expectedRevision: 1,
      workspaceState: workspace,
    })).rejects.toBeInstanceOf(ActionPlanRevisionConflictError);
  });

  it("preserves retired Strategy workspace data without returning it to current clients", async () => {
    const created = await createOwnedActionPlanForIdentity(identity("owner-uid"), {
      plan: actionPlan(),
    });
    const path = `action_plans/${created.id}`;
    const stored = firestore.documents.get(path)!;
    firestore.documents.set(path, {
      ...stored,
      workspace_state: {
        ...(stored.workspace_state as Record<string, unknown>),
        strategyOverrides: {
          alignement: { answerOne: "Réponse historique conservée." },
        },
      },
    });
    const workspace = createActionPlanWorkspaceState(created.plan);
    const updated = await updateActionPlanWorkspaceForAccess({
      uid: "owner-uid",
      id: created.id,
      expectedRevision: 1,
      workspaceState: workspace,
    });
    expect(updated?.workspaceState).not.toHaveProperty("strategyOverrides");
    expect(firestore.documents.get(path)?.workspace_state).toMatchObject({
      strategyOverrides: {
        alignement: { answerOne: "Réponse historique conservée." },
      },
    });
  });

  it("soft-deletes only for the owner UID", async () => {
    const created = await createOwnedActionPlanForIdentity(identity("owner-uid"), {
      plan: actionPlan(),
    });
    await expect(deleteActionPlanForAccess({
      uid: "other-uid",
      id: created.id,
      expectedRevision: 1,
    })).resolves.toBeNull();
    await expect(deleteActionPlanForAccess({
      uid: "owner-uid",
      id: created.id,
      expectedRevision: 1,
    })).resolves.toMatchObject({ revision: 2 });
    await expect(getActionPlanForAccess({ id: created.id, uid: "owner-uid" }))
      .resolves.toBeNull();
  });
});
