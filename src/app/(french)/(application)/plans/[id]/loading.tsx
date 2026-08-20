export default function SavedActionPlanLoading() {
  return (
    <div className="min-h-screen bg-dema-cream px-4 pb-24 pt-24 text-brand-blue sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[68rem]" aria-busy="true" aria-live="polite">
        <p className="sr-only">Ouverture du plan…</p>
        <div className="h-12 w-full max-w-xl animate-pulse rounded-full bg-dema-sage/55" />
        <div className="mt-8 grid gap-4">
          <div className="h-32 animate-pulse rounded-[1.25rem] bg-dema-paper" />
          <div className="h-32 animate-pulse rounded-[1.25rem] bg-dema-paper" />
          <div className="h-32 animate-pulse rounded-[1.25rem] bg-dema-paper" />
        </div>
      </div>
    </div>
  );
}
