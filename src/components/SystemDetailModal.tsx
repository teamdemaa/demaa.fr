"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight, X } from "lucide-react";

type SystemDetailModalProps = {
  children: React.ReactNode;
  standaloneHref: string;
  title: string;
};

export default function SystemDetailModal({
  children,
  standaloneHref,
  title,
}: SystemDetailModalProps) {
  const router = useRouter();

  function closeModal() {
    router.back();
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-brand-blue/35 p-4"
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative flex h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[1.25rem] border border-dema-line bg-dema-paper p-6 pt-14 shadow-[0_24px_60px_rgba(23,35,29,0.14)] md:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.location.assign(standaloneHref)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
            aria-label="Ouvrir en page"
            title="Ouvrir en page"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-dema-line bg-dema-paper text-brand-blue transition hover:border-dema-forest/25 hover:text-dema-forest"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
