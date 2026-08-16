import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-api-key";
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "test-app-id";
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "demaa-test.firebaseapp.com";
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "demaa-test";
});

const mocks = vi.hoisted(() => ({
  getApps: vi.fn(),
  getAuth: vi.fn(),
  getRedirectResult: vi.fn(),
  initializeApp: vi.fn(),
  setPersistence: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("firebase/app", () => ({
  getApps: mocks.getApps,
  initializeApp: mocks.initializeApp,
}));

vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: class {
    setCustomParameters() {}
    static credentialFromError() { return null; }
    static credential() { return {}; }
  },
  browserSessionPersistence: "browser-session",
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: mocks.getAuth,
  getRedirectResult: mocks.getRedirectResult,
  inMemoryPersistence: "memory",
  linkWithCredential: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  setPersistence: mocks.setPersistence,
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: mocks.signInWithRedirect,
  signOut: mocks.signOut,
}));

import {
  consumeGoogleRedirectAndGetIdToken,
  finishGoogleRedirect,
  readPendingGoogleRedirect,
  shouldUseGoogleRedirect,
  startGoogleRedirect,
} from "@/lib/firebase-client-auth";

function browser(options: { mobile?: boolean; standalone?: boolean } = {}) {
  const storage = new Map<string, string>();
  vi.stubGlobal("window", {
    location: { hostname: "demaa.co", origin: "https://demaa.co" },
    matchMedia: (query: string) => ({
      matches: query.includes("display-mode")
        ? Boolean(options.standalone)
        : Boolean(options.mobile),
    }),
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      removeItem: (key: string) => storage.delete(key),
      setItem: (key: string, value: string) => storage.set(key, value),
    },
    navigator: { standalone: options.standalone },
  });
  vi.stubGlobal("navigator", { standalone: options.standalone });
  return storage;
}

describe("Firebase Google redirect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mocks.getApps.mockReturnValue([{ name: "demaa-client-auth" }]);
    mocks.getAuth.mockReturnValue({ languageCode: "" });
    mocks.setPersistence.mockResolvedValue(undefined);
    mocks.signInWithRedirect.mockResolvedValue(undefined);
    mocks.signOut.mockResolvedValue(undefined);
  });

  it("uses redirect in a mobile browser or an installed PWA", () => {
    browser({ mobile: true });
    expect(shouldUseGoogleRedirect()).toBe(true);
    browser({ standalone: true });
    expect(shouldUseGoogleRedirect()).toBe(true);
    browser();
    expect(shouldUseGoogleRedirect()).toBe(false);
  });

  it("proxies Firebase helpers on the app domain without blocking its own iframe", () => {
    const config = readFileSync("next.config.ts", "utf8");
    expect(config).toContain("source: '/__/auth/:path*'");
    expect(config).toContain("destination: `${firebaseAuthHelperOrigin}/__/auth/:path*`");
    expect(config).toContain("headers: firebaseAuthHelperHeaders");
    expect(config).toContain("value: 'SAMEORIGIN'");
    expect(config).toContain("allowSameOriginFraming: true");
  });

  it("preserves the safe application destination through the redirect", async () => {
    browser({ mobile: true });
    await startGoogleRedirect("/?intent=generate-plan");

    expect(mocks.setPersistence).toHaveBeenCalledWith(
      expect.anything(),
      "browser-session",
    );
    expect(mocks.signInWithRedirect).toHaveBeenCalledOnce();
    expect(readPendingGoogleRedirect()).toEqual({
      returnTo: "/?intent=generate-plan",
    });

    mocks.getRedirectResult.mockResolvedValue({
      user: { getIdToken: vi.fn().mockResolvedValue("google-id-token") },
    });
    await expect(consumeGoogleRedirectAndGetIdToken()).resolves.toEqual({
      idToken: "google-id-token",
      returnTo: "/?intent=generate-plan",
    });

    await finishGoogleRedirect();
    expect(readPendingGoogleRedirect()).toBeNull();
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });
});
