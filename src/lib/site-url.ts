export const DEFAULT_SITE_URL = "https://demaa.co";
export const LEGACY_SITE_ORIGINS = [
  "https://demaa.fr",
  "https://www.demaa.fr",
] as const;

const LEGACY_SITE_HOSTS = new Set(
  LEGACY_SITE_ORIGINS.map((origin) => new URL(origin).host),
);

function normalizeSiteUrl(value: string) {
  return value.replace(/\/$/, "");
}

function parseSiteUrl(value: string) {
  try {
    return new URL(normalizeSiteUrl(value));
  } catch {
    return null;
  }
}

export function getCanonicalSiteUrl() {
  const configuredUrl =
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    DEFAULT_SITE_URL;

  const parsedUrl = parseSiteUrl(configuredUrl);

  if (!parsedUrl || LEGACY_SITE_HOSTS.has(parsedUrl.host.toLowerCase())) {
    return DEFAULT_SITE_URL;
  }

  return normalizeSiteUrl(parsedUrl.toString());
}

export function getCanonicalOrigin() {
  return new URL(getCanonicalSiteUrl()).origin;
}

function getCanonicalHost() {
  return new URL(getCanonicalSiteUrl()).host.toLowerCase();
}

export function isVercelPreviewHost(host: string) {
  if (process.env.VERCEL_ENV !== "preview") {
    return false;
  }

  const normalizedHost = host.trim().toLowerCase();
  const previewHosts = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
    .map((value) => value?.trim().toLowerCase())
    .filter(Boolean);

  return previewHosts.includes(normalizedHost);
}

export function getCanonicalBaseUrl(request?: Request) {
  if (process.env.NODE_ENV === "production" || !request) {
    return getCanonicalOrigin();
  }

  const requestOrigin = parseSiteUrl(new URL(request.url).origin);

  if (!requestOrigin) {
    return getCanonicalOrigin();
  }

  const host = requestOrigin.host.toLowerCase();
  const isLocalHost =
    host.startsWith("localhost:") ||
    host.startsWith("127.0.0.1:") ||
    host === "localhost" ||
    host === "127.0.0.1";

  return isLocalHost ? requestOrigin.origin : getCanonicalOrigin();
}

export function isAllowedRequestHost(request: Request) {
  const requestUrl = new URL(request.url);
  const host = requestUrl.host.toLowerCase();
  const canonicalHost = getCanonicalHost();

  if (host === canonicalHost || LEGACY_SITE_HOSTS.has(host)) {
    return true;
  }

  if (isVercelPreviewHost(host)) {
    return true;
  }

  if (process.env.NODE_ENV !== "production") {
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("localhost:") ||
      host.startsWith("127.0.0.1:")
    );
  }

  return false;
}

export function isAllowedRequestOrigin(request: Request, origin: string) {
  let originUrl: URL;
  let requestUrl: URL;

  try {
    originUrl = new URL(origin);
    requestUrl = new URL(request.url);
  } catch {
    return false;
  }

  if (!isAllowedRequestHost(request)) {
    return false;
  }

  if (originUrl.origin === requestUrl.origin) {
    return true;
  }

  if (process.env.NODE_ENV !== "production") {
    const localHostnames = new Set(["localhost", "127.0.0.1"]);
    const isEquivalentLocalOrigin =
      localHostnames.has(originUrl.hostname.toLowerCase()) &&
      localHostnames.has(requestUrl.hostname.toLowerCase()) &&
      originUrl.protocol === requestUrl.protocol &&
      originUrl.port === requestUrl.port;

    if (isEquivalentLocalOrigin) {
      return true;
    }
  }

  const trustedProductionOrigins = new Set([
    getCanonicalOrigin(),
    ...LEGACY_SITE_ORIGINS,
  ]);

  return (
    trustedProductionOrigins.has(originUrl.origin) &&
    trustedProductionOrigins.has(requestUrl.origin)
  );
}
