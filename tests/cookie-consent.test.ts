import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("client-only", () => ({}));

type FakeBrowser = {
  cookies: Map<string, string>;
  localValues: Map<string, string>;
  cookieWrites: string[];
  listeners: Map<string, Set<() => void>>;
  setCookiesEnabled: (enabled: boolean) => void;
  setLocalStorageEnabled: (enabled: boolean) => void;
};

function installFakeBrowser(): FakeBrowser {
  const cookies = new Map<string, string>();
  const localValues = new Map<string, string>();
  const cookieWrites: string[] = [];
  const listeners = new Map<string, Set<() => void>>();
  let cookiesEnabled = true;
  let localStorageEnabled = true;

  const localStorage = {
    getItem(key: string) {
      if (!localStorageEnabled) throw new Error("storage unavailable");
      return localValues.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (!localStorageEnabled) throw new Error("storage unavailable");
      localValues.set(key, value);
    },
    removeItem(key: string) {
      if (!localStorageEnabled) throw new Error("storage unavailable");
      localValues.delete(key);
    },
  };

  const fakeWindow = {
    localStorage,
    location: { protocol: "https:" },
    addEventListener(type: string, listener: () => void) {
      const typeListeners = listeners.get(type) ?? new Set();
      typeListeners.add(listener);
      listeners.set(type, typeListeners);
    },
    removeEventListener(type: string, listener: () => void) {
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent(event: Event) {
      for (const listener of listeners.get(event.type) ?? []) listener();
      return true;
    },
  };

  const fakeDocument = {} as { cookie: string };
  Object.defineProperty(fakeDocument, "cookie", {
    configurable: true,
    get: () => Array.from(cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; "),
    set: (serialized: string) => {
      cookieWrites.push(serialized);
      if (!cookiesEnabled) return;
      const [pair] = serialized.split(";");
      const separator = pair.indexOf("=");
      const name = pair.slice(0, separator);
      const value = pair.slice(separator + 1);
      if (/Max-Age=0(?:;|$)/i.test(serialized)) cookies.delete(name);
      else cookies.set(name, value);
    },
  });

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: fakeWindow,
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: fakeDocument,
  });

  return {
    cookies,
    localValues,
    cookieWrites,
    listeners,
    setCookiesEnabled(enabled) {
      cookiesEnabled = enabled;
    },
    setLocalStorageEnabled(enabled) {
      localStorageEnabled = enabled;
    },
  };
}

async function loadConsentModule() {
  return import("@/lib/cookie-consent");
}

describe("cookie consent persistence", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-16T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(globalThis, "window");
    Reflect.deleteProperty(globalThis, "document");
  });

  it("writes a versioned 180-day choice to localStorage and a functional cookie", async () => {
    const browser = installFakeBrowser();
    const consent = await loadConsentModule();

    const preferences = consent.writeCookieConsentPreferences({
      analytics: true,
      marketing: false,
    });

    expect(preferences).toEqual({
      analytics: true,
      marketing: false,
      decidedAt: "2026-08-16T10:00:00.000Z",
      expiresAt: "2027-02-12T10:00:00.000Z",
      version: 2,
    });
    expect(browser.localValues.get(consent.COOKIE_CONSENT_STORAGE_KEY)).toBe(
      JSON.stringify(preferences),
    );
    expect(browser.cookies.has(consent.COOKIE_CONSENT_COOKIE_NAME)).toBe(true);
    expect(browser.cookieWrites.at(-1)).toContain("Max-Age=15552000");
    expect(browser.cookieWrites.at(-1)).toContain("Path=/; SameSite=Lax; Secure");
  });

  it("migrates a historical local-only choice and restores the cookie", async () => {
    const browser = installFakeBrowser();
    browser.localValues.set("demaa-cookie-consent", "rejected");
    const consent = await loadConsentModule();

    const snapshot = consent.readCookieConsentSnapshot();
    const preferences = consent.parseCookieConsentSnapshot(snapshot);

    expect(preferences).toMatchObject({ analytics: false, marketing: false, version: 2 });
    expect(browser.localValues.get(consent.COOKIE_CONSENT_STORAGE_KEY)).toBe(snapshot);
    expect(browser.cookies.has(consent.COOKIE_CONSENT_COOKIE_NAME)).toBe(true);
  });

  it("restores localStorage from the cookie after a refresh or PWA reopening", async () => {
    const browser = installFakeBrowser();
    let consent = await loadConsentModule();
    consent.writeCookieConsentPreferences({ analytics: true, marketing: false });
    browser.localValues.clear();

    vi.resetModules();
    consent = await loadConsentModule();
    const snapshot = consent.readCookieConsentSnapshot();

    expect(consent.parseCookieConsentSnapshot(snapshot)).toMatchObject({
      analytics: true,
      marketing: false,
    });
    expect(browser.localValues.get(consent.COOKIE_CONSENT_STORAGE_KEY)).toBe(snapshot);
  });

  it("keeps the cookie as fallback when Safari private storage is unavailable", async () => {
    const browser = installFakeBrowser();
    browser.setLocalStorageEnabled(false);
    let consent = await loadConsentModule();
    consent.writeCookieConsentPreferences({ analytics: false, marketing: true });

    vi.resetModules();
    consent = await loadConsentModule();

    expect(consent.getCookieConsentPreferences()).toMatchObject({
      analytics: false,
      marketing: true,
    });
  });

  it("keeps localStorage as fallback when cookies are blocked", async () => {
    const browser = installFakeBrowser();
    browser.setCookiesEnabled(false);
    let consent = await loadConsentModule();
    consent.writeCookieConsentPreferences({ analytics: true, marketing: true });

    vi.resetModules();
    consent = await loadConsentModule();

    expect(consent.getCookieConsentPreferences()).toMatchObject({
      analytics: true,
      marketing: true,
    });
  });

  it("resolves divergent stores with the newest valid preference", async () => {
    const browser = installFakeBrowser();
    const consent = await loadConsentModule();
    const older = JSON.stringify({
      analytics: false,
      marketing: false,
      decidedAt: "2026-08-15T10:00:00.000Z",
      expiresAt: "2027-02-11T10:00:00.000Z",
      version: 2,
    });
    const newer = JSON.stringify({
      analytics: true,
      marketing: false,
      decidedAt: "2026-08-16T09:00:00.000Z",
      expiresAt: "2027-02-12T09:00:00.000Z",
      version: 2,
    });
    browser.localValues.set(consent.COOKIE_CONSENT_STORAGE_KEY, older);
    browser.cookies.set(consent.COOKIE_CONSENT_COOKIE_NAME, encodeURIComponent(newer));

    const snapshot = consent.readCookieConsentSnapshot();

    expect(snapshot).toBe(newer);
    expect(browser.localValues.get(consent.COOKIE_CONSENT_STORAGE_KEY)).toBe(newer);
  });

  it("expires old choices and rejects another consent version", async () => {
    const consent = await loadConsentModule();
    const expired = JSON.stringify({
      analytics: true,
      marketing: true,
      decidedAt: "2026-01-01T00:00:00.000Z",
      expiresAt: "2026-08-16T09:59:59.000Z",
      version: 2,
    });
    const obsolete = JSON.stringify({
      analytics: true,
      marketing: true,
      decidedAt: "2026-08-16T09:00:00.000Z",
      expiresAt: "2027-02-12T09:00:00.000Z",
      version: 1,
    });

    expect(consent.parseCookieConsentSnapshot(expired)).toBeNull();
    expect(consent.parseCookieConsentSnapshot(obsolete)).toBeNull();
  });

  it("clears both persisted stores and listens for PWA lifecycle reconciliation", async () => {
    const browser = installFakeBrowser();
    const consent = await loadConsentModule();
    consent.writeCookieConsentPreferences({ analytics: true, marketing: true });
    const listener = vi.fn();
    const unsubscribe = consent.subscribeToCookieConsent(listener);

    expect(browser.listeners.get("pageshow")?.has(listener)).toBe(true);
    expect(browser.listeners.get("focus")?.has(listener)).toBe(true);

    consent.clearCookieConsentPreferences();
    expect(browser.localValues.has(consent.COOKIE_CONSENT_STORAGE_KEY)).toBe(false);
    expect(browser.cookies.has(consent.COOKIE_CONSENT_COOKIE_NAME)).toBe(false);
    expect(listener).toHaveBeenCalled();

    unsubscribe();
    expect(browser.listeners.get("pageshow")?.has(listener)).toBe(false);
    expect(browser.listeners.get("focus")?.has(listener)).toBe(false);
  });
});
