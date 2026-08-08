import OrganisationCallbackRequestButton from "@/components/OrganisationCallbackRequestButton";

type SystemCustomOfferCtaProps = {
  context: "process" | "solutions";
  systemSlug: string;
};

const ctaCopy = {
  process: {
    buttonLabel: "Demander à être rappelé(e)",
    description:
      "Décrivez brièvement ce que vous souhaitez améliorer. Nous vous rappelons pour clarifier ce qui bloque et identifier votre prochaine étape.",
    source: "Système métier - Demande de rappel organisation",
    tag: "Premier échange offert · Sans engagement",
    title: "Besoin de prendre du recul sur votre organisation ?",
  },
  solutions: {
    buttonLabel: "Demander à être rappelé(e)",
    description:
      "Décrivez brièvement votre besoin. Nous vous rappelons pour vous aider à comparer les options et identifier la solution la plus adaptée à votre activité.",
    source: "Système métier - Demande de rappel solution",
    tag: "Premier échange offert · Sans engagement",
    title: "Besoin d’aide pour identifier la bonne solution ?",
  },
} as const;

const ctaButtonClass =
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
        <p className="mt-2 text-xs font-medium text-dema-forest/75">
          {copy.tag}
        </p>
      </div>

      <OrganisationCallbackRequestButton
        systemSlug={systemSlug}
        source={copy.source}
        label={copy.buttonLabel}
        className={ctaButtonClass}
      />
    </aside>
  );
}
