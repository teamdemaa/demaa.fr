import Navbar from "@/components/Navbar";

function LoadingCard({ accent = "muted" }: { accent?: "forest" | "muted" }) {
  return (
    <div className="demaa-card flex min-h-[14rem] flex-col rounded-[1.15rem] p-5 text-left">
      <div className="h-10 w-10 animate-pulse rounded-full bg-dema-sage/70" />
      <div
        className={`mt-4 h-3 w-24 animate-pulse rounded-full ${
          accent === "forest" ? "bg-dema-sage/60" : "bg-dema-sage/45"
        }`}
      />
      <div className="mt-3 h-6 w-4/5 animate-pulse rounded-full bg-dema-sage/55" />
      <div className="mt-4 space-y-2">
        <div className="h-4 animate-pulse rounded-full bg-dema-sage/40" />
        <div className="h-4 w-11/12 animate-pulse rounded-full bg-dema-sage/35" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-dema-sage/30" />
      </div>
      <div className="mt-auto pt-5">
        <div className="h-4 w-20 animate-pulse rounded-full bg-dema-sage/35" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <>
      <Navbar minimal />
      <main className="min-h-screen bg-background pb-20">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-3 sm:px-6 lg:px-8">
          <div className="mt-4">
            <div className="h-5 w-24 animate-pulse rounded-full bg-dema-sage/45" />
            <div className="mt-6 h-12 w-[min(28rem,80vw)] animate-pulse rounded-[1rem] bg-dema-sage/60" />
            <div className="mt-4 max-w-2xl space-y-2">
              <div className="h-4 animate-pulse rounded-full bg-dema-sage/45" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-dema-sage/45" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-dema-sage/35" />
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {[
                "Systèmes",
                "Outils",
                "Fournisseurs",
                "Financement",
                "Réseau pro",
                "Cours",
              ].map((label, index) => (
                <div
                  key={label}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    index === 0
                      ? "bg-dema-sage/70 text-brand-blue/85"
                      : "bg-transparent text-brand-blue/35"
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
                Outils métier
              </p>
              <div className="-mx-4 overflow-x-auto px-4 pb-4 pt-1 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="flex w-max snap-x snap-mandatory gap-4">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="w-[18rem] shrink-0 snap-start sm:w-[19rem] lg:w-[20rem]"
                    >
                      <LoadingCard accent={index === 0 ? "forest" : "muted"} />
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-muted">
                Outils transverses
              </p>
              <div className="-mx-4 overflow-x-auto px-4 pb-4 pt-1 soft-scroll sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                <div className="flex w-max snap-x snap-mandatory gap-4">
                  {[0, 1].map((index) => (
                    <div
                      key={index}
                      className="w-[18rem] shrink-0 snap-start sm:w-[19rem] lg:w-[20rem]"
                    >
                      <LoadingCard />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-start">
                <div className="h-5 w-36 animate-pulse rounded-full bg-dema-sage/40" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
