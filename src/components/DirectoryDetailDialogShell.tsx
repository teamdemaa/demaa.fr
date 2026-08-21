"use client";

import { X } from "lucide-react";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";

type DirectoryDetailDialogShellProps = {
  ariaLabel: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
  onClose: () => void;
  closeLabel?: string;
};

export default function DirectoryDetailDialogShell({
  ariaLabel,
  children,
  maxWidthClassName = "max-w-5xl",
  onClose,
  closeLabel = "Fermer",
}: DirectoryDetailDialogShellProps) {
  const dialogRef = useAccessibleDialog({ onClose });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-blue/45 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className={`demaa-dialog-shadow relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[1.35rem] border border-dema-line bg-dema-paper p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-14 outline-none sm:max-h-[92vh] sm:rounded-[1.25rem] sm:p-6 sm:pt-14 md:p-8 ${maxWidthClassName}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
      >
        <button
          type="button"
          onClick={onClose}
          data-dialog-initial-focus
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35"
          aria-label={closeLabel}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}
