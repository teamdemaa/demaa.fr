export function usesDemaaFooter(pathname: string | null): boolean {
  return Boolean(pathname?.startsWith("/"));
}
