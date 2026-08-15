"use client";

import { useEffect, useId, useState } from "react";
import { KeyRound, LoaderCircle, Mail } from "lucide-react";
import GoogleCustomerSignInButton from "@/components/GoogleCustomerSignInButton";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import {
  createPasswordAccountAndGetIdToken,
  hasFirebaseGoogleAuthConfiguration,
  isFirebaseGoogleAuthAllowedOnCurrentHost,
  requestPasswordReset,
  signInWithPasswordAndGetIdToken,
} from "@/lib/firebase-client-auth";

type AccessMode = "create" | "signin";

export type CustomerSpaceAccessDraft = {
  email: string;
  mode: AccessMode;
  password: string;
};

function getFriendlyAuthError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "";
  if (code.includes("email-already-in-use")) {
    return "Un compte existe déjà avec cette adresse. Choisissez « J’ai déjà un compte ».";
  }
  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return "Adresse e-mail ou mot de passe incorrect.";
  }
  if (code.includes("weak-password") || code.includes("password-does-not-meet-requirements")) {
    return "Ce mot de passe ne respecte pas la politique de sécurité Firebase.";
  }
  if (code.includes("too-many-requests")) {
    return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
  }
  return error instanceof Error ? error.message : "La connexion n’a pas abouti.";
}

export default function CustomerSpaceAccessForm({
  compact = false,
  draft,
  initialMode = "signin",
  onDraftChange,
  onAuthenticated,
  returnTo,
  simple = false,
}: {
  compact?: boolean;
  draft?: CustomerSpaceAccessDraft;
  initialMode?: AccessMode;
  onDraftChange?: (draft: CustomerSpaceAccessDraft) => void;
  onAuthenticated?: (result: { redirectTo: string }) => Promise<void> | void;
  returnTo?: string;
  simple?: boolean;
}) {
  const [internalDraft, setInternalDraft] = useState<CustomerSpaceAccessDraft>({
    email: "",
    mode: initialMode,
    password: "",
  });
  const activeDraft = draft ?? internalDraft;
  const { email, mode, password } = activeDraft;
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const emailId = useId();
  const passwordId = useId();
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    setGoogleEnabled(
      hasFirebaseGoogleAuthConfiguration()
      && isFirebaseGoogleAuthAllowedOnCurrentHost(),
    );
  }, []);

  function updateDraft(update: Partial<CustomerSpaceAccessDraft>) {
    const nextDraft = { ...activeDraft, ...update };
    if (!draft) setInternalDraft(nextDraft);
    onDraftChange?.(nextDraft);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = normalizeEmail(email);

    setError(null);
    setNotice(null);

    if (!isValidEmail(normalizedEmail)) {
      setError("Merci d'indiquer une adresse email valide.");
      return;
    }

    if (!password) {
      setError("Indiquez votre mot de passe.");
      return;
    }

    setIsSending(true);

    try {
      const authResult = mode === "create"
        ? await createPasswordAccountAndGetIdToken(normalizedEmail, password)
        : await signInWithPasswordAndGetIdToken(normalizedEmail, password);
      const response = await fetch("/api/customer-space/firebase-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken: authResult.idToken,
          returnTo,
        }),
      });
      const payload = await response.json().catch(() => null) as {
        error?: string;
        redirectTo?: string;
      } | null;
      if (!response.ok || !payload?.redirectTo) {
        throw new Error(payload?.error || "La connexion n’a pas abouti.");
      }
      if (onAuthenticated) await onAuthenticated({ redirectTo: payload.redirectTo });
      else window.location.assign(payload.redirectTo);
    } catch (submitError) {
      setError(getFriendlyAuthError(submitError));
    } finally {
      setIsSending(false);
    }
  }

  async function handlePasswordReset() {
    const normalizedEmail = normalizeEmail(email);
    setError(null);
    setNotice(null);
    if (!isValidEmail(normalizedEmail)) {
      setError("Indiquez d’abord l’adresse e-mail de votre compte.");
      return;
    }
    setIsSending(true);
    try {
      await requestPasswordReset(normalizedEmail);
      setNotice("Si un compte correspond à cette adresse, les instructions ont été envoyées.");
    } catch (resetError) {
      setError(getFriendlyAuthError(resetError));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className={compact ? "space-y-3" : "mx-auto max-w-md space-y-4"}>
      <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 rounded-full bg-dema-sage/55 p-1 text-xs font-medium">
        <button
          type="button"
          onClick={() => { updateDraft({ mode: "signin" }); setError(null); setNotice(null); }}
          className={`min-h-9 rounded-full px-3 transition ${mode === "signin" ? "bg-dema-paper text-dema-forest shadow-sm" : "text-dema-muted"}`}
        >
          J’ai déjà un compte
        </button>
        <button
          type="button"
          onClick={() => { updateDraft({ mode: "create" }); setError(null); setNotice(null); }}
          className={`min-h-9 rounded-full px-3 transition ${mode === "create" ? "bg-dema-paper text-dema-forest shadow-sm" : "text-dema-muted"}`}
        >
          Créer mon accès
        </button>
      </div>
      <div className="text-left">
        <label className={compact ? "sr-only" : "text-xs font-medium text-brand-blue/70"} htmlFor={emailId}>
          {simple ? "Adresse e-mail" : "Email utilisé pour votre paiement, votre demande ou votre accès"}
        </label>
        <div className={compact ? "relative" : "relative mt-1.5"}>
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/45" />
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(event) => updateDraft({ email: event.target.value })}
            placeholder="vous@entreprise.fr"
            className="w-full rounded-full border border-dema-line bg-dema-paper py-3 pl-10 pr-4 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/35 focus:border-dema-forest/30"
          />
        </div>
      </div>

        <div className="text-left">
          <label className={compact ? "sr-only" : "text-xs font-medium text-brand-blue/70"} htmlFor={passwordId}>
            Mot de passe
          </label>
          <div className={compact ? "relative" : "relative mt-1.5"}>
            <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/45" />
            <input
              id={passwordId}
              type="password"
              autoComplete={mode === "create" ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => updateDraft({ password: event.target.value })}
              placeholder={mode === "create" ? "Choisissez un mot de passe" : "Votre mot de passe"}
              className="w-full rounded-full border border-dema-line bg-dema-paper py-3 pl-10 pr-4 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/35 focus:border-dema-forest/30"
            />
          </div>
          {mode === "signin" ? (
            <button
              type="button"
              onClick={() => void handlePasswordReset()}
              className="mt-2 text-xs text-dema-muted underline decoration-dema-line underline-offset-4 hover:text-dema-forest"
            >
              Mot de passe oublié ?
            </button>
          ) : !compact ? (
            <p className="mt-2 text-xs leading-relaxed text-dema-muted">
              Demaa ne stocke jamais votre mot de passe.
            </p>
          ) : null}
        </div>

      {error ? <p className="text-sm text-dema-forest">{error}</p> : null}
      {notice ? <p className="text-sm text-dema-forest">{notice}</p> : null}

      <button
        type="submit"
        disabled={isSending}
        className="inline-flex w-full items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isSending
          ? "Connexion…"
          : mode === "create" ? "Créer mon accès"
          : "Se connecter"}
      </button>
      </form>
      {googleEnabled ? (
        <>
          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-dema-line" />
            <span className="text-xs text-dema-muted">{compact ? "ou" : "ou continuer avec Google"}</span>
            <span className="h-px flex-1 bg-dema-line" />
          </div>
          <GoogleCustomerSignInButton
            onAuthenticated={onAuthenticated}
            onError={setError}
            returnTo={returnTo}
          />
        </>
      ) : null}
    </div>
  );
}
