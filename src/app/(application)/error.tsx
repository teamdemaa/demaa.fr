"use client";

export default function ApplicationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-dema-cream px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] text-center text-brand-blue">
      <section className="w-full max-w-lg rounded-[1.4rem] border border-dema-line bg-white p-7 shadow-[0_20px_60px_rgba(23,35,29,0.08)]">
        <h1 className="text-2xl font-medium tracking-[-0.03em]">
          Votre espace ne peut pas être chargé
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-dema-muted">
          Vos plans n’ont pas été supprimés. Réessayez pour rétablir la connexion à votre entreprise.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-dema-forest px-6 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
        >
          Réessayer
        </button>
        {error.digest ? (
          <p className="mt-4 text-[11px] text-dema-muted">Référence : {error.digest}</p>
        ) : null}
      </section>
    </main>
  );
}
