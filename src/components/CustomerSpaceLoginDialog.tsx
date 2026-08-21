"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import CustomerSpaceAccessForm from "@/components/CustomerSpaceAccessForm";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";
import type { InterfaceLocaleCode } from "@/lib/international-context";

export default function CustomerSpaceLoginDialog({
  localeCode = "fr",
  message,
  onAuthenticated,
  onClose,
  returnTo = "/plans/latest",
}: {
  localeCode?: InterfaceLocaleCode;
  message?: string;
  onAuthenticated?: (result: { redirectTo: string }) => Promise<void> | void;
  onClose?: () => void;
  returnTo?: string;
}) {
  const router = useRouter();
  const closeDialog = useCallback(
    () => onClose ? onClose() : router.back(),
    [onClose, router],
  );
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
        aria-labelledby="action-plan-access-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="demaa-dialog-shadow relative w-full max-w-md rounded-t-[1.4rem] border border-dema-line bg-dema-paper px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-16 outline-none sm:rounded-[1.4rem] sm:p-8 sm:pt-16"
      >
        <button
          type="button"
          aria-label={localeCode === "en" ? "Close" : "Fermer"}
          data-dialog-initial-focus
          onClick={closeDialog}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {message ? (
          <div className="text-center">
            <p className="mt-4 rounded-[0.9rem] border border-dema-forest/15 bg-dema-sage/70 px-4 py-3 text-sm text-dema-forest">
              {message.slice(0, 180)}
            </p>
          </div>
        ) : null}

        <div className={message ? "mt-6" : ""}>
          <CustomerSpaceAccessForm
            choiceTitle={localeCode === "en" ? "Sign in" : "Connectez-vous"}
            localeCode={localeCode}
            onAuthenticated={onAuthenticated}
            returnTo={returnTo}
          />
        </div>
      </section>
    </div>
  );
}
