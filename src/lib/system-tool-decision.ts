import type { RenderableSolutionPlacementDto } from "@/lib/system-solutions-ui-dto";
import type { ToolProcessComparisonView } from "@/lib/tool-process-comparison-contract";

type CuratedToolDecision = Readonly<{
  comparable: readonly string[];
  complementary: readonly string[];
}>;

/**
 * These groups express product substitutability, not visual categories.
 * A tool belongs in `comparable` only when it can reasonably occupy the same
 * core role as the other tools in that group. Cross-cutting products stay out
 * of the feature table even when they are useful to the same business.
 */
const CURATED_TOOL_DECISIONS: Readonly<Record<string, CuratedToolDecision>> = {
  batiment: {
    comparable: ["obat", "costructor", "progbat", "vertuoza"],
    complementary: [],
  },
  "cabinet-comptable": {
    comparable: [
      "pennylane",
      "sage-generation-experts",
      "cegid-loop",
      "inqom-expert",
    ],
    complementary: ["tiimora", "silae"],
  },
  "cabinet-davocat": {
    comparable: ["kleos", "secib", "jarvis-legal"],
    complementary: ["doctrine"],
  },
  "gestionnaire-paie-independant": {
    comparable: ["silae", "payfit"],
    complementary: [],
  },
  restaurant: {
    comparable: ["lightspeed", "l-addition"],
    complementary: ["zenchef", "deliverect", "revya", "uber-eats"],
  },
};

const CROSS_CUTTING_TOOL_SLUGS = new Set([
  "airtable",
  "chatgpt",
  "google-workspace",
  "make",
  "notion",
]);

const CURATED_TOOL_ROLE_LABELS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  batiment: {
    obat: "Gestion BTP",
    costructor: "Gestion BTP",
    progbat: "Gestion BTP",
    vertuoza: "Gestion BTP",
  },
  "cabinet-comptable": {
    pennylane: "Production comptable",
    "sage-generation-experts": "Production comptable",
    "cegid-loop": "Production comptable",
    "inqom-expert": "Production comptable",
    tiimora: "Organisation du cabinet",
    silae: "Paie",
  },
  "cabinet-davocat": {
    kleos: "Gestion du cabinet",
    secib: "Gestion du cabinet",
    "jarvis-legal": "Gestion du cabinet",
    doctrine: "Recherche juridique & IA",
  },
  "gestionnaire-paie-independant": {
    silae: "Production de la paie",
    payfit: "Paie & RH",
  },
  restaurant: {
    lightspeed: "Caisse & gestion du restaurant",
    "l-addition": "Caisse & gestion du restaurant",
    zenchef: "Réservations & relation client",
    deliverect: "Commandes & livraison",
    revya: "Fidélisation",
    "uber-eats": "Plateforme de livraison",
  },
};

export function getSystemToolRoleLabel(
  systemSlug: string,
  resourceSlug: string,
  fallback = "Outil",
) {
  return CURATED_TOOL_ROLE_LABELS[systemSlug]?.[resourceSlug] ?? fallback;
}

function pickInOrder(
  placements: readonly RenderableSolutionPlacementDto[],
  slugs: readonly string[],
) {
  const bySlug = new Map(
    placements.map((placement) => [placement.resource.resourceSlug, placement]),
  );
  return slugs.flatMap((slug) => {
    const placement = bySlug.get(slug);
    return placement ? [placement] : [];
  });
}

export type SystemToolDecision = Readonly<{
  comparable: readonly RenderableSolutionPlacementDto[];
  complementary: readonly RenderableSolutionPlacementDto[];
  unclassified: readonly RenderableSolutionPlacementDto[];
}>;

export function buildSystemToolDecision(
  systemSlug: string,
  placements: readonly RenderableSolutionPlacementDto[],
): SystemToolDecision {
  const curated = CURATED_TOOL_DECISIONS[systemSlug];
  if (curated) {
    const classifiedSlugs = new Set([
      ...curated.comparable,
      ...curated.complementary,
    ]);
    return {
      comparable: pickInOrder(placements, curated.comparable),
      complementary: pickInOrder(placements, curated.complementary),
      unclassified: placements.filter(
        ({ resource }) => !classifiedSlugs.has(resource.resourceSlug),
      ),
    };
  }

  const complementary = placements.filter(({ resource }) =>
    CROSS_CUTTING_TOOL_SLUGS.has(resource.resourceSlug),
  );
  const remaining = placements.filter(
    ({ resource }) => !CROSS_CUTTING_TOOL_SLUGS.has(resource.resourceSlug),
  );

  return {
    comparable: [],
    complementary,
    // Matching editorial labels are not proof of substitutability. Until a
    // métier has been reviewed, keep its products neutral rather than expose a
    // misleading comparison.
    unclassified: remaining,
  };
}

export function selectComparableToolColumns(
  comparison: ToolProcessComparisonView | null,
  comparablePlacements: readonly RenderableSolutionPlacementDto[],
): ToolProcessComparisonView | null {
  if (!comparison || comparablePlacements.length < 2) return null;

  const allowedSlugs = new Set(
    comparablePlacements.map(({ resource }) => resource.resourceSlug),
  );
  const selectedIndexes = comparison.tools.flatMap((tool, index) =>
    allowedSlugs.has(tool.resourceSlug) ? [index] : [],
  );
  if (selectedIndexes.length < 2) return null;

  const tools = selectedIndexes.map((index) => comparison.tools[index]);
  const features = comparison.features.flatMap((feature) => {
    const cells = selectedIndexes.map((index) => feature.cells[index]);
    return cells.some((cell) => cell.status !== "not_documented")
      ? [{ ...feature, cells }]
      : [];
  });
  if (features.length === 0) return null;

  return { ...comparison, tools, features };
}
