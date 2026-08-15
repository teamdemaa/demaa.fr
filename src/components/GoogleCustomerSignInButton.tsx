"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  hasFirebaseGoogleAuthConfiguration,
  isFirebaseGoogleAuthAllowedOnCurrentHost,
  signInWithGoogleAndGetIdToken,
} from "@/lib/firebase-client-auth";

function getGoogleErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "";

  if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) {
    return null;
  }
  if (code.includes("popup-blocked")) {
    return "Autorisez la fenêtre Google dans votre navigateur, puis réessayez.";
  }
  if (code.includes("unauthorized-domain")) {
    return "La connexion Google n’est pas encore autorisée sur ce domaine.";
  }
  if (code.includes("account-exists-with-different-credential")) {
    return "Cette adresse utilise déjà un mot de passe. Connectez-vous avec celui-ci pour lier Google au même compte.";
  }
  return error instanceof Error
    ? error.message
    : "La connexion Google n’a pas pu aboutir.";
}

export default function GoogleCustomerSignInButton({
  onAuthenticated,
  onError,
  returnTo = "/plans",
}: {
  onAuthenticated?: (result: { redirectTo: string }) => Promise<void> | void;
  onError?: (message: string | null) => void;
  returnTo?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (
    !hasFirebaseGoogleAuthConfiguration()
    || !isFirebaseGoogleAuthAllowedOnCurrentHost()
  ) return null;

  async function signIn() {
    setIsLoading(true);
    onError?.(null);

    try {
      const { idToken } = await signInWithGoogleAndGetIdToken();
      const response = await fetch("/api/customer-space/firebase-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, returnTo }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; redirectTo?: string }
        | null;

      if (!response.ok || !payload?.redirectTo) {
        throw new Error(payload?.error || "La connexion Google n’a pas pu aboutir.");
      }

      if (onAuthenticated) {
        await onAuthenticated({ redirectTo: payload.redirectTo });
      } else {
        router.push(payload.redirectTo);
        router.refresh();
      }
    } catch (error) {
      onError?.(getGoogleErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void signIn()}
      disabled={isLoading}
      className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-dema-line bg-white px-5 text-sm font-medium text-brand-blue transition hover:border-dema-forest/30 hover:bg-dema-soft disabled:cursor-wait disabled:opacity-60"
    >
      {isLoading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <span aria-hidden="true" className="text-base font-semibold text-dema-forest">G</span>
      )}
      {isLoading ? "Connexion…" : "Continuer avec Google"}
    </button>
  );
}
