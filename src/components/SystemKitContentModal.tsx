"use client";

import { useEffect } from "react";
import { ArrowUpRight, FileSpreadsheet, X } from "lucide-react";
import SystemeTabContent from "@/components/SystemeTabContent";
import type { SystemeDetail } from "@/lib/systeme-catalog";

type SystemKitContentModalProps = {
  systemSlug: string;
  systemName: string;
  systeme: SystemeDetail | null | undefined;
  pilotingSheetHref?: string;
  onClose: () => void;
  onRequestDocuments: () => void;
};

export default function SystemKitContentModal({
  systemSlug,
  systemName,
  systeme,
  pilotingSheetHref,
  onClose,
  onRequestDocuments,
}: SystemKitContentModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (document.querySelector('[data-system-document-preview="true"]')) {
        return;
      }

      onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-blue/40 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-kit-content-modal-title"
      onClick={onClose}
    >
      <section
        className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.5rem] border border-dema-line bg-dema-paper shadow-[0_24px_70px_rgba(23,35,29,0.16)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="border-b border-dema-line px-5 py-5 pr-16 sm:px-7 sm:py-6 sm:pr-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
            Kit Process &amp; Système
          </p>
          <h2
            id="system-kit-content-modal-title"
            className="mt-2 text-2xl font-semibold tracking-tight text-brand-blue sm:text-3xl"
          >
            Kit Process &amp; Système {systemName}
          </h2>
          <button
            type="button"
            onClick={onRequestDocuments}
            className="demaa-primary-button mt-4"
          >
            Recevoir tous les documents
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 soft-scroll sm:px-7 sm:py-7">
          {pilotingSheetHref ? (
            <section className="rounded-[1.25rem] border border-dema-line bg-dema-sage/40 p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dema-forest text-dema-paper">
                    <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                      Plan de pilotage métier
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight text-brand-blue">
                      Tableau de pilotage {systemName}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dema-muted">
                      Les tâches récurrentes, responsables, fréquences et priorités utiles pour piloter cette activité.
                    </p>
                  </div>
                </div>
                <a
                  href={pilotingSheetHref}
                  target="_blank"
                  rel="noreferrer"
                  className="demaa-secondary-button shrink-0 gap-2"
                >
                  Ouvrir le tableau de pilotage
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </section>
          ) : null}

          <div className={pilotingSheetHref ? "mt-6" : undefined}>
            <SystemeTabContent
              systemName={systemName}
              systemSlug={systemSlug}
              systeme={systeme}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
