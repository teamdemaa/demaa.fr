"use client";

import { getApps, initializeApp, type FirebaseError } from "firebase/app";
import {
  type AuthCredential,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  linkWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

let pendingGoogleLink: { credential: AuthCredential; email: string } | null = null;

const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

export function hasFirebaseGoogleAuthConfiguration() {
  return Object.values(clientConfig).every(Boolean);
}

export function isFirebaseGoogleAuthAllowedOnCurrentHost() {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  return hostname === "demaa.co"
    || hostname === "localhost"
    || hostname === "127.0.0.1"
    || hostname.endsWith(".vercel.app");
}

function getDemaaAuth() {
  if (!hasFirebaseGoogleAuthConfiguration()) {
    throw new Error("La connexion n’est pas configurée.");
  }
  const app = getApps().find((candidate) => candidate.name === "demaa-client-auth")
    ?? initializeApp(clientConfig, "demaa-client-auth");
  const auth = getAuth(app);
  auth.languageCode = "fr";
  return auth;
}

export async function signInWithGoogleAndGetIdToken() {
  if (!hasFirebaseGoogleAuthConfiguration()) {
    throw new Error("La connexion Google n’est pas configurée.");
  }

  const auth = getDemaaAuth();
  await setPersistence(auth, inMemoryPersistence);

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email;
    const idToken = await result.user.getIdToken();
    return { email, idToken };
  } catch (error) {
    const firebaseError = error as FirebaseError;
    const email = typeof firebaseError.customData?.email === "string"
      ? firebaseError.customData.email.trim().toLowerCase()
      : "";
    const credential = GoogleAuthProvider.credentialFromError(firebaseError);
    if (
      firebaseError.code === "auth/account-exists-with-different-credential"
      && email
      && credential
    ) {
      pendingGoogleLink = { credential, email };
    }
    throw error;
  } finally {
    await signOut(auth).catch(() => undefined);
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
    const pendingLink = pendingGoogleLink;
    pendingGoogleLink = null;
    if (pendingLink?.email === email.trim().toLowerCase()) {
      user = (await linkWithCredential(user, pendingLink.credential)).user;
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
