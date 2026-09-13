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

/**
 * The compact process overview remains available in the process document but
 * is intentionally hidden from the public screen experience. The detailed
 * process guides stay visible and the overview can be restored independently.
 */
export const PUBLIC_SYSTEM_PROCESS_OVERVIEW_ENABLED =
  process.env.NEXT_PUBLIC_DEMAA_SYSTEM_PROCESS_OVERVIEW_ENABLED === "true";
