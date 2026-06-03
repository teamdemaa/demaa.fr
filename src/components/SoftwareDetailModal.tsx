"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

type SoftwareDetailModalProps = {
  children: React.ReactNode;
};

export default function SoftwareDetailModal({ children }: SoftwareDetailModalProps) {
  const router = useRouter();

  function closeModal() {
    router.back();
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-blue/35 p-4"
      onClick={closeModal}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[1.25rem] bg-white p-5 pt-14 shadow-[0_30px_80px_rgba(20,20,20,0.18)] sm:p-6 sm:pt-14 md:p-8"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-blue/10 bg-white text-brand-blue transition hover:border-neutral-300 hover:text-neutral-700"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
