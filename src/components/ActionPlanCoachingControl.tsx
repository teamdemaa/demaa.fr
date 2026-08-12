"use client";

import { LoaderCircle, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CoachingPanel, {
  type SpecialistAccessIntent,
  type SpecialistOffer,
} from "@/components/CoachingPanel";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import type { PersistableActionPlan } from "@/lib/action-plan-contract";
import type { ActionPlanWorkspaceState } from "@/lib/action-plan-workspace";
import {
  toPersistedAiGenerationMetadata,
  type AiGenerationMetadata,
} from "@/lib/ai-generation-metadata";

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
}: {
  accessPlan?: AccessPlan;
  demoMode?: boolean;
  existingPlanId?: string;
  initialEmail?: string;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [accessIntent, setAccessIntent] = useState<SpecialistAccessIntent>({ tab: "messages" });
  const [accessPlanId, setAccessPlanId] = useState(existingPlanId || "");
  const [accessPreparing, setAccessPreparing] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeAccessDialog = useCallback(() => setAccessOpen(false), []);
  const closePanel = useCallback(() => {
    setOpen(false);

    const url = new URL(window.location.href);
    if (url.searchParams.get("intent") !== "coaching") return;

    url.searchParams.delete("intent");
    url.searchParams.delete("offer");
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
    if (initialEmail) return;
    setAccessIntent(intent);
    setAccessError(null);

    if (existingPlanId) {
      setAccessPlanId(existingPlanId);
      setAccessOpen(true);
      return;
    }

    if (demoMode) {
      setAccessOpen(true);
      return;
    }

    if (!accessPlan || accessPreparing) return;
    setAccessPreparing(true);

    try {
      const response = await fetch("/api/action-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: accessPlan.plan,
          sourceText: accessPlan.sourceText,
          workspaceState: accessPlan.workspace,
          generation: toPersistedAiGenerationMetadata(
            accessPlan.generation ?? null,
          ),
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | {
            actionPlan?: { id?: string };
            actionPlanId?: string;
            error?: string;
            status?: "pending_claim" | "saved";
          }
        | null;
      const actionPlanId =
        body?.status === "saved" ? body.actionPlan?.id : body?.actionPlanId;

      if (!response.ok || !actionPlanId) {
        throw new Error(body?.error || "Impossible de préparer l’accès au spécialiste.");
      }

      if (body?.status === "saved") {
        const params = new URLSearchParams({ intent: "coaching", tab: intent.tab });
        if (intent.offer) params.set("offer", intent.offer);
        window.location.assign(
          `/plans/${encodeURIComponent(actionPlanId)}?${params.toString()}`,
        );
        return;
      }

      setAccessPlanId(actionPlanId);
      setAccessOpen(true);
    } catch (error) {
      setAccessError(
        error instanceof Error
          ? error.message
          : "Impossible de préparer l’accès au spécialiste.",
      );
    } finally {
      setAccessPreparing(false);
    }
  }, [accessPlan, accessPreparing, demoMode, existingPlanId, initialEmail]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTarget(document.getElementById("action-plan-navbar-specialist"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!initialEmail) return;
    const intent = new URLSearchParams(window.location.search).get("intent");
    if (intent !== "coaching") return;
    const search = new URLSearchParams(window.location.search);
    const requestedTab = search.get("tab") === "formules" ? "formules" : "messages";
    const requestedOffer = search.get("offer");
    const validOffer: SpecialistOffer | undefined = requestedOffer === "echanges"
      || requestedOffer === "pilotage_1"
      || requestedOffer === "pilotage_2"
      ? requestedOffer
      : undefined;
    const timeout = window.setTimeout(() => {
      setAccessIntent({ offer: validOffer, tab: requestedTab });
      setOpen(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [initialEmail]);

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
          className="demaa-primary-button min-h-10 px-3 text-xs sm:min-h-11 sm:px-4 sm:text-sm"
          aria-label="Parler à un spécialiste"
          title="Parler à un spécialiste"
        >
          <span>Parler à un spécialiste</span>
        </button>,
        target,
      )}

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[130] overflow-y-auto bg-dema-cream/98 px-4 pb-24 pt-4 backdrop-blur-md sm:px-6 lg:px-8"
              role="dialog"
              aria-modal="true"
              aria-label="Parler à un spécialiste"
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
                initialOffer={initialEmail ? accessIntent.offer : undefined}
                initialTab={accessIntent.tab}
                onRequireAccess={initialEmail ? undefined : (intent) => void prepareAccess(intent)}
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
                  Écrire à un spécialiste
                </h2>
                <div className="mt-6">
                  <CustomerSpaceAccessForm
                    actionPlanClaim={accessPlanId ? { actionPlanId: accessPlanId } : null}
                    returnTo={(() => {
                      const params = new URLSearchParams({ intent: "coaching", tab: accessIntent.tab });
                      if (accessIntent.offer) params.set("offer", accessIntent.offer);
                      return accessPlanId
                        ? `/plans/${encodeURIComponent(accessPlanId)}?${params.toString()}`
                        : `/?${params.toString()}`;
                    })()}
                    compact
                    simple
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
