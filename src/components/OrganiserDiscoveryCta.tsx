import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OrganiserDiscoveryCta() {
  return (
    <section
      aria-labelledby="organiser-discovery-heading"
      className="rounded-[1.5rem] border border-dema-line bg-dema-paper px-6 py-8 sm:px-8 sm:py-9"
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <div className="max-w-2xl">
          <h2
            id="organiser-discovery-heading"
            className="text-2xl font-light leading-tight tracking-[-0.035em] text-brand-blue sm:text-3xl"
          >
            Des tutoriels pour passer à l’action
          </h2>
          <p className="mt-3 text-sm leading-6 text-dema-muted sm:text-base sm:leading-7">
            Suivez des pas-à-pas construits autour des modèles Demaa que vous pouvez copier et adapter.
          </p>
        </div>
        <Link
          href="/tutoriels"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-dema-forest px-6 text-sm font-semibold text-white transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
        >
          Voir les tutoriels
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
