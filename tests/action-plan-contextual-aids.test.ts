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
import type { RenderableSolutionSectionDto } from "@/lib/system-solutions-ui-dto";
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
    description: "Un modèle pour suivre votre trésorerie et vos prévisions.",
    format: "template",
    formatLabel: "Modèle financier",
    rank: 1,
    resourceSlug: "suivi-previsionnel-financier",
    title: "Suivi et prévisionnel financier",
  },
  {
    availability: "available",
    description: "Une base CRM pour les prospects et les relances.",
    format: "template",
    formatLabel: "Modèle CRM",
    rank: 2,
    resourceSlug: "crm-suivi-commercial",
    title: "CRM - suivi commercial",
  },
  {
    availability: "coming-soon",
    description: "Un guide annoncé mais pas encore disponible.",
    format: "guide",
    formatLabel: "Guide",
    rank: 3,
    resourceSlug: "guide-restaurant-gerer",
    title: "Gérer un restaurant",
  },
];

function placement(input: {
  category: string;
  name: string;
  resourceSlug: string;
  section?: "software" | "services" | "providers";
  usage: string;
}) {
  const section = input.section ?? "software";
  return {
    placementId: `restaurant:${input.resourceSlug}:${section}:1`,
    systemSlug: "restaurant",
    rank: 1,
    section,
    usage: input.usage,
    fitRationale: input.usage,
    fitConstraints: [],
    resource: {
      resourceSlug: input.resourceSlug,
      resourceType: section === "software" ? "software" as const : "expertise" as const,
      name: input.name,
      description: input.usage,
      displayCategory: input.category,
      interaction: section === "software"
        ? { interactionMode: "external_link" as const, href: "https://example.com" }
        : { interactionMode: "detail" as const, href: `/services/${input.resourceSlug}` },
    },
  };
}

const solutionSections: readonly RenderableSolutionSectionDto[] = [
  {
    section: "software",
    placements: [
      placement({
        category: "CRM",
        name: "Pipedrive",
        resourceSlug: "pipedrive",
        usage: "Centraliser les prospects, suivre les opportunités et les relances commerciales.",
      }),
      placement({
        category: "Comptabilité",
        name: "Pennylane",
        resourceSlug: "pennylane",
        usage: "Suivre la comptabilité, la trésorerie, les factures et les paiements.",
      }),
      placement({
        category: "Planning",
        name: "Planity",
        resourceSlug: "planity",
        usage: "Organiser le planning, les rendez-vous et les disponibilités de l'équipe.",
      }),
    ],
  },
  {
    section: "services",
    placements: [
      placement({
        category: "Pilotage",
        name: "Coach business",
        resourceSlug: "coach-business",
        section: "services",
        usage: "Accompagnement global du dirigeant.",
      }),
      placement({
        category: "Comptabilité",
        name: "Expert-comptable",
        resourceSlug: "expert-comptable",
        section: "services",
        usage: "Confier la tenue comptable, la TVA, le bilan et la liasse fiscale.",
      }),
      placement({
        category: "Automatisation",
        name: "Automatisation des processus et IA",
        resourceSlug: "automatisation-processus",
        section: "services",
        usage: "Déléguer la mise en place de workflows et supprimer les ressaisies.",
      }),
      placement({
        category: "Juridique",
        name: "Formalités d’entreprise",
        resourceSlug: "formalites-entreprise",
        section: "services",
        usage: "Confier une création, une modification ou une fermeture d’entreprise.",
      }),
      placement({
        category: "Communication",
        name: "Gestion des réseaux sociaux",
        resourceSlug: "gestion-reseaux-sociaux",
        section: "services",
        usage: "Confier le calendrier éditorial et les publications récurrentes.",
      }),
      placement({
        category: "Acquisition",
        name: "Publicité en ligne",
        resourceSlug: "publicite-en-ligne",
        section: "services",
        usage: "Déléguer les campagnes Google Ads et Meta Ads.",
      }),
      placement({
        category: "Commercial",
        name: "Prospection ciblée",
        resourceSlug: "prospection-ciblee",
        section: "services",
        usage: "Externaliser la recherche et la qualification de prospects.",
      }),
    ],
  },
  {
    section: "providers",
    placements: [placement({
      category: "Finance",
      name: "Fournisseur privé",
      resourceSlug: "fournisseur-prive",
      section: "providers",
      usage: "Suivre la trésorerie et les paiements.",
    })],
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

  it("keeps the relevant process but hides contextual models until intent resolution is ready", () => {
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
    expect(aids["action-1"]?.model).toBeNull();
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
      accompaniment: null,
      model: null,
      organisation: null,
      tool: null,
    });
    expect(hasActionPlanContextualAid(aids["action-1"])).toBe(false);
  });

  it("does not surface a contextual model when a legacy generated table exists", () => {
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

  it("limits tools to two unique placements and marks an existing selection", () => {
    const aids = buildActionPlanContextualAids({
      actions: [
        action({
          id: "action-1",
          title: "Suivre les prospects dans un CRM",
          objective: "Centraliser les opportunités et les relances commerciales.",
        }),
        action({
          id: "action-2",
          title: "Piloter la trésorerie",
          objective: "Suivre les factures et les paiements dans Pennylane.",
        }),
        action({
          id: "action-3",
          title: "Organiser le planning",
          objective: "Centraliser les rendez-vous et disponibilités de l'équipe.",
        }),
      ],
      resources,
      selectedSolutionPlacementIds: new Set(["restaurant:pipedrive:software:1"]),
      solutionSections,
      systemId: "restaurant",
      systeme,
    });

    const tools = Object.values(aids).flatMap(({ tool }) => tool ? [tool] : []);
    expect(tools).toHaveLength(2);
    expect(new Set(tools.map(({ resourceSlug }) => resourceSlug)).size).toBe(2);
    expect(tools).toContainEqual(expect.objectContaining({
      relationship: "selected_in_solutions",
      resourceSlug: "pipedrive",
    }));
  });

  it("caps tools and accompaniments together at two commercial aids per plan", () => {
    const aids = buildActionPlanContextualAids({
      actions: [
        action({
          id: "action-1",
          title: "Utiliser Pipedrive pour les prospects",
          objective: "Centraliser les opportunités et les relances dans Pipedrive.",
        }),
        action({
          id: "action-2",
          title: "Utiliser Pennylane pour la trésorerie",
          objective: "Suivre les factures et les paiements dans Pennylane.",
        }),
        action({
          id: "action-3",
          title: "Déléguer l’automatisation",
          objective: "Confier la mise en place des workflows et supprimer les ressaisies.",
        }),
      ],
      resources,
      solutionSections,
      systemId: "restaurant",
      systeme,
    });

    const commercialAids = Object.values(aids).flatMap(({ accompaniment, tool }) => [
      ...(tool ? [tool] : []),
      ...(accompaniment ? [accompaniment] : []),
    ]);
    expect(commercialAids).toHaveLength(2);
    expect(Object.values(aids).every(({ accompaniment, tool }) =>
      Number(Boolean(accompaniment)) + Number(Boolean(tool)) <= 1
    )).toBe(true);
  });

  it("does not suggest software for a generic action without a software capability", () => {
    const aids = buildActionPlanContextualAids({
      actions: [action({
        title: "Vérifier la trésorerie",
        objective: "Voir les paiements attendus et décider de la priorité.",
      })],
      resources,
      solutionSections,
      systemId: "restaurant",
      systeme,
    });

    expect(aids["action-1"]?.tool).toBeNull();
  });

  it("does not add an approximate CRM tool when no product is explicitly named", () => {
    const baseInput = {
      resources,
      solutionSections,
      systemId: "restaurant",
      systeme,
    } as const;
    const before = buildActionPlanContextualAids({
      ...baseInput,
      actions: [action()],
    });
    const after = buildActionPlanContextualAids({
      ...baseInput,
      actions: [action({
        title: "Centraliser les prospects dans un CRM",
        objective: "Suivre les opportunités et les relances commerciales.",
      })],
    });

    expect(before["action-1"]?.tool).toBeNull();
    expect(after["action-1"]?.model).toBeNull();
    expect(after["action-1"]?.tool).toBeNull();
  });

  it("does not turn a generic software capability into a new product recommendation", () => {
    const aids = buildActionPlanContextualAids({
      actions: [action({
        channelOrTool: "CRM",
        title: "Centraliser les prospects dans un CRM",
        objective: "Suivre les opportunités et les relances commerciales.",
      })],
      resources: [],
      solutionSections,
      systemId: "restaurant",
      systeme,
    });

    expect(aids["action-1"]?.model).toBeNull();
    expect(aids["action-1"]?.tool).toBeNull();
  });

  it("does not suggest a competitor from the same category when the source names an existing tool", () => {
    const secondCrm = placement({
      category: "CRM",
      name: "Sellsy",
      resourceSlug: "sellsy",
      usage: "Centraliser les prospects, opportunités et relances commerciales.",
    });
    const sections = solutionSections.map((section) => section.section === "software"
      ? { ...section, placements: [...section.placements, secondCrm] }
      : section);
    const aids = buildActionPlanContextualAids({
      actions: [action({
        title: "Suivre les prospects dans Pipedrive",
        objective: "Centraliser les opportunités et les relances commerciales.",
      })],
      resources,
      solutionSections: sections,
      sourceText: "Nous utilisons déjà Pipedrive pour nos prospects.",
      systemId: "restaurant",
      systeme,
    });

    expect(aids["action-1"]?.tool).toMatchObject({
      relationship: "already_in_use",
      resourceSlug: "pipedrive",
    });
  });

  it("also detects an existing tool mentioned in a modified action", () => {
    const aids = buildActionPlanContextualAids({
      actions: [action({
        title: "Continuer avec Pennylane",
        objective: "Nous utilisons déjà Pennylane pour la comptabilité et les paiements.",
      })],
      resources,
      solutionSections,
      systemId: "restaurant",
      systeme,
    });

    expect(aids["action-1"]?.tool).toMatchObject({
      relationship: "already_in_use",
      resourceSlug: "pennylane",
    });
  });

  it("does not treat a future tool action as proof that the tool is already used", () => {
    const aids = buildActionPlanContextualAids({
      actions: [action({
        title: "Utiliser Pennylane",
        objective: "Centraliser la comptabilité, les factures et les paiements.",
      })],
      resources,
      solutionSections,
      systemId: "restaurant",
      systeme,
    });

    expect(aids["action-1"]?.tool).toMatchObject({
      relationship: "named_in_action",
      resourceSlug: "pennylane",
    });
  });

  it("offers at most one eligible accompaniment and never Coach business", () => {
    const aids = buildActionPlanContextualAids({
      actions: [
        action({
          id: "action-1",
          title: "Confier la clôture comptable",
          objective: "Faire valider le bilan et la liasse fiscale par un expert-comptable.",
        }),
        action({
          id: "action-2",
          title: "Déléguer l'automatisation",
          objective: "Confier la mise en place des workflows et supprimer les ressaisies.",
        }),
      ],
      resources,
      solutionSections,
      systemId: "restaurant",
      systeme,
    });

    const aidsList = Object.values(aids).flatMap(({ accompaniment }) =>
      accompaniment ? [accompaniment] : []);
    expect(aidsList).toHaveLength(1);
    expect(aidsList[0]?.resourceSlug).not.toBe("coach-business");
  });

  it.each([
    {
      objective: "Préparer le bilan, la liasse fiscale et la déclaration de TVA.",
      title: "Finaliser la clôture comptable",
    },
    {
      objective: "Préparer les pièces nécessaires à la modification des statuts.",
      title: "Modifier les statuts de l’entreprise",
    },
    {
      objective: "Connecter les outils et supprimer les ressaisies manuelles.",
      title: "Mettre en place un workflow automatisé",
    },
    {
      objective: "Comparer les tarifs des professionnels pour le bilan et la liasse fiscale.",
      title: "Étudier le marché des experts-comptables",
    },
    {
      objective: "Préparer un calendrier éditorial et publier régulièrement sur les réseaux sociaux.",
      title: "Organiser les publications",
    },
    {
      objective: "Lancer une campagne Google Ads avec un budget média défini.",
      title: "Tester la publicité en ligne",
    },
    {
      objective: "Construire un fichier de prospects et qualifier les leads prioritaires.",
      title: "Préparer la prospection ciblée",
    },
    {
      objective: "Trouver un professionnel pour avancer plus vite.",
      title: "Chercher un prestataire",
    },
  ])("does not turn an explicit business topic into an unsolicited service", (input) => {
    const aids = buildActionPlanContextualAids({
      actions: [action(input)],
      resources,
      solutionSections,
      systemId: "restaurant",
      systeme,
    });

    expect(aids["action-1"]?.accompaniment).toBeNull();
  });

  it.each([
    {
      expectedSlug: "expert-comptable",
      objective: "Faire appel à un professionnel pour le bilan et la liasse fiscale.",
      title: "Confier la clôture comptable",
    },
    {
      expectedSlug: "formalites-entreprise",
      objective: "Trouver un prestataire pour préparer et déposer la modification des statuts.",
      title: "Déléguer les formalités d’entreprise",
    },
    {
      expectedSlug: "automatisation-processus",
      objective: "Confier à un spécialiste la connexion des outils et la suppression des ressaisies.",
      title: "Externaliser l’automatisation du workflow",
    },
    {
      expectedSlug: "gestion-reseaux-sociaux",
      objective: "Confier à un prestataire le calendrier éditorial et les publications récurrentes.",
      title: "Déléguer les réseaux sociaux",
    },
    {
      expectedSlug: "publicite-en-ligne",
      objective: "Faire appel à un spécialiste pour gérer les campagnes Google Ads et le budget média.",
      title: "Confier la publicité en ligne",
    },
    {
      expectedSlug: "prospection-ciblee",
      objective: "Externaliser la recherche de prospects et la qualification des leads.",
      title: "Déléguer la prospection ciblée",
    },
  ])("keeps a service when both the need and delegation are explicit", ({ expectedSlug, ...input }) => {
    const aids = buildActionPlanContextualAids({
      actions: [action(input)],
      resources,
      solutionSections,
      systemId: "restaurant",
      systeme,
    });

    expect(aids["action-1"]?.accompaniment).toMatchObject({
      relationship: "suggested",
      resourceSlug: expectedSlug,
    });
  });

  it("removes a service after the current action no longer asks for delegation", () => {
    const plan = structuredClone(ACTION_PLAN_DEMO);
    const workspace = createActionPlanWorkspaceState(plan);
    workspace.tasks["action-1"].overrides = {
      objective: "Confier à un spécialiste la connexion des outils et la suppression des ressaisies.",
      title: "Déléguer l’automatisation du workflow",
    };
    const delegatedActions = getEffectiveActionPlanActionsForContextualAids(plan, workspace);
    const before = buildActionPlanContextualAids({
      actions: delegatedActions,
      resources,
      solutionSections,
      systemId: "restaurant",
      systeme,
    });

    workspace.tasks["action-1"].overrides = {
      objective: "Documenter le workflow actuel et supprimer une ressaisie simple en interne.",
      title: "Cartographier le workflow",
    };
    const editedActions = getEffectiveActionPlanActionsForContextualAids(plan, workspace);
    const after = buildActionPlanContextualAids({
      actions: editedActions,
      resources,
      solutionSections,
      systemId: "restaurant",
      systeme,
    });

    expect(before["action-1"]?.accompaniment?.resourceSlug).toBe(
      "automatisation-processus",
    );
    expect(after["action-1"]?.accompaniment).toBeNull();
  });

  it("never reintroduces a private solution section", () => {
    const aids = buildActionPlanContextualAids({
      actions: [action({
        title: "Piloter la trésorerie",
        objective: "Suivre la trésorerie et les paiements.",
      })],
      resources: [],
      solutionSections: solutionSections.filter(({ section }) => section === "providers"),
      systemId: "restaurant",
      systeme: null,
    });

    expect(aids["action-1"]).toEqual({
      accompaniment: null,
      model: null,
      organisation: null,
      tool: null,
    });
  });

  it("preserves formalities exclusions even if an invalid placement leaks into a regulated payload", () => {
    for (const systemId of [
      "cabinet-comptable",
      "expert-comptable",
      "cabinet-davocat",
      "notaire",
    ]) {
      const scopedSections = solutionSections.map((section) => ({
        ...section,
        placements: section.placements.map((item) => ({
          ...item,
          placementId: `${systemId}:${item.resource.resourceSlug}:${item.section}:1`,
          systemSlug: systemId,
        })),
      }));
      const aids = buildActionPlanContextualAids({
        actions: [action({
          title: "Confier une modification d’entreprise",
          objective: "Déléguer les formalités de modification des statuts.",
        })],
        resources: [],
        solutionSections: scopedSections,
        systemId,
        systeme: null,
      });

      expect(aids["action-1"]?.accompaniment, systemId).toBeNull();
    }
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
    const processPage = readFileSync(
      "src/app/(french)/(marketing)/systemes/[slug]/processus/page.tsx",
      "utf8",
    );

    expect(guest).toContain("contextualSystemId={");
    expect(saved).toContain("contextualSystemId={");
    expect(result).toContain("useActionPlanContextualAids");
    expect(result).toContain("Dans votre système");
    expect(result).toContain("Ouvrir le modèle");
    expect(result).toContain("Voir le processus");
    expect(result).toContain("encodeURIComponent(contextualAid.organisation.routineId)");
    expect(processPage).toContain("id={routine.routineId}");
    expect(processPage).toContain("scroll-mt-28");
    expect(result).toContain("Outil mentionné dans cette action");
    expect(result).toContain("Voir dans Solutions");
    expect(result).toContain("Vous souhaitez déléguer cette action ?");
    expect(result).toContain("Voir l’accompagnement");
    expect(result).not.toContain("contextualAid?.solutions");
    expect(result).not.toMatch(/Prix|Avantage abonné|checkout/i);
    expect(result).not.toContain("https://");
    expect(result).not.toContain("Stratégie");
  });
});
