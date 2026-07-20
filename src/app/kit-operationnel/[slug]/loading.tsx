import Navbar from "@/components/Navbar";

function LoadingCard() {
  return (
    <div className="demaa-card flex min-h-[13rem] min-w-0 flex-col rounded-[1.25rem] p-4 text-left sm:p-5 md:p-6">
      <div className="h-10 w-10 animate-pulse rounded-full bg-dema-sage/70" />
      <div className="mt-5 h-6 w-4/5 animate-pulse rounded-full bg-dema-sage/55" />
      <div className="mt-3 space-y-2">
        <div className="h-4 animate-pulse rounded-full bg-dema-sage/40" />
        <div className="h-4 w-11/12 animate-pulse rounded-full bg-dema-sage/35" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-dema-sage/30" />
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
          <div className="h-5 w-24 animate-pulse rounded-full bg-dema-sage/45" />
          <div className="mt-6 h-12 w-[min(28rem,80vw)] animate-pulse rounded-[1rem] bg-dema-sage/60" />
          <div className="mt-4 max-w-2xl space-y-2">
            <div className="h-4 animate-pulse rounded-full bg-dema-sage/45" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-dema-sage/45" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-dema-sage/35" />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
