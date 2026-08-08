"use client";

import { Printer } from "lucide-react";

export default function SystemRecapPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-dema-forest/20 bg-white px-5 py-3 text-sm font-semibold text-dema-forest transition hover:border-dema-forest/35 hover:bg-dema-sage/30 print:hidden"
    >
      <Printer className="h-4 w-4" aria-hidden="true" />
      Imprimer ou enregistrer en PDF
    </button>
  );
}
