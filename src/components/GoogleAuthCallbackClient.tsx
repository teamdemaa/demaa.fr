"use client";

import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { exchangeFirebaseIdTokenForSession } from "@/lib/customer-auth-session.client";
import { getAuthUiCopy } from "@/lib/auth-ui-copy";
import {
  consumeGoogleRedirectAndGetIdToken,
  finishGoogleRedirect,
  startGoogleRedirect,
} from "@/lib/firebase-client-auth";
import type { InterfaceLocaleCode } from "@/lib/international-context";
import { buildLocalizedConnexionHref } from "@/lib/localized-auth-path";

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
  const copy = getAuthUiCopy(localeCode);
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error(copy.errors.googleCallbackTimeout)),
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
  const copy = getAuthUiCopy(localeCode);
  const code = typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "";
  if (code.includes("unauthorized-domain")) {
    return copy.errors.googleUnauthorizedDomain;
  }
  if (code.includes("account-exists-with-different-credential")) {
    return copy.errors.googleAccountUsesPassword;
  }
  return error instanceof Error
    ? error.message
    : copy.errors.googleIncomplete;
}

export default function GoogleAuthCallbackClient({
  localeCode,
  returnTo,
}: {
  localeCode: InterfaceLocaleCode;
  returnTo: string;
}) {
  const copy = getAuthUiCopy(localeCode);
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
          throw new Error(copy.errors.googleRedirectIncomplete);
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
  }, [copy, localeCode, returnTo]);

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
      <section className="w-full max-w-[430px] rounded-[1.5rem] border border-dema-line bg-white p-7 text-center shadow-[0_24px_70px_rgba(23,35,29,0.12)]">
        {error ? (
          <>
            <h1 className="text-2xl font-medium text-brand-blue">
              {copy.google.interruptedTitle}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-dema-gray">{error}</p>
            <button
              type="button"
              onClick={() => void retry()}
              className="mt-6 inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-white transition hover:bg-dema-forest/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              {copy.google.retry}
            </button>
            <Link
              href={buildLocalizedConnexionHref({ localeCode, returnTo })}
              className="mt-4 inline-flex min-h-10 items-center text-sm text-dema-gray underline-offset-4 hover:underline"
            >
              {copy.access.continueWithEmail}
            </Link>
          </>
        ) : (
          <div role="status" aria-live="polite">
            <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-dema-forest" aria-hidden="true" />
            <h1 className="mt-5 text-2xl font-medium text-brand-blue">
              {copy.google.callbackTitle}
            </h1>
            <p className="mt-3 text-sm text-dema-gray">
              {copy.google.callbackDescription}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
