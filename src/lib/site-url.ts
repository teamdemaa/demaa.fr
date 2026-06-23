import "server-only";

const PRODUCTION_SITE_URL = "https://demaa.fr";

export function getCanonicalSiteUrl() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

  if (fromEnv && !fromEnv.includes("vercel.app")) {
    return fromEnv;
  }

  return PRODUCTION_SITE_URL;
}
