"use client";

import { getApps, initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const clientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

export function hasFirebaseGoogleAuthConfiguration() {
  return Object.values(clientConfig).every(Boolean);
}

export async function signInWithGoogleAndGetIdToken() {
  if (!hasFirebaseGoogleAuthConfiguration()) {
    throw new Error("La connexion Google n’est pas configurée.");
  }

  const app = getApps().find((candidate) => candidate.name === "demaa-client-auth")
    ?? initializeApp(clientConfig, "demaa-client-auth");
  const auth = getAuth(app);
  auth.languageCode = "fr";

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return {
    email: result.user.email,
    idToken: await result.user.getIdToken(),
  };
}
