import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import {
  getActionPlanActions,
  type ActionPlanViewAction,
} from "@/lib/action-plan-view-model";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import type { SystemeDetail } from "@/lib/systeme-catalog";
import type { SystemResource } from "@/lib/system-resource-catalog";
import { isCanonicalServiceEligibleForSystem } from "@/lib/canonical-service-eligibility";
import { isCanonicalServicePublic } from "@/lib/canonical-service-visibility";
import type {
  RenderableSolutionPlacementDto,
  RenderableSolutionSectionDto,
} from "@/lib/system-solutions-ui-dto";

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

export type ActionPlanSolutionAid = Readonly<{
  description: string;
  kind: "accompaniment" | "tool";
  label: string;
  placementId: string;
  relationship: "already_in_use" | "named_in_action" | "selected_in_solutions" | "suggested";
  resourceSlug: string;
  systemId: string;
}>;

export type ActionPlanContextualAid = Readonly<{
  accompaniment: ActionPlanSolutionAid | null;
  model: ActionPlanModelAid | null;
  organisation: ActionPlanOrganisationAid | null;
  tool: ActionPlanSolutionAid | null;
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
  accompaniment: null,
  model: null,
  organisation: null,
  tool: null,
});

// The current lexical resolver is not precise enough to distinguish an
// explicit deliverable from a broad business concept. Models remain available
// in Resources, but contextual model cards stay hidden until the versioned
// intent resolver is ready.
const CONTEXTUAL_MODEL_RECOMMENDATIONS_ENABLED = false;

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
      resource.resourceSlug !== "processus-metier" &&
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

type ScoredSolutionAid = Readonly<{
  actionId: string;
  aid: ActionPlanSolutionAid;
  score: number;
}>;

// A service card is commercial, so a matching business topic is not enough.
// Require language that clearly asks another person to take responsibility for
// the work. Broad wording such as "aide", "accompagnement" or "mettre en
// place" is deliberately excluded to avoid unsolicited upsell.
const EXPLICIT_DELEGATION_PATTERN =
  /\b(confier\w*|deleg\w*|externalis\w*|mandater\w*|recrut\w*|solliciter\w*|sous trait\w*|faire (?:appel|faire|gerer|prendre en charge|realiser|valider)\w*|trouver (?:un |une |le |la )?(?:expert|prestataire|professionnel|specialiste|quelqu)\w*)/;

const SOFTWARE_CAPABILITY_PATTERN =
  /\b(automatis|centralis|connect|crm|en ligne|integr|logiciel|multi utilisateur|outil|planning|rendez vous|synchron|temps reel|workflow)\w*/;

const ALTERNANCE_INTENT_PATTERN =
  /\b(alternan|apprenti|commercial en alternance|administratif polyvalent en alternance|monteur video en alternance|createur de contenu en alternance)\w*/;

const SERVICE_INTENT_PATTERNS: Readonly<Record<string, RegExp>> = {
  "expert-comptable":
    /\b(expert comptable|comptabil|bilan|liasse|fisc|tva|tenue comptable|cloture comptable)\w*/,
  "formalites-entreprise":
    /\b(creer (une |mon |son )?entreprise|creation d entreprise|cessation|fermeture|formal|immatricul|modifier (les )?statut|radiation)\w*/,
  "assistance-administrative":
    /\b(assistance administrative|assistant administratif|secretariat|classement (des )?document|gestion administrative|saisie administrative|collecte (des )?piece|relance (des )?document)\w*/,
  "automatisation-processus":
    /\b(automatis|connecter? (les )?outil|integration|workflow|ressaisie|tache repetit)\w*/,
  "application-metier":
    /\b(application metier|logiciel sur mesure|outil sur mesure|portail interne|espace client sur mesure|developper (une )?application|creer (une )?application)\w*/,
  "gestion-reseaux-sociaux":
    /\b(reseaux sociaux|publication|calendrier editorial|community management|contenu recurrent)\w*/,
  "publicite-en-ligne":
    /\b(publicite|campagne payante|google ads|meta ads|budget media|acquisition payante)\w*/,
  "prospection-ciblee":
    /\b(prospection|fichier prospect|recherche de prospect|qualification (des )?lead|prise de rendez vous)\w*/,
  "recruter-un-alternant": ALTERNANCE_INTENT_PATTERN,
};

function getActionSearchText(action: ActionPlanViewAction) {
  return normalizeText([
    action.title,
    action.objective,
    action.channelOrTool,
    ...action.steps,
  ].join(" "));
}

function getPlacementParts(
  placement: RenderableSolutionPlacementDto,
): readonly WeightedPart[] {
  return [
    { text: placement.resource.name, weight: 4 },
    { text: placement.resource.displayCategory, weight: 2 },
    { text: placement.usage, weight: 4 },
    { text: placement.resource.description, weight: 2 },
    { text: placement.fitRationale, weight: 2 },
    ...placement.fitConstraints.map((constraint) => ({ text: constraint, weight: 1 })),
  ];
}

function sourceMentionsTool(
  sourceText: string,
  placement: RenderableSolutionPlacementDto,
) {
  const source = normalizeText(sourceText);
  const name = normalizeText(placement.resource.name);
  if (!source || name.length < 3 || !source.includes(name)) return false;

  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `\\b(avec|avons|deja|equip\\w*|notre outil|sur|travaill\\w* avec|utilise deja|utilise actuellement|utilisent|utilisons)(?: \\w+){0,6} ${escapedName}\\b|\\b${escapedName}\\b(?: \\w+){0,5} \\b(actuel|deja|utilise)\\w*`,
  ).test(source);
}

function textMentionsTool(
  text: string,
  placement: RenderableSolutionPlacementDto,
) {
  const normalizedText = normalizeText(text);
  const name = normalizeText(placement.resource.name);
  return Boolean(normalizedText && name.length >= 3 && normalizedText.includes(name));
}

function toSolutionAid(input: {
  kind: ActionPlanSolutionAid["kind"];
  placement: RenderableSolutionPlacementDto;
  relationship?: ActionPlanSolutionAid["relationship"];
  systemId: string;
}): ActionPlanSolutionAid {
  return {
    description: input.placement.usage,
    kind: input.kind,
    label: input.placement.resource.name,
    placementId: input.placement.placementId,
    relationship: input.relationship ?? "suggested",
    resourceSlug: input.placement.resource.resourceSlug,
    systemId: input.systemId,
  };
}

function findToolAid(
  action: ActionPlanViewAction,
  placements: readonly RenderableSolutionPlacementDto[],
  input: {
    hasModel: boolean;
    mentionedCategories: ReadonlySet<string>;
    mentionedPlacementIds: ReadonlySet<string>;
    referencedPlacementIds: ReadonlySet<string>;
    selectedPlacementIds: ReadonlySet<string>;
    systemId: string;
  },
): ScoredSolutionAid | null {
  const actionText = getActionSearchText(action);
  const actionTokens = getActionTokens(action);
  const scored = placements.flatMap((placement) => {
    const category = normalizeText(placement.resource.displayCategory ?? "");
    const mentioned = input.mentionedPlacementIds.has(placement.placementId);
    if (!mentioned && category && input.mentionedCategories.has(category)) return [];
    return [{
      candidate: placement,
      ...scoreParts(actionTokens, getPlacementParts(placement)),
    }];
  }).sort((left, right) => right.score - left.score);
  const best = scored[0];
  const second = scored[1];
  const bestIsMentioned = best
    ? input.mentionedPlacementIds.has(best.candidate.placementId)
    : false;
  const bestIsReferenced = best
    ? input.referencedPlacementIds.has(best.candidate.placementId)
    : false;
  const bestIsSelected = best
    ? input.selectedPlacementIds.has(best.candidate.placementId)
    : false;
  if (
    !best ||
    (!bestIsMentioned && !bestIsReferenced && !bestIsSelected) ||
    (!SOFTWARE_CAPABILITY_PATTERN.test(actionText) && !bestIsReferenced && !bestIsSelected) ||
    (input.hasModel && !bestIsReferenced && !bestIsSelected) ||
    best.score < 14 ||
    (!bestIsReferenced && !bestIsSelected && best.rawMatches < 2) ||
    best.rawMatches + best.conceptMatches === 0 ||
    (second && best.score - second.score < 4)
  ) return null;

  return {
    actionId: action.id,
    aid: toSolutionAid({
      kind: "tool",
      placement: best.candidate,
      relationship: bestIsSelected
        ? "selected_in_solutions"
        : bestIsMentioned
          ? "already_in_use"
          : "named_in_action",
      systemId: input.systemId,
    }),
    score: best.score,
  };
}

function serviceMatchesAction(
  placement: RenderableSolutionPlacementDto,
  actionText: string,
  systemId: string,
) {
  const slug = placement.resource.resourceSlug;
  if (slug === "coach-business") return false;
  if (!isCanonicalServiceEligibleForSystem(slug, systemId)) return false;
  if (ALTERNANCE_INTENT_PATTERN.test(actionText) && slug !== "recruter-un-alternant") {
    return false;
  }
  const intentPattern = SERVICE_INTENT_PATTERNS[slug];
  if (!intentPattern?.test(actionText)) return false;
  return EXPLICIT_DELEGATION_PATTERN.test(actionText);
}

function findAccompanimentAid(
  action: ActionPlanViewAction,
  placements: readonly RenderableSolutionPlacementDto[],
  input: {
    systemId: string;
  },
): ScoredSolutionAid | null {
  const actionText = getActionSearchText(action);
  const actionTokens = getActionTokens(action);
  const scored = placements
    .filter((placement) => serviceMatchesAction(
      placement,
      actionText,
      input.systemId,
    ))
    .map((placement) => ({
      candidate: placement,
      ...scoreParts(actionTokens, getPlacementParts(placement)),
    }))
    .sort((left, right) => right.score - left.score);
  const best = selectUniqueBest(scored, {
    minimumMargin: 3,
    minimumScore: 10,
  });
  if (!best) return null;

  return {
    actionId: action.id,
    aid: toSolutionAid({
      kind: "accompaniment",
      placement: best,
      // Services now live in their own destination and are no longer
      // selectable in Solutions. Historical service placement IDs must not
      // surface a misleading "already selected" state.
      relationship: "suggested",
      systemId: input.systemId,
    }),
    score: scored.find(({ candidate }) => candidate.placementId === best.placementId)?.score ?? 0,
  };
}

export function buildActionPlanContextualAids(input: {
  actions: readonly ActionPlanViewAction[];
  resources: readonly SystemResource[];
  selectedSolutionPlacementIds?: ReadonlySet<string>;
  solutionSections?: readonly RenderableSolutionSectionDto[];
  sourceText?: string | null;
  systemId: string;
  systeme: SystemeDetail | null;
}): ActionPlanContextualAidsByActionId {
  if (!input.systemId) return {};

  const selectedPlacementIds = input.selectedSolutionPlacementIds ?? new Set<string>();
  const visibleSections = input.solutionSections ?? [];
  const toolPlacements = visibleSections
    .filter(({ section }) => section === "software")
    .flatMap(({ placements }) => placements)
    .filter((placement) =>
      placement.systemSlug === input.systemId &&
      (placement.resource.resourceType === "software" ||
        placement.resource.resourceType === "tool"),
    );
  const servicePlacements = visibleSections
    .filter(({ section }) => section === "services")
    .flatMap(({ placements }) => placements)
    .filter(({ resource, systemSlug }) =>
      systemSlug === input.systemId &&
      isCanonicalServicePublic(resource.resourceSlug),
    );
  const mentionedTools = toolPlacements.filter((placement) =>
    sourceMentionsTool(
      [
        input.sourceText ?? "",
        ...input.actions.map(getActionSearchText),
      ].join(" "),
      placement,
    ),
  );
  const mentionedPlacementIds = new Set(
    mentionedTools.map(({ placementId }) => placementId),
  );
  const referencedPlacementIds = new Set(
    toolPlacements
      .filter((placement) => input.actions.some((action) =>
        textMentionsTool(getActionSearchText(action), placement),
      ))
      .map(({ placementId }) => placementId),
  );
  const mentionedCategories = new Set(
    mentionedTools
      .map(({ resource }) => normalizeText(resource.displayCategory ?? ""))
      .filter(Boolean),
  );
  const modelAidByActionId = new Map(
    input.actions.map((action) => [
      action.id,
      CONTEXTUAL_MODEL_RECOMMENDATIONS_ENABLED
        ? findModelAid(getActionTokens(action), input.systemId, input.resources)
        : null,
    ]),
  );
  const toolCandidates = input.actions.flatMap((action) => {
    const candidate = findToolAid(action, toolPlacements, {
      hasModel: Boolean(modelAidByActionId.get(action.id)),
      mentionedCategories,
      mentionedPlacementIds,
      referencedPlacementIds,
      selectedPlacementIds,
      systemId: input.systemId,
    });
    return candidate ? [candidate] : [];
  }).sort((left, right) => right.score - left.score);
  const selectedToolCandidates: ScoredSolutionAid[] = [];
  const selectedToolSlugs = new Set<string>();
  const selectedToolActionIds = new Set<string>();
  for (const candidate of toolCandidates) {
    if (
      selectedToolCandidates.length >= 2 ||
      selectedToolSlugs.has(candidate.aid.resourceSlug) ||
      selectedToolActionIds.has(candidate.actionId)
    ) continue;
    selectedToolCandidates.push(candidate);
    selectedToolSlugs.add(candidate.aid.resourceSlug);
    selectedToolActionIds.add(candidate.actionId);
  }
  const accompanimentCandidate = input.actions
    .flatMap((action) => {
      const candidate = findAccompanimentAid(action, servicePlacements, {
        systemId: input.systemId,
      });
      return candidate ? [candidate] : [];
    })
    .sort((left, right) => right.score - left.score)[0] ?? null;
  const selectedCommercialCandidates: ScoredSolutionAid[] = [];
  const selectedCommercialActionIds = new Set<string>();
  for (const candidate of [
    ...selectedToolCandidates,
    ...(accompanimentCandidate ? [accompanimentCandidate] : []),
  ].sort((left, right) => right.score - left.score)) {
    if (
      selectedCommercialCandidates.length >= 2 ||
      selectedCommercialActionIds.has(candidate.actionId)
    ) continue;
    selectedCommercialCandidates.push(candidate);
    selectedCommercialActionIds.add(candidate.actionId);
  }
  const toolAidByActionId = new Map(
    selectedCommercialCandidates
      .filter(({ aid }) => aid.kind === "tool")
      .map(({ actionId, aid }) => [actionId, aid]),
  );
  const accompanimentAidByActionId = new Map(
    selectedCommercialCandidates
      .filter(({ aid }) => aid.kind === "accompaniment")
      .map(({ actionId, aid }) => [actionId, aid]),
  );

  return Object.fromEntries(
    input.actions.map((action) => {
      const actionTokens = getActionTokens(action);
      if (actionTokens.length === 0) return [action.id, EMPTY_AID];

      return [action.id, {
        accompaniment:
          accompanimentAidByActionId.get(action.id) ?? null,
        model: modelAidByActionId.get(action.id) ?? null,
        organisation: findOrganisationAid(
          actionTokens,
          input.systemId,
          input.systeme,
        ),
        tool: toolAidByActionId.get(action.id) ?? null,
      }];
    }),
  );
}

export function hasActionPlanContextualAid(
  aid: ActionPlanContextualAid | null | undefined,
) {
  return Boolean(
    aid && (aid.accompaniment || aid.organisation || aid.model || aid.tool),
  );
}
