"use client";

import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { exchangeFirebaseIdTokenForSession } from "@/lib/customer-auth-session.client";
import { getAuthUiCopy } from "@/lib/auth-ui-copy";
import {
  hasFirebaseGoogleAuthConfiguration,
  isFirebaseGoogleAuthAllowedOnCurrentHost,
  shouldUseGoogleRedirect,
  signInWithGoogleAndGetIdToken,
} from "@/lib/firebase-client-auth";
import { getReturnToInterfaceLocale } from "@/lib/international-context";
import type { InterfaceLocaleCode } from "@/lib/international-context";
import { buildLocalizedGoogleAuthHref } from "@/lib/localized-auth-path";

const GOOGLE_POPUP_TIMEOUT_MS = 30_000;

class GooglePopupTimeoutError extends Error {
  readonly code = "auth/popup-timeout";

  constructor() {
    super("La fenêtre Google n’a pas répondu.");
    this.name = "GooglePopupTimeoutError";
  }
}

function withGooglePopupTimeout<T>(promise: Promise<T>) {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new GooglePopupTimeoutError()),
      GOOGLE_POPUP_TIMEOUT_MS,
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

function shouldOfferRedirectFallback(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "";
  return code.includes("popup-timeout")
    || code.includes("popup-blocked")
    || code.includes("operation-not-supported-in-this-environment");
}

function getGoogleErrorMessage(error: unknown, localeCode: InterfaceLocaleCode) {
  const copy = getAuthUiCopy(localeCode);
  const code = typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "";

  if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) {
    return null;
  }
  if (code.includes("popup-blocked")) {
    return copy.errors.googlePopupBlocked;
  }
  if (
    code.includes("popup-timeout")
    || code.includes("operation-not-supported-in-this-environment")
  ) {
    return copy.errors.googlePopupTimeout;
  }
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

export default function GoogleCustomerSignInButton({
  large = false,
  onAuthenticated,
  onError,
  returnTo = "/plans",
  localeCode = "fr",
}: {
  large?: boolean;
  onAuthenticated?: (result: { redirectTo: string }) => Promise<void> | void;
  onError?: (message: string | null) => void;
  returnTo?: string;
  localeCode?: InterfaceLocaleCode;
}) {
  const copy = getAuthUiCopy(localeCode);
  const [isLoading, setIsLoading] = useState(false);
  const [preferRedirect, setPreferRedirect] = useState(false);

  if (
    !hasFirebaseGoogleAuthConfiguration()
    || !isFirebaseGoogleAuthAllowedOnCurrentHost()
  ) return null;

  async function signIn() {
    setIsLoading(true);
    onError?.(null);

    try {
      const localeCode = getReturnToInterfaceLocale(returnTo);
      if (shouldUseGoogleRedirect() || preferRedirect) {
        window.location.assign(buildLocalizedGoogleAuthHref({ localeCode, returnTo }));
        return;
      }
      const { idToken } = await withGooglePopupTimeout(
        signInWithGoogleAndGetIdToken(localeCode),
      );
      const result = await exchangeFirebaseIdTokenForSession({ idToken, returnTo });

      if (onAuthenticated) {
        await onAuthenticated(result);
      } else {
        window.location.assign(result.redirectTo);
      }
    } catch (error) {
      if (shouldOfferRedirectFallback(error)) setPreferRedirect(true);
      onError?.(getGoogleErrorMessage(error, localeCode));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void signIn()}
      disabled={isLoading}
      className={`inline-flex w-full items-center justify-center gap-3 rounded-full border border-dema-line bg-white px-5 text-sm font-medium text-brand-blue transition hover:border-dema-forest/30 hover:bg-dema-soft disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2 ${large ? "min-h-[54px]" : "min-h-12"}`}
    >
      {isLoading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <span aria-hidden="true" className="text-base font-semibold text-dema-forest">G</span>
      )}
      {isLoading
        ? copy.google.signingIn
        : copy.google.continue}
    </button>
  );
}
