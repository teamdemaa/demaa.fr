const ADMIN_RETURN_PATHS = new Set([
  "/admin",
  "/admin/coaching",
  "/admin/demandes",
  "/admin/opportunites",
  "/admin/outils",
]);

export const DEFAULT_ADMIN_RETURN_TO = "/admin/demandes";

export function getSafeAdminReturnTo(value?: string | null) {
  if (!value) return DEFAULT_ADMIN_RETURN_TO;
  return ADMIN_RETURN_PATHS.has(value) ? value : DEFAULT_ADMIN_RETURN_TO;
}
