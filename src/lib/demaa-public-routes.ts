import { BookOpen, Handshake, Workflow, type LucideIcon } from "lucide-react";

export const DEMAA_DEFAULT_PUBLIC_PATH = "/accompagnement";

export const DEMAA_PUBLIC_NAVIGATION = [
  { view: "accompagnement", label: "Accompagnement", href: "/accompagnement", Icon: Handshake },
  { view: "solutions", label: "Solutions", href: "/solutions", Icon: Workflow },
  { view: "academy", label: "Tutoriels", href: "/tutoriels", Icon: BookOpen },
] as const satisfies readonly {
  view: "accompagnement" | "solutions" | "academy";
  label: string;
  href: string;
  Icon: LucideIcon;
}[];

export const DEMAA_ARCHIVED_PUBLIC_PATH_PREFIXES = [
  "/a-reprendre",
  "/transmettre",
  "/annuaire-",
  "/modeles",
  "/outils",
  "/aides-et-subventions",
  "/contenus",
  "/organiser",
  "/services",
  "/session-structurer",
  "/sur-mesure",
  "/systemes",
] as const;

export function isArchivedDemaaPublicPath(pathname: string): boolean {
  return DEMAA_ARCHIVED_PUBLIC_PATH_PREFIXES.some((prefix) =>
    pathname === prefix
      || pathname.startsWith(`${prefix}/`)
      || (prefix.endsWith("-") && pathname.startsWith(prefix)),
  );
}
