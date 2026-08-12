import "server-only";

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";

import {
  createFirebaseVercelWorkloadIdentityGoogleAuth,
  createFirebaseVercelWorkloadIdentityCredential,
  hasFirebaseVercelWorkloadIdentityConfiguration,
} from "@/lib/firebase-vercel-oidc-credential.server";

let workloadIdentityFirestore: Firestore | null = null;

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function shouldUseApplicationDefaultCredential() {
  return process.env.FIREBASE_USE_APPLICATION_DEFAULT === "true";
}

export function hasFirebaseAdminConfiguration() {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    || hasFirebaseVercelWorkloadIdentityConfiguration()
    || (
      process.env.FIREBASE_PROJECT_ID
      && process.env.FIREBASE_CLIENT_EMAIL
      && process.env.FIREBASE_PRIVATE_KEY
    )
    || shouldUseApplicationDefaultCredential()
  );
}

function getFirebaseCredential() {
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    return cert(JSON.parse(serviceAccountKey));
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (projectId && clientEmail && privateKey) {
    return cert({
      projectId,
      clientEmail,
      privateKey,
    });
  }

  if (!shouldUseApplicationDefaultCredential()) {
    throw new Error(
      "Firebase admin credentials are not configured. Set explicit FIREBASE_* credentials or FIREBASE_USE_APPLICATION_DEFAULT=true.",
    );
  }

  return applicationDefault();
}

export function getFirebaseAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  return initializeApp({
    credential: hasFirebaseVercelWorkloadIdentityConfiguration()
      ? createFirebaseVercelWorkloadIdentityCredential()
      : getFirebaseCredential(),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export function getAdminFirestore() {
  if (hasFirebaseVercelWorkloadIdentityConfiguration()) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error(
        "FIREBASE_PROJECT_ID is required for Firebase workload identity.",
      );
    }
    if (!workloadIdentityFirestore) {
      workloadIdentityFirestore = new Firestore({
        auth: createFirebaseVercelWorkloadIdentityGoogleAuth(),
        preferRest: true,
        projectId,
      });
    }
    return workloadIdentityFirestore;
  }

  return getFirestore(getFirebaseAdminApp());
}
