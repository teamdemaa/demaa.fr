export default function Loading() {
  return (
    <main className="min-h-screen bg-dema-cream">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 md:px-8 md:pt-12">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-dema-line/70 bg-dema-paper px-5 py-8 shadow-[0_14px_40px_rgba(23,35,29,0.04)] md:px-8 md:py-10">
          <div className="mx-auto h-5 w-40 animate-pulse rounded-full bg-dema-sage/70" />
          <div className="mx-auto mt-6 h-14 w-full max-w-2xl animate-pulse rounded-[1.75rem] bg-dema-sage/55 md:h-16" />
          <div className="mx-auto mt-4 h-4 w-full max-w-xl animate-pulse rounded-full bg-dema-sage/45" />
          <div className="mx-auto mt-10 h-14 w-full max-w-4xl animate-pulse rounded-full bg-dema-sage/55" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[1.4rem] border border-dema-line/70 bg-dema-paper p-5 shadow-[0_10px_28px_rgba(23,35,29,0.035)]"
            >
              <div className="h-5 w-32 animate-pulse rounded-full bg-dema-sage/60" />
              <div className="mt-5 space-y-3">
                <div className="h-4 w-full animate-pulse rounded-full bg-dema-sage/40" />
                <div className="h-4 w-11/12 animate-pulse rounded-full bg-dema-sage/35" />
                <div className="h-4 w-4/5 animate-pulse rounded-full bg-dema-sage/30" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
