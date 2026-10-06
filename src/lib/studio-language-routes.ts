const pairs: readonly (readonly [string, string])[] = [
  ["/studio", "/en/studio"], ["/projets", "/en/ventures"],
  ["/studio/opportunites", "/en/studio/build-with-us"], ["/equipe", "/en/team"],
  ["/apprentissages", "/en/insights"],
  ...["jago", "tiimora", "dumaan"].flatMap(project => [
    [`/apprentissages/${project}`, `/en/insights/${project}`] as const,
    ...[["la-genese", "origins"], ["strategie", "strategy"], ["plan-action", "action-plan"]].map(([fr, en]) => [`/apprentissages/${project}/${fr}`, `/en/insights/${project}/${en}`] as const),
  ]),
  ["/apprentissages/demaa/on-construit-un-studio", "/en/insights/demaa/building-a-venture-studio"],
  ["/apprentissages/demaa/pourquoi-demaa", "/en/insights/demaa/why-demaa"],
  ["/apprentissages/demaa/systeme-go-to-market", "/en/insights/demaa/go-to-market-system"],
];
export const STUDIO_LANGUAGE_ROUTES = pairs;
export function studioLanguagePaths(path: string) {
  const pair = pairs.find(([fr, en]) => path === fr || path === en);
  return pair ? { fr: pair[0], en: pair[1] } : undefined;
}
export function isEnglishStudioPath(path: string) {
  return path === "/en" || pairs.some(([, en]) => path === en);
}
