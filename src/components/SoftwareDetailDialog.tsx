"use client";

import { X } from "lucide-react";
import SoftwareDetailContent from "@/components/SoftwareDetailContent";
import type { ToolDirectoryItem } from "@/lib/tool-directory";

type SoftwareDetailDialogProps = {
  tool: ToolDirectoryItem;
  onClose: () => void;
};

export default function SoftwareDetailDialog({
  tool,
  onClose,
}: SoftwareDetailDialogProps) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-blue/35 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[1.25rem] border border-dema-line bg-dema-paper p-5 pt-14 shadow-[0_24px_60px_rgba(23,35,29,0.14)] sm:p-6 sm:pt-14 md:p-8"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={tool.name}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
        <SoftwareDetailContent tool={tool} compact />
      </div>
    </div>
  );
}
