"use client";

import { LoaderCircle, X } from "lucide-react";
import { useId } from "react";
import { useAccessibleDialog } from "@/components/useAccessibleDialog";

export default function CompanyStrategyCycleDialog({
  open,
  creating,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean;
  creating: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const id = useId();
  const dialogRef = useAccessibleDialog({ isOpen: open, onClose });
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[170] flex items-end justify-center bg-black/40 p-3 sm:items-center" onMouseDown={(event) => { if (event.target === event.currentTarget && !creating) onClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} tabIndex={-1} className="w-full max-w-md rounded-2xl bg-dema-paper p-5 shadow-2xl outline-none sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id={`${id}-title`} className="text-xl font-semibold text-dema-ink">Créer un nouveau cycle ?</h2><p className="mt-2 text-sm leading-relaxed text-dema-muted">Le cycle actuel sera archivé en lecture seule. Le nouveau cycle commencera vide et couvrira trois mois calendaires.</p></div>
          <button data-dialog-initial-focus type="button" disabled={creating} onClick={onClose} aria-label="Fermer" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dema-line text-dema-forest disabled:opacity-50"><X className="h-4 w-4" aria-hidden="true" /></button>
        </div>
        {error ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" disabled={creating} onClick={onClose} className="rounded-full border border-dema-line px-4 py-2.5 text-sm font-semibold text-dema-ink disabled:opacity-50">Annuler</button>
          <button type="button" disabled={creating} onClick={onConfirm} className="inline-flex items-center justify-center gap-2 rounded-full bg-dema-forest px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{creating ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}Créer le cycle</button>
        </div>
      </div>
    </div>
  );
}
