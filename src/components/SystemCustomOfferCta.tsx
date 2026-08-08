import SystemCallbackRequestButton from "@/components/SystemCallbackRequestButton";

type SystemCustomOfferCtaProps = {
  context: "process" | "solutions";
  systemSlug: string;
};

const ctaCopy = {
  process: {
    buttonLabel: "Demander à être rappelé",
    description:
      "Décrivez-nous ce qui vous bloque. Un spécialiste Demaa vous rappelle pour vous aider à identifier la priorité.",
    title: "Besoin de prendre du recul sur votre organisation ?",
  },
  solutions: {
    buttonLabel: "Demander à être rappelé",
    description:
      "Expliquez-nous votre besoin. Un spécialiste Demaa vous rappelle pour identifier les solutions les plus adaptées à votre activité.",
    title: "Besoin d’aide pour choisir la bonne solution ?",
  },
} as const;

const bookingButtonClass =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-dema-forest px-5 py-3 text-center text-sm font-semibold text-dema-paper transition hover:bg-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dema-forest/35 focus-visible:ring-offset-2";

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
      </div>

      <SystemCallbackRequestButton
        context={context}
        systemSlug={systemSlug}
        className={bookingButtonClass}
      />
    </aside>
  );
}
