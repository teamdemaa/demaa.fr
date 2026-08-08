import { Suspense } from "react";
import OrganisationSessionBookingButton from "@/components/OrganisationSessionBookingButton";
import PreferentialRatesTrigger from "@/components/PreferentialRatesTrigger";

type SystemCustomOfferCtaProps = {
  context: "process" | "solutions";
  systemSlug: string;
};

const ctaCopy = {
  process: {
    buttonLabel: "Réserver mon échange offert",
    description:
      "Échangez 30 minutes avec un spécialiste Demaa pour clarifier ce qui bloque, identifier votre priorité et repartir avec une prochaine étape concrète.",
    source: "Système métier - Échange organisation",
    tag: "30 minutes · Gratuit · Sans engagement",
    title: "Besoin de prendre du recul sur votre organisation ?",
  },
  solutions: {
    buttonLabel: "Recevoir les tarifs préférentiels",
    description:
      "Recevez la liste des partenaires recommandés et les réductions négociées pour vous.",
    source: "Système métier - Tarifs préférentiels partenaires",
    tag: "Partenaires recommandés · Tarifs négociés",
    title: "Des tarifs préférentiels avec les partenaires Demaa",
  },
} as const;

const bookingButtonClass =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-center text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2";

function BookingButtonFallback({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      className={`${bookingButtonClass} opacity-60`}
    >
      {label}
    </button>
  );
}

export default function SystemCustomOfferCta({
  context,
  systemSlug,
}: SystemCustomOfferCtaProps) {
  const copy = ctaCopy[context];

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
          {copy.title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-dema-muted">
          {copy.description}
        </p>
        <p className="mt-2 text-xs font-medium text-dema-forest/75">
          {copy.tag}
        </p>
      </div>

      {context === "solutions" ? (
        <PreferentialRatesTrigger
          systemSlug={systemSlug}
          label={copy.buttonLabel}
          className={bookingButtonClass}
        />
      ) : (
        <Suspense fallback={<BookingButtonFallback label={copy.buttonLabel} />}>
          <OrganisationSessionBookingButton
            systemSlug={systemSlug}
            source={copy.source}
            sourceIsAuthoritative
            label={copy.buttonLabel}
            className={bookingButtonClass}
          />
        </Suspense>
      )}
    </aside>
  );
}
