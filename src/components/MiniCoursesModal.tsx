"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import PartnerOffersForm from "@/components/PartnerOffersForm";

export default function MiniCoursesModal({
  onClose,
  initialSector,
  source = "mini_courses_modal",
}: {
  onClose: () => void;
  initialSector?: string;
  source?: string;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-blue/30 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mini-courses-modal-title"
    >
      <section
        className="relative w-full max-w-xl rounded-[2rem] border border-brand-blue/10 bg-[#fcfcfc] px-5 py-10 text-center shadow-[0_22px_70px_rgba(20,20,20,0.10)] md:px-8 md:py-12"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer le formulaire des mini-cours gratuits"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-blue/45 transition-colors hover:bg-white hover:text-brand-blue"
        >
          <X className="h-4 w-4" />
        </button>

        <h2
          id="mini-courses-modal-title"
          className="text-3xl font-semibold tracking-tight text-brand-blue"
        >
          Offres partenaires et mini-cours
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-brand-blue/65 md:text-base">
          Recevez dans un même e-mail nos offres partenaires et des mini-cours utiles pour
          avancer plus sereinement.
        </p>

        <PartnerOffersForm
          initialSector={initialSector}
          source={source}
          submitLabel="Recevoir les offres et mini-cours"
          submittingLabel="Inscription..."
          successMessage={() =>
            "C'est noté. Vous recevrez bientôt nos offres partenaires et nos mini-cours."
          }
        />
      </section>
    </div>
  );
}
