import "client-only";

export type CookieConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
  expiresAt: string;
  version: 2;
};

export const COOKIE_CONSENT_STORAGE_KEY = "demaa-cookie-consent";
export const COOKIE_CONSENT_EVENT = "demaa-cookie-consent-change";

const CONSENT_LIFETIME_MS = 180 * 24 * 60 * 60 * 1000;

function buildPreferences(analytics: boolean, marketing: boolean): CookieConsentPreferences {
  const now = new Date();

  return {
    analytics,
    marketing,
    decidedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CONSENT_LIFETIME_MS).toISOString(),
    version: 2,
  };
}

export function parseCookieConsentSnapshot(
  snapshot: string | null,
): CookieConsentPreferences | null {
  if (!snapshot) return null;

  if (snapshot === "accepted") return buildPreferences(true, true);
  if (snapshot === "rejected") return buildPreferences(false, false);

  try {
    const value = JSON.parse(snapshot) as Partial<CookieConsentPreferences>;
    if (
      value.version !== 2 ||
      typeof value.analytics !== "boolean" ||
      typeof value.marketing !== "boolean" ||
      typeof value.decidedAt !== "string" ||
      typeof value.expiresAt !== "string"
    ) {
      return null;
    }

    if (!Number.isFinite(Date.parse(value.expiresAt)) || Date.parse(value.expiresAt) <= Date.now()) {
      return null;
    }

    return value as CookieConsentPreferences;
  } catch {
    return null;
  }
}

export function readCookieConsentSnapshot() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
}

export function getCookieConsentPreferences() {
  return parseCookieConsentSnapshot(readCookieConsentSnapshot());
}

export function writeCookieConsentPreferences(input: {
  analytics: boolean;
  marketing: boolean;
}) {
  const preferences = buildPreferences(input.analytics, input.marketing);
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
  return preferences;
}

export function clearCookieConsentPreferences() {
  window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

export function subscribeToCookieConsent(onStoreChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}
