"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";

export default function CustomerSpaceLoginDialog({
  message,
  returnTo = "/plans/latest",
}: {
  message?: string;
  returnTo?: string;
}) {
  const router = useRouter();
  const closeDialog = useCallback(() => router.back(), [router]);
  const dialogRef = useAccessibleDialog({ onClose: closeDialog });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-dema-cream/60 backdrop-blur-[7px] sm:items-center sm:p-4"
      onClick={closeDialog}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-login-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-t-[1.4rem] border border-dema-line bg-dema-paper px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-16 shadow-[0_24px_70px_rgba(23,35,29,0.16)] outline-none sm:rounded-[1.4rem] sm:p-8 sm:pt-16"
      >
        <button
          type="button"
          aria-label="Fermer"
          data-dialog-initial-focus
          onClick={closeDialog}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="text-center">
          <h2 id="customer-login-title" className="text-3xl font-light tracking-[-0.04em] text-brand-blue">
            Se connecter
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-dema-muted">
            Retrouvez vos plans avec votre adresse e-mail et votre mot de passe.
          </p>
          {message ? (
            <p className="mt-4 rounded-[0.9rem] border border-dema-forest/15 bg-dema-sage/70 px-4 py-3 text-sm text-dema-forest">
              {message.slice(0, 180)}
            </p>
          ) : null}
        </div>

        <div className="mt-6">
          <CustomerSpaceAccessForm returnTo={returnTo} simple />
        </div>
      </section>
    </div>
  );
}
