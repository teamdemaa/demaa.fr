// Hidden services retain their stable catalog identity for historical records,
// while every current public surface fails closed through this shared gate.
export const HIDDEN_CANONICAL_SERVICE_SLUGS = [
  "expert-comptable",
] as const;

const hiddenCanonicalServiceSlugs = new Set<string>(
  HIDDEN_CANONICAL_SERVICE_SLUGS,
);

export function isCanonicalServicePublic(slug: string) {
  return !hiddenCanonicalServiceSlugs.has(slug);
}
