"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="min-h-screen bg-dema-cream text-brand-blue font-sans">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-16 md:px-8">
          <section className="demaa-surface w-full rounded-[1.15rem] p-6 text-center md:p-8">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">
              Demaa
            </p>
            <h1 className="mt-4 text-[2.4rem] font-light leading-[1.02] tracking-tight text-brand-blue/44 md:text-[3rem]">
              <span className="demaa-hero-title text-brand-blue/86">Une erreur</span>
              <br />
              est survenue
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-dema-muted">
              La page n&apos;a pas pu se charger correctement. Vous pouvez relancer
              l&apos;affichage ou revenir dans quelques instants.
            </p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="demaa-primary-button mt-6"
            >
              Réessayer
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
