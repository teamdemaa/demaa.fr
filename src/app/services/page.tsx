import { notFound } from "next/navigation";
import ServicesMarketplace from "@/components/ServicesMarketplace";
import { getPublishedServiceOffersV2 } from "@/lib/service-catalog-v2";

export default function ServicesPage() {
  const offers = getPublishedServiceOffersV2();

  if (offers.length === 0) notFound();

  return (
    <main className="min-h-screen min-w-0 max-w-full bg-dema-cream px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
      <div className="mx-auto min-w-0 max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dema-forest">
            Services
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-brand-blue sm:text-5xl">
            Des prestations concrètes pour structurer et développer votre activité
          </h1>
          <p className="mt-5 text-base leading-relaxed text-dema-muted sm:text-lg">
            Explorez uniquement les offres dont le périmètre, les responsabilités et les conditions ont été validés.
          </p>
        </header>

        <div className="mt-12 min-w-0 max-w-full">
          <ServicesMarketplace offers={offers} />
        </div>
      </div>
    </main>
  );
}
