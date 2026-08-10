import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ActionPlan } from "@/lib/action-plan-contract";
import { actionPlanSystemOptions } from "@/lib/action-plan-system-catalog";
import { createActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

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
  createOwnedActionPlan,
  createPendingActionPlan,
  getOwnedActionPlans,
  hashActionPlanClaimSecret,
  updateOwnedActionPlanWorkspace,
} from "@/lib/action-plan-storage.server";
import {
  consumeCustomerMagicLink,
  saveCustomerMagicLink,
} from "@/lib/generations-db";

const systemId = actionPlanSystemOptions[0]?.id;
if (!systemId) throw new Error("Missing action plan system fixture.");

function actionPlan(summary = "Un plan concret pour reprendre la main."): ActionPlan {
  const actions = [1, 2, 3].map((index) => ({
    id: `action-${index}` as `action-${1 | 2 | 3 | 4 | 5}`,
    title: `Action ${index}`,
    objective: "Obtenir un résultat concret cette semaine.",
    why: "Cette action traite directement le blocage décrit.",
    estimatedMinutes: 30,
    channelOrTool: "Téléphone et document de suivi",
    deliverable: "Une décision documentée",
    steps: ["Préparer les informations utiles.", "Réaliser puis noter le résultat."],
    readyToUse: null,
    successCriterion: "La décision est prise et consignée.",
    ethicalGuardrail: "Respecter le choix et le temps de chaque personne.",
    strategyPillar: "alignement" as const,
  }));

  return {
    version: "1",
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

  it("creates an expiring pending plan without storing the raw claim secret", async () => {
    const pending = await createPendingActionPlan({
      plan: actionPlan(),
      sourceText: "Je veux mieux organiser mon activité.",
    });

    const document = firestore.documents.get(`action_plans/${pending.id}`);
    expect(document?.status).toBe("pending_claim");
    expect(document?.owner_email).toBeNull();
    expect(document?.claim_secret_hash).toBe(
      hashActionPlanClaimSecret(pending.claimSecret),
    );
    expect(document?.claim_secret_hash).not.toBe(pending.claimSecret);
    expect(Date.parse(String(document?.retention_expires_at))).toBeGreaterThan(Date.now());
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
        claimSecretHash: hashActionPlanClaimSecret(pending.claimSecret),
      },
    });

    expect(attached).toBe(true);
    expect(
      firestore.documents.get(`action_plans/${pending.id}`)?.owner_email,
    ).toBeNull();

    await consumeCustomerMagicLink(tokenHash);

    const claimed = firestore.documents.get(`action_plans/${pending.id}`);
    expect(claimed?.status).toBe("active");
    expect(claimed?.owner_email).toBe("dirigeant@example.com");
    expect(claimed?.claim_secret_hash).toBeNull();
    expect(claimed?.retention_expires_at).toBe("2029-08-10T00:00:00.000Z");

    const plans = await getOwnedActionPlans("dirigeant@example.com");
    expect(plans).toHaveLength(1);
    expect(plans[0]?.id).toBe(pending.id);
  });

  it("rejects a wrong claim secret and leaves the plan unattached", async () => {
    const pending = await createPendingActionPlan({ plan: actionPlan() });
    const attached = await saveCustomerMagicLink({
      email: "dirigeant@example.com",
      expiresAt: new Date(Date.now() + 30_000).toISOString(),
      tokenHash: "magic-token-hash",
      actionPlanClaim: {
        actionPlanId: pending.id,
        claimSecretHash: hashActionPlanClaimSecret("wrong-secret"),
      },
    });

    expect(attached).toBe(false);
    expect(firestore.documents.has("customer_magic_links/magic-token-hash")).toBe(false);
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
