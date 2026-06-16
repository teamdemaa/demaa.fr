"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import PartnerOffersForm from "@/components/PartnerOffersForm";

export default function PartnerOffersPageModal() {
  const router = useRouter();

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[rgba(20,20,20,0.08)] px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center md:min-h-[calc(100vh-5rem)]">
        <section className="relative w-full max-w-xl rounded-[2rem] border border-brand-blue/10 bg-[#fcfcfc] px-5 py-10 text-center shadow-[0_22px_70px_rgba(20,20,20,0.10)] md:px-8 md:py-12">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fermer le formulaire des tarifs négociés"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-brand-blue/45 transition-colors hover:bg-white hover:text-brand-blue"
          >
            <X className="h-4 w-4" />
          </button>

          <p className="text-xs font-black uppercase tracking-[0.22em] text-brand-coral">
            Offres partenaires
          </p>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-brand-blue/65 md:text-base">
            Recevez les tarifs négociés, les offres partenaires et les opportunités utiles
            selon votre secteur d&apos;activité.
          </p>

          <PartnerOffersForm source="partner_offers_page" />
        </section>
      </div>
    </main>
  );
}
