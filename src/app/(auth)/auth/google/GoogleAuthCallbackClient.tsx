"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { exchangeFirebaseIdTokenForSession } from "@/lib/customer-auth-session.client";
import {
  consumeGoogleRedirectAndGetIdToken,
  finishGoogleRedirect,
  startGoogleRedirect,
} from "@/lib/firebase-client-auth";
import type { InterfaceLocaleCode } from "@/lib/international-context";

const GOOGLE_CALLBACK_MARKER = "demaa:google-callback:v2";
const GOOGLE_CALLBACK_TTL_MS = 10 * 60 * 1_000;

type Marker = { returnTo: string; startedAt: number };

function readMarker(): Marker | null {
  try {
    const raw = window.sessionStorage.getItem(GOOGLE_CALLBACK_MARKER);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Marker>;
    if (
      typeof value.returnTo !== "string"
      || typeof value.startedAt !== "number"
      || Date.now() - value.startedAt > GOOGLE_CALLBACK_TTL_MS
    ) {
      window.sessionStorage.removeItem(GOOGLE_CALLBACK_MARKER);
      return null;
    }
    return value as Marker;
  } catch {
    return null;
  }
}

function clearMarker() {
  try {
    window.sessionStorage.removeItem(GOOGLE_CALLBACK_MARKER);
  } catch {
    // The callback also works without sessionStorage once Firebase returns.
  }
}

function writeMarker(returnTo: string) {
  try {
    window.sessionStorage.setItem(
      GOOGLE_CALLBACK_MARKER,
      JSON.stringify({ returnTo, startedAt: Date.now() } satisfies Marker),
    );
  } catch {
    // Firebase remains the source of truth for the OAuth result.
  }
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  localeCode: InterfaceLocaleCode,
) {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error(localeCode === "en"
        ? "Google sign-in is taking too long. Try again."
        : "La connexion Google prend trop de temps. Réessayez.")),
      timeoutMs,
    );
    promise.then(
      (value) => {
        window.clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function friendlyGoogleError(error: unknown, localeCode: InterfaceLocaleCode) {
  const code = typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "";
  if (code.includes("unauthorized-domain")) {
    return localeCode === "en"
      ? "Google is not authorised on this domain."
      : "Google n’est pas autorisé sur ce domaine.";
  }
  if (code.includes("account-exists-with-different-credential")) {
    return localeCode === "en"
      ? "This address already uses a password. Sign in with your email."
      : "Cette adresse utilise déjà un mot de passe. Connectez-vous avec votre e-mail.";
  }
  return error instanceof Error
    ? error.message
    : localeCode === "en"
      ? "Google sign-in could not be completed."
      : "La connexion Google n’a pas pu aboutir.";
}

export default function GoogleAuthCallbackClient({
  localeCode,
  returnTo,
}: {
  localeCode: InterfaceLocaleCode;
  returnTo: string;
}) {
  const hasRun = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    void (async () => {
      try {
        const result = await withTimeout(
          consumeGoogleRedirectAndGetIdToken(localeCode),
          15_000,
          localeCode,
        );
        if (result) {
          const session = await withTimeout(
            exchangeFirebaseIdTokenForSession({
              idToken: result.idToken,
              returnTo,
            }),
            15_000,
            localeCode,
          );
          clearMarker();
          await finishGoogleRedirect(localeCode);
          window.location.replace(session.redirectTo);
          return;
        }

        const marker = readMarker();
        if (marker?.returnTo === returnTo) {
          clearMarker();
          throw new Error(localeCode === "en"
            ? "Google sign-in was not completed. Try again."
            : "La connexion Google n’a pas été finalisée. Réessayez.");
        }

        writeMarker(returnTo);
        await startGoogleRedirect(localeCode);
      } catch (callbackError) {
        clearMarker();
        await finishGoogleRedirect(localeCode).catch(() => undefined);
        console.error(
          "[google-auth-callback] flow failed",
          callbackError instanceof Error ? callbackError.message : "Unknown error",
        );
        setError(friendlyGoogleError(callbackError, localeCode));
      }
    })();
  }, [localeCode, returnTo]);

  async function retry() {
    setError(null);
    writeMarker(returnTo);
    try {
      await startGoogleRedirect(localeCode);
    } catch (retryError) {
      clearMarker();
      setError(friendlyGoogleError(retryError, localeCode));
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-dema-cream px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))]">
      <section className="demaa-dialog-shadow w-full max-w-[430px] rounded-[1.5rem] border border-dema-line bg-white p-7 text-center">
        {error ? (
          <>
            <h1 className="text-2xl font-medium text-brand-blue">
              {localeCode === "en" ? "Sign-in interrupted" : "Connexion interrompue"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-dema-gray">{error}</p>
            <button
              type="button"
              onClick={() => void retry()}
              className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-white transition hover:bg-dema-forest/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              {localeCode === "en" ? "Try again with Google" : "Réessayer avec Google"}
            </button>
            <Link
              href={`/connexion?returnTo=${encodeURIComponent(returnTo)}`}
              className="mt-4 inline-flex min-h-10 items-center text-sm text-dema-gray underline-offset-4 hover:underline"
            >
              {localeCode === "en" ? "Continue with my email" : "Continuer avec mon e-mail"}
            </Link>
          </>
        ) : (
          <div role="status" aria-live="polite">
            <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-dema-forest" aria-hidden="true" />
            <h1 className="mt-5 text-2xl font-medium text-brand-blue">
              {localeCode === "en" ? "Signing in with Google" : "Connexion avec Google"}
            </h1>
            <p className="mt-3 text-sm text-dema-gray">
              {localeCode === "en" ? "Finishing your sign-in…" : "Finalisation de votre accès…"}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
