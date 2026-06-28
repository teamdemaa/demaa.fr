const DEFAULT_SITE_URL = "https://demaa.fr";

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

  return parsedUrl ? parsedUrl.toString() : DEFAULT_SITE_URL;
}

export function getCanonicalOrigin() {
  return new URL(getCanonicalSiteUrl()).origin;
}

export function getCanonicalHost() {
  return new URL(getCanonicalSiteUrl()).host.toLowerCase();
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

  if (host === canonicalHost) {
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
