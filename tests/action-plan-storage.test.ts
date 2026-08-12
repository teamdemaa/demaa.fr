import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LegacyV2ActionPlan } from "@/lib/action-plan-contract";
import { ACTION_PLAN_DEMO } from "@/lib/action-plan-demo";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import { createActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import { createManualAction, createManualActionPlan } from "@/lib/action-plan-manual";

type StoredDocument = Record<string, unknown>;

const firestore = vi.hoisted(() => {
  const documents = new Map<string, StoredDocument>();

  function snapshot(path: string) {
    const data = documents.get(path);
    return {
      id: path.split("/").at(-1) || "",
      exists: Boolean(data),
      data: () => data,
    };
  }

  function ref(path: string) {
    return {
      path,
      async create(value: StoredDocument) {
        if (documents.has(path)) throw new Error("already exists");
        documents.set(path, structuredClone(value));
      },
      async get() {
        return snapshot(path);
      },
      async set(value: StoredDocument, options?: { merge?: boolean }) {
        const previous = options?.merge ? documents.get(path) || {} : {};
        documents.set(path, structuredClone({ ...previous, ...value }));
      },
    };
  }

  const database = {
    collection(name: string) {
      return {
        doc(id: string) {
          return ref(`${name}/${id}`);
        },
        where(field: string, operator: string, value: unknown) {
          if (operator !== "==") throw new Error(`unsupported operator ${operator}`);
          return {
            async get() {
              const docs = [...documents.entries()]
                .filter(([path, document]) =>
                  path.startsWith(`${name}/`) && document[field] === value,
                )
                .map(([path]) => snapshot(path));
              return { docs, empty: docs.length === 0, size: docs.length };
            },
          };
        },
      };
    },
    async runTransaction<T>(operation: (transaction: {
      get(reference: ReturnType<typeof ref>): Promise<ReturnType<typeof snapshot>>;
      set(
        reference: ReturnType<typeof ref>,
        value: StoredDocument,
        options?: { merge?: boolean },
      ): void;
    }) => Promise<T>) {
      const writes: Array<{
        reference: ReturnType<typeof ref>;
        value: StoredDocument;
        options?: { merge?: boolean };
      }> = [];
      const result = await operation({
        get: async (reference) => snapshot(reference.path),
        set: (reference, value, options) => {
          writes.push({ reference, value, options });
        },
      });
      for (const write of writes) {
        await write.reference.set(write.value, write.options);
      }
      return result;
    },
  };

  return { database, documents };
});

vi.mock("@/lib/firebase-admin", () => ({
  getAdminFirestore: () => firestore.database,
}));

vi.mock("@/lib/operational-maintenance", () => ({
  getLeadRetentionExpiry: () => "2029-08-10T00:00:00.000Z",
}));

import {
  ActionPlanRevisionConflictError,
  InvalidActionPlanMutationError,
  claimPendingActionPlanWithAccessToken,
  createOwnedActionPlan,
  createPendingActionPlan,
  deleteActionPlanForAccess,
  getActionPlanForAccess,
  getActionPlanAccessCookieOptions,
  getOwnedActionPlans,
  hashActionPlanAccessToken,
  hashActionPlanClaimSecret,
  updateOwnedActionPlanWorkspace,
  updateActionPlanWorkspaceForAccess,
} from "@/lib/action-plan-storage.server";
import {
  consumeCustomerMagicLink,
  saveCustomerMagicLink,
} from "@/lib/generations-db";

const systemId = actionPlanSystemOptions[0]?.id;
if (!systemId) throw new Error("Missing action plan system fixture.");

function actionPlan(summary = "Un plan concret pour reprendre la main."): LegacyV2ActionPlan {
  const actions = [1, 2, 3].map((index) => ({
    id: `action-${index}` as `action-${1 | 2 | 3 | 4 | 5}`,
    title: `Action ${index}`,
    objective: "Obtenir un résultat concret cette semaine.",
    channelOrTool: "Téléphone et document de suivi",
    steps: ["Préparer les informations utiles.", "Réaliser puis noter le résultat."],
    readyToUse: null,
    strategyPillar: "alignement" as const,
  }));

  return {
    version: "2",
    summary,
    systemId,
    systemReason: "Ce système correspond à l'activité décrite.",
    weeklyActions: actions,
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

describe("action plan Firebase persistence", () => {
  beforeEach(() => {
    firestore.documents.clear();
  });

  it("creates a 30-day pending plan without storing the raw access token", async () => {
    const pending = await createPendingActionPlan({
      plan: actionPlan(),
      sourceText: "Je veux mieux organiser mon activité.",
    });

    const document = firestore.documents.get(`action_plans/${pending.id}`);
    expect(document?.status).toBe("pending_claim");
    expect(document?.schema_version).toBe("2");
    expect(document?.owner_email).toBeNull();
    expect(document?.claim_secret_hash).toBeNull();
    expect(document?.temporary_access_token_hash).toBe(
      hashActionPlanAccessToken(pending.temporaryAccessToken),
    );
    expect(document?.temporary_access_token_hash).not.toBe(
      pending.temporaryAccessToken,
    );
    expect(
      Date.parse(String(document?.temporary_access_expires_at)) - Date.now(),
    ).toBeGreaterThan(29 * 24 * 60 * 60 * 1000);
    expect(Date.parse(String(document?.retention_expires_at))).toBeGreaterThan(Date.now());
  });

  it("opens only the pending plan authorized by the opaque temporary token", async () => {
    const pending = await createPendingActionPlan({ plan: actionPlan() });

    expect(
      await getActionPlanForAccess({
        id: pending.id,
        temporaryAccessToken: pending.temporaryAccessToken,
      }),
    ).toMatchObject({ id: pending.id, revision: 1 });
    expect(
      await getActionPlanForAccess({
        id: pending.id,
        temporaryAccessToken: "another-opaque-token",
      }),
    ).toBeNull();

    await firestore.database.collection("action_plans").doc(pending.id).set(
      { temporary_access_expires_at: new Date(Date.now() - 1_000).toISOString() },
      { merge: true },
    );
    expect(
      await getActionPlanForAccess({
        id: pending.id,
        temporaryAccessToken: pending.temporaryAccessToken,
      }),
    ).toBeNull();
  });

  it("claims a pending plan atomically with its opaque access token", async () => {
    const pending = await createPendingActionPlan({ plan: actionPlan() });

    await expect(
      claimPendingActionPlanWithAccessToken({
        email: "dirigeant@example.com",
        id: pending.id,
        temporaryAccessToken: "invalid-token",
      }),
    ).resolves.toBe(false);

    await expect(
      claimPendingActionPlanWithAccessToken({
        email: "Dirigeant@Example.com",
        id: pending.id,
        temporaryAccessToken: pending.temporaryAccessToken,
      }),
    ).resolves.toBe(true);

    const document = firestore.documents.get(`action_plans/${pending.id}`);
    expect(document).toMatchObject({
      owner_email: "dirigeant@example.com",
      pending_owner_email: null,
      status: "active",
      temporary_access_token_hash: null,
    });
    await expect(
      claimPendingActionPlanWithAccessToken({
        email: "dirigeant@example.com",
        id: pending.id,
        temporaryAccessToken: pending.temporaryAccessToken,
      }),
    ).resolves.toBe(false);
  });

  it("stores a distinct plan title and lets its owner rename it", async () => {
    const created = await createOwnedActionPlan("dirigeant@example.com", {
      plan: actionPlan(),
      title: "  Priorités   commerciales  ",
    });
    expect(created.title).toBe("Priorités commerciales");

    const updated = await updateActionPlanWorkspaceForAccess({
      email: "dirigeant@example.com",
      id: created.id,
      expectedRevision: created.revision,
      title: "Plan de rentrée",
      workspaceState: created.workspaceState,
    });
    expect(updated?.title).toBe("Plan de rentrée");
    expect((await getOwnedActionPlans("dirigeant@example.com"))[0]?.title).toBe(
      "Plan de rentrée",
    );
  });

  it("soft-deletes a plan and removes it from the active list", async () => {
    const created = await createOwnedActionPlan("dirigeant@example.com", {
      plan: actionPlan(),
    });

    await deleteActionPlanForAccess({
      email: "dirigeant@example.com",
      id: created.id,
      expectedRevision: created.revision,
    });

    expect(await getOwnedActionPlans("dirigeant@example.com")).toEqual([]);
    expect(firestore.documents.get(`action_plans/${created.id}`)?.status).toBe(
      "deleted",
    );
  });

  it("configures the temporary credential as a 30-day HttpOnly preview cookie", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(getActionPlanAccessCookieOptions()).toMatchObject({
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
    vi.unstubAllEnvs();
  });

  it("claims the pending plan only after consuming the email magic link", async () => {
    const pending = await createPendingActionPlan({ plan: actionPlan() });
    const tokenHash = "magic-token-hash";

    const attached = await saveCustomerMagicLink({
      email: " DIRIGEANT@example.com ",
      expiresAt: new Date(Date.now() + 30_000).toISOString(),
      tokenHash,
      actionPlanClaim: {
        actionPlanId: pending.id,
        temporaryAccessTokenHash: hashActionPlanAccessToken(
          pending.temporaryAccessToken,
        ),
      },
    });

    expect(attached).toBe(true);
    expect(
      firestore.documents.get(`action_plans/${pending.id}`)?.owner_email,
    ).toBeNull();

    await consumeCustomerMagicLink(tokenHash);
    expect(await consumeCustomerMagicLink(tokenHash)).toBeNull();

    const claimed = firestore.documents.get(`action_plans/${pending.id}`);
    expect(claimed?.status).toBe("active");
    expect(claimed?.owner_email).toBe("dirigeant@example.com");
    expect(claimed?.claim_secret_hash).toBeNull();
    expect(claimed?.temporary_access_token_hash).toBeNull();
    expect(claimed?.retention_expires_at).toBe("2029-08-10T00:00:00.000Z");

    const plans = await getOwnedActionPlans("dirigeant@example.com");
    expect(plans).toHaveLength(1);
    expect(plans[0]?.id).toBe(pending.id);
  });

  it("rejects a wrong temporary token and leaves the plan unattached", async () => {
    const pending = await createPendingActionPlan({ plan: actionPlan() });
    const attached = await saveCustomerMagicLink({
      email: "dirigeant@example.com",
      expiresAt: new Date(Date.now() + 30_000).toISOString(),
      tokenHash: "magic-token-hash",
      actionPlanClaim: {
        actionPlanId: pending.id,
        temporaryAccessTokenHash: hashActionPlanAccessToken("wrong-token"),
      },
    });

    expect(attached).toBe(false);
    expect(firestore.documents.has("customer_magic_links/magic-token-hash")).toBe(false);
  });

  it("does not attach a plan whose claim expired after the magic link was issued", async () => {
    const pending = await createPendingActionPlan({ plan: actionPlan() });
    const tokenHash = "expired-plan-claim-token";

    const attached = await saveCustomerMagicLink({
      email: "dirigeant@example.com",
      expiresAt: new Date(Date.now() + 30_000).toISOString(),
      tokenHash,
      actionPlanClaim: {
        actionPlanId: pending.id,
        temporaryAccessTokenHash: hashActionPlanAccessToken(
          pending.temporaryAccessToken,
        ),
      },
    });

    expect(attached).toBe(true);
    await firestore.database.collection("action_plans").doc(pending.id).set(
      { claim_expires_at: new Date(Date.now() - 1_000).toISOString() },
      { merge: true },
    );

    await consumeCustomerMagicLink(tokenHash);

    const plan = firestore.documents.get(`action_plans/${pending.id}`);
    expect(plan?.status).toBe("pending_claim");
    expect(plan?.owner_email).toBeNull();
  });

  it("retries email delivery without creating another pending plan", async () => {
    const pending = await createPendingActionPlan({ plan: actionPlan() });
    const actionPlanClaim = {
      actionPlanId: pending.id,
      temporaryAccessTokenHash: hashActionPlanAccessToken(
        pending.temporaryAccessToken,
      ),
    };

    expect(await saveCustomerMagicLink({
      email: "dirigeant@example.com",
      expiresAt: new Date(Date.now() + 30_000).toISOString(),
      tokenHash: "first-link",
      actionPlanClaim,
    })).toBe(true);
    expect(await saveCustomerMagicLink({
      email: "dirigeant@example.com",
      expiresAt: new Date(Date.now() + 30_000).toISOString(),
      tokenHash: "retry-link",
      actionPlanClaim,
    })).toBe(true);

    expect(
      [...firestore.documents.keys()].filter((key) => key.startsWith("action_plans/")),
    ).toEqual([`action_plans/${pending.id}`]);
    expect(
      firestore.documents.get(`action_plans/${pending.id}`)?.claim_link_token_hashes,
    ).toEqual(["first-link", "retry-link"]);
  });

  it("keeps an earlier unconsumed retry link valid after newer retries", async () => {
    const pending = await createPendingActionPlan({ plan: actionPlan() });
    const actionPlanClaim = {
      actionPlanId: pending.id,
      temporaryAccessTokenHash: hashActionPlanAccessToken(
        pending.temporaryAccessToken,
      ),
    };
    for (const tokenHash of ["link-1", "link-2", "link-3", "link-4"]) {
      expect(await saveCustomerMagicLink({
        email: "dirigeant@example.com",
        expiresAt: new Date(Date.now() + 30_000).toISOString(),
        tokenHash,
        actionPlanClaim,
      })).toBe(true);
    }

    expect(await consumeCustomerMagicLink("link-1")).toBe(
      "dirigeant@example.com",
    );
    expect(
      firestore.documents.get(`action_plans/${pending.id}`)?.status,
    ).toBe("active");
  });

  it("keeps legacy claim secrets compatible during the migration", async () => {
    const pending = await createPendingActionPlan({ plan: actionPlan() });
    const legacySecret = "legacy-claim-secret-with-enough-entropy";
    await firestore.database.collection("action_plans").doc(pending.id).set(
      {
        claim_secret_hash: hashActionPlanClaimSecret(legacySecret),
        temporary_access_token_hash: null,
        temporary_access_expires_at: null,
      },
      { merge: true },
    );

    expect(await saveCustomerMagicLink({
      email: "dirigeant@example.com",
      expiresAt: new Date(Date.now() + 30_000).toISOString(),
      tokenHash: "legacy-link",
      actionPlanClaim: {
        actionPlanId: pending.id,
        claimSecretHash: hashActionPlanClaimSecret(legacySecret),
      },
    })).toBe(true);
  });

  it("stores workspace progress in the same plan document", async () => {
    const plan = actionPlan();
    const created = await createOwnedActionPlan("dirigeant@example.com", {
      plan,
    });
    const workspace = createActionPlanWorkspaceState(plan);
    workspace.tasks["action-1"].status = "done";
    workspace.tasks["action-1"].notes = "Résultat vérifié avec l’équipe.";

    const updated = await updateOwnedActionPlanWorkspace(
      "dirigeant@example.com",
      created.id,
      created.revision,
      workspace,
    );

    expect(updated?.revision).toBe(2);
    const plans = await getOwnedActionPlans("dirigeant@example.com");
    expect(plans[0]?.workspaceState.tasks["action-1"]?.status).toBe("done");
    expect(plans[0]?.workspaceState.tasks["action-1"]?.notes).toContain("équipe");
    expect(plans[0]?.plan.summary).toBe(plan.summary);
    expect(
      firestore.documents.get(`action_plans/${created.id}`)?.retention_expires_at,
    ).toBe("2029-08-10T00:00:00.000Z");
  });

  it("persists newly added actions when a saved manual plan is reopened", async () => {
    const initialPlan = createManualActionPlan();
    const created = await createOwnedActionPlan("dirigeant@example.com", {
      plan: initialPlan,
    });
    const nextPlan = {
      ...initialPlan,
      weeklyActions: [createManualAction(1)],
    };
    const nextWorkspace = createActionPlanWorkspaceState(nextPlan);

    await updateActionPlanWorkspaceForAccess({
      email: "dirigeant@example.com",
      id: created.id,
      expectedRevision: created.revision,
      plan: nextPlan,
      workspaceState: nextWorkspace,
    });

    const [reopened] = await getOwnedActionPlans("dirigeant@example.com");
    expect(reopened?.plan.version).toBe("manual");
    expect(reopened?.plan.version === "manual" ? reopened.plan.weeklyActions : []).toHaveLength(1);
    expect(reopened?.workspaceState.tasks["action-1"]?.status).toBe("todo");
  });

  it("does not allow the generated plan body to be replaced through PATCH", async () => {
    const generated = actionPlan();
    const created = await createOwnedActionPlan("dirigeant@example.com", {
      plan: generated,
    });

    await expect(
      updateActionPlanWorkspaceForAccess({
        email: "dirigeant@example.com",
        id: created.id,
        expectedRevision: created.revision,
        plan: generated,
        workspaceState: createActionPlanWorkspaceState(generated),
      }),
    ).rejects.toBeInstanceOf(InvalidActionPlanMutationError);
  });

  it("turns a pristine saved manual plan into V3 without changing its identity", async () => {
    const manualPlan = createManualActionPlan();
    const created = await createOwnedActionPlan("dirigeant@example.com", {
      plan: manualPlan,
    });
    const generatedWorkspace = createActionPlanWorkspaceState(ACTION_PLAN_DEMO);
    generatedWorkspace.selectedSystemId = systemId;
    generatedWorkspace.savedSystemIds = [systemId];

    const updated = await updateActionPlanWorkspaceForAccess({
      email: "dirigeant@example.com",
      id: created.id,
      expectedRevision: created.revision,
      plan: ACTION_PLAN_DEMO,
      sourceText: "Je veux rendre mon entreprise plus autonome.",
      generation: {
        model: "openai/gpt-5.6-terra",
        inputTokens: 800,
        outputTokens: 1_400,
        totalTokens: 2_200,
      },
      workspaceState: generatedWorkspace,
    });

    const reopened = await getActionPlanForAccess({
      email: "dirigeant@example.com",
      id: created.id,
    });
    expect(updated?.revision).toBe(created.revision + 1);
    expect(reopened?.id).toBe(created.id);
    expect(reopened?.plan.version).toBe("3");
    expect(reopened?.sourceText).toBe(
      "Je veux rendre mon entreprise plus autonome.",
    );
    expect(reopened?.generation).toMatchObject({
      model: "openai/gpt-5.6-terra",
      inputTokens: 800,
      outputTokens: 1_400,
    });
  });

  it("refuses to overwrite a manual plan once the user has started it", async () => {
    const startedPlan = {
      ...createManualActionPlan(),
      weeklyActions: [createManualAction(1)],
    };
    const created = await createOwnedActionPlan("dirigeant@example.com", {
      plan: startedPlan,
    });

    await expect(
      updateActionPlanWorkspaceForAccess({
        email: "dirigeant@example.com",
        id: created.id,
        expectedRevision: created.revision,
        plan: ACTION_PLAN_DEMO,
        workspaceState: createActionPlanWorkspaceState(ACTION_PLAN_DEMO),
      }),
    ).rejects.toBeInstanceOf(InvalidActionPlanMutationError);
  });

  it("reads legacy V1 plans and workspace overrides without losing progress", async () => {
    const currentPlan = actionPlan("Plan historique");
    const legacyPlan = {
      ...currentPlan,
      version: "1",
      weeklyActions: currentPlan.weeklyActions.map((action) => ({
        ...action,
        why: "Ancienne justification.",
        estimatedMinutes: 60,
        deliverable: "Ancien livrable.",
        successCriterion: "Ancien critère.",
        ethicalGuardrail: "Ancien garde-fou.",
      })),
    };
    const legacyWorkspace = createActionPlanWorkspaceState(currentPlan);
    legacyWorkspace.tasks["action-1"].status = "done";
    legacyWorkspace.tasks["action-1"].notes = "Progression historique";
    const legacyWorkspaceValue = structuredClone(legacyWorkspace) as unknown as {
      tasks: Record<string, { overrides: Record<string, unknown> }>;
    };
    legacyWorkspaceValue.tasks["action-1"].overrides.estimatedMinutes = 60;

    firestore.documents.set("action_plans/legacy-plan", {
      schema_version: "1",
      status: "active",
      plan: legacyPlan,
      workspace_state: legacyWorkspaceValue,
      source_text: null,
      generation: null,
      owner_email: "dirigeant@example.com",
      revision: 3,
      created_at: "2026-08-01T10:00:00.000Z",
      updated_at: "2026-08-02T10:00:00.000Z",
    });

    const [stored] = await getOwnedActionPlans("dirigeant@example.com");
    expect(stored?.plan.version).toBe("2");
    const legacyAction = stored?.plan.version === "2"
      ? stored.plan.weeklyActions[0]
      : undefined;
    expect(legacyAction).not.toHaveProperty("why");
    expect(legacyAction).not.toHaveProperty("estimatedMinutes");
    expect(stored?.workspaceState.tasks["action-1"].status).toBe("done");
    expect(stored?.workspaceState.tasks["action-1"].notes).toBe(
      "Progression historique",
    );
    expect(stored?.workspaceState.tasks["action-1"].overrides).not.toHaveProperty(
      "estimatedMinutes",
    );
  });

  it("rejects an outdated revision instead of overwriting newer changes", async () => {
    const plan = actionPlan();
    const created = await createOwnedActionPlan("dirigeant@example.com", { plan });
    const workspace = createActionPlanWorkspaceState(plan);

    await updateOwnedActionPlanWorkspace(
      "dirigeant@example.com",
      created.id,
      1,
      workspace,
    );

    await expect(
      updateOwnedActionPlanWorkspace(
        "dirigeant@example.com",
        created.id,
        1,
        workspace,
      ),
    ).rejects.toBeInstanceOf(ActionPlanRevisionConflictError);
  });

});
