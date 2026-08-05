import { Suspense } from "react";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";

type SystemCustomOfferCtaProps = {
  systemSlug: string;
};

const bookingButtonClass =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-center text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2";

function BookingButtonFallback() {
  return (
    <button
      type="button"
      disabled
      className={`${bookingButtonClass} opacity-60`}
    >
      Réserver mon échange offert
    </button>
  );
}

export default function SystemCustomOfferCta({
  systemSlug,
}: SystemCustomOfferCtaProps) {
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
          Besoin de prendre du recul sur votre organisation ?
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-dema-muted">
          Échangez 30 minutes avec un spécialiste Demaa pour clarifier ce qui
          bloque, identifier votre priorité et repartir avec une prochaine
          étape concrète.
        </p>
        <p className="mt-2 text-xs font-medium text-dema-forest/75">
          30 minutes · Gratuit · Sans engagement
        </p>
      </div>

      <Suspense fallback={<BookingButtonFallback />}>
        <OrganisationSessionBookingButton
          systemSlug={systemSlug}
          source="Système opérationnel - Échange organisation"
          sourceIsAuthoritative
          label="Réserver mon échange offert"
          className={bookingButtonClass}
        />
      </Suspense>
    </aside>
  );
}
