"use client";

import { getApps, initializeApp, type FirebaseError } from "firebase/app";
import {
  type AuthCredential,
  GoogleAuthProvider,
  type OAuthCredential,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  inMemoryPersistence,
  linkWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

let pendingGoogleLink: { credential: AuthCredential; email: string } | null = null;
const GOOGLE_REDIRECT_KEY = "demaa:google-redirect:v1";
const GOOGLE_LINK_KEY = "demaa:google-link:v1";
const GOOGLE_STATE_TTL_MS = 20 * 60 * 1_000;

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
  const standalone = window.matchMedia("(display-mode: standalone)").matches
    || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  return standalone || window.matchMedia("(max-width: 767px)").matches;
}

function getDemaaAuth() {
  if (!hasFirebaseGoogleAuthConfiguration()) {
    throw new Error("La connexion n’est pas configurée.");
  }
  const app = getApps().find((candidate) => candidate.name === "demaa-client-auth")
    ?? initializeApp(clientConfig(), "demaa-client-auth");
  const auth = getAuth(app);
  auth.languageCode = "fr";
  return auth;
}

function googleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}

function rememberPendingGoogleLink(error: FirebaseError) {
  const email = typeof error.customData?.email === "string"
    ? error.customData.email.trim().toLowerCase()
    : "";
  const credential = GoogleAuthProvider.credentialFromError(error);
  if (error.code !== "auth/account-exists-with-different-credential" || !email || !credential) {
    return;
  }
  pendingGoogleLink = { credential, email };
  const oauth = credential as OAuthCredential;
  try {
    window.sessionStorage.setItem(GOOGLE_LINK_KEY, JSON.stringify({
      accessToken: oauth.accessToken ?? null,
      createdAt: new Date().toISOString(),
      email,
      idToken: oauth.idToken ?? null,
    }));
  } catch {
    // Linking still works without a reload through the in-memory credential.
  }
}

function readPendingGoogleLink(email: string) {
  if (pendingGoogleLink?.email === email) {
    const value = pendingGoogleLink;
    pendingGoogleLink = null;
    return value.credential;
  }
  try {
    const raw = window.sessionStorage.getItem(GOOGLE_LINK_KEY);
    window.sessionStorage.removeItem(GOOGLE_LINK_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as {
      accessToken?: string | null;
      createdAt?: string;
      email?: string;
      idToken?: string | null;
    };
    const createdAt = Date.parse(value.createdAt ?? "");
    if (
      value.email !== email
      || !Number.isFinite(createdAt)
      || Date.now() - createdAt > GOOGLE_STATE_TTL_MS
    ) return null;
    return GoogleAuthProvider.credential(
      value.idToken ?? null,
      value.accessToken ?? null,
    );
  } catch {
    return null;
  }
}

export async function signInWithGoogleAndGetIdToken() {
  if (!hasFirebaseGoogleAuthConfiguration()) {
    throw new Error("La connexion Google n’est pas configurée.");
  }

  const auth = getDemaaAuth();
  await setPersistence(auth, inMemoryPersistence);

  try {
    const result = await signInWithPopup(auth, googleProvider());
    const email = result.user.email;
    const idToken = await result.user.getIdToken();
    return { email, idToken };
  } catch (error) {
    rememberPendingGoogleLink(error as FirebaseError);
    throw error;
  } finally {
    await signOut(auth).catch(() => undefined);
  }
}

export async function startGoogleRedirect(returnTo: string) {
  const auth = getDemaaAuth();
  await setPersistence(auth, browserSessionPersistence);
  window.sessionStorage.setItem(GOOGLE_REDIRECT_KEY, JSON.stringify({
    createdAt: new Date().toISOString(),
    returnTo,
  }));
  await signInWithRedirect(auth, googleProvider());
}

export function readPendingGoogleRedirect() {
  try {
    const raw = window.sessionStorage.getItem(GOOGLE_REDIRECT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as { createdAt?: string; returnTo?: string };
    const createdAt = Date.parse(value.createdAt ?? "");
    if (
      !Number.isFinite(createdAt)
      || Date.now() - createdAt > GOOGLE_STATE_TTL_MS
      || typeof value.returnTo !== "string"
    ) {
      window.sessionStorage.removeItem(GOOGLE_REDIRECT_KEY);
      return null;
    }
    return { returnTo: value.returnTo };
  } catch {
    return null;
  }
}

export async function consumeGoogleRedirectAndGetIdToken() {
  const pending = readPendingGoogleRedirect();
  if (!pending) return null;
  const auth = getDemaaAuth();
  await setPersistence(auth, browserSessionPersistence);
  try {
    const result = await getRedirectResult(auth);
    if (!result) return null;
    return {
      idToken: await result.user.getIdToken(),
      returnTo: pending.returnTo,
    };
  } catch (error) {
    rememberPendingGoogleLink(error as FirebaseError);
    throw error;
  }
}

export async function finishGoogleRedirect() {
  try {
    window.sessionStorage.removeItem(GOOGLE_REDIRECT_KEY);
  } finally {
    await signOut(getDemaaAuth()).catch(() => undefined);
  }
}


export async function createPasswordAccountAndGetIdToken(
  email: string,
  password: string,
) {
  const auth = getDemaaAuth();
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
) {
  const auth = getDemaaAuth();
  await setPersistence(auth, inMemoryPersistence);
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    let user = result.user;
    const normalizedEmail = email.trim().toLowerCase();
    const pendingLink = readPendingGoogleLink(normalizedEmail);
    if (pendingLink) {
      user = (await linkWithCredential(user, pendingLink)).user;
    }
    const idToken = await user.getIdToken(true);
    return { email: user.email, idToken };
  } finally {
    await signOut(auth).catch(() => undefined);
  }
}

export async function requestPasswordReset(email: string) {
  const auth = getDemaaAuth();
  await sendPasswordResetEmail(auth, email, {
    url: `${window.location.origin}/connexion`,
  });
}
