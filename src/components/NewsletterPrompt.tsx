"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";

const STORAGE_KEY = "demaa_newsletter_prompt_hidden";

export default function NewsletterPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.localStorage.getItem(STORAGE_KEY) === "true") {
      return;
    }

    const timeout = window.setTimeout(() => {
      setVisible(true);
    }, 30000);

    return () => window.clearTimeout(timeout);
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
  };

  const handleSuccess = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }

    window.setTimeout(() => {
      setVisible(false);
    }, 2800);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] max-w-[360px] rounded-[1.75rem] border border-brand-blue/10 bg-[#FFF3EF]/98 p-4 shadow-[0_18px_50px_rgba(25,27,48,0.10)] backdrop-blur-sm md:bottom-6 md:right-6">
      <button
        type="button"
        onClick={handleClose}
        aria-label="Fermer la newsletter"
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-brand-blue/45 transition-colors hover:bg-white hover:text-brand-blue"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pr-8">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-coral">
          Newsletter
        </p>
        <p className="mt-2 text-sm leading-relaxed text-brand-blue">
          Recevez des idées simples pour automatiser et structurer votre entreprise.
        </p>
      </div>

      <NewsletterForm
        compact
        source="newsletter_popup_home"
        onSuccess={handleSuccess}
        successMessage={(firstName) =>
          `${firstName || "Merci"} — c'est bien noté. On vous enverra des idées concrètes, simples et utiles très bientôt.`
        }
      />
    </div>
  );
}
