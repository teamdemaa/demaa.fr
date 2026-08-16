import "client-only";

import {
  safeReadBrowserStorage,
  safeRemoveBrowserStorage,
  safeWriteBrowserStorage,
} from "@/lib/browser-storage";

export type CookieConsentPreferences = {
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
  expiresAt: string;
  version: 2;
};

export const COOKIE_CONSENT_STORAGE_KEY = "demaa-cookie-consent";
export const COOKIE_CONSENT_COOKIE_NAME = "demaa_cookie_consent";
export const COOKIE_CONSENT_VERSION = 2 as const;

const COOKIE_CONSENT_EVENT = "demaa-cookie-consent-change";
const CONSENT_LIFETIME_SECONDS = 180 * 24 * 60 * 60;
const CONSENT_LIFETIME_MS = CONSENT_LIFETIME_SECONDS * 1000;
let memoryConsentSnapshot: string | null = null;

function buildPreferences(
  analytics: boolean,
  marketing: boolean,
  now = Date.now(),
): CookieConsentPreferences {
  return {
    analytics,
    marketing,
    decidedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + CONSENT_LIFETIME_MS).toISOString(),
    version: COOKIE_CONSENT_VERSION,
  };
}

function parseStoredConsent(
  snapshot: string | null,
  now = Date.now(),
): CookieConsentPreferences | null {
  if (!snapshot) return null;

  // Migration des anciennes valeurs enregistrées uniquement dans localStorage.
  if (snapshot === "accepted") return buildPreferences(true, true, now);
  if (snapshot === "rejected") return buildPreferences(false, false, now);

  try {
    const value = JSON.parse(snapshot) as Partial<CookieConsentPreferences>;
    const decidedAt = Date.parse(value.decidedAt ?? "");
    const expiresAt = Date.parse(value.expiresAt ?? "");

    if (
      value.version !== COOKIE_CONSENT_VERSION ||
      typeof value.analytics !== "boolean" ||
      typeof value.marketing !== "boolean" ||
      !Number.isFinite(decidedAt) ||
      !Number.isFinite(expiresAt) ||
      decidedAt > now + 5 * 60 * 1000 ||
      expiresAt <= decidedAt ||
      expiresAt > decidedAt + CONSENT_LIFETIME_MS + 5 * 60 * 1000 ||
      expiresAt <= now
    ) {
      return null;
    }

    return {
      analytics: value.analytics,
      marketing: value.marketing,
      decidedAt: new Date(decidedAt).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      version: COOKIE_CONSENT_VERSION,
    };
  } catch {
    return null;
  }
}

export function parseCookieConsentSnapshot(
  snapshot: string | null,
  now = Date.now(),
): CookieConsentPreferences | null {
  return parseStoredConsent(snapshot, now);
}

export function resolveCookieConsentSnapshot(
  snapshots: Array<string | null>,
  now = Date.now(),
) {
  const preferences = snapshots
    .map((snapshot) => parseStoredConsent(snapshot, now))
    .filter((value): value is CookieConsentPreferences => value !== null)
    .sort((left, right) => Date.parse(right.decidedAt) - Date.parse(left.decidedAt))[0];

  return preferences ? JSON.stringify(preferences) : null;
}

function readConsentCookie() {
  if (typeof document === "undefined") return null;

  let rawValue: string | undefined;
  try {
    const prefix = `${COOKIE_CONSENT_COOKIE_NAME}=`;
    rawValue = document.cookie
      .split(";")
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(prefix))
      ?.slice(prefix.length);
  } catch {
    return null;
  }

  if (!rawValue) return null;

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return null;
  }
}

function writeConsentCookie(snapshot: string, preferences: CookieConsentPreferences) {
  if (typeof document === "undefined") return;

  const remainingSeconds = Math.max(
    0,
    Math.ceil((Date.parse(preferences.expiresAt) - Date.now()) / 1000),
  );
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  try {
    document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(snapshot)}; Max-Age=${remainingSeconds}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // localStorage and the in-memory snapshot remain available.
  }
}

function removeConsentCookie() {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  try {
    document.cookie = `${COOKIE_CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax${secure}`;
  } catch {
    // The browser may prohibit cookie access in a restricted context.
  }
}

function synchronizeConsentStores(snapshot: string) {
  const preferences = parseStoredConsent(snapshot);
  if (!preferences || typeof window === "undefined") return;

  memoryConsentSnapshot = snapshot;
  safeWriteBrowserStorage(
    () => window.localStorage,
    COOKIE_CONSENT_STORAGE_KEY,
    snapshot,
  );
  writeConsentCookie(snapshot, preferences);
}

export function readCookieConsentSnapshot() {
  if (typeof window === "undefined") return null;

  const localSnapshot = safeReadBrowserStorage(
    () => window.localStorage,
    COOKIE_CONSENT_STORAGE_KEY,
  );
  const cookieSnapshot = readConsentCookie();
  const resolvedSnapshot = resolveCookieConsentSnapshot([
    localSnapshot,
    cookieSnapshot,
    memoryConsentSnapshot,
  ]);

  if (resolvedSnapshot) {
    if (
      resolvedSnapshot !== localSnapshot ||
      resolvedSnapshot !== cookieSnapshot ||
      resolvedSnapshot !== memoryConsentSnapshot
    ) {
      synchronizeConsentStores(resolvedSnapshot);
    }
    return resolvedSnapshot;
  }

  memoryConsentSnapshot = null;
  if (localSnapshot) {
    safeRemoveBrowserStorage(() => window.localStorage, COOKIE_CONSENT_STORAGE_KEY);
  }
  if (cookieSnapshot) removeConsentCookie();
  return null;
}

export function getCookieConsentPreferences() {
  return parseCookieConsentSnapshot(readCookieConsentSnapshot());
}

export function writeCookieConsentPreferences(input: {
  analytics: boolean;
  marketing: boolean;
}) {
  const preferences = buildPreferences(input.analytics, input.marketing);
  const snapshot = JSON.stringify(preferences);
  synchronizeConsentStores(snapshot);
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
  return preferences;
}

export function clearCookieConsentPreferences() {
  memoryConsentSnapshot = null;
  safeRemoveBrowserStorage(() => window.localStorage, COOKIE_CONSENT_STORAGE_KEY);
  removeConsentCookie();
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
}

export function subscribeToCookieConsent(onStoreChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("pageshow", onStoreChange);
  window.addEventListener("focus", onStoreChange);

  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("pageshow", onStoreChange);
    window.removeEventListener("focus", onStoreChange);
  };
}
