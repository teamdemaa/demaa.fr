/**
 * The Specialists universe is complete but intentionally unpublished for now.
 * Keep its routes and components in place so it can be reviewed and re-enabled
 * later without rebuilding the catalog.
 */
export const PUBLIC_SPECIALISTS_ENABLED =
  process.env.NEXT_PUBLIC_DEMAA_SPECIALISTS_ENABLED === "true";

/**
 * The leader daily tools rail is intentionally parked outside the public
 * experience. Its component and editorial selection stay available so the
 * section can be re-enabled later without rebuilding it.
 */
export const PUBLIC_LEADER_DAILY_TOOLS_ENABLED =
  process.env.NEXT_PUBLIC_DEMAA_LEADER_DAILY_TOOLS_ENABLED === "true";
