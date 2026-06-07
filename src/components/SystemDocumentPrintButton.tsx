"use client";

import { Printer } from "lucide-react";

export default function SystemDocumentPrintButton() {
  async function handlePrint() {
    await document.fonts?.ready;
    window.print();
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-dema-line bg-dema-paper px-4 py-2 text-sm font-medium text-brand-blue shadow-[0_8px_24px_rgba(23,35,29,0.035)] transition hover:border-dema-forest/25 hover:text-dema-forest print:hidden"
    >
      <Printer className="h-4 w-4" />
      Imprimer / télécharger
    </button>
  );
}
