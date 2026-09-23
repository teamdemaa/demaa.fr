const DEMAA_FOOTER_PREFIXES = [
  "/academie",
  "/solutions",
  "/specialistes",
  "/annuaire-coachs",
  "/annuaire-experts-comptables",
  "/annuaire-outils",
  "/annuaire-fournisseurs",
  "/annuaire-financement",
  "/annuaire-reseaux-pro",
  "/annuaire-formations",
  "/aides-et-subventions",
  "/modeles",
  "/outils",
  "/organiser",
  "/systemes",
  "/services",
] as const;

export function usesDemaaFooter(pathname: string | null): boolean {
  if (!pathname) return false;
  return DEMAA_FOOTER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
