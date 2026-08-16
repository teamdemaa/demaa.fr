"use client";

export default function SavedActionPlanError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="min-h-screen bg-dema-cream px-4 pb-24 pt-24 text-brand-blue sm:px-6 lg:px-8">
      <div
        className="mx-auto max-w-xl rounded-[1.25rem] border border-dema-line bg-dema-paper px-6 py-10 text-center"
        role="alert"
      >
        <h2 className="text-2xl font-light tracking-[-0.035em]">
          Impossible d’ouvrir ce plan
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-dema-muted">
          Le chargement a échoué. Vos données enregistrées restent intactes.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-dema-forest px-5 text-sm font-semibold text-white transition hover:bg-brand-blue"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
