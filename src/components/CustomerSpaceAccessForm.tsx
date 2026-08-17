"use client";

import { useEffect, useId, useState } from "react";
import { ArrowLeft, KeyRound, LoaderCircle, Mail } from "lucide-react";
import GoogleCustomerSignInButton from "@/components/GoogleCustomerSignInButton";
import { exchangeFirebaseIdTokenForSession } from "@/lib/customer-auth-session.client";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import {
  createPasswordAccountAndGetIdToken,
  hasFirebaseGoogleAuthConfiguration,
  isFirebaseGoogleAuthAllowedOnCurrentHost,
  requestPasswordReset,
  signInWithPasswordAndGetIdToken,
} from "@/lib/firebase-client-auth";
import {
  getReturnToInterfaceLocale,
  type InterfaceLocaleCode,
} from "@/lib/international-context";

type AccessMode = "create" | "signin";
type ProgressiveAccessStep = "choice" | "email" | "password";

export type CustomerSpaceAccessDraft = {
  email: string;
  mode: AccessMode;
  password: string;
};

function getFriendlyAuthError(error: unknown, localeCode: InterfaceLocaleCode) {
  const code = typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "";
  if (code.includes("email-already-in-use")) {
    return localeCode === "en"
      ? "An account already exists for this address. Sign in with your password."
      : "Un compte existe déjà avec cette adresse. Connectez-vous avec votre mot de passe.";
  }
  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return localeCode === "en" ? "Incorrect email address or password." : "Adresse e-mail ou mot de passe incorrect.";
  }
  if (code.includes("weak-password") || code.includes("password-does-not-meet-requirements")) {
    return localeCode === "en"
      ? "This password does not meet the Firebase security policy."
      : "Ce mot de passe ne respecte pas la politique de sécurité Firebase.";
  }
  if (code.includes("too-many-requests")) {
    return localeCode === "en"
      ? "Too many attempts. Wait a few minutes before trying again."
      : "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
  }
  return error instanceof Error
    ? error.message
    : localeCode === "en" ? "Sign-in was not completed." : "La connexion n’a pas abouti.";
}

export default function CustomerSpaceAccessForm({
  choiceTitle = "Accédez à votre espace",
  draft,
  initialMode = "signin",
  onDraftChange,
  onAuthenticated,
  returnTo,
  localeCode = "fr",
}: {
  choiceTitle?: string;
  draft?: CustomerSpaceAccessDraft;
  initialMode?: AccessMode;
  onDraftChange?: (draft: CustomerSpaceAccessDraft) => void;
  onAuthenticated?: (result: { redirectTo: string }) => Promise<void> | void;
  returnTo?: string;
  localeCode?: InterfaceLocaleCode;
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
  const [progressiveStep, setProgressiveStep] =
    useState<ProgressiveAccessStep>("choice");
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
      setError(localeCode === "en" ? "Enter a valid email address." : "Merci d'indiquer une adresse email valide.");
      return;
    }

    if (!password) {
      setError(localeCode === "en" ? "Enter your password." : "Indiquez votre mot de passe.");
      return;
    }
    if (mode === "create" && password.length < 8) {
      setError(localeCode === "en" ? "Choose a password with at least 8 characters." : "Choisissez un mot de passe d’au moins 8 caractères.");
      return;
    }

    setIsSending(true);

    try {
      const localeCode = getReturnToInterfaceLocale(returnTo || "/");
      const authResult = mode === "create"
        ? await createPasswordAccountAndGetIdToken(normalizedEmail, password, localeCode)
        : await signInWithPasswordAndGetIdToken(normalizedEmail, password, localeCode);
      const result = await exchangeFirebaseIdTokenForSession({
        idToken: authResult.idToken,
        returnTo: returnTo || "/",
      });
      if (onAuthenticated) await onAuthenticated(result);
      else window.location.assign(result.redirectTo);
    } catch (submitError) {
      setError(getFriendlyAuthError(submitError, localeCode));
    } finally {
      setIsSending(false);
    }
  }

  async function handlePasswordReset() {
    const normalizedEmail = normalizeEmail(email);
    setError(null);
    setNotice(null);
    if (!isValidEmail(normalizedEmail)) {
      setError(localeCode === "en" ? "Enter your account email address first." : "Indiquez d’abord l’adresse e-mail de votre compte.");
      return;
    }
    setIsSending(true);
    try {
      const target = returnTo || "/plans/latest";
      await requestPasswordReset(
        normalizedEmail,
        getReturnToInterfaceLocale(target),
        target,
      );
      setNotice(localeCode === "en"
        ? "If an account matches this address, the instructions have been sent."
        : "Si un compte correspond à cette adresse, les instructions ont été envoyées.");
    } catch (resetError) {
      setError(getFriendlyAuthError(resetError, localeCode));
    } finally {
      setIsSending(false);
    }
  }

  function clearFeedback() {
    setError(null);
    setNotice(null);
  }

  function showProgressiveStep(step: ProgressiveAccessStep) {
    clearFeedback();
    setProgressiveStep(step);
  }

  function handleProgressiveEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = normalizeEmail(email);
    clearFeedback();
    if (!isValidEmail(normalizedEmail)) return;
    updateDraft({ email: normalizedEmail, password: "" });
    setProgressiveStep("password");
  }

  const normalizedEmail = normalizeEmail(email);
  const emailReady = isValidEmail(normalizedEmail);
  const title = progressiveStep === "choice"
      ? choiceTitle
      : progressiveStep === "email"
        ? localeCode === "en" ? "Your email address" : "Votre adresse e-mail"
        : mode === "create"
          ? localeCode === "en" ? "Create your access" : "Créez votre accès"
          : localeCode === "en" ? "Welcome back" : "Bon retour";

  return (
      <div className="space-y-5">
        <div
          className={progressiveStep === "choice"
            ? "pr-12"
            : "grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 pr-12"}
        >
          {progressiveStep !== "choice" ? (
            <button
              type="button"
              onClick={() => showProgressiveStep(
                progressiveStep === "email" ? "choice" : "email",
              )}
              aria-label={progressiveStep === "email"
                ? localeCode === "en" ? "Back to sign-in options" : "Retour aux options de connexion"
                : localeCode === "en" ? "Back to the email step" : "Retour à l’étape e-mail"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-brand-blue transition hover:bg-dema-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          <h2
            id="action-plan-access-title"
            className={`text-2xl font-medium tracking-[-0.035em] text-brand-blue ${progressiveStep === "choice" ? "text-left" : "text-center"}`}
            tabIndex={-1}
            aria-live="polite"
          >
            {title}
          </h2>
          {progressiveStep !== "choice" ? <span aria-hidden="true" /> : null}
        </div>

        {progressiveStep === "choice" ? (
          <div className="space-y-3">
            {googleEnabled ? (
              <GoogleCustomerSignInButton
                large
                onAuthenticated={onAuthenticated}
                onError={setError}
                returnTo={returnTo}
                localeCode={localeCode}
              />
            ) : null}
            {googleEnabled ? (
              <div className="flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-dema-line" />
                <span className="text-xs text-dema-muted">{localeCode === "en" ? "or" : "ou"}</span>
                <span className="h-px flex-1 bg-dema-line" />
              </div>
            ) : null}
            {error ? <p role="alert" className="text-sm text-dema-forest">{error}</p> : null}
            <button
              type="button"
              onClick={() => showProgressiveStep("email")}
              className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              {localeCode === "en" ? "Continue with my email" : "Continuer avec mon e-mail"}
            </button>
          </div>
        ) : progressiveStep === "email" ? (
          <form className="space-y-4" onSubmit={handleProgressiveEmailSubmit} noValidate>
            <div className="text-left">
              <label className="sr-only" htmlFor={emailId}>{localeCode === "en" ? "Email address" : "Adresse e-mail"}</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/45" aria-hidden="true" />
                <input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(event) => updateDraft({ email: event.target.value })}
                  placeholder={localeCode === "en" ? "Email address" : "Adresse e-mail"}
                  aria-invalid={email.length > 0 && !emailReady}
                  className="min-h-[54px] w-full rounded-full border border-dema-line bg-dema-paper py-3 pl-10 pr-4 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/35 focus:border-dema-forest/30 focus:ring-2 focus:ring-dema-forest/10"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!emailReady}
              className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              {localeCode === "en" ? "Continue" : "Continuer"}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex min-h-12 items-center justify-between gap-3 rounded-[0.9rem] bg-dema-sage/55 px-4 py-2 text-sm">
              <span className="min-w-0 truncate text-brand-blue">{normalizedEmail}</span>
              <button
                type="button"
                onClick={() => showProgressiveStep("email")}
                className="shrink-0 text-xs font-medium text-dema-forest underline decoration-dema-forest/25 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
              >
                {localeCode === "en" ? "Edit" : "Modifier"}
              </button>
            </div>
            <div className="text-left">
              <label className="sr-only" htmlFor={passwordId}>{localeCode === "en" ? "Password" : "Mot de passe"}</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/45" aria-hidden="true" />
                <input
                  id={passwordId}
                  type="password"
                  autoComplete={mode === "create" ? "new-password" : "current-password"}
                  autoFocus
                  minLength={mode === "create" ? 8 : undefined}
                  required
                  value={password}
                  onChange={(event) => updateDraft({ password: event.target.value })}
                  placeholder={mode === "create"
                    ? localeCode === "en" ? "Choose a password" : "Choisissez un mot de passe"
                    : localeCode === "en" ? "Your password" : "Votre mot de passe"}
                  className="min-h-[54px] w-full rounded-full border border-dema-line bg-dema-paper py-3 pl-10 pr-4 text-sm text-brand-blue outline-none transition placeholder:text-brand-blue/35 focus:border-dema-forest/30 focus:ring-2 focus:ring-dema-forest/10"
                />
              </div>
            </div>
            {error ? <p role="alert" className="text-sm text-dema-forest">{error}</p> : null}
            {notice ? <p role="status" className="text-sm text-dema-forest">{notice}</p> : null}
            {mode === "signin" ? (
              <button
                type="button"
                disabled={isSending}
                onClick={() => void handlePasswordReset()}
                className="block min-h-8 text-left text-xs text-dema-muted underline decoration-dema-line underline-offset-4 hover:text-dema-forest disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
              >
                {localeCode === "en" ? "Forgot your password?" : "Mot de passe oublié ?"}
              </button>
            ) : null}
            <button
              type="submit"
              disabled={isSending}
              className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              {isSending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {isSending
                ? localeCode === "en" ? "Signing in…" : "Connexion…"
                : mode === "create"
                  ? localeCode === "en" ? "Create my access" : "Créer mon accès"
                  : localeCode === "en" ? "Sign in" : "Se connecter"}
            </button>
            <p className="text-center text-xs text-dema-muted">
              {mode === "create"
                ? localeCode === "en" ? "Already have an account?" : "Vous avez déjà un compte ?"
                : localeCode === "en" ? "Don’t have an account yet?" : "Vous n’avez pas encore de compte ?"}{" "}
              <button
                type="button"
                onClick={() => {
                  updateDraft({ mode: mode === "create" ? "signin" : "create", password: "" });
                  clearFeedback();
                }}
                className="font-medium text-dema-forest underline decoration-dema-forest/25 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
              >
                {mode === "create"
                  ? localeCode === "en" ? "Sign in" : "Se connecter"
                  : localeCode === "en" ? "Create my access" : "Créer mon accès"}
              </button>
            </p>
          </form>
        )}
      </div>
  );
}
