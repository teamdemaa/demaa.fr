"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  openServiceCartModal,
  readServiceCartSlugs,
  writeServiceCartSlugs,
} from "@/lib/service-cart";
import {
  formatLiveSessionDate,
  getLiveSessionPurchaseDetails,
  getLiveSessionPurchaseSlug,
  type LiveTrainingSession,
} from "@/lib/live-session-catalog";
import { formatPurchasableServicePrice } from "@/lib/service-purchase";

type LiveSessionDialogProps = {
  training: LiveTrainingSession;
  systemSlug: string;
  onClose: () => void;
};

function getInitialSlotId(training: LiveTrainingSession, systemSlug: string) {
  const firstSlotId = training.slots[0]?.id ?? "";

  if (typeof window === "undefined") {
    return firstSlotId;
  }

  const cartSlugs = readServiceCartSlugs();
  const selectedSlotFromCart = training.slots.find((slot) =>
    cartSlugs.includes(getLiveSessionPurchaseSlug(training.slug, slot.id, systemSlug)) ||
    cartSlugs.includes(getLiveSessionPurchaseSlug(training.slug, slot.id)),
  );

  return selectedSlotFromCart?.id ?? firstSlotId;
}

export function LiveSessionDialog({ training, systemSlug, onClose }: LiveSessionDialogProps) {
  const [selectedSlotId, setSelectedSlotId] = useState(() =>
    getInitialSlotId(training, systemSlug),
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const selectedSlot = training.slots.find((slot) => slot.id === selectedSlotId);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (!firstElement || !lastElement) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      } else if (!dialogRef.current.contains(document.activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!selectedSlot) {
    return null;
  }

  function continueToCheckout() {
    const currentSlugs = readServiceCartSlugs();
    const otherSelections = currentSlugs.filter(
      (slug) => getLiveSessionPurchaseDetails(slug)?.training.slug !== training.slug,
    );
    const selectedPurchaseSlug = getLiveSessionPurchaseSlug(
      training.slug,
      selectedSlotId,
      systemSlug,
    );

    writeServiceCartSlugs([...otherSelections, selectedPurchaseSlug]);
    onClose();
    window.requestAnimationFrame(openServiceCartModal);
  }

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-blue/40 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-session-dialog-title"
      onClick={onClose}
    >
      <section
        className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          autoFocus
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <header className="border-b border-dema-line px-5 py-6 pr-16 sm:px-7 sm:py-7 sm:pr-20">
          <p className="text-sm font-medium text-dema-forest">
            En direct · {training.duration}
          </p>
          <h2
            id="live-session-dialog-title"
            className="mt-2 text-2xl font-semibold tracking-tight text-brand-blue sm:text-3xl"
          >
            {training.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dema-muted sm:text-base">
            {training.description}
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 soft-scroll sm:px-7 sm:py-7">
          <div className="space-y-7">
            <section aria-labelledby="live-session-audience-title">
              <h3
                id="live-session-audience-title"
                className="text-sm font-semibold text-brand-blue"
              >
                Pour qui ?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-dema-muted">
                {training.audience}
              </p>
            </section>

            <section aria-labelledby="live-session-goals-title">
              <h3
                id="live-session-goals-title"
                className="text-sm font-semibold text-brand-blue"
              >
                Ce que vous allez apprendre
              </h3>
              <ul className="mt-3 space-y-2.5">
                {training.learningGoals.map((goal) => (
                  <li
                    key={goal}
                    className="flex gap-3 text-sm leading-relaxed text-dema-muted"
                  >
                    <span
                      className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-dema-forest"
                      aria-hidden="true"
                    />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="live-session-models-title">
              <h3
                id="live-session-models-title"
                className="text-sm font-semibold text-brand-blue"
              >
                Inclus avec la formation
              </h3>
              <ul className="mt-3 space-y-2.5">
                {training.includedModels.map((model) => (
                  <li
                    key={model}
                    className="flex gap-3 text-sm leading-relaxed text-dema-muted"
                  >
                    <span
                      className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-dema-forest"
                      aria-hidden="true"
                    />
                    <span>{model}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 rounded-[0.9rem] bg-dema-sage/70 px-4 py-3 text-sm leading-relaxed text-dema-forest">
                <strong>Session Q&amp;A incluse.</strong> {training.qAndA}
              </p>
            </section>

            <fieldset>
              <legend className="text-sm font-semibold text-brand-blue">
                Choisissez votre session
              </legend>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {training.slots.map((slot) => {
                  const isSelected = slot.id === selectedSlot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`rounded-[0.95rem] border px-4 py-3 text-left text-sm transition ${
                        isSelected
                          ? "border-dema-forest bg-dema-sage text-dema-forest"
                          : "border-dema-line bg-dema-paper text-brand-blue/72 hover:border-dema-forest/30"
                      }`}
                      aria-pressed={isSelected}
                    >
                      {formatLiveSessionDate(slot.startsAt)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </div>

        <footer className="border-t border-dema-line bg-dema-paper px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-dema-muted">Session sélectionnée</p>
              <p className="mt-1 text-sm font-medium text-dema-forest">
                {formatLiveSessionDate(selectedSlot.startsAt)}
              </p>
              <p className="mt-1 text-base font-normal text-brand-blue">
                {formatPurchasableServicePrice(training.unitAmount)}
              </p>
              <p className="mt-1 text-xs text-dema-muted">
                Session interactive + modèles opérationnels + Q&amp;A
              </p>
            </div>
            <button
              type="button"
              onClick={continueToCheckout}
              className="demaa-primary-button w-full justify-center sm:w-auto"
            >
              Continuer vers l’inscription
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
