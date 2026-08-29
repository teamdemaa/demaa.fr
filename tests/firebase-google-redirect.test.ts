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
  },
  browserSessionPersistence: "browser-session",
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: mocks.getAuth,
  getRedirectResult: mocks.getRedirectResult,
  inMemoryPersistence: "memory",
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
  shouldUseGoogleRedirect,
  startGoogleRedirect,
} from "@/lib/firebase-client-auth";

function browser(options: {
  hostname?: string;
  mobile?: boolean;
  standalone?: boolean;
} = {}) {
  const storage = new Map<string, string>();
  const hostname = options.hostname ?? "demaa.fr";
  vi.stubGlobal("window", {
    location: { hostname, origin: `https://${hostname}` },
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

  it("uses redirect on the production domain, mobile, or an installed PWA", () => {
    browser();
    expect(shouldUseGoogleRedirect()).toBe(true);
    browser({ hostname: "preview.demaa.test", mobile: true });
    expect(shouldUseGoogleRedirect()).toBe(true);
    browser({ hostname: "preview.demaa.test", standalone: true });
    expect(shouldUseGoogleRedirect()).toBe(true);
    browser({ hostname: "preview.demaa.test" });
    expect(shouldUseGoogleRedirect()).toBe(false);
  });

  it("proxies Firebase helpers on the app domain without blocking its own iframe", () => {
    const config = readFileSync("next.config.ts", "utf8");
    const contentSecurityPolicy = readFileSync(
      "src/lib/content-security-policy.ts",
      "utf8",
    );
    expect(config).toContain("source: '/__/auth/:path*'");
    expect(config).toContain("destination: `${firebaseAuthHelperOrigin}/__/auth/:path*`");
    expect(config).not.toContain("source: '/__/firebase/init.json'");
    expect(config).toContain("headers: firebaseAuthHelperHeaders");
    expect(config).toContain("value: 'SAMEORIGIN'");
    expect(config).toContain("allowSameOriginFraming: true");
    expect(contentSecurityPolicy).toContain('"frame-src \'self\'');
  });

  it("starts and consumes the redirect only on the dedicated callback", async () => {
    browser({ mobile: true });
    const auth = { languageCode: "" };
    mocks.getAuth.mockReturnValue(auth);
    await startGoogleRedirect("en");

    expect(mocks.setPersistence).toHaveBeenCalledWith(
      expect.anything(),
      "browser-session",
    );
    expect(mocks.signInWithRedirect).toHaveBeenCalledOnce();
    expect(auth.languageCode).toBe("en");

    mocks.getRedirectResult.mockResolvedValue({
      user: { getIdToken: vi.fn().mockResolvedValue("google-id-token") },
    });
    await expect(consumeGoogleRedirectAndGetIdToken("en")).resolves.toEqual({
      idToken: "google-id-token",
    });

    await finishGoogleRedirect("en");
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });

  it("keeps the return destination out of Firebase client persistence", () => {
    const callback = readFileSync(
      "src/app/(auth)/auth/google/GoogleAuthCallbackClient.tsx",
      "utf8",
    );
    const helper = readFileSync("src/lib/firebase-client-auth.ts", "utf8");
    expect(callback).toContain("exchangeFirebaseIdTokenForSession");
    expect(callback).toContain("window.location.replace(session.redirectTo)");
    expect(helper).not.toContain("demaa:google-redirect:v1");
    expect(helper).not.toContain("GOOGLE_LINK_KEY");
    expect(helper).not.toContain("linkWithCredential");
  });

  it("bounds a blocked desktop popup and offers the dedicated redirect on retry", () => {
    const button = readFileSync(
      "src/components/GoogleCustomerSignInButton.tsx",
      "utf8",
    );
    expect(button).toContain("GOOGLE_POPUP_TIMEOUT_MS = 30_000");
    expect(button).toContain("setPreferRedirect(true)");
    expect(button).toContain("shouldUseGoogleRedirect() || preferRedirect");
    expect(button).toContain("window.location.assign(`/auth/google?");
    expect(button).toContain("locale: localeCode");
  });
});
