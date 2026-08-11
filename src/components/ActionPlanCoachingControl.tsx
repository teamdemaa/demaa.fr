"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CoachingPanel from "@/components/CoachingPanel";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";

export default function ActionPlanCoachingControl({
  initialEmail = "",
}: {
  initialEmail?: string;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeAccessDialog = useCallback(() => setAccessOpen(false), []);
  const closePanel = useCallback(() => {
    setOpen(false);

    const url = new URL(window.location.href);
    if (url.searchParams.get("intent") !== "coaching") return;

    url.searchParams.delete("intent");
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
    const timeout = window.setTimeout(() => setOpen(true), 0);
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
                onRequireAccess={initialEmail ? undefined : () => setAccessOpen(true)}
              />
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
                <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                  Entrez votre adresse e-mail pour recevoir un lien sécurisé et continuer dans l’application.
                </p>
                <div className="mt-6">
                  <CustomerSpaceAccessForm returnTo="/?intent=coaching" compact simple />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
