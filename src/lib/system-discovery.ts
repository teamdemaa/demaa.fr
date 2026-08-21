import { normalizeSearchText } from "@/lib/search";
import rawSystemDiscoveryTerms from "@/lib/system-discovery-terms.json";

export type SystemDiscoveryTermKind = "alias" | "specialty" | "problem" | "object";

export type SystemDiscoveryTerm = {
  value: string;
  kind: SystemDiscoveryTermKind;
  status: "published" | "draft";
};

export type SystemDiscoveryEntry = {
  systemSlug: string;
  terms: readonly SystemDiscoveryTerm[];
};

export type FutureSystemCandidate = {
  candidateKey: string;
  status: "draft";
  terms: readonly string[];
};

export type SystemDiscoverySearchInput = {
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  tags: readonly string[];
  sectorLabel: string;
};

type RawSystemDiscoveryPayload = {
  entries: Record<string, SystemDiscoveryTerm[]>;
  futureCandidates: FutureSystemCandidate[];
};

const rawDiscoveryPayload = rawSystemDiscoveryTerms as RawSystemDiscoveryPayload;

function normalizeDiscoveryText(value: string): string {
  return normalizeSearchText(value)
    .split(" ")
    .map((token) => {
      if (token.length <= 4) return token;
      if (token.endsWith("aux")) return `${token.slice(0, -3)}al`;
      if (token.endsWith("s") || token.endsWith("x")) return token.slice(0, -1);
      return token;
    })
    .join(" ");
}

export const SYSTEM_DISCOVERY_ENTRIES: Readonly<Record<string, SystemDiscoveryEntry>> =
  Object.fromEntries(
    Object.entries(rawDiscoveryPayload.entries).map(([systemSlug, terms]) => [
      systemSlug,
      { systemSlug, terms },
    ]),
  );

export const FUTURE_SYSTEM_CANDIDATES: readonly FutureSystemCandidate[] =
  rawDiscoveryPayload.futureCandidates;

const draftDiscoveryTerms = new Set(
  FUTURE_SYSTEM_CANDIDATES.flatMap((candidate) =>
    candidate.terms.map((term) => normalizeDiscoveryText(term)),
  ),
);

const termKindScore: Record<SystemDiscoveryTermKind, number> = {
  alias: 2,
  specialty: 3,
  problem: 4,
  object: 5,
};

function scoreText(value: string, query: string, baseScore: number): number | null {
  const normalizedValue = normalizeDiscoveryText(value);

  if (!normalizedValue) return null;
  if (normalizedValue === query) return baseScore;
  if (normalizedValue.startsWith(query)) return baseScore + 6;
  if (normalizedValue.includes(query)) return baseScore + 12;

  const queryTokens = query.split(" ").filter(Boolean);
  return queryTokens.every((token) => normalizedValue.includes(token))
    ? baseScore + 18
    : null;
}

export function getPublishedSystemDiscoveryTerms(systemSlug: string): readonly SystemDiscoveryTerm[] {
  return SYSTEM_DISCOVERY_ENTRIES[systemSlug]?.terms ?? [];
}

export function getSystemDiscoveryOptionScore(
  option: Readonly<{
    aliases: readonly string[];
    id: string;
    label: string;
  }>,
  rawQuery: string,
): number | null {
  const query = normalizeDiscoveryText(rawQuery);

  if (!query) return 0;
  if (draftDiscoveryTerms.has(query)) return null;

  const scores = [
    scoreText(option.label, query, 0),
    scoreText(option.id, query, 1),
    ...option.aliases.map((alias) => scoreText(alias, query, 3)),
  ].filter((score): score is number => score !== null);

  return scores.length ? Math.min(...scores) : null;
}

export function getSystemDiscoveryScore(
  system: SystemDiscoverySearchInput,
  rawQuery: string,
): number | null {
  const query = normalizeDiscoveryText(rawQuery);

  if (!query) return 0;
  if (draftDiscoveryTerms.has(query)) return null;

  const scores: number[] = [];
  const pushScore = (score: number | null) => {
    if (score !== null) scores.push(score);
  };

  pushScore(scoreText(system.name, query, 0));
  pushScore(scoreText(system.slug, query, 1));

  getPublishedSystemDiscoveryTerms(system.slug).forEach((term) => {
    pushScore(scoreText(term.value, query, termKindScore[term.kind]));
  });

  system.tags.forEach((tag) => pushScore(scoreText(tag, query, 7)));
  pushScore(scoreText(system.sectorLabel, query, 8));
  if (system.shortDescription) pushScore(scoreText(system.shortDescription, query, 9));
  pushScore(scoreText(system.description, query, 10));

  return scores.length ? Math.min(...scores) : null;
}
