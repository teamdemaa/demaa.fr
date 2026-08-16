"use client";

import { LoaderCircle, MessageCircle, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CoachingPanel, {
  type SpecialistAccessIntent,
} from "@/components/CoachingPanel";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import {
  toPersistedAiGenerationMetadata,
  type AiGenerationMetadata,
} from "@/lib/ai-generation-metadata";
import { isCoachingMessageDraftToken } from "@/lib/coaching-message-draft";

type AccessPlan = {
  plan: PersistableActionPlan;
  sourceText: string;
  workspace: ActionPlanWorkspaceState;
  generation?: AiGenerationMetadata | null;
};

export default function ActionPlanCoachingControl({
  accessPlan,
  demoMode = false,
  existingPlanId,
  initialEmail = "",
  isAuthenticated = Boolean(initialEmail),
}: {
  accessPlan?: AccessPlan;
  demoMode?: boolean;
  existingPlanId?: string;
  initialEmail?: string;
  isAuthenticated?: boolean;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [accessIntent, setAccessIntent] = useState<SpecialistAccessIntent>({ tab: "messages" });
  const [accessPreparing, setAccessPreparing] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeAccessDialog = useCallback(() => setAccessOpen(false), []);
  const closePanel = useCallback(() => {
    setOpen(false);

    const url = new URL(window.location.href);
    if (url.searchParams.get("intent") !== "coaching") return;

    url.searchParams.delete("intent");
    url.searchParams.delete("tab");
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);
  const accessDialogRef = useAccessibleDialog({
    isOpen: accessOpen,
    onClose: closeAccessDialog,
  });

  const prepareAccess = useCallback(async (intent: SpecialistAccessIntent) => {
    if (isAuthenticated) return;
    setAccessIntent(intent);
    setAccessError(null);

    setAccessOpen(true);
  }, [isAuthenticated]);

  const handleAuthenticated = useCallback(async () => {
    setAccessPreparing(true);
    setAccessError(null);
    try {
      const params = new URLSearchParams({ intent: "coaching", tab: accessIntent.tab });
      if (accessIntent.draftToken) params.set("draftToken", accessIntent.draftToken);

      let planId = existingPlanId || "";
      if (!planId && accessPlan && !demoMode) {
        const response = await fetch("/api/action-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan: accessPlan.plan,
            sourceText: accessPlan.sourceText,
            workspaceState: accessPlan.workspace,
            generation: toPersistedAiGenerationMetadata(accessPlan.generation ?? null),
          }),
        });
        const body = await response.json().catch(() => null) as {
          actionPlan?: { id?: string };
          error?: string;
          status?: string;
        } | null;
        planId = body?.actionPlan?.id || "";
        if (!response.ok || body?.status !== "saved" || !planId) {
          throw new Error(body?.error || "Impossible de sauvegarder le plan.");
        }
      }

      window.location.assign(
        planId
          ? `/plans/${encodeURIComponent(planId)}?${params.toString()}`
          : `/?${params.toString()}`,
      );
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Impossible de préparer l’accès au spécialiste.";
      setAccessError(message);
      throw error;
    } finally {
      setAccessPreparing(false);
    }
  }, [accessIntent, accessPlan, demoMode, existingPlanId]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTarget(document.getElementById("action-plan-navbar-specialist"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const intent = new URLSearchParams(window.location.search).get("intent");
    if (intent !== "coaching") return;
    const search = new URLSearchParams(window.location.search);
    const rawDraftToken = search.get("draftToken");
    const requestedDraftToken = isCoachingMessageDraftToken(rawDraftToken)
      ? rawDraftToken
      : undefined;
    const timeout = window.setTimeout(() => {
      setAccessIntent({
        draftToken: requestedDraftToken,
        tab: "messages",
      });
      setOpen(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePanel();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closePanel, open]);

  if (!target) return null;

  return (
    <>
      {createPortal(
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-dema-forest px-4 text-xs font-medium text-white shadow-[0_6px_18px_rgba(39,91,67,0.18)] transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/30 sm:min-h-11 sm:px-5 sm:text-sm"
          aria-label="Échanger avec l’équipe Demaa"
          title="Échanger avec l’équipe Demaa"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          <span>Échanger</span>
        </button>,
        target,
      )}

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[130] overflow-y-auto bg-dema-cream/98 px-4 pb-24 pt-4 backdrop-blur-md sm:px-6 lg:px-8"
              role="dialog"
              aria-modal="true"
              aria-label="Échanger avec l’équipe Demaa"
            >
              <div className="mx-auto flex max-w-[68rem] justify-end">
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={closePanel}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue"
                  aria-label="Fermer la page spécialiste"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <CoachingPanel
                initialDraftToken={isAuthenticated ? accessIntent.draftToken : undefined}
                onRequireAccess={isAuthenticated ? undefined : (intent) => void prepareAccess(intent)}
              />
              {accessPreparing ? (
                <div className="fixed inset-x-0 bottom-8 z-[135] mx-auto flex w-fit items-center gap-2 rounded-full bg-dema-paper px-4 py-2 text-sm text-dema-forest shadow-lg" role="status">
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Préparation de votre accès…
                </div>
              ) : null}
              {accessError ? (
                <p className="fixed inset-x-4 bottom-8 z-[135] mx-auto max-w-md rounded-2xl bg-dema-paper px-4 py-3 text-center text-sm text-red-700 shadow-lg" role="alert">
                  {accessError}
                </p>
              ) : null}
            </div>,
            document.body,
          )
        : null}

      {accessOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[140] flex items-end justify-center bg-brand-blue/25 p-0 backdrop-blur-sm sm:items-center sm:p-6"
              role="presentation"
              onMouseDown={closeAccessDialog}
            >
              <div
                ref={accessDialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="specialist-access-title"
                tabIndex={-1}
                className="relative max-h-dvh w-full max-w-md overflow-y-auto rounded-t-[1.5rem] bg-dema-paper p-6 shadow-2xl sm:rounded-[1.5rem] sm:p-7"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={closeAccessDialog}
                  data-dialog-initial-focus
                  className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
                <h2 id="specialist-access-title" className="pr-12 text-2xl font-medium tracking-[-0.03em] text-brand-blue">
                  {accessIntent.draftToken ? "Connectez-vous pour envoyer" : "Écrire à l’équipe Demaa"}
                </h2>
                <div className="mt-4">
                  <CustomerSpaceAccessForm
                    choiceTitle="Connectez-vous pour envoyer"
                    onAuthenticated={handleAuthenticated}
                    returnTo="/"
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
