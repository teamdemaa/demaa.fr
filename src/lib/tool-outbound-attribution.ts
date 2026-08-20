export const TOOL_OUTBOUND_CAMPAIGN = "solutions";

export const TOOL_OUTBOUND_SURFACES = [
  "action_recommendation",
  "pricing",
  "solutions",
  "system_recap",
  "tool_detail",
  "tool_directory",
] as const;

export type ToolOutboundSurface = (typeof TOOL_OUTBOUND_SURFACES)[number];

const TOOL_SOLUTION_RESOURCE_TYPES = new Set(["software", "tool"]);
const DEMAA_HOSTS = ["demaa.co", "demaa.fr"] as const;

function isDemaaHost(hostname: string) {
  const normalizedHostname = hostname.toLowerCase().replace(/\.$/, "");
  return DEMAA_HOSTS.some(
    (host) => normalizedHostname === host || normalizedHostname.endsWith(`.${host}`),
  );
}

export function isToolSolutionResourceType(resourceType: string) {
  return TOOL_SOLUTION_RESOURCE_TYPES.has(resourceType);
}

export function buildToolOutboundUrl(rawUrl: string) {
  const candidate = rawUrl.trim();
  if (!candidate) return null;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }

  if (
    (url.protocol !== "https:" && url.protocol !== "http:")
    || url.username
    || url.password
    || isDemaaHost(url.hostname)
  ) {
    return null;
  }

  url.searchParams.set("utm_source", "demaa");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", TOOL_OUTBOUND_CAMPAIGN);

  return url.toString();
}
