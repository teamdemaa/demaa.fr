import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import {
  getActionPlanActions,
  type ActionPlanViewAction,
} from "@/lib/action-plan-view-model";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import type { SystemeDetail } from "@/lib/systeme-catalog";
import type { SystemResource } from "@/lib/system-resource-catalog";

export type ActionPlanOrganisationAid = Readonly<{
  bullets: readonly string[];
  cadence: string;
  kind: "organisation";
  label: string;
  routineId: string;
  systemId: string;
}>;

export type ActionPlanModelAid = Readonly<{
  description: string;
  formatLabel: string;
  kind: "model";
  label: string;
  resourceSlug: string;
  systemId: string;
}>;

export type ActionPlanContextualAid = Readonly<{
  model: ActionPlanModelAid | null;
  organisation: ActionPlanOrganisationAid | null;
}>;

export type ActionPlanContextualAidsByActionId = Readonly<
  Record<string, ActionPlanContextualAid>
>;

type WeightedPart = Readonly<{
  text: string | null | undefined;
  weight: number;
}>;

type WeightedToken = Readonly<{
  concept: string | null;
  token: string;
  weight: number;
}>;

type ScoredCandidate<T> = Readonly<{
  candidate: T;
  conceptMatches: number;
  rawMatches: number;
  score: number;
}>;

const STOP_WORDS = new Set([
  "action",
  "actions",
  "afin",
  "avec",
  "avoir",
  "cette",
  "chaque",
  "choisir",
  "comme",
  "dans",
  "definir",
  "des",
  "faire",
  "identifier",
  "les",
  "leur",
  "leurs",
  "mettre",
  "noter",
  "objectif",
  "organiser",
  "par",
  "pour",
  "premier",
  "premiere",
  "preparer",
  "priorite",
  "prochaine",
  "prochain",
  "resultat",
  "semaine",
  "sans",
  "sur",
  "tous",
  "toutes",
  "utiliser",
  "verifier",
]);

const CONCEPT_GROUPS: Readonly<Record<string, readonly string[]>> = {
  commercial: [
    "client",
    "commercial",
    "crm",
    "devis",
    "lead",
    "opportunite",
    "prospect",
    "relance",
    "vente",
  ],
  finance: [
    "budget",
    "cout",
    "encaissement",
    "facture",
    "finance",
    "marge",
    "paiement",
    "previsionnel",
    "rentabilite",
    "tresorerie",
  ],
  pilotage: [
    "capacite",
    "ecart",
    "indicateur",
    "performance",
    "pilotage",
    "reporting",
    "tableau",
  ],
  planning: [
    "agenda",
    "affectation",
    "calendrier",
    "equipe",
    "intervention",
    "planning",
    "rendez",
  ],
  qualite: [
    "audit",
    "conformite",
    "controle",
    "hygiene",
    "qualite",
    "securite",
  ],
  stock: [
    "achat",
    "approvisionnement",
    "commande",
    "fournisseur",
    "inventaire",
    "reassort",
    "stock",
  ],
};

const CONCEPT_BY_TOKEN = new Map(
  Object.entries(CONCEPT_GROUPS).flatMap(([concept, tokens]) =>
    tokens.map((token) => [token, concept] as const),
  ),
);

const EMPTY_AID: ActionPlanContextualAid = Object.freeze({
  model: null,
  organisation: null,
});

export function getEffectiveActionPlanActionsForContextualAids(
  plan: PersistableActionPlan,
  workspace: ActionPlanWorkspaceState,
) {
  const deletedActionIds = new Set(workspace.deletedActionIds);
  return [
    ...getActionPlanActions(plan),
    ...workspace.addedActions,
  ].filter(({ id }) => !deletedActionIds.has(id)).map((action) => {
    const overrides = workspace.tasks[action.id]?.overrides;
    return {
      ...action,
      title: overrides?.title ?? action.title,
      objective: overrides?.objective ?? action.objective,
      steps: overrides?.steps ?? action.steps,
      support: overrides && Object.hasOwn(overrides, "support")
        ? overrides.support ?? null
        : action.support,
    } satisfies ActionPlanViewAction;
  });
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function singularize(token: string) {
  if (token.length > 5 && token.endsWith("s")) return token.slice(0, -1);
  return token;
}

function findConcept(token: string) {
  for (const [knownToken, concept] of CONCEPT_BY_TOKEN) {
    if (sameLexeme(token, knownToken)) return concept;
  }
  return null;
}

function sameLexeme(left: string, right: string) {
  if (left === right) return true;
  const prefixLength = Math.min(left.length, right.length, 5);
  return prefixLength >= 5 && left.slice(0, prefixLength) === right.slice(0, prefixLength);
}

function getWeightedTokens(parts: readonly WeightedPart[]): WeightedToken[] {
  const byToken = new Map<string, WeightedToken>();

  for (const part of parts) {
    if (!part.text) continue;
    for (const rawToken of normalizeText(part.text).split(" ")) {
      const token = singularize(rawToken);
      if (token.length < 3 || STOP_WORDS.has(token)) continue;
      const previous = byToken.get(token);
      if (!previous || previous.weight < part.weight) {
        byToken.set(token, {
          concept: findConcept(token),
          token,
          weight: part.weight,
        });
      }
    }
  }

  return [...byToken.values()];
}

function scoreParts(
  actionTokens: readonly WeightedToken[],
  candidateParts: readonly WeightedPart[],
) {
  const candidateTokens = getWeightedTokens(candidateParts);
  const matchedCandidateTokens = new Set<string>();
  const matchedConcepts = new Set<string>();
  let rawMatches = 0;
  let score = 0;

  for (const actionToken of actionTokens) {
    let bestRawMatch: WeightedToken | null = null;
    let bestConceptMatch: WeightedToken | null = null;

    for (const candidateToken of candidateTokens) {
      if (sameLexeme(actionToken.token, candidateToken.token)) {
        if (!bestRawMatch || candidateToken.weight > bestRawMatch.weight) {
          bestRawMatch = candidateToken;
        }
      } else if (
        actionToken.concept &&
        actionToken.concept === candidateToken.concept
      ) {
        if (!bestConceptMatch || candidateToken.weight > bestConceptMatch.weight) {
          bestConceptMatch = candidateToken;
        }
      }
    }

    if (bestRawMatch && !matchedCandidateTokens.has(bestRawMatch.token)) {
      score += actionToken.weight * bestRawMatch.weight;
      rawMatches += 1;
      matchedCandidateTokens.add(bestRawMatch.token);
      continue;
    }

    if (
      bestConceptMatch &&
      actionToken.concept &&
      !matchedConcepts.has(actionToken.concept)
    ) {
      score += actionToken.weight * bestConceptMatch.weight * 0.65;
      matchedConcepts.add(actionToken.concept);
    }
  }

  return {
    conceptMatches: matchedConcepts.size,
    rawMatches,
    score,
  };
}

function getActionTokens(action: ActionPlanViewAction) {
  return getWeightedTokens([
    { text: action.title, weight: 4 },
    { text: action.objective, weight: 3 },
    { text: action.channelOrTool, weight: 3 },
    ...action.steps.map((step) => ({ text: step, weight: 1 })),
  ]);
}

function selectUniqueBest<T>(
  scored: readonly ScoredCandidate<T>[],
  options: { minimumScore: number; minimumMargin: number },
) {
  const ordered = [...scored].sort((left, right) => right.score - left.score);
  const best = ordered[0];
  const second = ordered[1];
  if (
    !best ||
    best.score < options.minimumScore ||
    best.rawMatches + best.conceptMatches === 0 ||
    (second && best.score - second.score < options.minimumMargin)
  ) {
    return null;
  }
  return best.candidate;
}

function findOrganisationAid(
  actionTokens: readonly WeightedToken[],
  systemId: string,
  systeme: SystemeDetail | null,
): ActionPlanOrganisationAid | null {
  const routines = systeme?.routines ?? [];
  const best = selectUniqueBest(
    routines.map((routine) => ({
      candidate: routine,
      ...scoreParts(actionTokens, [
        { text: routine.title, weight: 4 },
        ...routine.bullets.map((bullet) => ({ text: bullet, weight: 1 })),
      ]),
    })),
    { minimumScore: 18, minimumMargin: 5 },
  );

  return best
    ? {
        bullets: best.bullets,
        cadence: best.cadence,
        kind: "organisation",
        label: best.title,
        routineId: best.routineId,
        systemId,
      }
    : null;
}

function findModelAid(
  actionTokens: readonly WeightedToken[],
  systemId: string,
  resources: readonly SystemResource[],
): ActionPlanModelAid | null {
  const candidates = resources.filter(
    (resource) =>
      resource.availability === "available" &&
      resource.format === "template" &&
      resource.resourceSlug !== "recapitulatif-systeme",
  );
  const best = selectUniqueBest(
    candidates.map((resource) => ({
      candidate: resource,
      ...scoreParts(actionTokens, [
        { text: resource.title, weight: 4 },
        { text: resource.formatLabel, weight: 2 },
        { text: resource.description, weight: 2 },
      ]),
    })),
    { minimumScore: 10, minimumMargin: 3 },
  );

  return best
    ? {
        description: best.description,
        formatLabel: best.formatLabel,
        kind: "model",
        label: best.title,
        resourceSlug: best.resourceSlug,
        systemId,
      }
    : null;
}

export function buildActionPlanContextualAids(input: {
  actions: readonly ActionPlanViewAction[];
  resources: readonly SystemResource[];
  systemId: string;
  systeme: SystemeDetail | null;
}): ActionPlanContextualAidsByActionId {
  if (!input.systemId) return {};

  return Object.fromEntries(
    input.actions.map((action) => {
      const actionTokens = getActionTokens(action);
      if (actionTokens.length === 0) return [action.id, EMPTY_AID];

      return [action.id, {
        model: action.support
          ? null
          : findModelAid(actionTokens, input.systemId, input.resources),
        organisation: findOrganisationAid(
          actionTokens,
          input.systemId,
          input.systeme,
        ),
      }];
    }),
  );
}

export function hasActionPlanContextualAid(
  aid: ActionPlanContextualAid | null | undefined,
) {
  return Boolean(aid && (aid.organisation || aid.model));
}
