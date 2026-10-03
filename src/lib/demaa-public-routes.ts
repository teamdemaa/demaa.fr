import { Building2, Layers, UsersRound, type LucideIcon } from "lucide-react";

export const DEMAA_DEFAULT_PUBLIC_PATH = "/studio";

export const DEMAA_PUBLIC_NAVIGATION = [
  { view: "studio", label: "Studio", href: "/studio", Icon: Building2 },
  { view: "projets", label: "Projets", href: "/projets", Icon: Layers },
  { view: "opportunites", label: "Opportunités", href: "/studio/opportunites", Icon: UsersRound },
] as const satisfies readonly { view: "studio" | "projets" | "opportunites"; label: string; href: string; Icon: LucideIcon }[];

export const DEMAA_RESOURCE_NAVIGATION = [
  { label: "Solutions par activité", href: "/solutions", description: "Outils, fournisseurs, financements et ressources adaptés à votre métier." },
  { label: "Tutoriels", href: "/tutoriels", description: "Des vidéos et méthodes pour apprendre et mettre en pratique." },
  { label: "Accompagnement", href: "/accompagnement", description: "Un accompagnement pour organiser le travail et structurer votre entreprise." },
] as const;

export const DEMAA_DIRECTORY_NAVIGATION = [
  { label: "Outils & logiciels", href: "/annuaire-outils" },
  { label: "Fournisseurs", href: "/annuaire-fournisseurs" },
  { label: "Financements", href: "/annuaire-financement" },
  { label: "Aides & subventions", href: "/aides-et-subventions" },
  { label: "Réseaux professionnels", href: "/annuaire-reseaux-pro" },
] as const;

export const DEMAA_ARCHIVED_PUBLIC_PATH_PREFIXES = [
  "/a-reprendre", "/transmettre", "/annuaire-", "/modeles", "/outils",
  "/aides-et-subventions", "/contenus", "/organiser", "/services",
  "/session-structurer", "/sur-mesure", "/systemes",
] as const;

export function isArchivedDemaaPublicPath(pathname: string): boolean {
  if (DEMAA_DIRECTORY_NAVIGATION.some(({ href }) => pathname === href || pathname.startsWith(`${href}/`))) return false;
  return DEMAA_ARCHIVED_PUBLIC_PATH_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`) || (prefix.endsWith("-") && pathname.startsWith(prefix)),
  );
}
