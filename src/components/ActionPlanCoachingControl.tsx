"use client";

import { Handshake, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CoachingPanel from "@/components/CoachingPanel";

export default function ActionPlanCoachingControl() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTarget(document.getElementById("action-plan-navbar-specialist"));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!target) return null;

  return (
    <>
      {createPortal(
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-forest/15 bg-dema-paper text-dema-forest transition hover:border-dema-forest/28 hover:bg-dema-sage/45 sm:h-11 sm:w-11"
          aria-label="Parler à un spécialiste"
          title="Parler à un spécialiste"
        >
          <Handshake className="h-4 w-4" aria-hidden="true" />
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
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue"
                  aria-label="Fermer le Coaching"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <CoachingPanel />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
