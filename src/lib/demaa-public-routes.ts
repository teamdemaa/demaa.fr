export const DEMAA_DEFAULT_PUBLIC_PATH = "/studio";

export const DEMAA_PUBLIC_NAVIGATION = [
  { view: "studio", label: "Studio", href: "/studio" },
  { view: "projets", label: "Projets", href: "/projets" },
  { view: "academy", label: "Apprentissages", href: "/tutoriels" },
] as const;

export const DEMAA_RESOURCE_NAVIGATION = [
  { label: "Apprentissages", href: "/tutoriels", description: "Les apprentissages de nos projets, épisode après épisode." },
] as const;

export const DEMAA_DIRECTORY_NAVIGATION = [
  { label: "Outils & logiciels", href: "/annuaire-outils" },
  { label: "Fournisseurs", href: "/annuaire-fournisseurs" },
  { label: "Financements", href: "/annuaire-financement" },
  { label: "Aides & subventions", href: "/aides-et-subventions" },
  { label: "Réseaux professionnels", href: "/annuaire-reseaux-pro" },
] as const;

export const DEMAA_ARCHIVED_PUBLIC_PATH_PREFIXES = [
  "/a-reprendre", "/transmettre", "/annuaire-", "/outils",
  "/aides-et-subventions", "/contenus", "/organiser", "/services",
  "/session-structurer", "/sur-mesure", "/systemes",
] as const;

export function isArchivedDemaaPublicPath(pathname: string): boolean {
  return DEMAA_ARCHIVED_PUBLIC_PATH_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`) || (prefix.endsWith("-") && pathname.startsWith(prefix)),
  );
}
