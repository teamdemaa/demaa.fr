"use client";

import { useEffect, useId, useState } from "react";
import { ArrowLeft, KeyRound, LoaderCircle, Mail } from "lucide-react";
import GoogleCustomerSignInButton from "@/components/GoogleCustomerSignInButton";
import {
  CustomerSessionExchangeError,
  exchangeFirebaseIdTokenForSession,
} from "@/lib/customer-auth-session.client";
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
import { getAuthUiCopy } from "@/lib/auth-ui-copy";

type AccessMode = "create" | "signin";
type ProgressiveAccessStep = "choice" | "email" | "password";

export type CustomerSpaceAccessDraft = {
  email: string;
  mode: AccessMode;
  password: string;
};

function getFriendlyAuthError(error: unknown, localeCode: InterfaceLocaleCode) {
  const copy = getAuthUiCopy(localeCode);
  const code = typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "";
  if (code.includes("email-already-in-use")) {
    return copy.errors.emailAlreadyUsed;
  }
  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return copy.errors.invalidCredentials;
  }
  if (code.includes("weak-password") || code.includes("password-does-not-meet-requirements")) {
    return copy.errors.weakPassword;
  }
  if (code.includes("too-many-requests")) {
    return copy.errors.tooManyRequests;
  }
  return error instanceof Error
    ? error.message
    : copy.errors.signInIncomplete;
}

function getFirebaseAuthErrorCode(error: unknown) {
  return typeof error === "object" && error && "code" in error
    ? String(error.code)
    : "";
}

export default function CustomerSpaceAccessForm({
  choiceTitle,
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
  const copy = getAuthUiCopy(localeCode);
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
      setError(copy.errors.invalidEmail);
      return;
    }

    if (!password) {
      setError(copy.errors.missingPassword);
      return;
    }
    if (mode === "create" && password.length < 8) {
      setError(copy.errors.shortPassword);
      return;
    }

    setIsSending(true);

    try {
      const returnLocaleCode = getReturnToInterfaceLocale(returnTo || "/");
      const authResult = mode === "create"
        ? await createPasswordAccountAndGetIdToken(normalizedEmail, password, returnLocaleCode)
        : await signInWithPasswordAndGetIdToken(normalizedEmail, password, returnLocaleCode);
      const result = await exchangeFirebaseIdTokenForSession({
        idToken: authResult.idToken,
        returnTo: returnTo || "/",
      });
      if (onAuthenticated) await onAuthenticated(result);
      else window.location.assign(result.redirectTo);
    } catch (submitError) {
      const firebaseCode = getFirebaseAuthErrorCode(submitError);
      if (
        mode === "create"
        && (
          firebaseCode.includes("email-already-in-use")
          || (submitError instanceof CustomerSessionExchangeError && submitError.status === 503)
        )
      ) {
        updateDraft({ mode: "signin", password: "" });
        setError(
          submitError instanceof CustomerSessionExchangeError
            ? copy.errors.workspacePreparationFailed
            : getFriendlyAuthError(submitError, localeCode),
        );
        return;
      }
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
      setError(copy.errors.missingResetEmail);
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
      setNotice(copy.notices.resetSent);
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
      ? choiceTitle ?? copy.access.defaultChoiceTitle
      : progressiveStep === "email"
        ? copy.access.emailTitle
        : mode === "create"
          ? copy.access.createTitle
          : copy.access.welcomeBackTitle;

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
                ? copy.access.backToOptions
                : copy.access.backToEmail}
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
                <span className="text-xs text-dema-muted">{copy.access.or}</span>
                <span className="h-px flex-1 bg-dema-line" />
              </div>
            ) : null}
            {error ? <p role="alert" className="text-sm text-dema-forest">{error}</p> : null}
            <button
              type="button"
              onClick={() => showProgressiveStep("email")}
              className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              {copy.access.continueWithEmail}
            </button>
          </div>
        ) : progressiveStep === "email" ? (
          <form className="space-y-4" onSubmit={handleProgressiveEmailSubmit} noValidate>
            <div className="text-left">
              <label className="sr-only" htmlFor={emailId}>{copy.access.emailAddress}</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dema-forest/45" aria-hidden="true" />
                <input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(event) => updateDraft({ email: event.target.value })}
                  placeholder={copy.access.emailAddress}
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
              {copy.access.continue}
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
                {copy.access.edit}
              </button>
            </div>
            <div className="text-left">
              <label className="sr-only" htmlFor={passwordId}>{copy.access.password}</label>
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
                    ? copy.access.choosePassword
                    : copy.access.currentPassword}
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
                {copy.access.forgotPassword}
              </button>
            ) : null}
            <button
              type="submit"
              disabled={isSending}
              className="inline-flex min-h-[54px] w-full items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-medium text-dema-paper transition hover:bg-[#284f3a] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
            >
              {isSending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {isSending
                ? copy.access.signingIn
                : mode === "create"
                  ? copy.access.createAccess
                  : copy.access.signIn}
            </button>
            <p className="text-center text-xs text-dema-muted">
              {mode === "create"
                ? copy.access.alreadyHasAccount
                : copy.access.needsAccount}{" "}
              <button
                type="button"
                onClick={() => {
                  updateDraft({ mode: mode === "create" ? "signin" : "create", password: "" });
                  clearFeedback();
                }}
                className="font-medium text-dema-forest underline decoration-dema-forest/25 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
              >
                {mode === "create"
                  ? copy.access.signIn
                  : copy.access.createAccess}
              </button>
            </p>
          </form>
        )}
      </div>
  );
}
