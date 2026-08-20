"use client";

import { useEffect } from "react";

export default function EnglishError({
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
    <main className="flex min-h-dvh items-center bg-dema-cream px-4 py-16 text-brand-blue md:px-8">
      <section className="mx-auto w-full max-w-3xl rounded-[1.15rem] border border-dema-line/70 bg-dema-paper p-6 text-center shadow-[0_6px_18px_rgba(23,35,29,0.024)] md:p-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-dema-forest">
          Demaa
        </p>
        <h1 className="mt-4 text-[2.4rem] font-light leading-[1.02] tracking-tight text-brand-blue/44 md:text-[3rem]">
          <span className="demaa-hero-title text-brand-blue/86">Something went wrong</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-dema-muted">
          This page could not be loaded. You can try again now.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="demaa-primary-button mt-6"
        >
          Try again
        </button>
      </section>
    </main>
  );
}
