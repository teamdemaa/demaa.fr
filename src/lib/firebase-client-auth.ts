"use client";

import { getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  inMemoryPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import {
  type InterfaceLocaleCode,
  getClientInterfaceLocale,
} from "@/lib/international-context";

const configuredClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

function clientConfig() {
  const currentHost = typeof window === "undefined"
    ? null
    : window.location.hostname.toLowerCase();
  return {
    ...configuredClientConfig,
    authDomain: currentHost === "demaa.co"
      ? currentHost
      : configuredClientConfig.authDomain,
  };
}

export function hasFirebaseGoogleAuthConfiguration() {
  return Object.values(configuredClientConfig).every(Boolean);
}

export function isFirebaseGoogleAuthAllowedOnCurrentHost() {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  const configuredHosts = (process.env.NEXT_PUBLIC_FIREBASE_AUTHORIZED_DOMAINS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return hostname === "demaa.co"
    || hostname === "localhost"
    || hostname === "127.0.0.1"
    || configuredHosts.includes(hostname);
}

export function shouldUseGoogleRedirect() {
  if (typeof window === "undefined") return false;
  // The same-origin Firebase helper used on the canonical production domain
  // does not reliably complete the popup message channel in every browser.
  // Redirect authentication uses the same verified handler without leaving a
  // pending popup promise, so prefer it immediately in production.
  if (window.location.hostname.toLowerCase() === "demaa.co") return true;
  const standalone = window.matchMedia("(display-mode: standalone)").matches
    || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return standalone || window.matchMedia("(max-width: 767px)").matches;
}

function getDemaaAuth(localeCode?: InterfaceLocaleCode) {
  if (!hasFirebaseGoogleAuthConfiguration()) {
    throw new Error("La connexion n’est pas configurée.");
  }
  const app = getApps().find((candidate) => candidate.name === "demaa-client-auth")
    ?? initializeApp(clientConfig(), "demaa-client-auth");
  const auth = getAuth(app);
  auth.languageCode = localeCode ?? getClientInterfaceLocale();
  return auth;
}

function googleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

export async function signInWithGoogleAndGetIdToken(
  localeCode?: InterfaceLocaleCode,
) {
  if (!hasFirebaseGoogleAuthConfiguration()) {
    throw new Error("La connexion Google n’est pas configurée.");
  }

  const auth = getDemaaAuth(localeCode);
  await setPersistence(auth, inMemoryPersistence);

  try {
    const result = await signInWithPopup(auth, googleProvider());
    const email = result.user.email;
    const idToken = await result.user.getIdToken();
    return { email, idToken };
  } finally {
    await signOut(auth).catch(() => undefined);
  }
}

export async function startGoogleRedirect(localeCode?: InterfaceLocaleCode) {
  const auth = getDemaaAuth(localeCode);
  await setPersistence(auth, browserSessionPersistence);
  await signInWithRedirect(auth, googleProvider());
}

export async function consumeGoogleRedirectAndGetIdToken(
  localeCode?: InterfaceLocaleCode,
) {
  const auth = getDemaaAuth(localeCode);
  await setPersistence(auth, browserSessionPersistence);
  const result = await getRedirectResult(auth);
  if (!result) return null;
  return { idToken: await result.user.getIdToken() };
}

export async function finishGoogleRedirect(localeCode?: InterfaceLocaleCode) {
  await signOut(getDemaaAuth(localeCode)).catch(() => undefined);
}


export async function createPasswordAccountAndGetIdToken(
  email: string,
  password: string,
  localeCode?: InterfaceLocaleCode,
) {
  const auth = getDemaaAuth(localeCode);
  await setPersistence(auth, inMemoryPersistence);
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    return { email: result.user.email, idToken };
  } finally {
    await signOut(auth).catch(() => undefined);
  }
}

export async function signInWithPasswordAndGetIdToken(
  email: string,
  password: string,
  localeCode?: InterfaceLocaleCode,
) {
  const auth = getDemaaAuth(localeCode);
  await setPersistence(auth, inMemoryPersistence);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken(true);
    return { email: result.user.email, idToken };
  } finally {
    await signOut(auth).catch(() => undefined);
  }
}

export async function requestPasswordReset(
  email: string,
  localeCode?: InterfaceLocaleCode,
  returnTo = "/plans/latest",
  signInPath = "/connexion",
) {
  const auth = getDemaaAuth(localeCode);
  await sendPasswordResetEmail(auth, email, {
    url: `${window.location.origin}${signInPath}?returnTo=${encodeURIComponent(returnTo)}`,
  });
}
