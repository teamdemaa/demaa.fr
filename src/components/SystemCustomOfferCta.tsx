import Link from "next/link";

export default function SystemCustomOfferCta() {
  return (
    <aside
      className="mt-7 flex flex-col gap-4 rounded-[1.15rem] border border-dema-line bg-dema-paper px-5 py-5 shadow-[0_8px_24px_rgba(23,35,29,0.03)] sm:flex-row sm:items-center sm:justify-between sm:px-6"
      aria-labelledby="system-custom-offer-heading"
    >
      <div className="min-w-0">
        <h2
          id="system-custom-offer-heading"
          className="text-base font-semibold tracking-[-0.015em] text-brand-blue"
        >
          Besoin d’une application adaptée à votre métier ?
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-dema-muted">
          Découvrez comment une application sur mesure peut simplifier votre
          organisation et s’adapter à votre façon de travailler.
        </p>
      </div>

      <Link
        href="/services"
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-center text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2"
      >
        Voir les services
      </Link>
    </aside>
  );
}
