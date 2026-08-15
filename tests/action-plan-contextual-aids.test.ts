import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import {
  buildActionPlanContextualAids,
  getEffectiveActionPlanActionsForContextualAids,
  hasActionPlanContextualAid,
} from "@/lib/action-plan-contextual-aids";
import { ACTION_PLAN_DEMO } from "@/lib/action-plan-demo";
import type { ActionPlanViewAction } from "@/lib/action-plan-view-model";
import type { SystemeDetail } from "@/lib/systeme-catalog";
import {
  getSystemResourcesForSystem,
  type SystemResource,
} from "@/lib/system-resource-catalog";
import { createActionPlanWorkspaceState } from "@/lib/action-plan-workspace";

const systeme: SystemeDetail = {
  cards: [],
  routines: [
    {
      bullets: [
        "Compter les produits sensibles",
        "Déclencher le réassort avant la rupture",
      ],
      cadence: "Chaque jour",
      routineId: "restaurant-stocks",
      support: null,
      title: "Contrôler les stocks et déclencher le réassort",
    },
    {
      bullets: [
        "Mettre à jour les encaissements",
        "Comparer les décaissements prévus",
      ],
      cadence: "Chaque semaine",
      routineId: "restaurant-piloter-tresorerie",
      support: null,
      title: "Piloter la trésorerie",
    },
  ],
};

const resources: readonly SystemResource[] = [
  {
    availability: "available",
    description: "Un tableau pour suivre les priorités et les résultats.",
    format: "template",
    formatLabel: "Tableau de pilotage",
    rank: 1,
    resourceSlug: "tableau-pilotage-operationnel",
    title: "Tableau de pilotage opérationnel",
  },
  {
    availability: "available",
    description: "Un modèle pour suivre votre trésorerie et vos prévisions.",
    format: "template",
    formatLabel: "Modèle financier",
    rank: 2,
    resourceSlug: "suivi-previsionnel-financier",
    title: "Suivi et prévisionnel financier",
  },
  {
    availability: "available",
    description: "Une base CRM pour les prospects et les relances.",
    format: "template",
    formatLabel: "Modèle CRM",
    rank: 3,
    resourceSlug: "crm-suivi-commercial",
    title: "CRM - suivi commercial",
  },
  {
    availability: "coming-soon",
    description: "Un guide annoncé mais pas encore disponible.",
    format: "guide",
    formatLabel: "Guide",
    rank: 4,
    resourceSlug: "guide-restaurant-gerer",
    title: "Gérer un restaurant",
  },
];

function action(
  overrides: Partial<ActionPlanViewAction> = {},
): ActionPlanViewAction {
  return {
    channelOrTool: "Point de gestion",
    id: "action-1",
    objective: "Obtenir une première information exploitable.",
    steps: ["Rassembler les éléments utiles.", "Décider de la suite."],
    support: null,
    title: "Clarifier la situation",
    ...overrides,
  };
}

describe("action plan contextual aids", () => {
  it("associates a concrete stock action with the relevant organisation routine", () => {
    const aids = buildActionPlanContextualAids({
      actions: [action({
        objective: "Éviter les ruptures pendant le service.",
        steps: ["Compter le stock critique.", "Déclencher le réassort utile."],
        title: "Contrôler les stocks",
      })],
      resources,
      systemId: "restaurant",
      systeme,
    });

    expect(aids["action-1"]?.organisation).toMatchObject({
      routineId: "restaurant-stocks",
      systemId: "restaurant",
      cadence: "Chaque jour",
    });
    expect(aids["action-1"]?.organisation?.bullets).toContain(
      "Déclencher le réassort avant la rupture",
    );
  });

  it("links a treasury action to the existing financial model", () => {
    const aids = buildActionPlanContextualAids({
      actions: [action({
        channelOrTool: "Prévisionnel financier",
        objective: "Voir les encaissements et décaissements des prochaines semaines.",
        steps: ["Lister les paiements attendus.", "Mettre à jour la trésorerie."],
        title: "Piloter la trésorerie",
      })],
      resources,
      systemId: "restaurant",
      systeme,
    });

    expect(aids["action-1"]?.organisation?.routineId).toBe(
      "restaurant-piloter-tresorerie",
    );
    expect(aids["action-1"]?.model).toMatchObject({
      formatLabel: "Modèle financier",
      resourceSlug: "suivi-previsionnel-financier",
    });
  });

  it("fails closed for a vague action and ignores generated support content", () => {
    const aids = buildActionPlanContextualAids({
      actions: [action({
        support: {
          content: "Prospects, CRM, relances et opportunités commerciales",
          label: "Tableau prêt à utiliser",
          type: "template",
        },
      })],
      resources,
      systemId: "restaurant",
      systeme,
    });

    expect(aids["action-1"]).toEqual({
      model: null,
      organisation: null,
    });
    expect(hasActionPlanContextualAid(aids["action-1"])).toBe(false);
  });

  it("does not duplicate an existing ready-to-use support with a model", () => {
    const aids = buildActionPlanContextualAids({
      actions: [action({
        channelOrTool: "Prévisionnel financier",
        objective: "Voir les encaissements et décaissements à venir.",
        steps: ["Lister les paiements.", "Mettre à jour la trésorerie."],
        support: {
          content: "Encaissements :\nDécaissements :\nSolde prévisionnel :",
          label: "Prévisionnel prêt à compléter",
          type: "table",
        },
        title: "Piloter la trésorerie",
      })],
      resources,
      systemId: "restaurant",
      systeme,
    });

    expect(aids["action-1"]?.model).toBeNull();
    expect(aids["action-1"]?.organisation?.routineId).toBe(
      "restaurant-piloter-tresorerie",
    );
  });

  it("returns no association when no system is selected", () => {
    expect(buildActionPlanContextualAids({
      actions: [action()],
      resources,
      systemId: "",
      systeme,
    })).toEqual({});
  });

  it("derives from current action overrides without changing the persisted plan", () => {
    const workspace = createActionPlanWorkspaceState(ACTION_PLAN_DEMO);
    workspace.tasks["action-1"].overrides = {
      objective: "Éviter une rupture pendant le service.",
      steps: ["Compter le stock critique.", "Déclencher le réassort."],
      title: "Contrôler les stocks",
    };
    const before = structuredClone(ACTION_PLAN_DEMO);
    const actions = getEffectiveActionPlanActionsForContextualAids(
      ACTION_PLAN_DEMO,
      workspace,
    );

    expect(actions[0]).toMatchObject({
      id: "action-1",
      objective: "Éviter une rupture pendant le service.",
      title: "Contrôler les stocks",
    });
    expect(ACTION_PLAN_DEMO).toEqual(before);
  });

  it("reuses the real visible Organisation and Resources banks", () => {
    const aids = buildActionPlanContextualAids({
      actions: [action({
        channelOrTool: "Inventaire et caisse",
        objective: "Éviter les ruptures pendant le service.",
        steps: ["Compter le stock critique.", "Déclencher le réassort."],
        title: "Contrôler les stocks",
      })],
      resources: getSystemResourcesForSystem("restaurant"),
      systemId: "restaurant",
      systeme,
    });

    expect(aids["action-1"]?.organisation).toMatchObject({
      routineId: "restaurant-stocks",
    });
    expect(aids["action-1"]?.model).toBeNull();
  });
});

describe("action plan contextual aid integration", () => {
  it("wires the same derived aids into guest and saved plan details", () => {
    const guest = readFileSync(
      "src/components/ActionPlanExperience.tsx",
      "utf8",
    );
    const saved = readFileSync(
      "src/components/SavedActionPlanDetail.tsx",
      "utf8",
    );
    const result = readFileSync("src/components/ActionPlanResult.tsx", "utf8");

    expect(guest).toContain("contextualSystemId={");
    expect(saved).toContain("contextualSystemId={");
    expect(result).toContain("useActionPlanContextualAids");
    expect(result).toContain("Dans votre système");
    expect(result).toContain("contextualAid.organisation.bullets");
    expect(result).not.toContain("contextualAid?.solutions");
    expect(result).not.toContain("Stratégie");
  });
});
